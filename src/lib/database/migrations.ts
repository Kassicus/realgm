import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

/**
 * Run database migrations
 * This ensures existing saves get updated with new tables/columns from Phase 1+
 */
export function runMigrations(db: Database.Database): void {
  // Create migrations tracking table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrations = [
    {
      name: '001_add_fa_offers',
      sql: `
        CREATE TABLE IF NOT EXISTS fa_offers (
          offer_id INTEGER PRIMARY KEY AUTOINCREMENT,
          player_id INTEGER NOT NULL,
          team_id INTEGER NOT NULL,
          total_years INTEGER NOT NULL CHECK(total_years >= 1 AND total_years <= 7),
          total_value INTEGER NOT NULL,
          guaranteed_money INTEGER NOT NULL DEFAULT 0,
          signing_bonus INTEGER NOT NULL DEFAULT 0,
          annual_breakdown TEXT,
          structure_type TEXT CHECK(structure_type IN ('frontloaded', 'backloaded', 'even')),
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn')),
          negotiation_round INTEGER NOT NULL DEFAULT 1,
          is_counter_offer BOOLEAN NOT NULL DEFAULT 0,
          parent_offer_id INTEGER,
          player_response TEXT,
          response_date TIMESTAMP,
          offer_score INTEGER,
          offered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_date TIMESTAMP,
          FOREIGN KEY (player_id) REFERENCES players(player_id),
          FOREIGN KEY (team_id) REFERENCES teams(team_id),
          FOREIGN KEY (parent_offer_id) REFERENCES fa_offers(offer_id)
        );

        CREATE INDEX IF NOT EXISTS idx_fa_offers_player ON fa_offers(player_id);
        CREATE INDEX IF NOT EXISTS idx_fa_offers_team ON fa_offers(team_id);
        CREATE INDEX IF NOT EXISTS idx_fa_offers_status ON fa_offers(status);
        CREATE INDEX IF NOT EXISTS idx_fa_offers_date ON fa_offers(offered_date);
      `
    },
    {
      name: '002_add_draft_tables',
      sql: `
        -- Draft Prospects
        CREATE TABLE IF NOT EXISTS draft_prospects (
          prospect_id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          position TEXT NOT NULL,
          college TEXT NOT NULL,
          height_inches INTEGER NOT NULL,
          weight INTEGER NOT NULL,
          age INTEGER NOT NULL,
          true_overall_rating INTEGER NOT NULL CHECK(true_overall_rating >= 54 AND true_overall_rating <= 99),
          true_position_ratings TEXT NOT NULL,
          scouted_overall_rating INTEGER CHECK(scouted_overall_rating >= 54 AND scouted_overall_rating <= 99),
          scouted_position_ratings TEXT,
          draft_grade TEXT NOT NULL CHECK(draft_grade IN ('1st Round', '2nd-3rd Round', '4th-5th Round', '6th-7th Round', 'UDFA')),
          projected_round INTEGER CHECK(projected_round >= 1 AND projected_round <= 7),
          forty_yard_dash REAL,
          bench_press INTEGER,
          vertical_jump REAL,
          broad_jump REAL,
          three_cone_drill REAL,
          twenty_yard_shuttle REAL,
          work_ethic INTEGER CHECK(work_ethic >= 1 AND work_ethic <= 5),
          injury_risk INTEGER CHECK(injury_risk >= 1 AND injury_risk <= 5),
          character_grade INTEGER CHECK(character_grade >= 1 AND character_grade <= 5),
          football_iq INTEGER CHECK(football_iq >= 1 AND football_iq <= 5),
          development_trait TEXT CHECK(development_trait IN ('Star', 'Elite', 'Quick', 'Normal', 'Slow')),
          scout_notes TEXT,
          nfl_comparison TEXT,
          injury_flags TEXT,
          draft_year INTEGER NOT NULL,
          is_drafted BOOLEAN NOT NULL DEFAULT 0,
          drafted_by_team_id INTEGER,
          drafted_round INTEGER,
          drafted_pick INTEGER,
          drafted_overall INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (drafted_by_team_id) REFERENCES teams(team_id)
        );

        CREATE INDEX IF NOT EXISTS idx_prospects_year ON draft_prospects(draft_year);
        CREATE INDEX IF NOT EXISTS idx_prospects_position ON draft_prospects(position);
        CREATE INDEX IF NOT EXISTS idx_prospects_grade ON draft_prospects(draft_grade);
        CREATE INDEX IF NOT EXISTS idx_prospects_drafted ON draft_prospects(is_drafted);
        CREATE INDEX IF NOT EXISTS idx_prospects_rating ON draft_prospects(true_overall_rating);

        -- Team Draft Boards
        CREATE TABLE IF NOT EXISTS team_draft_boards (
          board_id INTEGER PRIMARY KEY AUTOINCREMENT,
          team_id INTEGER NOT NULL,
          prospect_id INTEGER NOT NULL,
          rank INTEGER NOT NULL,
          team_grade TEXT,
          team_notes TEXT,
          is_need_position BOOLEAN DEFAULT 0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team_id) REFERENCES teams(team_id),
          FOREIGN KEY (prospect_id) REFERENCES draft_prospects(prospect_id),
          UNIQUE(team_id, prospect_id),
          UNIQUE(team_id, rank)
        );

        CREATE INDEX IF NOT EXISTS idx_draft_board_team ON team_draft_boards(team_id);
        CREATE INDEX IF NOT EXISTS idx_draft_board_rank ON team_draft_boards(team_id, rank);

        -- Draft Selections
        CREATE TABLE IF NOT EXISTS draft_selections (
          selection_id INTEGER PRIMARY KEY AUTOINCREMENT,
          draft_year INTEGER NOT NULL,
          round INTEGER NOT NULL CHECK(round >= 1 AND round <= 7),
          pick_number INTEGER NOT NULL CHECK(pick_number >= 1 AND pick_number <= 32),
          overall_pick INTEGER NOT NULL CHECK(overall_pick >= 1 AND overall_pick <= 256),
          team_id INTEGER NOT NULL,
          prospect_id INTEGER,
          time_on_clock INTEGER DEFAULT 300,
          was_traded BOOLEAN DEFAULT 0,
          selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team_id) REFERENCES teams(team_id),
          FOREIGN KEY (prospect_id) REFERENCES draft_prospects(prospect_id)
        );

        CREATE INDEX IF NOT EXISTS idx_draft_selections_year ON draft_selections(draft_year);
        CREATE INDEX IF NOT EXISTS idx_draft_selections_team ON draft_selections(team_id);
        CREATE INDEX IF NOT EXISTS idx_draft_selections_overall ON draft_selections(overall_pick);

        -- Draft Pick Trades
        CREATE TABLE IF NOT EXISTS draft_pick_trades (
          trade_id INTEGER PRIMARY KEY AUTOINCREMENT,
          team1_id INTEGER NOT NULL,
          team2_id INTEGER NOT NULL,
          team1_picks TEXT NOT NULL,
          team1_players TEXT,
          team2_picks TEXT NOT NULL,
          team2_players TEXT,
          team1_value INTEGER,
          team2_value INTEGER,
          status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'countered')),
          proposed_by_team INTEGER NOT NULL,
          proposed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          resolved_at TIMESTAMP,
          FOREIGN KEY (team1_id) REFERENCES teams(team_id),
          FOREIGN KEY (team2_id) REFERENCES teams(team_id)
        );

        CREATE INDEX IF NOT EXISTS idx_draft_trades_teams ON draft_pick_trades(team1_id, team2_id);
        CREATE INDEX IF NOT EXISTS idx_draft_trades_status ON draft_pick_trades(status);
      `
    }
  ];

  // Check and apply each migration
  const checkMigration = db.prepare('SELECT migration_name FROM schema_migrations WHERE migration_name = ?');
  const recordMigration = db.prepare('INSERT INTO schema_migrations (migration_name) VALUES (?)');

  migrations.forEach(({ name, sql }) => {
    const exists = checkMigration.get(name);

    if (!exists) {
      console.log(`Applying migration: ${name}`);
      db.exec(sql);
      recordMigration.run(name);
      console.log(`✓ Migration ${name} applied successfully`);
    }
  });
}

/**
 * Check if migrations are needed
 */
export function checkMigrationsNeeded(db: Database.Database): boolean {
  try {
    // Check if schema_migrations table exists
    const tableCheck = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name='schema_migrations'
    `).get();

    if (!tableCheck) {
      return true; // Need to run migrations
    }

    // Check if all required tables exist
    const requiredTables = [
      'fa_offers',
      'draft_prospects',
      'team_draft_boards',
      'draft_selections',
      'draft_pick_trades'
    ];

    for (const tableName of requiredTables) {
      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name=?
      `).get(tableName);

      if (!tableExists) {
        return true; // Missing table, need migrations
      }
    }

    return false; // All good
  } catch (error) {
    console.error('Error checking migrations:', error);
    return true;
  }
}
