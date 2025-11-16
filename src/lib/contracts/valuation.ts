/**
 * Player Valuation Engine
 * Calculates contract demands for free agents based on:
 * - Position value
 * - Overall rating
 * - Age
 * - Market conditions
 */

export interface PlayerDemands {
  apy: number; // Average per year
  years: number; // Contract length
  guaranteed: number; // Total guaranteed money
  priority: 'money' | 'years' | 'winning' | 'hometown'; // Player's top priority
}

interface Player {
  player_id: number;
  position: string;
  overall_rating: number;
  age: number;
  accrued_seasons?: number;
  current_team_id?: number;
}

/**
 * Calculate a player's contract demands
 */
export function calculatePlayerValue(player: Player): PlayerDemands {
  const baseValue = getPositionBaseValue(player.position, player.overall_rating);

  // Age modifier
  const ageModifier = getAgeModifier(player.age, player.position);

  // Performance modifier (based on recent stats if available)
  // TODO: Calculate from actual stats once stats system is implemented
  const performanceModifier = 1.0;

  // Market modifier (supply/demand at position)
  const marketModifier = getMarketModifier(player.position);

  const apy = Math.round(baseValue * ageModifier * performanceModifier * marketModifier);

  // Years based on age and position
  const years = calculateContractYears(player.age, player.position);

  // Guaranteed money (typically 40-70% for good players)
  const guaranteedPct = calculateGuaranteedPercentage(player.overall_rating, player.age);
  const guaranteed = Math.round(apy * years * guaranteedPct);

  // Determine priority based on age, rating, and team situation
  const priority = determinePlayerPriority(player);

  return { apy, years, guaranteed, priority };
}

/**
 * Get base salary value for position and rating
 */
function getPositionBaseValue(position: string, rating: number): number {
  // Position-specific salary scales (2025 estimates)
  const positionMultipliers: Record<string, number> = {
    'QB': 2.5,
    'EDGE': 1.8,
    'WR': 1.6,
    'CB': 1.5,
    'OT': 1.5,
    'DT': 1.3,
    'S': 1.2,
    'LB': 1.2,
    'OG': 1.0,
    'C': 1.0,
    'TE': 1.0,
    'RB': 0.8,
    'K': 0.5,
    'P': 0.5,
    'LS': 0.4
  };

  const multiplier = positionMultipliers[position] || 1.0;

  // Rating to base salary curve (exponential for elite players)
  let baseSalary = 0;
  if (rating >= 90) {
    baseSalary = 25000000; // Elite tier
  } else if (rating >= 85) {
    baseSalary = 18000000; // Pro Bowl tier
  } else if (rating >= 80) {
    baseSalary = 12000000; // Above average starter
  } else if (rating >= 75) {
    baseSalary = 8000000;  // Average starter
  } else if (rating >= 70) {
    baseSalary = 5000000;  // Below average starter
  } else if (rating >= 65) {
    baseSalary = 2000000;  // Backup/depth
  } else {
    baseSalary = 1000000;  // Minimum-level player
  }

  return baseSalary * multiplier;
}

/**
 * Calculate age modifier based on position-specific peak ages
 */
function getAgeModifier(age: number, position: string): number {
  // Peak ages vary by position
  const peakAges: Record<string, [number, number]> = {
    'QB': [27, 33],
    'RB': [23, 27],
    'WR': [26, 30],
    'TE': [26, 31],
    'OT': [27, 32],
    'OG': [27, 32],
    'C': [27, 32],
    'EDGE': [26, 30],
    'DT': [26, 30],
    'LB': [25, 29],
    'CB': [25, 29],
    'S': [26, 30],
    'K': [27, 35],
    'P': [27, 35],
    'LS': [27, 35]
  };

  const [peakStart, peakEnd] = peakAges[position] || [26, 30];

  if (age < peakStart) {
    // Young player discount (but rising value)
    return 0.85 + (age - 22) * 0.03;
  } else if (age <= peakEnd) {
    // Peak value
    return 1.0;
  } else {
    // Age decline
    const yearsPastPeak = age - peakEnd;
    return Math.max(0.6, 1.0 - yearsPastPeak * 0.08);
  }
}

/**
 * Calculate contract length based on age and position
 */
function calculateContractYears(age: number, position: string): number {
  // QBs can get longer deals
  if (position === 'QB' && age < 30) return 4;

  // RBs get shorter deals, especially older ones
  if (position === 'RB' && age > 26) return 2;

  // General age-based logic
  if (age < 26) return 4;
  if (age < 29) return 3;
  if (age < 32) return 2;
  return 1;
}

