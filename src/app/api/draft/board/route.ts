import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';

/**
 * GET /api/draft/board
 * Get team's draft board rankings
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId') || '1';

    const board = db.prepare(`
      SELECT
        tdb.rank,
        p.prospect_id,
        p.first_name || ' ' || p.last_name as name,
        p.position,
        p.college,
        p.scouted_overall_rating as overall_rating,
        p.draft_grade,
        p.height_inches,
        p.weight,
        p.age,
        p.forty_yard_dash,
        p.nfl_comparison,
        p.is_drafted,
        tdb.is_need_position,
        tdb.team_notes
      FROM team_draft_boards tdb
      INNER JOIN draft_prospects p ON tdb.prospect_id = p.prospect_id
      WHERE tdb.team_id = ?
      ORDER BY tdb.rank ASC
    `).all(teamId);

    return NextResponse.json(board);
  } catch (error) {
    console.error('Error fetching draft board:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft board' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/draft/board
 * Update team's draft board rankings
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();
    const { teamId = 1, board } = await request.json();

    if (!board || !Array.isArray(board)) {
      return NextResponse.json(
        { error: 'Invalid board data' },
        { status: 400 }
      );
    }

    // Delete existing board
    db.prepare('DELETE FROM team_draft_boards WHERE team_id = ?').run(teamId);

    // Insert new rankings
    const insertStmt = db.prepare(`
      INSERT INTO team_draft_boards (team_id, prospect_id, rank, is_need_position)
      VALUES (?, ?, ?, ?)
    `);

    for (const entry of board) {
      insertStmt.run(teamId, entry.prospect_id, entry.rank, entry.is_need_position || 0);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating draft board:', error);
    return NextResponse.json(
      { error: 'Failed to update draft board' },
      { status: 500 }
    );
  }
}
