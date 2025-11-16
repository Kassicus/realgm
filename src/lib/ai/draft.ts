/**
 * AI Draft Decision Making System
 * Makes intelligent draft picks for AI teams
 */

import { getDatabase } from '@/lib/database/client';

interface ProspectEvaluation {
  prospect_id: number;
  score: number;
  isBPA: boolean;
  isNeed: boolean;
  name: string;
  position: string;
  overall_rating: number;
}

/**
 * Make a pick for an AI team
 */
export function makeAIPick(teamId: number, pickNumber: number): number | null {
  const db = getDatabase();

  // Get team's draft strategy
  const strategy = getTeamDraftStrategy(db, teamId);

  // Get available prospects
  const available = getAvailableProspects(db);

  if (available.length === 0) return null;

  // Evaluate prospects
  const evaluations = evaluateProspects(db, teamId, available, strategy);

  // Select best prospect based on strategy
  const selected = selectProspect(evaluations, strategy);

  return selected?.prospect_id || null;
}

/**
 * Get team's draft strategy
 */
function getTeamDraftStrategy(db: any, teamId: number): {
  bpaWeight: number; // 0-1, how much to weight BPA vs need
  positionNeeds: string[];
  preferredTraits: string[];
} {
  // Analyze team's roster to determine needs
  const positionCounts = db.prepare(`
    SELECT position, COUNT(*) as count, AVG(overall_rating) as avg_rating
    FROM players
    WHERE current_team_id = ?
      AND roster_status = 'Active'
    GROUP BY position
  `).all(teamId) as any[];

  const needs: string[] = [];

  // Position minimums
  const minimums: Record<string, number> = {
    QB: 2, RB: 3, WR: 5, TE: 3, OT: 2, OG: 2, C: 1,
    EDGE: 3, DT: 3, LB: 4, CB: 4, S: 3
  };

  // Check for positions below minimum or low quality
  for (const [pos, min] of Object.entries(minimums)) {
    const posData = positionCounts.find(p => p.position === pos);
    const count = posData?.count || 0;
    const avgRating = posData?.avg_rating || 60;

    if (count < min || avgRating < 70) {
      needs.push(pos);
    }
  }

  // BPA weight varies by team (some teams are more BPA, others draft for need)
  const bpaWeight = 0.5 + (Math.random() - 0.5) * 0.3; // 0.35 - 0.65

  return {
    bpaWeight,
    positionNeeds: needs,
    preferredTraits: ['Quick', 'Elite', 'Star'] // Most teams prefer high development
  };
}

/**
 * Get all undrafted prospects
 */
function getAvailableProspects(db: any): any[] {
  return db.prepare(`
    SELECT
      prospect_id,
      first_name || ' ' || last_name as name,
      position,
      scouted_overall_rating as overall_rating,
      draft_grade,
      work_ethic,
      character_grade,
      football_iq,
      development_trait,
      injury_risk
    FROM draft_prospects
    WHERE is_drafted = 0
    ORDER BY scouted_overall_rating DESC
    LIMIT 100
  `).all();
}

/**
 * Evaluate all available prospects for this team
 */
function evaluateProspects(
  db: any,
  teamId: number,
  prospects: any[],
  strategy: any
): ProspectEvaluation[] {
  const evaluations: ProspectEvaluation[] = [];

  // Find BPA (Best Player Available)
  const bpaRating = prospects[0]?.overall_rating || 0;

  for (const prospect of prospects) {
    const isBPA = prospect.overall_rating >= bpaRating - 3; // Within 3 points of BPA
    const isNeed = strategy.positionNeeds.includes(prospect.position);

    // Calculate score
    let score = prospect.overall_rating;

    // Bonus for being BPA
    if (isBPA) {
      score += 10 * strategy.bpaWeight;
    }

    // Bonus for being a need position
    if (isNeed) {
      score += 15 * (1 - strategy.bpaWeight);
    }

    // Bonus for good traits
    if (strategy.preferredTraits.includes(prospect.development_trait)) {
      score += 5;
    }

    // Bonus for high intangibles
    if (prospect.work_ethic >= 4) score += 3;
    if (prospect.character_grade >= 4) score += 2;
    if (prospect.football_iq >= 4) score += 3;

    // Penalty for injury risk
    if (prospect.injury_risk >= 4) score -= 5;

    evaluations.push({
      prospect_id: prospect.prospect_id,
      score,
      isBPA,
      isNeed,
      name: prospect.name,
      position: prospect.position,
      overall_rating: prospect.overall_rating
    });
  }

  return evaluations.sort((a, b) => b.score - a.score);
}

