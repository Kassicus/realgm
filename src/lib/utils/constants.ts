/**
 * Game constants and configuration values
 */

// Salary Cap
export const SALARY_CAP_2025 = 279200000; // $279.2M
export const SALARY_FLOOR_2025 = 248248000; // 89% of cap

// Minimum Salaries by Accrued Seasons (2025 values)
export const MINIMUM_SALARIES: Record<number, number> = {
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
  10: 1500000,
};

// Roster Limits
export const ACTIVE_ROSTER_SIZE = 53;
export const PRACTICE_SQUAD_SIZE = 16;
export const OFFSEASON_ROSTER_SIZE = 90;
export const OFFSEASON_CAP_COUNT = 51; // Only top 51 count in offseason

// Draft
export const DRAFT_ROUNDS = 7;
export const PICKS_PER_ROUND = 32;
export const TOTAL_DRAFT_PICKS = DRAFT_ROUNDS * PICKS_PER_ROUND; // 224

// Positions
export const POSITIONS = [
  'QB', 'RB', 'WR', 'TE', 'OL',
  'DL', 'LB', 'CB', 'S',
  'K', 'P', 'LS'
] as const;

export const OFFENSIVE_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OL'] as const;
export const DEFENSIVE_POSITIONS = ['DL', 'LB', 'CB', 'S'] as const;
export const SPECIAL_TEAMS_POSITIONS = ['K', 'P', 'LS'] as const;

// Rating Tiers
export const RATING_TIERS = {
  SUPERSTAR: { min: 90, max: 99, label: 'Superstar' },
  PRO_BOWL: { min: 85, max: 89, label: 'Pro Bowl' },
  ABOVE_AVERAGE: { min: 77, max: 84, label: 'Above Average' },
  AVERAGE: { min: 70, max: 76, label: 'Average' },
  BELOW_AVERAGE: { min: 60, max: 69, label: 'Below Average' },
  POOR: { min: 54, max: 59, label: 'Poor' },
} as const;

// Season Phases
export const SEASON_PHASES = [
  'Post-Season',
  'Pre-Free Agency',
  'Free Agency',
  'Pre-Draft',
  'Draft',
  'Post-Draft',
  'Training Camp',
  'Regular Season',
  'Playoffs'
] as const;

// Contract Types
export const CONTRACT_TYPES = [
  'Rookie',
  'Veteran',
  'Extension',
  'Franchise Tag',
  'Transition Tag'
] as const;

// Free Agent Types
export const FREE_AGENT_TYPES = ['UFA', 'RFA', 'ERFA'] as const;
