/**
 * Draft Pick Trade Value Calculator
 * Based on the Jimmy Johnson trade chart (modified for modern NFL)
 */

/**
 * Trade value chart - maps overall pick number to point value
 * Based on Jimmy Johnson chart with slight modern adjustments
 */
export const PICK_VALUES: Record<number, number> = {
  // Round 1
  1: 3000, 2: 2600, 3: 2200, 4: 1800, 5: 1700,
  6: 1600, 7: 1500, 8: 1400, 9: 1350, 10: 1300,
  11: 1250, 12: 1200, 13: 1150, 14: 1100, 15: 1050,
  16: 1000, 17: 950, 18: 900, 19: 875, 20: 850,
  21: 800, 22: 780, 23: 760, 24: 740, 25: 720,
  26: 700, 27: 680, 28: 660, 29: 640, 30: 620,
  31: 600, 32: 590,

  // Round 2
  33: 580, 34: 560, 35: 550, 36: 540, 37: 530,
  38: 520, 39: 510, 40: 500, 41: 490, 42: 480,
  43: 470, 44: 460, 45: 450, 46: 440, 47: 430,
  48: 420, 49: 410, 50: 400, 51: 390, 52: 380,
  53: 370, 54: 360, 55: 350, 56: 340, 57: 330,
  58: 320, 59: 310, 60: 300, 61: 292, 62: 284,
  63: 276, 64: 270,

  // Round 3
  65: 265, 66: 260, 67: 255, 68: 250, 69: 245,
  70: 240, 71: 235, 72: 230, 73: 225, 74: 220,
  75: 215, 76: 210, 77: 205, 78: 200, 79: 195,
  80: 190, 81: 185, 82: 180, 83: 175, 84: 170,
  85: 165, 86: 160, 87: 155, 88: 150, 89: 145,
  90: 140, 91: 136, 92: 132, 93: 128, 94: 124,
  95: 120, 96: 116,

  // Round 4
  97: 112, 98: 108, 99: 104, 100: 100, 101: 96,
  102: 92, 103: 88, 104: 86, 105: 84, 106: 82,
  107: 80, 108: 78, 109: 76, 110: 74, 111: 72,
  112: 70, 113: 68, 114: 66, 115: 64, 116: 62,
  117: 60, 118: 58, 119: 56, 120: 54, 121: 52,
  122: 50, 123: 49, 124: 48, 125: 47, 126: 46,
  127: 45, 128: 44, 129: 43, 130: 42, 131: 41,
  132: 40,

  // Round 5
  133: 39, 134: 38, 135: 37, 136: 36, 137: 35,
  138: 34, 139: 33, 140: 32, 141: 31, 142: 30,
  143: 29.5, 144: 29, 145: 28.5, 146: 28, 147: 27.5,
  148: 27, 149: 26.6, 150: 26.2, 151: 25.8, 152: 25.4,
  153: 25, 154: 24.6, 155: 24.2, 156: 23.8, 157: 23.4,
  158: 23, 159: 22.6, 160: 22.2, 161: 21.8, 162: 21.4,
  163: 21, 164: 20.8, 165: 20.6, 166: 20.4, 167: 20.2,
  168: 20, 169: 19.8, 170: 19.6, 171: 19.4, 172: 19.2,
  173: 19, 174: 18.8, 175: 18.6, 176: 18.4,

  // Round 6
  177: 18.2, 178: 18, 179: 17.8, 180: 17.6, 181: 17.4,
  182: 17.2, 183: 17, 184: 16.8, 185: 16.6, 186: 16.4,
  187: 16.2, 188: 16, 189: 15.8, 190: 15.6, 191: 15.4,
  192: 15.2, 193: 15, 194: 14.8, 195: 14.6, 196: 14.4,
  197: 14.2, 198: 14, 199: 13.8, 200: 13.6, 201: 13.4,
  202: 13.2, 203: 13, 204: 12.8, 205: 12.6, 206: 12.4,
  207: 12.2, 208: 12, 209: 11.8, 210: 11.6, 211: 11.4,
  212: 11.2, 213: 11, 214: 10.8, 215: 10.6, 216: 10.4,
  217: 10.2, 218: 10, 219: 9.8, 220: 9.6,

  // Round 7
  221: 9.4, 222: 9.2, 223: 9, 224: 8.8, 225: 8.6,
  226: 8.4, 227: 8.2, 228: 8, 229: 7.8, 230: 7.6,
  231: 7.4, 232: 7.2, 233: 7, 234: 6.8, 235: 6.6,
  236: 6.4, 237: 6.2, 238: 6, 239: 5.8, 240: 5.6,
  241: 5.4, 242: 5.2, 243: 5, 244: 4.8, 245: 4.6,
  246: 4.4, 247: 4.2, 248: 4, 249: 3.8, 250: 3.6,
  251: 3.4, 252: 3.2, 253: 3, 254: 2.8, 255: 2.6,
  256: 2.4, 257: 2.2, 258: 2, 259: 1.8, 260: 1.6,
  261: 1.4, 262: 1.2, 263: 1
};

/**
 * Get the trade value for a specific pick
 */
export function getPickValue(overallPick: number): number {
  return PICK_VALUES[overallPick] || 0;
}

/**
 * Calculate total value of multiple picks
 */
export function calculateTotalPickValue(picks: number[]): number {
  return picks.reduce((total, pick) => total + getPickValue(pick), 0);
}

/**
 * Evaluate if a trade is fair (within acceptable range)
 */