/**
 * Select the best prospect based on evaluations
 */
function selectProspect(
  evaluations: ProspectEvaluation[],
  strategy: any
): ProspectEvaluation | null {
  if (evaluations.length === 0) return null;

  // Top 3 prospects have highest scores
  const topProspects = evaluations.slice(0, 3);

  // Add some randomness - don't always pick #1
  const random = Math.random();

  if (random < 0.7) {
    // 70% chance to pick best
    return topProspects[0];
  } else if (random < 0.9 && topProspects.length > 1) {
    // 20% chance to pick 2nd best
    return topProspects[1];
  } else if (topProspects.length > 2) {
    // 10% chance to pick 3rd best
    return topProspects[2];
  }

  return topProspects[0];
}

/**
 * Process all AI picks until player is on the clock
 */
export function processAIPicks(): void {
  const db = getDatabase();

  // Get current pick
  const gameState = db.prepare('SELECT current_season FROM game_state WHERE state_id = 1').get() as any;
  const draftYear = gameState.current_season;

  while (true) {
    // Get next pick
    const nextPick = db.prepare(`
      SELECT
        dp.pick_id,
        dp.overall_pick,
        dp.round,
        dp.pick_number,
        dp.current_team_id as team_id
      FROM draft_picks dp
      WHERE dp.draft_year = ?
        AND dp.is_used = 0
      ORDER BY dp.overall_pick ASC
      LIMIT 1
    `).get(draftYear) as any;

    if (!nextPick) {
      console.log('Draft is complete');
      break;
    }

    // Check if it's the player's turn
    if (nextPick.team_id === 1) {
      console.log(`Player is on the clock at pick ${nextPick.overall_pick}`);
      break;
    }

    // Make AI pick
    const prospectId = makeAIPick(nextPick.team_id, nextPick.overall_pick);

    if (!prospectId) {
      console.log('No prospects available');
      break;
    }

    // Execute the pick
    db.prepare(`
      UPDATE draft_picks
      SET is_used = 1,
          player_selected_id = ?
      WHERE pick_id = ?
    `).run(prospectId, nextPick.pick_id);

    db.prepare(`
      UPDATE draft_prospects
      SET is_drafted = 1,
          drafted_by_team_id = ?,
          drafted_round = ?,
          drafted_pick = ?,
          drafted_overall = ?
      WHERE prospect_id = ?
    `).run(nextPick.team_id, nextPick.round, nextPick.pick_number, nextPick.overall_pick, prospectId);

    // Record selection
    db.prepare(`
      INSERT INTO draft_selections (
        draft_year, round, pick_number, overall_pick,
        team_id, prospect_id, time_on_clock
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      draftYear,
      nextPick.round,
      nextPick.pick_number,
      nextPick.overall_pick,
      nextPick.team_id,
      prospectId,
      Math.floor(Math.random() * 180) + 120 // 2-5 minutes
    );

    const prospect = db.prepare('SELECT first_name, last_name, position FROM draft_prospects WHERE prospect_id = ?').get(prospectId) as any;
    console.log(`Pick ${nextPick.overall_pick}: Team ${nextPick.team_id} selects ${prospect.first_name} ${prospect.last_name} (${prospect.position})`);
  }
}

/**
 * Initialize draft boards for all AI teams
 */
export function initializeAIDraftBoards(draftYear: number): void {
  const db = getDatabase();

  // Get all teams except player's team
  const teams = db.prepare('SELECT team_id FROM teams WHERE team_id != 1').all() as any[];

  // Get all prospects for this year
  const prospects = db.prepare(`
    SELECT prospect_id, scouted_overall_rating, position
    FROM draft_prospects
    WHERE draft_year = ?
    ORDER BY scouted_overall_rating DESC
  `).all(draftYear) as any[];

  for (const team of teams) {
    // Create draft board for this team
    const strategy = getTeamDraftStrategy(db, team.team_id);

    // Evaluate all prospects
    const evaluations = evaluateProspects(db, team.team_id, prospects, strategy);

    // Save top 250 to draft board
    const insertStmt = db.prepare(`
      INSERT INTO team_draft_boards (team_id, prospect_id, rank, is_need_position)
      VALUES (?, ?, ?, ?)
    `);

    for (let i = 0; i < Math.min(250, evaluations.length); i++) {
      const eval = evaluations[i];
      insertStmt.run(
        team.team_id,
        eval.prospect_id,
        i + 1,
        eval.isNeed ? 1 : 0
      );
    }
  }

  console.log(`✓ Initialized draft boards for ${teams.length} AI teams`);
}
