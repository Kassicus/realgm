import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { runMigrations, checkMigrationsNeeded } from './migrations';

// Database file location
// In Electron environment, use app.getPath('documents')
// In development, use a local directory
const getDbDirectory = (): string => {
  // Check if running in Electron
  if (typeof window !== 'undefined' && (window as any).electron) {
    // This will be set up when we add Electron preload
    return (window as any).electron.getDocumentsPath();
  }

  // Development: use project root or home directory
  if (process.env.NODE_ENV === 'development') {
    const devDbPath = path.join(process.cwd(), 'data', 'saves');
    if (!fs.existsSync(devDbPath)) {
      fs.mkdirSync(devDbPath, { recursive: true });
    }
    return devDbPath;
  }

  // Production fallback: use home directory
  const homeDbPath = path.join(os.homedir(), 'Documents', 'NFLGMSim', 'saves');
  if (!fs.existsSync(homeDbPath)) {
    fs.mkdirSync(homeDbPath, { recursive: true });
  }
  return homeDbPath;
};

const DB_DIR = getDbDirectory();

let currentDb: Database.Database | null = null;
let currentSaveFile: string | null = null;

/**
 * Initialize or switch to a database file
 */
export function initDatabase(saveFileName: string): Database.Database {
  // Close existing connection if switching saves
  if (currentDb && currentSaveFile !== saveFileName) {
    currentDb.close();
    currentDb = null;
  }

  // Open or create database
  if (!currentDb) {
    const dbPath = path.join(DB_DIR, `${saveFileName}.db`);
    currentDb = new Database(dbPath);
    currentSaveFile = saveFileName;

    // Enable foreign keys
    currentDb.pragma('foreign_keys = ON');

    // Performance optimizations
    currentDb.pragma('journal_mode = WAL');
    currentDb.pragma('synchronous = NORMAL');

    // Run migrations if needed
    if (checkMigrationsNeeded(currentDb)) {
      console.log('Running database migrations...');
      runMigrations(currentDb);
    }

    console.log(`Database initialized: ${dbPath}`);
  }

  return currentDb;
}

/**
 * Get current database connection
 */
export function getDatabase(): Database.Database {
  if (!currentDb) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return currentDb;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (currentDb) {
    currentDb.close();
    currentDb = null;
    currentSaveFile = null;
    console.log('Database connection closed');
  }
}

/**
 * Create a new save file with schema
 */
export function createNewSave(saveFileName: string, gmName: string): void {
  const dbPath = path.join(DB_DIR, `${saveFileName}.db`);

  // Check if save already exists
  if (fs.existsSync(dbPath)) {
    throw new Error(`Save file '${saveFileName}' already exists`);
  }

  // Create new database
  const db = new Database(dbPath);

  // Read and execute schema
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Execute schema (split by semicolons and execute each statement)
  const statements = schema.split(';').filter(stmt => stmt.trim());
  statements.forEach(statement => {
    if (statement.trim()) {
      db.exec(statement);
    }
  });

  // Initialize game state
  const initGameState = db.prepare(`
    INSERT INTO game_state (
      state_id,
      save_name,
      current_season,
      current_week,
      current_phase,
      league_salary_cap,
      salary_floor,
      settings
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const settings = JSON.stringify({
    difficulty: 'Normal',
    auto_depth_chart: true,
    auto_injury_management: true,
    player_team_id: null // Will be set after team selection
  });

  initGameState.run(
    1,         // state_id (always 1)
    saveFileName,
    2025,      // Starting season
    0,         // Week 0 (offseason)
    'Post-Season',
    279200000, // 2025 salary cap
    248248000, // 89% of cap
    settings
  );

  // Initialize GM career
  const initGMCareer = db.prepare(`
    INSERT INTO gm_career (
      gm_name,
      current_season,
      current_phase,
      career_start_date
    ) VALUES (?, ?, ?, DATE('now'))
  `);

  initGMCareer.run(gmName, 2025, 'Post-Season');

  db.close();
  console.log(`New save file created: ${saveFileName}`);
}

/**
 * List all save files
 */
export function listSaves(): string[] {
  if (!fs.existsSync(DB_DIR)) {
    return [];
  }

  return fs.readdirSync(DB_DIR)
    .filter(file => file.endsWith('.db'))
    .map(file => file.replace('.db', ''));
}

/**
 * Delete a save file
 */
export function deleteSave(saveFileName: string): void {
  const dbPath = path.join(DB_DIR, `${saveFileName}.db`);

  if (currentSaveFile === saveFileName) {
    closeDatabase();
  }

  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log(`Save file deleted: ${saveFileName}`);
  }
}