export function evaluateTrade(
  team1Picks: number[],
  team2Picks: number[],
  acceptableVariance: number = 0.15 // 15% variance
): {
  isFair: boolean;
  team1Value: number;
  team2Value: number;
  differential: number;
  percentageDiff: number;
  winner: 'team1' | 'team2' | 'even';
} {
  const team1Value = calculateTotalPickValue(team1Picks);
  const team2Value = calculateTotalPickValue(team2Picks);
  const differential = team1Value - team2Value;
  const higherValue = Math.max(team1Value, team2Value);
  const percentageDiff = higherValue > 0 ? Math.abs(differential) / higherValue : 0;

  return {
    isFair: percentageDiff <= acceptableVariance,
    team1Value,
    team2Value,
    differential,
    percentageDiff,
    winner: differential > 0 ? 'team1' : differential < 0 ? 'team2' : 'even'
  };
}

/**
 * Find what picks would balance a trade
 * Returns picks that team2 would need to add to make trade fair
 */
export function findBalancingPicks(
  team1Picks: number[],
  team2Picks: number[],
  availableTeam2Picks: number[]
): number[] {
  const team1Value = calculateTotalPickValue(team1Picks);
  const team2Value = calculateTotalPickValue(team2Picks);
  const deficit = team1Value - team2Value;

  if (deficit <= 0) return []; // Team 2 already has enough value

  // Sort available picks by value (descending)
  const sortedPicks = availableTeam2Picks
    .filter(pick => !team2Picks.includes(pick))
    .sort((a, b) => getPickValue(b) - getPickValue(a));

  const balancingPicks: number[] = [];
  let remainingDeficit = deficit;

  for (const pick of sortedPicks) {
    if (remainingDeficit <= 0) break;

    const pickValue = getPickValue(pick);
    balancingPicks.push(pick);
    remainingDeficit -= pickValue;
  }

  return balancingPicks;
}

/**
 * Suggest a counter-offer to make trade more fair
 */
export function suggestCounterOffer(
  team1Picks: number[],
  team2Picks: number[],
  allTeam1Picks: number[],
  allTeam2Picks: number[]
): {
  addToTeam1: number[];
  removeFromTeam1: number[];
  addToTeam2: number[];
  removeFromTeam2: number[];
  resultingDifferential: number;
} | null {
  const evaluation = evaluateTrade(team1Picks, team2Picks);

  if (evaluation.isFair) {
    return null; // Already fair
  }

  // Determine which team needs to add value
  const deficitTeam = evaluation.winner === 'team1' ? 2 : 1;
  const deficit = Math.abs(evaluation.differential);

  if (deficitTeam === 1) {
    // Team 1 needs to add picks
    const availablePicks = allTeam1Picks.filter(p => !team1Picks.includes(p));
    const balancingPicks = findBalancingPicks(team2Picks, team1Picks, availablePicks);

    return {
      addToTeam1: balancingPicks,
      removeFromTeam1: [],
      addToTeam2: [],
      removeFromTeam2: [],
      resultingDifferential: evaluation.differential + calculateTotalPickValue(balancingPicks)
    };
  } else {
    // Team 2 needs to add picks
    const availablePicks = allTeam2Picks.filter(p => !team2Picks.includes(p));
    const balancingPicks = findBalancingPicks(team1Picks, team2Picks, availablePicks);

    return {
      addToTeam1: [],
      removeFromTeam1: [],
      addToTeam2: balancingPicks,
      removeFromTeam2: [],
      resultingDifferential: evaluation.differential - calculateTotalPickValue(balancingPicks)
    };
  }
}

/**
 * Calculate the round and pick number from overall pick
 */
export function getRoundAndPick(overallPick: number): { round: number; pick: number } {
  const round = Math.ceil(overallPick / 32);
  const pick = ((overallPick - 1) % 32) + 1;
  return { round, pick };
}

/**
 * Calculate overall pick from round and pick number
 */
export function getOverallPick(round: number, pick: number): number {
  return (round - 1) * 32 + pick;
}

/**
 * Format pick display (e.g., "1.15" for Round 1, Pick 15)
 */
export function formatPick(overallPick: number): string {
  const { round, pick } = getRoundAndPick(overallPick);
  return `${round}.${pick.toString().padStart(2, '0')}`;
}

/**
 * Get pick description (e.g., "Round 1, Pick 15 (15th overall)")
 */
export function getPickDescription(overallPick: number): string {
  const { round, pick } = getRoundAndPick(overallPick);
  return `Round ${round}, Pick ${pick} (${overallPick}${getOrdinalSuffix(overallPick)} overall)`;
}

/**
 * Get ordinal suffix for number (1st, 2nd, 3rd, etc.)
 */
function getOrdinalSuffix(num: number): string {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

/**
 * Calculate "move up" cost - how much does it cost to trade up?
 */
export function calculateMoveUpCost(
  fromPick: number,
  toPick: number
): number {
  if (fromPick <= toPick) return 0; // Not moving up
  return getPickValue(toPick) - getPickValue(fromPick);
}

/**
 * Calculate what picks are needed to move up
 */
export function calculatePicksToMoveUp(
  fromPick: number,
  toPick: number,
  availablePicks: number[]
): number[] {
  const cost = calculateMoveUpCost(fromPick, toPick);
  if (cost <= 0) return [];

  // Start with the fromPick
  const picksToTrade = [fromPick];
  let currentValue = getPickValue(fromPick);
  let targetValue = getPickValue(toPick);

  // Sort available picks by value (ascending - use lower value picks first)
  const sortedPicks = availablePicks
    .filter(p => p !== fromPick)
    .sort((a, b) => getPickValue(a) - getPickValue(b));

  for (const pick of sortedPicks) {
    if (currentValue >= targetValue) break;

    picksToTrade.push(pick);
    currentValue += getPickValue(pick);
  }

  return currentValue >= targetValue ? picksToTrade : [];
}
