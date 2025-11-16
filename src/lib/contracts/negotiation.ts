/**
 * Contract Negotiation Logic
 * Handles offer evaluation, counter-offers, and player decisions
 */

import { PlayerDemands, calculateAPY } from './valuation';

export interface ContractOffer {
  years: number;
  totalValue: number;
  guaranteedMoney: number;
  signingBonus: number;
  structure: 'frontloaded' | 'backloaded' | 'even';
}

export interface NegotiationContext {
  player: {
    player_id: number;
    name: string;
    position: string;
    overall_rating: number;
    age: number;
  };
  demands: PlayerDemands;
  competingOffers?: ContractOffer[];
  negotiationRound: number;
  previousOffers?: ContractOffer[];
}

export interface OfferEvaluation {
  score: number; // 0-100
  decision: 'accept' | 'counter' | 'decline';
  message: string;
  reason?: string;
  counterOffer?: ContractOffer;
}

/**
 * Evaluate a contract offer from a team
 */
export function evaluateOffer(
  context: NegotiationContext,
  offer: ContractOffer
): OfferEvaluation {
  const { player, demands, competingOffers = [], negotiationRound } = context;

  // Calculate how close offer is to demands
  const apyScore = calculateAPYScore(offer, demands);
  const yearsScore = calculateYearsScore(offer, demands);
  const guaranteedScore = calculateGuaranteedScore(offer, demands);

  // Weight scores based on player's priority
  let totalScore = 0;
  switch (demands.priority) {
    case 'money':
      totalScore = apyScore * 0.5 + guaranteedScore * 0.3 + yearsScore * 0.2;
      break;
    case 'years':
      totalScore = yearsScore * 0.5 + apyScore * 0.3 + guaranteedScore * 0.2;
      break;
    case 'winning':
      // TODO: Factor in team's record/playoff chances
      totalScore = apyScore * 0.4 + guaranteedScore * 0.3 + yearsScore * 0.3;
      break;
    case 'hometown':
      // TODO: Factor in if this is player's original team
      totalScore = apyScore * 0.4 + guaranteedScore * 0.3 + yearsScore * 0.3;
      break;
  }

  // Adjust for competing offers
  if (competingOffers.length > 0) {
    const bestCompetingOffer = findBestCompetingOffer(competingOffers, demands);
    const competitionScore = compareOffers(offer, bestCompetingOffer, demands);

    // If this offer is significantly worse than competition, lower score
    if (competitionScore < -10) {
      totalScore -= 15;
    } else if (competitionScore > 10) {
      totalScore += 10; // This offer is better than competition
    }
  }

  // Adjust based on negotiation round (player becomes more flexible)
  if (negotiationRound > 1) {
    totalScore += (negotiationRound - 1) * 5;
  }

  // Determine decision based on score
  if (totalScore >= 90) {
    return {
      score: totalScore,
      decision: 'accept',
      message: generateAcceptanceMessage(player, offer)
    };
  } else if (totalScore >= 70 && negotiationRound < 3) {
    const counterOffer = generateCounterOffer(context, offer);
    return {
      score: totalScore,
      decision: 'counter',
      message: generateCounterMessage(player, totalScore),
      counterOffer
    };
  } else {
    return {
      score: totalScore,
      decision: 'decline',
      message: generateDeclineMessage(player, totalScore, demands),
      reason: identifyMainIssue(offer, demands)
    };
  }
}

/**
 * Generate a counter-offer from the player
 */
export function generateCounterOffer(
  context: NegotiationContext,
  currentOffer: ContractOffer
): ContractOffer {
  const { demands, negotiationRound } = context;

  // Start with demands
  let counterYears = demands.years;
  let counterTotalValue = demands.apy * demands.years;
  let counterGuaranteed = demands.guaranteed;

  // Move toward the current offer based on negotiation round
  const flexibility = negotiationRound * 0.15; // 15% more flexible each round

  // APY counter
  const currentAPY = calculateAPY(currentOffer.totalValue, currentOffer.years);
  const targetAPY = demands.apy - (demands.apy - currentAPY) * flexibility;

  // Years counter
  counterYears = Math.round(
    demands.years - (demands.years - currentOffer.years) * flexibility
  );
  counterYears = Math.max(1, Math.min(7, counterYears));

  // Total value
  counterTotalValue = Math.round(targetAPY * counterYears);

  // Guaranteed money counter
  const currentGuaranteedPct = currentOffer.guaranteedMoney / currentOffer.totalValue;
  const targetGuaranteedPct = demands.guaranteed / (demands.apy * demands.years);
  const counterGuaranteedPct =
    targetGuaranteedPct - (targetGuaranteedPct - currentGuaranteedPct) * flexibility;
  counterGuaranteed = Math.round(counterTotalValue * counterGuaranteedPct);

  // Signing bonus (typically 30-50% of guaranteed)
  const signingBonusPct = 0.4 + Math.random() * 0.1;
  const counterSigningBonus = Math.round(counterGuaranteed * signingBonusPct);

  return {
    years: counterYears,
    totalValue: counterTotalValue,
    guaranteedMoney: counterGuaranteed,
    signingBonus: counterSigningBonus,
    structure: currentOffer.structure || 'even'
  };
}

/**
 * Calculate how good the APY is (0-100)
 */
