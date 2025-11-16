import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';
import { calculatePlayerValue } from '@/lib/contracts/valuation';

/**
 * GET /api/free-agents
 * Fetches all available free agents with their contract demands
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDatabase();

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const position = searchParams.get('position');
    const faType = searchParams.get('faType');
    const minRating = searchParams.get('minRating');
    const maxAge = searchParams.get('maxAge');
    const search = searchParams.get('search');

    // Build query
    let query = `
      SELECT
        p.player_id,
        p.first_name || ' ' || p.last_name as name,
        p.position,
        p.age,
        p.overall_rating,
        p.college,
        p.accrued_seasons,
        p.current_team_id,
        fa.fa_type,
        fa.desired_years,
        fa.desired_total_value,
        fa.desired_guaranteed,
        fa.interested_teams,
        fa.top_offer
      FROM players p
      INNER JOIN free_agents fa ON p.player_id = fa.player_id
      WHERE fa.is_available = 1
        AND p.roster_status = 'Free Agent'
    `;

    const params: any[] = [];

    // Apply filters
    if (position && position !== 'ALL') {
      query += ' AND p.position = ?';
      params.push(position);
    }

    if (faType && faType !== 'ALL') {
      query += ' AND fa.fa_type = ?';
      params.push(faType);
    }

    if (minRating) {
      query += ' AND p.overall_rating >= ?';
      params.push(parseInt(minRating));
    }

    if (maxAge) {
      query += ' AND p.age <= ?';
      params.push(parseInt(maxAge));
    }

    if (search) {
      query += ` AND (p.first_name LIKE ? OR p.last_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.overall_rating DESC';

    // Execute query
    const stmt = db.prepare(query);
    const players = stmt.all(...params) as any[];

    // Calculate contract demands for each player if not already set
    const freeAgents = players.map(player => {
      let desiredAPY = 0;
      let desiredYears = 0;
      let desiredGuaranteed = 0;

      if (player.desired_total_value && player.desired_years) {
        // Use existing demands from database
        desiredAPY = Math.round(player.desired_total_value / player.desired_years);
        desiredYears = player.desired_years;
        desiredGuaranteed = player.desired_guaranteed;
      } else {
        // Calculate demands
        const demands = calculatePlayerValue({
          player_id: player.player_id,
          position: player.position,
          overall_rating: player.overall_rating,
          age: player.age,
          accrued_seasons: player.accrued_seasons,
          current_team_id: player.current_team_id
        });

        desiredAPY = demands.apy;
        desiredYears = demands.years;
        desiredGuaranteed = demands.guaranteed;

        // Update database with calculated demands
        const updateStmt = db.prepare(`
          UPDATE free_agents
          SET desired_years = ?,
              desired_total_value = ?,
              desired_guaranteed = ?
          WHERE player_id = ?
        `);
        updateStmt.run(
          desiredYears,
          desiredAPY * desiredYears,
          desiredGuaranteed,
          player.player_id
        );
      }

      // Parse JSON fields
      let interestedTeams = [];
      let topOffer = null;

      try {
        if (player.interested_teams) {
          interestedTeams = JSON.parse(player.interested_teams);
        }
        if (player.top_offer) {
          topOffer = JSON.parse(player.top_offer);
        }
      } catch (e) {
        console.error('Error parsing JSON fields:', e);
      }

      return {
        player_id: player.player_id,
        name: player.name,
        position: player.position,
        age: player.age,
        overall_rating: player.overall_rating,
        college: player.college,
        fa_type: player.fa_type,
        desired_apy: desiredAPY,
        desired_years: desiredYears,
        desired_guaranteed: desiredGuaranteed,
        interest_level: calculateInterestLevel(player),
        best_offer: topOffer
      };
    });

    return NextResponse.json(freeAgents);
  } catch (error) {
    console.error('Error fetching free agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch free agents' },
      { status: 500 }
    );
  }
}

/**
 * Calculate player's interest level in signing (0-100)
 */
function calculateInterestLevel(player: any): number {
  // Base interest
  let interest = 50;

  // Higher rated players are pickier
  if (player.overall_rating >= 85) {
    interest = 30;
  } else if (player.overall_rating >= 75) {
    interest = 50;
  } else {
    interest = 70;
  }

  // Add randomness
  interest += Math.floor(Math.random() * 20) - 10;

  return Math.max(0, Math.min(100, interest));
}
