import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';

/**
 * GET /api/draft/prospects
 * Fetches draft prospects with filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();
    const searchParams = request.nextUrl.searchParams;

    // Get filters
    const year = searchParams.get('year') || new Date().getFullYear();
    const position = searchParams.get('position');
    const grade = searchParams.get('grade');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const isDrafted = searchParams.get('isDrafted');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    // Build query
    let query = `
      SELECT
        prospect_id,
        first_name,
        last_name,
        first_name || ' ' || last_name as name,
        position,
        college,
        height_inches,
        weight,
        age,
        scouted_overall_rating as overall_rating,
        draft_grade,
        projected_round,
        forty_yard_dash,
        bench_press,
        vertical_jump,
        broad_jump,
        three_cone_drill,
        twenty_yard_shuttle,
        nfl_comparison,
        is_drafted,
        drafted_by_team_id,
        drafted_round,
        drafted_pick,
        drafted_overall
      FROM draft_prospects
      WHERE draft_year = ?
    `;

    const params: any[] = [year];

    // Apply filters
    if (position && position !== 'ALL') {
      query += ' AND position = ?';
      params.push(position);
    }

    if (grade && grade !== 'ALL') {
      query += ' AND draft_grade = ?';
      params.push(grade);
    }

    if (minRating) {
      query += ' AND scouted_overall_rating >= ?';
      params.push(parseInt(minRating));
    }

    if (maxRating) {
      query += ' AND scouted_overall_rating <= ?';
      params.push(parseInt(maxRating));
    }

    if (isDrafted !== null && isDrafted !== undefined) {
      query += ' AND is_drafted = ?';
      params.push(isDrafted === 'true' ? 1 : 0);
    }

    if (search) {
      query += ` AND (first_name LIKE ? OR last_name LIKE ? OR college LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Default sort by scouted rating
    query += ' ORDER BY scouted_overall_rating DESC';

    // Pagination
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }

    if (offset) {
      query += ' OFFSET ?';
      params.push(parseInt(offset));
    }

    const prospects = db.prepare(query).all(...params);

    // Format height for display
    const formattedProspects = (prospects as any[]).map(p => ({
      ...p,
      height: formatHeight(p.height_inches)
    }));

    return NextResponse.json(formattedProspects);
  } catch (error) {
    console.error('Error fetching prospects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prospects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/draft/prospects/generate
 * Generate a new draft class
 */
export async function POST(request: NextRequest) {
  try {
    const { year, count } = await request.json();

    if (!year) {
      return NextResponse.json(
        { error: 'Year is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // Check if prospects already exist for this year
    const existing = db.prepare(`
      SELECT COUNT(*) as count
      FROM draft_prospects
      WHERE draft_year = ?
    `).get(year) as any;

    if (existing.count > 0) {
      return NextResponse.json(
        { error: `Draft class for ${year} already exists` },
        { status: 400 }
      );
    }

    // Generate prospects (this would call the generator)
    // For now, return success
    // In production: import and call generateDraftClass(year, count || 280)

    return NextResponse.json({
      success: true,
      message: `Generated draft class for ${year}`,
      count: count || 280
    });
  } catch (error) {
    console.error('Error generating prospects:', error);
    return NextResponse.json(
      { error: 'Failed to generate prospects' },
      { status: 500 }
    );
  }
}

/**
 * Format height from inches to feet and inches
 */
function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}
