import { getDatabase } from '@/lib/database/client';

export interface ContractYear {
  year: number;
  base_salary: number;
  roster_bonus: number;
  workout_bonus: number;
  guarantees: number;
}

export interface Contract {
  contract_id: number;
  player_id: number;
  team_id: number;
  total_years: number;
  current_year: number;
  years_remaining: number;
  signing_bonus_total: number;
  signing_bonus_remaining: number;
  annual_breakdown: ContractYear[];
  has_void_years: boolean;
  void_year?: number;
}

export interface CapCalculation {
  total_cap_hit: number;
  base_salary: number;
  prorated_bonus: number;
  roster_bonus: number;
  workout_bonus: number;
}

/**
 * Calculate salary cap hit for a contract in a given year
 */
export function calculateCapHit(contract: Contract, year: number): CapCalculation {
  // Find the annual breakdown for this year
  const yearData = contract.annual_breakdown.find(y => y.year === year);

  if (!yearData) {
    throw new Error(`No data for year ${year} in contract`);
  }

  // Calculate prorated signing bonus
  const proratedBonus = contract.signing_bonus_remaining > 0
    ? Math.floor(contract.signing_bonus_total / Math.min(contract.total_years, 5))
    : 0;

  const capHit: CapCalculation = {
    base_salary: yearData.base_salary,
    roster_bonus: yearData.roster_bonus,
    workout_bonus: yearData.workout_bonus,
    prorated_bonus: proratedBonus,
    total_cap_hit: yearData.base_salary + yearData.roster_bonus + yearData.workout_bonus + proratedBonus
  };

  return capHit;
}

/**
 * Calculate dead money if player is cut
 */
export function calculateDeadMoney(
  contract: Contract,
  currentYear: number,
  isJune1Cut: boolean = false
): { currentYearDeadMoney: number; nextYearDeadMoney: number; capSavings: number } {
  const yearData = contract.annual_breakdown.find(y => y.year === currentYear);

  if (!yearData) {
    throw new Error(`No data for year ${currentYear} in contract`);
  }

  // Calculate remaining signing bonus proration
  const remainingBonusYears = contract.years_remaining;
  const proratedBonusPerYear = Math.floor(contract.signing_bonus_total / Math.min(contract.total_years, 5));
  const remainingBonusTotal = proratedBonusPerYear * remainingBonusYears;

  // Guaranteed money still owed
  const guaranteedRemaining = yearData.guarantees;

  if (isJune1Cut) {
    // June 1 designation spreads dead money over 2 years
    return {
      currentYearDeadMoney: proratedBonusPerYear + guaranteedRemaining,
      nextYearDeadMoney: remainingBonusTotal - proratedBonusPerYear,
      capSavings: yearData.base_salary + yearData.roster_bonus + yearData.workout_bonus - guaranteedRemaining
    };
  } else {
    // Pre-June 1 cut - all dead money accelerates to current year
    return {
      currentYearDeadMoney: remainingBonusTotal + guaranteedRemaining,
      nextYearDeadMoney: 0,
      capSavings: yearData.base_salary + yearData.roster_bonus + yearData.workout_bonus - guaranteedRemaining
    };
  }
}

/**
 * Calculate contract restructure
 */
export function calculateRestructure(
  contract: Contract,
  currentYear: number,
  amountToRestructure: number
): { newCapHit: number; futureCapHits: number[]; annualProration: number } {
  const yearData = contract.annual_breakdown.find(y => y.year === currentYear);

  if (!yearData) {
    throw new Error(`No data for year ${currentYear} in contract`);
  }

  // Validate restructure amount
  const minBaseSalary = getMinimumSalary(contract); // Based on accrued seasons
  const maxRestructure = yearData.base_salary - minBaseSalary;

  if (amountToRestructure > maxRestructure) {
    throw new Error(`Cannot restructure more than ${maxRestructure}. Must leave minimum base salary.`);
  }

  // Calculate new proration
  const prorateYears = Math.min(contract.years_remaining, 5);
  const annualProration = Math.floor(amountToRestructure / prorateYears);

  // New cap hit for current year
  const newBaseSalary = yearData.base_salary - amountToRestructure;
  const existingProratedBonus = Math.floor(contract.signing_bonus_total / Math.min(contract.total_years, 5));
  const newCapHit = newBaseSalary + yearData.roster_bonus + yearData.workout_bonus + existingProratedBonus + annualProration;

  // Future year cap hits
  const futureCapHits: number[] = [];
  for (let i = 1; i < prorateYears; i++) {
    const futureYear = contract.annual_breakdown.find(y => y.year === currentYear + i);
    if (futureYear) {
      const futureHit = futureYear.base_salary + futureYear.roster_bonus + futureYear.workout_bonus + existingProratedBonus + annualProration;
      futureCapHits.push(futureHit);
    }
  }

  return {
    newCapHit,
    futureCapHits,
    annualProration
  };
}

/**
 * Get minimum salary based on accrued seasons
 * (Values from 2025 CBA)
 */
function getMinimumSalary(contract: Contract): number {
  // This would need to query player's accrued_seasons from database
  // For now, returning a placeholder
  const db = getDatabase();
  const player = db.prepare('SELECT accrued_seasons FROM players WHERE player_id = ?')
    .get(contract.player_id) as { accrued_seasons: number };

  const minimumSalaries: { [key: number]: number } = {
    0: 750000,
    1: 870000,
    2: 940000,
    3: 1000000,
    4: 1092500,
    5: 1092500,
    6: 1092500,
    7: 1250000,
    8: 1250000,
    9: 1250000,
    10: 1500000
  };

  const accruedSeasons = player.accrued_seasons;
  return minimumSalaries[Math.min(accruedSeasons, 10)] || 1500000;
}

/**
 * Calculate team's total cap space
 */
export function calculateTeamCapSpace(teamId: number, season: number): {
  usedCapSpace: number;
  availableCapSpace: number;
  totalCap: number;
  topPlayersCount: number;
} {
  const db = getDatabase();

  // Get league salary cap
  const gameState = db.prepare('SELECT league_salary_cap FROM game_state WHERE state_id = 1')
    .get() as { league_salary_cap: number };

  const totalCap = gameState.league_salary_cap;

  // Get all active contracts for this team
  const contractsRaw = db.prepare(`
    SELECT * FROM contracts
    WHERE team_id = ? AND is_active = 1
    ORDER BY current_cap_hit DESC
  `).all(teamId) as any[];

  // Parse annual_breakdown JSON for each contract
  const contracts: Contract[] = contractsRaw.map(c => ({
    ...c,
    annual_breakdown: JSON.parse(c.annual_breakdown)
  }));

  // In offseason, only top 51 count
  const isOffseason = true; // TODO: Check current phase from game_state
  const capCountThreshold = isOffseason ? 51 : 53;

  // Calculate cap hits
  let usedCapSpace = 0;
  let count = 0;

  for (const contract of contracts) {
    if (count >= capCountThreshold) break;

    const capHit = calculateCapHit(contract, season);
    usedCapSpace += capHit.total_cap_hit;
    count++;
  }

  return {
    usedCapSpace,
    availableCapSpace: totalCap - usedCapSpace,
    totalCap,
    topPlayersCount: count
  };
}
