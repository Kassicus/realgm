import { initDatabase, createNewSave } from '../src/lib/database/client';

// NFL Teams Data (all 32 teams)
const teams = [
  // AFC East
  { name: 'Buffalo Bills', abbreviation: 'BUF', city: 'Buffalo', conference: 'AFC', division: 'East', market_size: 'Small-Medium', stadium_capacity: 71608 },
  { name: 'Miami Dolphins', abbreviation: 'MIA', city: 'Miami', conference: 'AFC', division: 'East', market_size: 'Medium', stadium_capacity: 65326 },
  { name: 'New England Patriots', abbreviation: 'NE', city: 'Foxborough', conference: 'AFC', division: 'East', market_size: 'Medium-Large', stadium_capacity: 65878 },
  { name: 'New York Jets', abbreviation: 'NYJ', city: 'East Rutherford', conference: 'AFC', division: 'East', market_size: 'Large', stadium_capacity: 82500 },

  // AFC North
  { name: 'Baltimore Ravens', abbreviation: 'BAL', city: 'Baltimore', conference: 'AFC', division: 'North', market_size: 'Small-Medium', stadium_capacity: 70745 },
  { name: 'Cincinnati Bengals', abbreviation: 'CIN', city: 'Cincinnati', conference: 'AFC', division: 'North', market_size: 'Medium', stadium_capacity: 65515 },
  { name: 'Cleveland Browns', abbreviation: 'CLE', city: 'Cleveland', conference: 'AFC', division: 'North', market_size: 'Small-Medium', stadium_capacity: 67431 },
  { name: 'Pittsburgh Steelers', abbreviation: 'PIT', city: 'Pittsburgh', conference: 'AFC', division: 'North', market_size: 'Small-Medium', stadium_capacity: 68400 },

  // AFC South
  { name: 'Houston Texans', abbreviation: 'HOU', city: 'Houston', conference: 'AFC', division: 'South', market_size: 'Medium-Large', stadium_capacity: 72220 },
  { name: 'Indianapolis Colts', abbreviation: 'IND', city: 'Indianapolis', conference: 'AFC', division: 'South', market_size: 'Medium', stadium_capacity: 67000 },
  { name: 'Jacksonville Jaguars', abbreviation: 'JAX', city: 'Jacksonville', conference: 'AFC', division: 'South', market_size: 'Small', stadium_capacity: 67814 },
  { name: 'Tennessee Titans', abbreviation: 'TEN', city: 'Nashville', conference: 'AFC', division: 'South', market_size: 'Medium', stadium_capacity: 69143 },

  // AFC West
  { name: 'Denver Broncos', abbreviation: 'DEN', city: 'Denver', conference: 'AFC', division: 'West', market_size: 'Medium', stadium_capacity: 76125 },
  { name: 'Kansas City Chiefs', abbreviation: 'KC', city: 'Kansas City', conference: 'AFC', division: 'West', market_size: 'Medium', stadium_capacity: 76416 },
  { name: 'Las Vegas Raiders', abbreviation: 'LV', city: 'Las Vegas', conference: 'AFC', division: 'West', market_size: 'Medium', stadium_capacity: 65000 },
  { name: 'Los Angeles Chargers', abbreviation: 'LAC', city: 'Los Angeles', conference: 'AFC', division: 'West', market_size: 'Large', stadium_capacity: 70240 },

  // NFC East
  { name: 'Dallas Cowboys', abbreviation: 'DAL', city: 'Arlington', conference: 'NFC', division: 'East', market_size: 'Large', stadium_capacity: 80000 },
  { name: 'New York Giants', abbreviation: 'NYG', city: 'East Rutherford', conference: 'NFC', division: 'East', market_size: 'Large', stadium_capacity: 82500 },
  { name: 'Philadelphia Eagles', abbreviation: 'PHI', city: 'Philadelphia', conference: 'NFC', division: 'East', market_size: 'Medium-Large', stadium_capacity: 69796 },
  { name: 'Washington Commanders', abbreviation: 'WAS', city: 'Landover', conference: 'NFC', division: 'East', market_size: 'Medium-Large', stadium_capacity: 67617 },

  // NFC North
  { name: 'Chicago Bears', abbreviation: 'CHI', city: 'Chicago', conference: 'NFC', division: 'North', market_size: 'Large', stadium_capacity: 61500 },
  { name: 'Detroit Lions', abbreviation: 'DET', city: 'Detroit', conference: 'NFC', division: 'North', market_size: 'Small-Medium', stadium_capacity: 65000 },
  { name: 'Green Bay Packers', abbreviation: 'GB', city: 'Green Bay', conference: 'NFC', division: 'North', market_size: 'Small', stadium_capacity: 81441 },
  { name: 'Minnesota Vikings', abbreviation: 'MIN', city: 'Minneapolis', conference: 'NFC', division: 'North', market_size: 'Medium', stadium_capacity: 66860 },

  // NFC South
  { name: 'Atlanta Falcons', abbreviation: 'ATL', city: 'Atlanta', conference: 'NFC', division: 'South', market_size: 'Medium', stadium_capacity: 71000 },
  { name: 'Carolina Panthers', abbreviation: 'CAR', city: 'Charlotte', conference: 'NFC', division: 'South', market_size: 'Medium', stadium_capacity: 75523 },
  { name: 'New Orleans Saints', abbreviation: 'NO', city: 'New Orleans', conference: 'NFC', division: 'South', market_size: 'Small', stadium_capacity: 73208 },
  { name: 'Tampa Bay Buccaneers', abbreviation: 'TB', city: 'Tampa', conference: 'NFC', division: 'South', market_size: 'Medium', stadium_capacity: 65618 },

  // NFC West
  { name: 'Arizona Cardinals', abbreviation: 'ARI', city: 'Glendale', conference: 'NFC', division: 'West', market_size: 'Medium', stadium_capacity: 63400 },
  { name: 'Los Angeles Rams', abbreviation: 'LAR', city: 'Los Angeles', conference: 'NFC', division: 'West', market_size: 'Large', stadium_capacity: 70240 },
  { name: 'San Francisco 49ers', abbreviation: 'SF', city: 'Santa Clara', conference: 'NFC', division: 'West', market_size: 'Large', stadium_capacity: 68500 },
  { name: 'Seattle Seahawks', abbreviation: 'SEA', city: 'Seattle', conference: 'NFC', division: 'West', market_size: 'Medium', stadium_capacity: 68740 },
];

