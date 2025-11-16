import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';
import { calculatePlayerValue } from '@/lib/contracts/valuation';
import { evaluateOffer, ContractOffer, NegotiationContext } from '@/lib/contracts/negotiation';

/**
 * POST /api/contracts/negotiate
 * Submit a contract offer to a free agent
 */
export async function POST(request: NextRequest) {
  try {
    const db = getDatabase();
    const body = await request.json();
    const { player_id, team_id = 1, offer } = body; // team_id defaults to 1 (player's team)

    // Validate input
    if (!player_id || !offer) {
      return NextResponse.json(
        { error: 'Missing required fields: player_id, offer' },
        { status: 400 }
      );
    }

    // Get player and free agent data
    const player = db.prepare(`
      SELECT
        p.player_id,
        p.first_name || ' ' || p.last_name as name,
        p.position,
        p.age,
        p.overall_rating,
        p.accrued_seasons,
        p.current_team_id,
        fa.desired_years,
        fa.desired_total_value,
        fa.desired_guaranteed,
        fa.fa_type
      FROM players p
      INNER JOIN free_agents fa ON p.player_id = fa.player_id
      WHERE p.player_id = ? AND fa.is_available = 1
    `).get(player_id) as any;

    if (!player) {
      return NextResponse.json(
        { error: 'Player not found or not available' },
        { status: 404 }
      );
    }

    // Calculate player demands if not set
    let demands;
    if (player.desired_total_value && player.desired_years) {
      demands = {
        apy: Math.round(player.desired_total_value / player.desired_years),
        years: player.desired_years,
        guaranteed: player.desired_guaranteed,
        priority: 'money' as const // TODO: Store priority in database
      };
    } else {
      demands = calculatePlayerValue({
        player_id: player.player_id,
        position: player.position,
        overall_rating: player.overall_rating,
        age: player.age,
        accrued_seasons: player.accrued_seasons,
        current_team_id: player.current_team_id
      });
    }

    // Get existing offers for this player
    const existingOffers = db.prepare(`
      SELECT *
      FROM fa_offers
      WHERE player_id = ?
        AND team_id != ?
        AND status = 'pending'
      ORDER BY total_value DESC
    `).all(player_id, team_id) as any[];

    const competingOffers: ContractOffer[] = existingOffers.map(o => ({
      years: o.total_years,
      totalValue: o.total_value,
      guaranteedMoney: o.guaranteed_money,
      signingBonus: o.signing_bonus,
      structure: o.structure_type || 'even'
    }));

    // Get negotiation round (count previous offers from this team)
    const previousOffersCount = db.prepare(`
      SELECT COUNT(*) as count
      FROM fa_offers
      WHERE player_id = ? AND team_id = ?
    `).get(player_id, team_id) as any;

    const negotiationRound = (previousOffersCount?.count || 0) + 1;

    // Build negotiation context
    const context: NegotiationContext = {
      player: {
        player_id: player.player_id,
        name: player.name,
        position: player.position,
        overall_rating: player.overall_rating,
        age: player.age
      },
      demands,
      competingOffers,
      negotiationRound
    };

    // Evaluate the offer
    const contractOffer: ContractOffer = {
      years: offer.years,
      totalValue: offer.totalValue,
      guaranteedMoney: offer.guaranteedMoney,
      signingBonus: offer.signingBonus,
      structure: offer.structure || 'even'
    };

    const evaluation = evaluateOffer(context, contractOffer);

    // Store the offer in database
    const insertOffer = db.prepare(`
      INSERT INTO fa_offers (
        player_id,
        team_id,
        total_years,
        total_value,
        guaranteed_money,
        signing_bonus,
        structure_type,
        status,
        negotiation_round,
        offer_score,
        player_response
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const offerStatus =
      evaluation.decision === 'accept' ? 'accepted' :
      evaluation.decision === 'counter' ? 'countered' :
      'rejected';

    insertOffer.run(
      player_id,
      team_id,
      offer.years,
      offer.totalValue,
      offer.guaranteedMoney,
      offer.signingBonus,
      offer.structure || 'even',
      offerStatus,
      negotiationRound,
      evaluation.score,
      JSON.stringify({
        decision: evaluation.decision,
        message: evaluation.message,
        reason: evaluation.reason
      })
    );

    // If accepted, create contract and update player status
    if (evaluation.decision === 'accept') {
      const contract = createContract(db, player_id, team_id, contractOffer);

      // Update free agent status
      db.prepare(`
        UPDATE free_agents
        SET is_available = 0,
            signed_date = DATE('now'),
            signed_team_id = ?
        WHERE player_id = ?
      `).run(team_id, player_id);

      // Update player team and status
      db.prepare(`
        UPDATE players
        SET current_team_id = ?,
            roster_status = 'Active'
        WHERE player_id = ?
      `).run(team_id, player_id);

      // Mark all other offers as withdrawn
      db.prepare(`
        UPDATE fa_offers
        SET status = 'withdrawn'
        WHERE player_id = ?
          AND team_id != ?
          AND status = 'pending'
      `).run(player_id, team_id);

      return NextResponse.json({
        decision: 'accept',
        message: evaluation.message,
        contract
      });
    }

    // If counter-offer
    if (evaluation.decision === 'counter' && evaluation.counterOffer) {
      return NextResponse.json({
        decision: 'counter',
        message: evaluation.message,
        counter: evaluation.counterOffer,
        negotiationRound: negotiationRound + 1
      });
    }

    // If declined
    return NextResponse.json({
      decision: 'decline',
      message: evaluation.message,
      reason: evaluation.reason
    });
  } catch (error) {
    console.error('Error negotiating contract:', error);
    return NextResponse.json(
      { error: 'Failed to process contract negotiation' },
      { status: 500 }
    );
  }
}

/**
 * Create a contract in the database
 */
function createContract(db: any, playerId: number, teamId: number, offer: ContractOffer): any {
  // Generate annual breakdown
  const annualBreakdown = generateAnnualBreakdown(offer);

  // Calculate cap hit for current year
  const bonusProration = offer.signingBonus / Math.min(offer.years, 5);
  const year1BaseSalary = annualBreakdown[0];
  const currentCapHit = Math.round(bonusProration + year1BaseSalary);

  // Calculate dead money if cut
  const deadMoney = offer.signingBonus; // Simplified - full signing bonus as dead money

  const insertContract = db.prepare(`
    INSERT INTO contracts (
      player_id,
      team_id,
      signed_date,
      total_years,
      current_year,
      years_remaining,
      total_value,
      signing_bonus_total,
      signing_bonus_remaining,
      annual_breakdown,
      guaranteed_money_remaining,
      guaranteed_at_signing,
      current_cap_hit,
      dead_money_if_cut,
      contract_type,
      is_active
    ) VALUES (?, ?, DATE('now'), ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Veteran', 1)
  `);

  const result = insertContract.run(
    playerId,
    teamId,
    offer.years,
    offer.years,
    offer.totalValue,
    offer.signingBonus,
    offer.signingBonus,
    JSON.stringify(annualBreakdown),
    offer.guaranteedMoney,
    offer.guaranteedMoney,
    currentCapHit,
    deadMoney
  );

  return {
    contract_id: result.lastInsertRowid,
    total_value: offer.totalValue,
    years: offer.years,
    guaranteed_money: offer.guaranteedMoney,
    signing_bonus: offer.signingBonus,
    year_1_cap_hit: currentCapHit,
    annual_breakdown: annualBreakdown
  };
}

/**
 * Generate annual salary breakdown
 */
function generateAnnualBreakdown(offer: ContractOffer): number[] {
  const nonBonusMoney = offer.totalValue - offer.signingBonus;
  const annualSalaries: number[] = [];

  if (offer.structure === 'even') {
    // Even distribution
    const yearlyAmount = nonBonusMoney / offer.years;
    for (let i = 0; i < offer.years; i++) {
      annualSalaries.push(Math.round(yearlyAmount));
    }
  } else if (offer.structure === 'frontloaded') {
    // Higher early years
    const weights = [1.5, 1.3, 1.1, 0.9, 0.8, 0.7, 0.6];
    const totalWeight = weights.slice(0, offer.years).reduce((a, b) => a + b, 0);

    for (let i = 0; i < offer.years; i++) {
      const yearlyAmount = (nonBonusMoney * weights[i]) / totalWeight;
      annualSalaries.push(Math.round(yearlyAmount));
    }
  } else {
    // Backloaded
    const weights = [0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5];
    const totalWeight = weights.slice(0, offer.years).reduce((a, b) => a + b, 0);

    for (let i = 0; i < offer.years; i++) {
      const yearlyAmount = (nonBonusMoney * weights[i]) / totalWeight;
      annualSalaries.push(Math.round(yearlyAmount));
    }
  }

  return annualSalaries;
}
