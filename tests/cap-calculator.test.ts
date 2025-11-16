/**
 * Phase 0 Cap Calculator Tests
 * Tests all salary cap calculation functions including cap hits, dead money, and restructures
 */

import { initDatabase } from '../src/lib/database/client';
import { calculateCapHit, calculateDeadMoney, calculateRestructure, calculateTeamCapSpace, Contract, ContractYear } from '../src/lib/cap/calculator';

console.log('\n=== PHASE 0 CAP CALCULATOR TESTS ===\n');

// Initialize database
const db = initDatabase('test_save');

// Create a sample contract for testing
const sampleContract: Contract = {
  contract_id: 1,
  player_id: 1,
  team_id: 1,
  total_years: 4,
  current_year: 1,
  years_remaining: 4,
  signing_bonus_total: 10000000, // $10M signing bonus
  signing_bonus_remaining: 10000000,
  annual_breakdown: [
    { year: 1, base_salary: 1500000, roster_bonus: 500000, workout_bonus: 50000, guarantees: 12000000 },
    { year: 2, base_salary: 5000000, roster_bonus: 1000000, workout_bonus: 50000, guarantees: 6000000 },
    { year: 3, base_salary: 8000000, roster_bonus: 0, workout_bonus: 50000, guarantees: 0 },
    { year: 4, base_salary: 10000000, roster_bonus: 0, workout_bonus: 50000, guarantees: 0 }
  ],
  has_void_years: false,
  void_year: undefined
};

// Test 1: Calculate Cap Hit
console.log('TEST 1: Calculate Contract Cap Hit');
try {
  const year1CapHit = calculateCapHit(sampleContract, 1);

  console.log('✅ Year 1 Cap Hit Breakdown:');
  console.log(`   Base Salary: $${year1CapHit.base_salary.toLocaleString()}`);
  console.log(`   Roster Bonus: $${year1CapHit.roster_bonus.toLocaleString()}`);
  console.log(`   Workout Bonus: $${year1CapHit.workout_bonus.toLocaleString()}`);
  console.log(`   Prorated Bonus: $${year1CapHit.prorated_bonus.toLocaleString()}`);
  console.log(`   TOTAL CAP HIT: $${year1CapHit.total_cap_hit.toLocaleString()}`);

  // Verify calculation
  const expectedProration = Math.floor(sampleContract.signing_bonus_total / 4); // $2.5M per year
  const expectedTotal = 1500000 + 500000 + 50000 + expectedProration; // $4,550,000

  if (year1CapHit.total_cap_hit === expectedTotal) {
    console.log(`   ✅ Calculation correct: $${expectedTotal.toLocaleString()}`);
  } else {
    console.error(`   ❌ Expected $${expectedTotal.toLocaleString()}, got $${year1CapHit.total_cap_hit.toLocaleString()}`);
  }
} catch (error) {
  console.error('❌ Failed to calculate cap hit:', error);
}

// Test 2: Calculate Dead Money (Pre-June 1)
console.log('\nTEST 2: Calculate Dead Money (Pre-June 1 Cut)');
try {
  const deadMoney = calculateDeadMoney(sampleContract, 1, false);

  console.log('✅ Pre-June 1 Cut Analysis:');
  console.log(`   Current Year Dead Money: $${deadMoney.currentYearDeadMoney.toLocaleString()}`);
  console.log(`   Next Year Dead Money: $${deadMoney.nextYearDeadMoney.toLocaleString()}`);
  console.log(`   Cap Savings: $${deadMoney.capSavings.toLocaleString()}`);

  // Verify: All dead money accelerates to current year in pre-June 1 cut
  if (deadMoney.nextYearDeadMoney === 0) {
    console.log('   ✅ Correctly accelerated all dead money to current year');
  } else {
    console.error('   ❌ Pre-June 1 cut should have $0 dead money in next year');
  }
} catch (error) {
  console.error('❌ Failed to calculate pre-June 1 dead money:', error);
}

// Test 3: Calculate Dead Money (June 1 Designation)
console.log('\nTEST 3: Calculate Dead Money (June 1 Cut)');
try {
  const june1DeadMoney = calculateDeadMoney(sampleContract, 1, true);

  console.log('✅ June 1 Cut Analysis:');
  console.log(`   Current Year Dead Money: $${june1DeadMoney.currentYearDeadMoney.toLocaleString()}`);
  console.log(`   Next Year Dead Money: $${june1DeadMoney.nextYearDeadMoney.toLocaleString()}`);
  console.log(`   Cap Savings: $${june1DeadMoney.capSavings.toLocaleString()}`);

  // Verify: June 1 cut spreads dead money over 2 years
  if (june1DeadMoney.nextYearDeadMoney > 0) {
    console.log('   ✅ Correctly spread dead money across multiple years');
  } else {
    console.error('   ❌ June 1 cut should spread dead money to next year');
  }

  // Compare savings
  const preJune1 = calculateDeadMoney(sampleContract, 1, false);
  if (june1DeadMoney.capSavings > preJune1.capSavings) {
    console.log(`   ✅ June 1 cut provides better cap savings: $${(june1DeadMoney.capSavings - preJune1.capSavings).toLocaleString()} more`);
  }
} catch (error) {
  console.error('❌ Failed to calculate June 1 dead money:', error);
}

