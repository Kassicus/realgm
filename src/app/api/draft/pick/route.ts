import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';
import { getOverallPick } from '@/lib/draft/tradeValue';

/**
 * POST /api/draft/pick
 * Make a draft pick
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();
    const { pick_number, prospect_id, team_id = 1 } = await request.json();

    if (!pick_number || !prospect_id) {
      return NextResponse.json(
        { error: 'Missing required fields: pick_number, prospect_id' },
        { status: 400 }
      );
    }

    // Get current draft state
    const gameState = db.prepare('SELECT current_season FROM game_state WHERE state_id = 1').get() as any;
    const draftYear = gameState.current_season;

    // Verify pick belongs to team and hasn't been used
    const pick = db.prepare(`
      SELECT *
      FROM draft_picks
      WHERE draft_year = ?
        AND overall_pick = ?
        AND current_team_id = ?
        AND is_used = 0
    `).get(draftYear, pick_number, team_id) as any;

    if (!pick) {
      return NextResponse.json(
        { error: 'Invalid pick or pick already used' },
        { status: 400 }
      );
    }

    // Verify prospect is available
    const prospect = db.prepare(`
      SELECT *
      FROM draft_prospects
      WHERE prospect_id = ?
        AND draft_year = ?
        AND is_drafted = 0
    `).get(prospect_id, draftYear) as any;

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not available' },
        { status: 400 }
      );
    }

    // Mark pick as used
    db.prepare(`
      UPDATE draft_picks
      SET is_used = 1,
          player_selected_id = ?
      WHERE pick_id = ?
    `).run(prospect_id, pick.pick_id);

    // Mark prospect as drafted
    db.prepare(`
      UPDATE draft_prospects
      SET is_drafted = 1,
          drafted_by_team_id = ?,
          drafted_round = ?,
          drafted_pick = ?,
          drafted_overall = ?
      WHERE prospect_id = ?
    `).run(team_id, pick.round, pick.pick_number, pick.overall_pick, prospect_id);

    // Record selection
    db.prepare(`
      INSERT INTO draft_selections (
        draft_year, round, pick_number, overall_pick,
        team_id, prospect_id, time_on_clock
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      draftYear,
      pick.round,
      pick.pick_number,
      pick.overall_pick,
      team_id,
      prospect_id,
      300 // Default 5 minutes
    );

    // Convert prospect to player
    const newPlayer = createPlayerFromProspect(db, prospect, team_id);

    return NextResponse.json({
      success: true,
      pick: {
        round: pick.round,
        pick: pick.pick_number,
        overall: pick.overall_pick
      },
      prospect: {
        prospect_id: prospect.prospect_id,
        name: `${prospect.first_name} ${prospect.last_name}`,
        position: prospect.position,
        college: prospect.college,
        overall_rating: prospect.scouted_overall_rating
      },
      player_id: newPlayer.player_id
    });
  } catch (error) {
    console.error('Error making draft pick:', error);
    return NextResponse.json(
      { error: 'Failed to make draft pick' },
      { status: 500 }
    );
  }
}

/**
 * Convert drafted prospect to player in roster
 */
function createPlayerFromProspect(db: any, prospect: any, teamId: number): any {
  const result = db.prepare(`
    INSERT INTO players (
      first_name, last_name, position, age, college,
      draft_year, draft_round, draft_pick,
      current_team_id, roster_status,
      overall_rating, position_ratings,
      work_ethic, injury_risk, personality_traits,
      accrued_seasons
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    prospect.first_name,
    prospect.last_name,
    prospect.position,
    prospect.age,
    prospect.college,
    prospect.draft_year,
    prospect.drafted_round,
    prospect.drafted_overall,
    teamId,
    'Active',
    prospect.true_overall_rating, // Use true rating, not scouted
    prospect.true_position_ratings,
    prospect.work_ethic,
    prospect.injury_risk,
    JSON.stringify({ character: prospect.character_grade, football_iq: prospect.football_iq }),
    0 // Rookie
  );

  return { player_id: result.lastInsertRowid };
}