// Sample Player Generator
function generatePlayers(teamId: number, count: number) {
  const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  const firstNames = ['John', 'Michael', 'David', 'James', 'Chris', 'Ryan', 'Matt', 'Tom', 'Patrick', 'Josh', 'Aaron', 'Derek', 'Justin', 'Brandon', 'Tyreek', 'Travis', 'Nick', 'Lamar', 'Jalen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Mahomes', 'Allen', 'Hurts', 'Jackson', 'Hill', 'Kelce', 'Bosa'];

  const players = [];

  for (let i = 0; i < count; i++) {
    const position = positions[Math.floor(Math.random() * positions.length)];
    const rating = 65 + Math.floor(Math.random() * 25); // 65-89

    players.push({
      first_name: firstNames[Math.floor(Math.random() * firstNames.length)],
      last_name: lastNames[Math.floor(Math.random() * lastNames.length)],
      position,
      age: 22 + Math.floor(Math.random() * 12), // 22-33
      college: 'State University',
      overall_rating: rating,
      current_team_id: teamId,
      roster_status: 'Active',
      position_ratings: JSON.stringify({ speed: rating, strength: rating, agility: rating }),
      work_ethic: 3,
      injury_risk: 3,
      draft_year: 2020,
      accrued_seasons: 3
    });
  }

  return players;
}

// Seed function
function seedDatabase() {
  console.log('Creating new save file...');
  createNewSave('test_save', 'Test GM');

  console.log('Initializing database...');
  const db = initDatabase('test_save');

  console.log('Inserting teams...');
  // Insert teams
  const insertTeam = db.prepare(`
    INSERT INTO teams (name, abbreviation, city, conference, division, market_size, stadium_capacity, current_cap_space)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  teams.forEach(team => {
    insertTeam.run(
      team.name,
      team.abbreviation,
      team.city,
      team.conference,
      team.division,
      team.market_size,
      team.stadium_capacity,
      279200000 // Starting with full cap
    );
  });

  console.log('Inserting players...');
  // Insert players for each team
  const insertPlayer = db.prepare(`
    INSERT INTO players (
      first_name, last_name, position, age, college,
      overall_rating, current_team_id, roster_status,
      position_ratings, work_ethic, injury_risk,
      draft_year, accrued_seasons
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (let teamId = 1; teamId <= 32; teamId++) {
    const players = generatePlayers(teamId, 53); // Full 53-man roster

    players.forEach(player => {
      insertPlayer.run(
        player.first_name,
        player.last_name,
        player.position,
        player.age,
        player.college,
        player.overall_rating,
        player.current_team_id,
        player.roster_status,
        player.position_ratings,
        player.work_ethic,
        player.injury_risk,
        player.draft_year,
        player.accrued_seasons
      );
    });
  }

  console.log('Database seeded successfully!');
  console.log(`- ${teams.length} teams`);
  console.log(`- ${teams.length * 53} players`);
}

// Run the seed
seedDatabase();
