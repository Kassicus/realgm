/**
 * AI Free Agency System
 * Generates competing offers from AI teams for free agents
 */

import { getDatabase } from '@/lib/database/client';
import { calculatePlayerValue, PlayerDemands } from '@/lib/contracts/valuation';
import { ContractOffer } from '@/lib/contracts/negotiation';

interface Team {
  team_id: number;
  name: string;
  current_cap_space: number;
}

interface Player {
  player_id: number;
  position: string;
  overall_rating: number;
  age: number;
  accrued_seasons: number;
}

/**
 * Generate AI offers for top free agents
 * This should be called at the start of free agency and periodically during
 */
export function generateAIOffers(maxOffersPerPlayer: number = 3): void {
  const db = getDatabase();

  // Get all available free agents
  const freeAgents = db.prepare(`
    SELECT
      p.player_id,
      p.position,
      p.overall_rating,
      p.age,
      p.accrued_seasons
    FROM players p
    INNER JOIN free_agents fa ON p.player_id = fa.player_id
    WHERE fa.is_available = 1
      AND p.overall_rating >= 70
    ORDER BY p.overall_rating DESC
    LIMIT 100
  `).all() as Player[];

  // Get all teams with cap space
  const teams = db.prepare(`
    SELECT
      team_id,
      name,
      current_cap_space
    FROM teams
    WHERE team_id != 1
    ORDER BY RANDOM()
  `).all() as Team[];

  console.log(`Generating AI offers for ${freeAgents.length} free agents...`);

  // Generate offers for each free agent
  for (const player of freeAgents) {
    // Determine how many teams should bid on this player (based on rating)
    const numBidders = determineNumberOfBidders(player.overall_rating);

    // Select random teams interested in this player
    const interestedTeams = selectInterestedTeams(teams, player, numBidders, db);

    // Generate offers from interested teams
    for (const team of interestedTeams) {
      const offer = generateTeamOffer(team, player);

      if (offer) {
        // Save offer to database
        saveAIOffer(db, team.team_id, player.player_id, offer);
      }
    }
  }

  console.log('AI offers generation complete');
}

/**
 * Determine how many teams should bid on a player based on their rating
 */
function determineNumberOfBidders(rating: number): number {
  if (rating >= 90) return 5 + Math.floor(Math.random() * 3); // 5-7 teams for elite
  if (rating >= 85) return 3 + Math.floor(Math.random() * 3); // 3-5 teams for great
  if (rating >= 80) return 2 + Math.floor(Math.random() * 2); // 2-3 teams for good
  if (rating >= 75) return 1 + Math.floor(Math.random() * 2); // 1-2 teams for average
  return Math.random() < 0.5 ? 1 : 0; // 0-1 teams for below average
}

/**
 * Select teams that would be interested in this player
 */
function selectInterestedTeams(
  allTeams: Team[],
  player: Player,
  numTeams: number,
  db: any
): Team[] {
  const interested: Team[] = [];

  // Get position needs for each team
  for (const team of allTeams) {
    if (interested.length >= numTeams) break;

    // Check if team has need at this position
    const needLevel = evaluatePositionNeed(db, team.team_id, player.position);

    // Check if team can afford player
    const demands = calculatePlayerValue(player);
    const canAfford = team.current_cap_space >= demands.apy;

    if (!canAfford) continue;

    // Probability of being interested based on need
    const interestProbability = needLevel * 0.7 + Math.random() * 0.3;

    if (Math.random() < interestProbability) {
      interested.push(team);
    }
  }

  // If we didn't get enough teams, add random ones
  while (interested.length < numTeams && interested.length < allTeams.length) {
    const randomTeam = allTeams[Math.floor(Math.random() * allTeams.length)];
    if (!interested.includes(randomTeam)) {
      const demands = calculatePlayerValue(player);
      if (randomTeam.current_cap_space >= demands.apy) {
        interested.push(randomTeam);
      }
    }
  }

  return interested;
}

/**
 * Evaluate how much a team needs a player at this position (0-1)
 */
function evaluatePositionNeed(db: any, teamId: number, position: string): number {
  // Get players at this position on the team
  const playersAtPosition = db.prepare(`
    SELECT COUNT(*) as count, AVG(overall_rating) as avg_rating
    FROM players
    WHERE current_team_id = ?
      AND position = ?
      AND roster_status = 'Active'
  `).get(teamId, position) as any;

  const count = playersAtPosition?.count || 0;
  const avgRating = playersAtPosition?.avg_rating || 60;

  // Position minimums
  const positionMinimums: Record<string, number> = {
    QB: 2,
    RB: 3,
    WR: 5,
    TE: 3,
    OT: 2,
    OG: 2,
    C: 1,
    EDGE: 3,
    DT: 3,
    LB: 4,
    CB: 4,
    S: 3
  };

  const minimum = positionMinimums[position] || 2;

  // High need if below minimum or low average rating
  if (count < minimum) return 0.9;
  if (avgRating < 70) return 0.7;
  if (avgRating < 75) return 0.5;
  return 0.3; // Low need but might upgrade
}

/**
 * Generate a contract offer from an AI team
 */
