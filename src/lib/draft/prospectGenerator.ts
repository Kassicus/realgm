/**
 * Draft Prospect Generation System
 * Generates realistic draft classes with proper rating distributions
 */

import { getDatabase } from '@/lib/database/client';

interface ProspectAttributes {
  firstName: string;
  lastName: string;
  position: string;
  college: string;
  heightInches: number;
  weight: number;
  age: number;
  trueOverallRating: number;
  scoutedOverallRating: number;
  draftGrade: string;
  projectedRound: number;
  combineStats: {
    fortyYard?: number;
    benchPress?: number;
    verticalJump?: number;
    broadJump?: number;
    threeCone?: number;
    twentyYardShuttle?: number;
  };
  intangibles: {
    workEthic: number;
    injuryRisk: number;
    characterGrade: number;
    footballIQ: number;
  };
  developmentTrait: string;
  nflComparison?: string;
}

// Position distribution for a realistic draft class
const POSITION_DISTRIBUTION: Record<string, number> = {
  QB: 15,
  RB: 20,
  WR: 35,
  TE: 15,
  OT: 25,
  OG: 20,
  C: 12,
  EDGE: 30,
  DT: 25,
  LB: 25,
  CB: 30,
  S: 20,
  K: 3,
  P: 3,
  LS: 2
};

// College names for variety
const COLLEGES = [
  'Alabama', 'Georgia', 'Ohio State', 'Michigan', 'LSU', 'Clemson', 'Oklahoma',
  'Texas', 'USC', 'Penn State', 'Florida', 'Notre Dame', 'Oregon', 'Miami',
  'Auburn', 'Florida State', 'Texas A&M', 'Tennessee', 'Wisconsin', 'Iowa',
  'Michigan State', 'Stanford', 'Washington', 'Ole Miss', 'Mississippi State',
  'Arkansas', 'Kentucky', 'South Carolina', 'UCLA', 'California', 'Arizona State',
  'Utah', 'Colorado', 'TCU', 'Baylor', 'Oklahoma State', 'Kansas State',
  'North Carolina', 'NC State', 'Virginia Tech', 'Pittsburgh', 'West Virginia',
  'Boston College', 'Syracuse', 'Louisville', 'Purdue', 'Minnesota', 'Nebraska',
  'Northwestern', 'Indiana', 'Illinois', 'Rutgers', 'Maryland', 'Duke', 'Wake Forest'
];

// First names pool
const FIRST_NAMES = [
  'James', 'Michael', 'Robert', 'John', 'David', 'William', 'Richard', 'Joseph',
  'Thomas', 'Christopher', 'Charles', 'Daniel', 'Matthew', 'Anthony', 'Mark',
  'Donald', 'Steven', 'Andrew', 'Kenneth', 'Joshua', 'Kevin', 'Brian', 'George',
  'Timothy', 'Ronald', 'Edward', 'Jason', 'Jeffrey', 'Ryan', 'Jacob', 'Gary',
  'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon',
  'Benjamin', 'Samuel', 'Raymond', 'Gregory', 'Frank', 'Alexander', 'Patrick',
  'Jack', 'Dennis', 'Jerry', 'Tyler', 'Aaron', 'Jose', 'Adam', 'Nathan',
  'Douglas', 'Zachary', 'Peter', 'Kyle', 'Walter', 'Ethan', 'Jeremy', 'Harold',
  'Keith', 'Christian', 'Roger', 'Noah', 'Gerald', 'Carl', 'Terry', 'Sean',
  'Austin', 'Arthur', 'Lawrence', 'Jesse', 'Dylan', 'Bryan', 'Joe', 'Jordan',
  'Billy', 'Bruce', 'Albert', 'Willie', 'Gabriel', 'Logan', 'Alan', 'Juan',
  'Wayne', 'Elijah', 'Randy', 'Roy', 'Vincent', 'Ralph', 'Eugene', 'Russell',
  'Bobby', 'Mason', 'Philip', 'Louis', 'Isaiah', 'Jamal', 'Darius', 'Marcus',
  'Tyrone', 'DeAndre', 'Malik', 'Terrell', 'Trevon', 'Jalen', 'Devin', 'Cordell'
];

