import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';

/**
 * GET /api/draft/current
 * Get current draft state (current pick, recent picks, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();

    // Get current season
    const gameState = db.prepare('SELECT current_season FROM game_state WHERE state_id = 1').get() as any;
    const draftYear = gameState.current_season;

    // Get next unpicked selection
    const currentPick = db.prepare(`
      SELECT
        dp.pick_id,
        dp.overall_pick,
        dp.round,
        dp.pick_number,
        dp.current_team_id as team_id,
        t.name as team_name,
        t.abbreviation as team_abbr
      FROM draft_picks dp
      INNER JOIN teams t ON dp.current_team_id = t.team_id
      WHERE dp.draft_year = ?
        AND dp.is_used = 0
      ORDER BY dp.overall_pick ASC
      LIMIT 1
    `).get(draftYear) as any;

    if (!currentPick) {
      return NextResponse.json(
        { error: 'Draft is complete' },
        { status: 404 }
      );
    }

    // Get recent picks (last 10)
    const recentPicks = db.prepare(`
      SELECT
        ds.overall_pick,
        ds.round,
        ds.pick_number,
        ds.team_id,
        t.name as team_name,
        t.abbreviation as team_abbr,
        p.first_name || ' ' || p.last_name as player_name,
        p.position,
        p.college,
        p.scouted_overall_rating as overall_rating
      FROM draft_selections ds
      INNER JOIN teams t ON ds.team_id = t.team_id
      LEFT JOIN draft_prospects p ON ds.prospect_id = p.prospect_id
      WHERE ds.draft_year = ?
      ORDER BY ds.overall_pick DESC
      LIMIT 10
    `).all(draftYear);

    // Get player's team upcoming picks
    const upcomingPicks = db.prepare(`
      SELECT
        dp.overall_pick,
        dp.round,
        dp.pick_number
      FROM draft_picks dp
      WHERE dp.draft_year = ?
        AND dp.current_team_id = 1
        AND dp.is_used = 0
      ORDER BY dp.overall_pick ASC
      LIMIT 5
    `).all(draftYear);

    return NextResponse.json({
      currentPick,
      recentPicks: recentPicks.reverse(), // Show most recent first
      upcomingPicks,
      draftYear
    });
  } catch (error) {
    console.error('Error fetching current draft state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft state' },
      { status: 500 }
    );
  }
}
