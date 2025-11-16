/**
 * Phase 0 Database Tests
 * Tests all database operations including save management, queries, and data integrity
 */

import { initDatabase, createNewSave, listSaves, deleteSave } from '../src/lib/database/client';
import { getAllTeams, getTeamById, getTeamRoster, getPlayerWithContract } from '../src/lib/database/queries';

console.log('\n=== PHASE 0 DATABASE TESTS ===\n');

// Test 1: List existing saves
console.log('TEST 1: List Existing Saves');
try {
  const saves = listSaves();
  console.log(`✅ Found ${saves.length} save file(s):`, saves);
  if (saves.length === 0) {
    console.log('⚠️  No saves found. You may need to run: npm run seed');
  }
} catch (error) {
  console.error('❌ Failed to list saves:', error);
}

// Test 2: Initialize existing database
console.log('\nTEST 2: Initialize Existing Database');
try {
  const db = initDatabase('test_save');
  console.log('✅ Successfully initialized test_save database');

  // Verify connection
  const result = db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number };
  console.log(`✅ Database connection verified - ${result.count} teams found`);
} catch (error) {
  console.error('❌ Failed to initialize database:', error);
  process.exit(1);
}

// Test 3: Query all teams
console.log('\nTEST 3: Query All Teams');
try {
  const teams = getAllTeams();
  console.log(`✅ Retrieved ${teams.length} teams`);

  // Show sample teams by division
  const afcEast = teams.filter(t => t.conference === 'AFC' && t.division === 'East');
  console.log(`   AFC East teams: ${afcEast.map(t => t.abbreviation).join(', ')}`);

  const nfcWest = teams.filter(t => t.conference === 'NFC' && t.division === 'West');
  console.log(`   NFC West teams: ${nfcWest.map(t => t.abbreviation).join(', ')}`);

  // Verify all 32 teams
  if (teams.length !== 32) {
    console.error(`❌ Expected 32 teams, got ${teams.length}`);
  }
} catch (error) {
  console.error('❌ Failed to query teams:', error);
}

// Test 4: Query specific team
console.log('\nTEST 4: Query Specific Team');
try {
  const chiefs = getAllTeams().find(t => t.abbreviation === 'KC');
  if (!chiefs) {
    throw new Error('Kansas City Chiefs not found');
  }

  const team = getTeamById(chiefs.team_id);
  if (!team) {
    throw new Error(`Team ${chiefs.team_id} not found`);
  }

  console.log('✅ Retrieved team:', {
    name: team.name,
    city: team.city,
    division: `${team.conference} ${team.division}`,
    stadium_capacity: team.stadium_capacity.toLocaleString(),
    market_size: team.market_size
  });
} catch (error) {
  console.error('❌ Failed to query specific team:', error);
}

// Test 5: Query team roster
console.log('\nTEST 5: Query Team Roster');
try {
  const chiefs = getAllTeams().find(t => t.abbreviation === 'KC');
  if (!chiefs) {
    throw new Error('Kansas City Chiefs not found');
  }

  const roster = getTeamRoster(chiefs.team_id);
  console.log(`✅ Retrieved ${roster.length} players for ${chiefs.name}`);

  // Group by position
  const positionCounts: { [key: string]: number } = {};
  roster.forEach(player => {
    positionCounts[player.position] = (positionCounts[player.position] || 0) + 1;
  });

  console.log('   Position breakdown:', positionCounts);

  // Show top 3 rated players
  const topPlayers = roster.sort((a, b) => b.overall_rating - a.overall_rating).slice(0, 3);
  console.log('   Top 3 rated players:');
  topPlayers.forEach(p => {
    console.log(`     - ${p.first_name} ${p.last_name} (${p.position}) - ${p.overall_rating} OVR`);
  });

  // Verify roster size
  if (roster.length !== 53) {
    console.log(`   ⚠️  Expected 53-man roster, got ${roster.length}`);
  }
} catch (error) {
  console.error('❌ Failed to query team roster:', error);
}

// Test 6: Query player with contract
console.log('\nTEST 6: Query Player With Contract');
try {
  const db = initDatabase('test_save');
  const firstPlayer = db.prepare('SELECT player_id FROM players LIMIT 1').get() as { player_id: number };

  const result = getPlayerWithContract(firstPlayer.player_id);
  console.log('✅ Retrieved player data:', {
    player: result.player ? `${(result.player as any).first_name} ${(result.player as any).last_name}` : 'null',
    hasContract: !!result.contract
  });

  if (!result.player) {
    console.error('   ❌ Player data is null');
  }
} catch (error) {
  console.error('❌ Failed to query player with contract:', error);
}

// Test 7: Game state verification
console.log('\nTEST 7: Verify Game State');
try {
  const db = initDatabase('test_save');
  const gameState = db.prepare('SELECT * FROM game_state WHERE state_id = 1').get() as any;

  console.log('✅ Game state retrieved:', {
    save_name: gameState.save_name,
    current_season: gameState.current_season,
    current_phase: gameState.current_phase,
    league_salary_cap: `$${(gameState.league_salary_cap / 1000000).toFixed(1)}M`,
    salary_floor: `$${(gameState.salary_floor / 1000000).toFixed(1)}M`
  });

  // Verify cap values
  const expectedCap = 279200000; // 2025 cap from seed
  if (gameState.league_salary_cap !== expectedCap) {
    console.error(`   ❌ Expected cap: $${expectedCap}, got: $${gameState.league_salary_cap}`);
  }
} catch (error) {
  console.error('❌ Failed to verify game state:', error);
}

// Test 8: GM Career data
console.log('\nTEST 8: Verify GM Career Data');
try {
  const db = initDatabase('test_save');
  const gmCareer = db.prepare('SELECT * FROM gm_career LIMIT 1').get() as any;

  if (gmCareer) {
    console.log('✅ GM career data retrieved:', {
      gm_name: gmCareer.gm_name,
      current_season: gmCareer.current_season,
      current_phase: gmCareer.current_phase,
      total_seasons: gmCareer.total_seasons,
      reputation: gmCareer.reputation
    });
  } else {
    console.error('   ❌ No GM career data found');
  }
} catch (error) {
  console.error('❌ Failed to verify GM career:', error);
}

// Test 9: Database schema validation
console.log('\nTEST 9: Validate Database Schema');
try {
  const db = initDatabase('test_save');

  const expectedTables = [
    'teams', 'players', 'contracts', 'draft_picks', 'free_agents',
    'coaches', 'scouts', 'scout_reports', 'game_results', 'transactions',
    'gm_career', 'season_standings', 'game_state'
  ];

  const tables = db.prepare(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  ).all() as { name: string }[];

  const tableNames = tables.map(t => t.name);
  const missingTables = expectedTables.filter(t => !tableNames.includes(t));

  if (missingTables.length === 0) {
    console.log(`✅ All ${expectedTables.length} expected tables exist`);
  } else {
    console.error('❌ Missing tables:', missingTables);
  }

  console.log(`   Total tables in database: ${tables.length}`);
} catch (error) {
  console.error('❌ Failed to validate schema:', error);
}

console.log('\n=== DATABASE TESTS COMPLETE ===\n');