/**
 * Calculate guaranteed percentage based on rating and age
 */
function calculateGuaranteedPercentage(rating: number, age: number): number {
  let basePct = 0.3; // 30% base

  // Better players get more guarantees
  if (rating >= 90) basePct = 0.7;
  else if (rating >= 85) basePct = 0.6;
  else if (rating >= 80) basePct = 0.5;
  else if (rating >= 75) basePct = 0.45;
  else if (rating >= 70) basePct = 0.4;

  // Younger players can demand more guarantees
  if (age < 27) basePct += 0.05;

  // Older players get less
  if (age > 30) basePct -= 0.1;
  if (age > 32) basePct -= 0.15;

  return Math.max(0.25, Math.min(0.75, basePct));
}

/**
 * Determine player's priority in negotiations
 */
function determinePlayerPriority(player: Player): 'money' | 'years' | 'winning' | 'hometown' {
  const { age, overall_rating, accrued_seasons = 0, current_team_id } = player;

  // Older players prioritize security (years)
  if (age > 30) return 'years';

  // Elite players in their late 20s prioritize winning
  if (overall_rating >= 85 && age >= 28 && age <= 31) return 'winning';

  // Veterans with their original team might prioritize staying
  if (accrued_seasons >= 6 && current_team_id) {
    // 30% chance to prioritize hometown
    if (Math.random() < 0.3) return 'hometown';
  }

  // Default: money
  return 'money';
}

/**
 * Get market modifier based on position supply/demand
 * TODO: Calculate this dynamically based on actual FA market
 */
function getMarketModifier(position: string): number {
  // For now, return neutral
  // In future: analyze FA market to adjust based on supply/demand
  return 1.0;
}

/**
 * Calculate Annual Per Year (APY) from total value and years
 */
export function calculateAPY(totalValue: number, years: number): number {
  return Math.round(totalValue / years);
}

/**
 * Calculate cap hit for first year of contract
 */
export function calculateYear1CapHit(
  totalValue: number,
  years: number,
  signingBonus: number
): number {
  // Signing bonus prorates over min of years or 5
  const bonusProration = signingBonus / Math.min(years, 5);

  // Base salary for year 1 (simplified)
  const baseSalary = (totalValue - signingBonus) / years;

  return Math.round(bonusProration + baseSalary);
}

/**
 * Generate a standard contract structure
 */
export function generateContractStructure(
  totalValue: number,
  years: number,
  guaranteedMoney: number,
  signingBonus: number,
  structureType: 'frontloaded' | 'backloaded' | 'even' = 'even'
): number[] {
  const annualSalaries: number[] = [];
  const nonBonusMoney = totalValue - signingBonus;

  if (structureType === 'even') {
    // Even distribution
    const yearlyAmount = nonBonusMoney / years;
    for (let i = 0; i < years; i++) {
      annualSalaries.push(Math.round(yearlyAmount));
    }
  } else if (structureType === 'frontloaded') {
    // Higher early years, lower later years
    const weights = [1.5, 1.3, 1.1, 0.9, 0.8, 0.7, 0.6];
    const totalWeight = weights.slice(0, years).reduce((a, b) => a + b, 0);

    for (let i = 0; i < years; i++) {
      const yearlyAmount = (nonBonusMoney * weights[i]) / totalWeight;
      annualSalaries.push(Math.round(yearlyAmount));
    }
  } else {
    // Backloaded - lower early years, higher later years
    const weights = [0.6, 0.7, 0.8, 0.9, 1.1, 1.3, 1.5];
    const totalWeight = weights.slice(0, years).reduce((a, b) => a + b, 0);

    for (let i = 0; i < years; i++) {
      const yearlyAmount = (nonBonusMoney * weights[i]) / totalWeight;
      annualSalaries.push(Math.round(yearlyAmount));
    }
  }

  return annualSalaries;
}

/**
 * Validate that a contract meets minimum requirements
 */
export function validateContract(
  totalValue: number,
  years: number,
  guaranteedMoney: number,
  signingBonus: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (years < 1 || years > 7) {
    errors.push('Contract must be between 1 and 7 years');
  }

  if (guaranteedMoney > totalValue) {
    errors.push('Guaranteed money cannot exceed total value');
  }

  if (signingBonus > totalValue) {
    errors.push('Signing bonus cannot exceed total value');
  }

  if (signingBonus > guaranteedMoney) {
    errors.push('Signing bonus cannot exceed guaranteed money');
  }

  if (totalValue < 1000000) {
    errors.push('Total value must be at least $1,000,000');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