// Last names pool
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill',
  'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell',
  'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner',
  'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris',
  'Morales', 'Murphy', 'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper',
  'Peterson', 'Bailey', 'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox',
  'Ward', 'Richardson', 'Watson', 'Brooks', 'Chavez', 'Wood', 'James', 'Bennett',
  'Gray', 'Mendoza', 'Ruiz', 'Hughes', 'Price', 'Alvarez', 'Castillo', 'Sanders',
  'Patel', 'Myers', 'Long', 'Ross', 'Foster', 'Jimenez', 'Washington', 'Jenkins'
];

/**
 * Generate a complete draft class
 */
export function generateDraftClass(year: number, totalProspects: number = 280): void {
  const db = getDatabase();

  console.log(`Generating ${totalProspects} prospects for ${year} draft class...`);

  const prospects: ProspectAttributes[] = [];

  // Generate prospects for each position
  for (const [position, count] of Object.entries(POSITION_DISTRIBUTION)) {
    for (let i = 0; i < count; i++) {
      prospects.push(generateProspect(position, year));
    }
  }

  // Fill remaining spots with random positions
  while (prospects.length < totalProspects) {
    const positions = Object.keys(POSITION_DISTRIBUTION);
    const randomPos = positions[Math.floor(Math.random() * positions.length)];
    prospects.push(generateProspect(randomPos, year));
  }

  // Shuffle prospects
  shuffleArray(prospects);

  // Insert into database
  const insertStmt = db.prepare(`
    INSERT INTO draft_prospects (
      first_name, last_name, position, college,
      height_inches, weight, age,
      true_overall_rating, true_position_ratings,
      scouted_overall_rating, scouted_position_ratings,
      draft_grade, projected_round,
      forty_yard_dash, bench_press, vertical_jump, broad_jump,
      three_cone_drill, twenty_yard_shuttle,
      work_ethic, injury_risk, character_grade, football_iq,
      development_trait, nfl_comparison, injury_flags, draft_year
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  for (const prospect of prospects) {
    insertStmt.run(
      prospect.firstName,
      prospect.lastName,
      prospect.position,
      prospect.college,
      prospect.heightInches,
      prospect.weight,
      prospect.age,
      prospect.trueOverallRating,
      JSON.stringify({}), // Position ratings (simplified for now)
      prospect.scoutedOverallRating,
      JSON.stringify({}),
      prospect.draftGrade,
      prospect.projectedRound,
      prospect.combineStats.fortyYard,
      prospect.combineStats.benchPress,
      prospect.combineStats.verticalJump,
      prospect.combineStats.broadJump,
      prospect.combineStats.threeCone,
      prospect.combineStats.twentyYardShuttle,
      prospect.intangibles.workEthic,
      prospect.intangibles.injuryRisk,
      prospect.intangibles.characterGrade,
      prospect.intangibles.footballIQ,
      prospect.developmentTrait,
      prospect.nflComparison,
      JSON.stringify([]),
      year
    );
  }

  console.log(`✓ Generated ${prospects.length} prospects for ${year} draft`);
}

/**
 * Generate a single prospect
 */
function generateProspect(position: string, year: number): ProspectAttributes {
  // Generate overall rating with realistic distribution
  const trueRating = generateOverallRating();

  // Scouted rating has variance based on scout accuracy
  const scoutingError = (Math.random() - 0.5) * 6; // ±3 points variance
  const scoutedRating = Math.max(54, Math.min(99, Math.round(trueRating + scoutingError)));

  // Determine draft grade based on rating
  const draftGrade = getDraftGrade(trueRating);
  const projectedRound = getProjectedRound(trueRating);

  return {
    firstName: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)],
    lastName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)],
    position,
    college: COLLEGES[Math.floor(Math.random() * COLLEGES.length)],
    heightInches: generateHeight(position),
    weight: generateWeight(position),
    age: 20 + Math.floor(Math.random() * 4), // 20-23 years old
    trueOverallRating: trueRating,
    scoutedOverallRating: scoutedRating,
    draftGrade,
    projectedRound,
    combineStats: generateCombineStats(position, trueRating),
    intangibles: generateIntangibles(),
    developmentTrait: getDevelopmentTrait(trueRating),
    nflComparison: generateComparison(position, trueRating)
  };
}

/**
 * Generate overall rating with realistic bell curve distribution
 */
function generateOverallRating(): number {
  // Use Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  // Mean: 72, Standard deviation: 8
  const rating = 72 + z * 8;

  return Math.max(54, Math.min(99, Math.round(rating)));
}

/**
 * Get draft grade from rating
 */
function getDraftGrade(rating: number): string {
  if (rating >= 85) return '1st Round';
  if (rating >= 78) return '2nd-3rd Round';
  if (rating >= 70) return '4th-5th Round';
  if (rating >= 65) return '6th-7th Round';
  return 'UDFA';
}

/**
 * Get projected round from rating
 */
function getProjectedRound(rating: number): number {
  if (rating >= 85) return 1;
  if (rating >= 80) return 2;
  if (rating >= 75) return 3;
  if (rating >= 70) return 4;
  if (rating >= 67) return 5;
  if (rating >= 64) return 6;
  return 7;
}

/**
 * Generate height for position (in inches)
 */
function generateHeight(position: string): number {
  const heights: Record<string, [number, number]> = {
    QB: [73, 77], // 6'1" - 6'5"
    RB: [68, 73], // 5'8" - 6'1"
    WR: [70, 77], // 5'10" - 6'5"
    TE: [74, 79], // 6'2" - 6'7"
    OT: [76, 80], // 6'4" - 6'8"
    OG: [73, 77], // 6'1" - 6'5"
    C: [72, 76], // 6'0" - 6'4"
    EDGE: [74, 78], // 6'2" - 6'6"
    DT: [73, 77], // 6'1" - 6'5"
    LB: [72, 76], // 6'0" - 6'4"
    CB: [69, 74], // 5'9" - 6'2"
    S: [70, 75], // 5'10" - 6'3"
    K: [70, 75],
    P: [72, 77],
    LS: [73, 77]
  };

  const [min, max] = heights[position] || [72, 76];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate weight for position (in pounds)
 */
function generateWeight(position: string): number {
  const weights: Record<string, [number, number]> = {
    QB: [210, 240],
    RB: [200, 230],
    WR: [180, 220],
    TE: [240, 270],
    OT: [300, 340],
    OG: [300, 330],
    C: [290, 320],
    EDGE: [245, 275],
    DT: [285, 330],
    LB: [230, 260],
    CB: [180, 205],
    S: [195, 220],
    K: [180, 210],
    P: [190, 220],
    LS: [240, 260]
  };

  const [min, max] = weights[position] || [200, 250];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate combine stats
 */
function generateCombineStats(position: string, rating: number) {
  const ratingBonus = (rating - 70) * 0.015; // Better players perform better

  return {
    fortyYard: generateFortyTime(position, ratingBonus),
    benchPress: generateBenchPress(position, ratingBonus),
    verticalJump: generateVertical(position, ratingBonus),
    broadJump: generateBroadJump(position, ratingBonus),
    threeCone: generateThreeCone(position, ratingBonus),
    twentyYardShuttle: generateShuttle(position, ratingBonus)
  };
}

function generateFortyTime(position: string, bonus: number): number {
  const baseTimes: Record<string, number> = {
    QB: 4.85, RB: 4.55, WR: 4.50, TE: 4.70, OT: 5.30, OG: 5.25, C: 5.20,
    EDGE: 4.75, DT: 5.00, LB: 4.70, CB: 4.48, S: 4.55, K: 4.80, P: 4.85, LS: 5.10
  };
  const base = baseTimes[position] || 4.75;
  return parseFloat((base - bonus * 0.1 + (Math.random() - 0.5) * 0.15).toFixed(2));
}

function generateBenchPress(position: string, bonus: number): number {
  const baseReps: Record<string, number> = {
    QB: 15, RB: 20, WR: 16, TE: 22, OT: 28, OG: 30, C: 28,
    EDGE: 24, DT: 26, LB: 22, CB: 14, S: 16, K: 10, P: 12, LS: 20
  };
  const base = baseReps[position] || 20;
  return Math.round(base + bonus * 2 + (Math.random() - 0.5) * 5);
}

function generateVertical(position: string, bonus: number): number {
  const baseVert: Record<string, number> = {
    QB: 30, RB: 35, WR: 36, TE: 32, OT: 26, OG: 27, C: 28,
    EDGE: 32, DT: 28, LB: 32, CB: 37, S: 35, K: 28, P: 30, LS: 26
  };
  const base = baseVert[position] || 30;
  return parseFloat((base + bonus * 1.5 + (Math.random() - 0.5) * 4).toFixed(1));
}

function generateBroadJump(position: string, bonus: number): number {
  const base = 115 + (Math.random() - 0.5) * 15;
  return parseFloat((base + bonus * 3).toFixed(1));
}

function generateThreeCone(position: string, bonus: number): number {
  const base = 7.2 - (Math.random() - 0.5) * 0.4;
  return parseFloat((base - bonus * 0.1).toFixed(2));
}

function generateShuttle(position: string, bonus: number): number {
  const base = 4.4 - (Math.random() - 0.5) * 0.3;
  return parseFloat((base - bonus * 0.08).toFixed(2));
}

/**
 * Generate intangibles
 */
function generateIntangibles() {
  return {
    workEthic: Math.ceil(Math.random() * 5),
    injuryRisk: Math.ceil(Math.random() * 5),
    characterGrade: Math.ceil(Math.random() * 5),
    footballIQ: Math.ceil(Math.random() * 5)
  };
}

/**
 * Get development trait
 */
function getDevelopmentTrait(rating: number): string {
  if (rating >= 90) return Math.random() < 0.4 ? 'Star' : 'Elite';
  if (rating >= 85) return Math.random() < 0.3 ? 'Elite' : 'Quick';
  if (rating >= 75) return Math.random() < 0.5 ? 'Quick' : 'Normal';
  if (rating >= 70) return 'Normal';
  return Math.random() < 0.3 ? 'Normal' : 'Slow';
}

/**
 * Generate NFL comparison
 */
function generateComparison(position: string, rating: number): string | undefined {
  if (rating < 75) return undefined; // Only good prospects get comparisons

  const comparisons: Record<string, string[]> = {
    QB: ['Patrick Mahomes', 'Josh Allen', 'Joe Burrow', 'Lamar Jackson', 'Jalen Hurts'],
    RB: ['Christian McCaffrey', 'Derrick Henry', 'Nick Chubb', 'Jonathan Taylor'],
    WR: ['Justin Jefferson', 'Tyreek Hill', 'Stefon Diggs', 'Davante Adams'],
    TE: ['Travis Kelce', 'George Kittle', 'Mark Andrews', 'TJ Hockenson'],
    EDGE: ['Micah Parsons', 'Nick Bosa', 'TJ Watt', 'Myles Garrett'],
    CB: ['Jalen Ramsey', 'Patrick Surtain', 'Sauce Gardner', 'Denzel Ward']
  };

  const pool = comparisons[position] || ['Solid NFL Starter'];
  const comparison = pool[Math.floor(Math.random() * pool.length)];

  if (rating >= 85) return comparison;
  if (rating >= 80) return `Poor man's ${comparison}`;
  return `${comparison}-lite`;
}

/**
 * Shuffle array in place
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