function calculateAPYScore(offer: ContractOffer, demands: PlayerDemands): number {
  const offeredAPY = calculateAPY(offer.totalValue, offer.years);
  const ratio = offeredAPY / demands.apy;

  if (ratio >= 1.1) return 100; // 10% over asking
  if (ratio >= 1.0) return 95;  // Meets asking
  if (ratio >= 0.95) return 85; // 5% below
  if (ratio >= 0.9) return 75;  // 10% below
  if (ratio >= 0.85) return 65; // 15% below
  if (ratio >= 0.8) return 50;  // 20% below
  if (ratio >= 0.75) return 35; // 25% below
  if (ratio >= 0.7) return 20;  // 30% below
  return 10; // More than 30% below
}

/**
 * Calculate how good the years are (0-100)
 */
function calculateYearsScore(offer: ContractOffer, demands: PlayerDemands): number {
  const diff = Math.abs(offer.years - demands.years);

  if (diff === 0) return 100;
  if (diff === 1) return 80;
  if (diff === 2) return 60;
  if (diff === 3) return 40;
  return 20;
}

/**
 * Calculate how good guaranteed money is (0-100)
 */
function calculateGuaranteedScore(offer: ContractOffer, demands: PlayerDemands): number {
  const ratio = offer.guaranteedMoney / demands.guaranteed;

  if (ratio >= 1.0) return 100;
  if (ratio >= 0.95) return 90;
  if (ratio >= 0.9) return 80;
  if (ratio >= 0.85) return 70;
  if (ratio >= 0.8) return 60;
  if (ratio >= 0.75) return 50;
  if (ratio >= 0.7) return 40;
  return 30;
}

/**
 * Find the best competing offer
 */
function findBestCompetingOffer(
  offers: ContractOffer[],
  demands: PlayerDemands
): ContractOffer {
  let bestOffer = offers[0];
  let bestScore = 0;

  for (const offer of offers) {
    const apyScore = calculateAPYScore(offer, demands);
    const guaranteedScore = calculateGuaranteedScore(offer, demands);
    const score = apyScore * 0.6 + guaranteedScore * 0.4;

    if (score > bestScore) {
      bestScore = score;
      bestOffer = offer;
    }
  }

  return bestOffer;
}

/**
 * Compare two offers (returns positive if offer1 is better, negative if offer2 is better)
 */
function compareOffers(
  offer1: ContractOffer,
  offer2: ContractOffer,
  demands: PlayerDemands
): number {
  const apy1 = calculateAPY(offer1.totalValue, offer1.years);
  const apy2 = calculateAPY(offer2.totalValue, offer2.years);

  const totalValueDiff = offer1.totalValue - offer2.totalValue;
  const apyDiff = apy1 - apy2;
  const guaranteedDiff = offer1.guaranteedMoney - offer2.guaranteedMoney;

  // Weight: APY (40%), Total Value (30%), Guaranteed (30%)
  const score = apyDiff * 0.4 + totalValueDiff * 0.0000003 + guaranteedDiff * 0.0000003;

  return score;
}

/**
 * Identify the main issue with an offer
 */
function identifyMainIssue(offer: ContractOffer, demands: PlayerDemands): string {
  const apyScore = calculateAPYScore(offer, demands);
  const yearsScore = calculateYearsScore(offer, demands);
  const guaranteedScore = calculateGuaranteedScore(offer, demands);

  const lowestScore = Math.min(apyScore, yearsScore, guaranteedScore);

  if (lowestScore === apyScore) {
    return 'APY too low';
  } else if (lowestScore === guaranteedScore) {
    return 'Not enough guaranteed money';
  } else {
    return 'Contract length doesn\'t match expectations';
  }
}

/**
 * Generate acceptance message
 */
function generateAcceptanceMessage(player: any, offer: ContractOffer): string {
  const messages = [
    `We have a deal! I'm excited to join your team and help bring a championship to the city.`,
    `This is exactly what I was looking for. Let's get to work!`,
    `I'm ready to sign on the dotted line. Can't wait to get started.`,
    `This offer shows you value what I bring to the table. I'm in.`,
    `Perfect! Let's make this official and get to training camp.`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Generate counter message
 */
function generateCounterMessage(player: any, score: number): string {
  if (score >= 80) {
    return `We're getting close. I've put together a counter-offer that I think works for both sides.`;
  } else if (score >= 70) {
    return `I appreciate the offer, but we need to bridge the gap a bit. Here's what I'm thinking...`;
  } else {
    return `We're still pretty far apart. Let me show you what it would take to get this done.`;
  }
}

/**
 * Generate decline message
 */
function generateDeclineMessage(player: any, score: number, demands: PlayerDemands): string {
  if (score < 50) {
    return `This offer doesn't reflect my value to the team. I think we're too far apart to continue negotiations.`;
  } else {
    return `I appreciate your interest, but I've decided to explore other options. Good luck this season.`;
  }
}

/**
 * Check if player will re-sign with current team (loyalty factor)
 */
export function calculateLoyaltyBonus(
  player: any,
  accruedSeasons: number,
  teamSuccess: number // 0-100, based on recent playoff appearances
): number {
  let bonus = 0;

  // Long tenure
  if (accruedSeasons >= 8) bonus += 10;
  else if (accruedSeasons >= 5) bonus += 5;

  // Team success
  if (teamSuccess >= 80) bonus += 10; // Recent championship contender
  else if (teamSuccess >= 60) bonus += 5; // Playoff team

  // Random hometown loyalty factor (0-5)
  bonus += Math.floor(Math.random() * 6);

  return bonus;
}