// Test 4: Calculate Contract Restructure
console.log('\nTEST 4: Calculate Contract Restructure');
try {
  // Restructure $3M of year 2 base salary
  const contractYear2: Contract = {
    ...sampleContract,
    current_year: 2,
    years_remaining: 3
  };

  const restructure = calculateRestructure(contractYear2, 2, 3000000);

  console.log('✅ Restructure $3M of base salary:');
  console.log(`   New Current Year Cap Hit: $${restructure.newCapHit.toLocaleString()}`);
  console.log(`   Annual Proration: $${restructure.annualProration.toLocaleString()}`);
  console.log(`   Future Year Cap Hits:`);
  restructure.futureCapHits.forEach((hit, i) => {
    console.log(`     Year ${i + 3}: $${hit.toLocaleString()}`);
  });

  // Verify: Should save money in current year, add to future years
  const originalYear2Hit = calculateCapHit(contractYear2, 2);
  if (restructure.newCapHit < originalYear2Hit.total_cap_hit) {
    const savings = originalYear2Hit.total_cap_hit - restructure.newCapHit;
    console.log(`   ✅ Current year savings: $${savings.toLocaleString()}`);
  } else {
    console.error('   ❌ Restructure should reduce current year cap hit');
  }
} catch (error) {
  console.error('❌ Failed to calculate restructure:', error);
}

// Test 5: Calculate Team Cap Space
console.log('\nTEST 5: Calculate Team Cap Space');
try {
  // Get Kansas City Chiefs
  const chiefs = db.prepare("SELECT team_id FROM teams WHERE abbreviation = 'KC'").get() as { team_id: number };

  const capSpace = calculateTeamCapSpace(chiefs.team_id, 2025);

  console.log('✅ Kansas City Chiefs Cap Analysis:');
  console.log(`   Total Salary Cap: $${(capSpace.totalCap / 1000000).toFixed(2)}M`);
  console.log(`   Used Cap Space: $${(capSpace.usedCapSpace / 1000000).toFixed(2)}M`);
  console.log(`   Available Cap Space: $${(capSpace.availableCapSpace / 1000000).toFixed(2)}M`);
  console.log(`   Players Counting Against Cap: ${capSpace.topPlayersCount}`);

  // Verify reasonable values
  if (capSpace.totalCap === 279200000) {
    console.log('   ✅ Correct 2025 salary cap');
  } else {
    console.error(`   ❌ Expected $279.2M cap, got $${(capSpace.totalCap / 1000000).toFixed(2)}M`);
  }

  if (capSpace.topPlayersCount <= 53) {
    console.log(`   ✅ Correct player count (${capSpace.topPlayersCount} ≤ 53)`);
  } else {
    console.error(`   ❌ Player count exceeds roster limit: ${capSpace.topPlayersCount}`);
  }
} catch (error) {
  console.error('❌ Failed to calculate team cap space:', error);
}

// Test 6: Signing Bonus Proration Rules
console.log('\nTEST 6: Verify Signing Bonus Proration (5-Year Rule)');
try {
  // Test 1: 3-year contract - prorate over 3 years
  const shortContract: Contract = {
    ...sampleContract,
    total_years: 3,
    years_remaining: 3,
    signing_bonus_total: 6000000,
    annual_breakdown: [
      { year: 1, base_salary: 1000000, roster_bonus: 0, workout_bonus: 0, guarantees: 6000000 },
      { year: 2, base_salary: 2000000, roster_bonus: 0, workout_bonus: 0, guarantees: 0 },
      { year: 3, base_salary: 3000000, roster_bonus: 0, workout_bonus: 0, guarantees: 0 }
    ]
  };

  const shortCapHit = calculateCapHit(shortContract, 1);
  const expectedShortProration = Math.floor(6000000 / 3); // $2M per year

  console.log(`✅ 3-year contract with $6M bonus:`);
  console.log(`   Prorated amount: $${shortCapHit.prorated_bonus.toLocaleString()} (expected $${expectedShortProration.toLocaleString()})`);

  // Test 2: 6-year contract - prorate over 5 years max
  const longContract: Contract = {
    ...sampleContract,
    total_years: 6,
    years_remaining: 6,
    signing_bonus_total: 15000000,
    annual_breakdown: Array(6).fill(null).map((_, i) => ({
      year: i + 1,
      base_salary: 2000000,
      roster_bonus: 0,
      workout_bonus: 0,
      guarantees: i === 0 ? 15000000 : 0
    }))
  };

  const longCapHit = calculateCapHit(longContract, 1);
  const expectedLongProration = Math.floor(15000000 / 5); // $3M per year (5-year max)

  console.log(`✅ 6-year contract with $15M bonus:`);
  console.log(`   Prorated amount: $${longCapHit.prorated_bonus.toLocaleString()} (expected $${expectedLongProration.toLocaleString()})`);

  if (longCapHit.prorated_bonus === expectedLongProration) {
    console.log('   ✅ Correctly applied 5-year maximum proration rule');
  } else {
    console.error('   ❌ Failed to apply 5-year maximum proration rule');
  }
} catch (error) {
  console.error('❌ Failed to verify proration rules:', error);
}

// Test 7: Edge Cases
console.log('\nTEST 7: Edge Cases and Validation');
try {
  // Test invalid year
  console.log('Testing invalid year handling...');
  try {
    calculateCapHit(sampleContract, 99);
    console.error('   ❌ Should throw error for invalid year');
  } catch (error) {
    console.log('   ✅ Correctly threw error for invalid year');
  }

  // Test restructure amount validation
  console.log('Testing restructure validation...');
  try {
    // Try to restructure more than available base salary
    const invalidRestructure = calculateRestructure(sampleContract, 1, 10000000);
    console.error('   ❌ Should throw error for invalid restructure amount');
  } catch (error) {
    console.log('   ✅ Correctly validated restructure amount');
  }
} catch (error) {
  console.error('❌ Failed edge case tests:', error);
}

console.log('\n=== CAP CALCULATOR TESTS COMPLETE ===\n');