function generateTeamOffer(team: Team, player: Player): ContractOffer | null {
  const demands = calculatePlayerValue(player);

  // AI teams offer between 85% and 105% of market value
  const offerPercentage = 0.85 + Math.random() * 0.2;

  const years = demands.years;
  const totalValue = Math.round(demands.apy * years * offerPercentage);
  const guaranteedPct = 0.4 + Math.random() * 0.2; // 40-60% guaranteed
  const guaranteedMoney = Math.round(totalValue * guaranteedPct);
  const signingBonus = Math.round(guaranteedMoney * (0.3 + Math.random() * 0.2));

  // Check if team can afford
  const year1Cap = calculateYear1Cap(totalValue, years, signingBonus);
  if (year1Cap > team.current_cap_space) {
    return null; // Can't afford
  }

  return {
    years,
    totalValue,
    guaranteedMoney,
    signingBonus,
    structure: selectContractStructure()
  };
}

/**
 * Calculate Year 1 cap hit
 */
function calculateYear1Cap(totalValue: number, years: number, signingBonus: number): number {
  const bonusProration = signingBonus / Math.min(years, 5);
  const baseSalary = (totalValue - signingBonus) / years;
  return Math.round(bonusProration + baseSalary);
}

/**
 * Select contract structure preference
 */
function selectContractStructure(): 'frontloaded' | 'backloaded' | 'even' {
  const rand = Math.random();
  if (rand < 0.2) return 'frontloaded';
  if (rand < 0.4) return 'backloaded';
  return 'even';
}

/**
 * Save an AI-generated offer to the database
 */
function saveAIOffer(db: any, teamId: number, playerId: number, offer: ContractOffer): void {
  try {
    const stmt = db.prepare(`
      INSERT INTO fa_offers (
        player_id,
        team_id,
        total_years,
        total_value,
        guaranteed_money,
        signing_bonus,
        structure_type,
        status,
        negotiation_round
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', 1)
    `);

    stmt.run(
      playerId,
      teamId,
      offer.years,
      offer.totalValue,
      offer.guaranteedMoney,
      offer.signingBonus,
      offer.structure
    );
  } catch (error) {
    console.error('Error saving AI offer:', error);
  }
}

/**
 * Update AI offers (increase bids in response to player offers)
 */
export function updateAIOffers(playerId: number): void {
  const db = getDatabase();

  // Get player info
  const player = db.prepare(`
    SELECT p.*, fa.desired_years, fa.desired_total_value
    FROM players p
    INNER JOIN free_agents fa ON p.player_id = fa.player_id
    WHERE p.player_id = ?
  `).get(playerId) as any;

  if (!player) return;

  // Get existing offers
  const existingOffers = db.prepare(`
    SELECT *
    FROM fa_offers
    WHERE player_id = ?
      AND status = 'pending'
    ORDER BY total_value DESC
  `).all(playerId) as any[];

  if (existingOffers.length === 0) return;

  // 30% chance for top bidder to increase their offer
  if (Math.random() < 0.3) {
    const topOffer = existingOffers[0];
    const increasePct = 1.05 + Math.random() * 0.05; // 5-10% increase

    db.prepare(`
      UPDATE fa_offers
      SET total_value = ?,
          guaranteed_money = ?,
          negotiation_round = negotiation_round + 1
      WHERE offer_id = ?
    `).run(
      Math.round(topOffer.total_value * increasePct),
      Math.round(topOffer.guaranteed_money * increasePct),
      topOffer.offer_id
    );

    console.log(`AI team ${topOffer.team_id} increased offer for player ${playerId}`);
  }
}

/**
 * Process AI team decisions on free agents
 * Some AI teams will accept free agent demands and sign them
 */
export function processAISignings(): void {
  const db = getDatabase();

  // Get all pending offers
  const offers = db.prepare(`
    SELECT
      o.*,
      p.player_id,
      p.position,
      p.overall_rating,
      p.age,
      fa.desired_total_value,
      fa.desired_years
    FROM fa_offers o
    INNER JOIN players p ON o.player_id = p.player_id
    INNER JOIN free_agents fa ON p.player_id = fa.player_id
    WHERE o.status = 'pending'
      AND fa.is_available = 1
      AND o.team_id != 1
    ORDER BY RANDOM()
    LIMIT 20
  `).all() as any[];

  for (const offer of offers) {
    // Calculate if offer is good enough
    const desiredAPY = offer.desired_total_value / offer.desired_years;
    const offeredAPY = offer.total_value / offer.total_years;
    const apyRatio = offeredAPY / desiredAPY;

    // 20% chance to sign if offer is 95%+ of asking
    if (apyRatio >= 0.95 && Math.random() < 0.2) {
      // Sign the player
      signPlayerToAITeam(db, offer.player_id, offer.team_id, offer);
    }
  }
}

/**
 * Sign a player to an AI team
 */
function signPlayerToAITeam(db: any, playerId: number, teamId: number, offer: any): void {
  try {
    // Update offer status
    db.prepare(`
      UPDATE fa_offers
      SET status = 'accepted'
      WHERE offer_id = ?
    `).run(offer.offer_id);

    // Update free agent status
    db.prepare(`
      UPDATE free_agents
      SET is_available = 0,
          signed_date = DATE('now'),
          signed_team_id = ?
      WHERE player_id = ?
    `).run(teamId, playerId);

    // Update player team
    db.prepare(`
      UPDATE players
      SET current_team_id = ?,
          roster_status = 'Active'
      WHERE player_id = ?
    `).run(teamId, playerId);

    // Withdraw all other offers
    db.prepare(`
      UPDATE fa_offers
      SET status = 'withdrawn'
      WHERE player_id = ?
        AND offer_id != ?
    `).run(playerId, offer.offer_id);

    console.log(`Player ${playerId} signed with AI team ${teamId}`);
  } catch (error) {
    console.error('Error signing player to AI team:', error);
  }
}
