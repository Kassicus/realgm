import { getDatabase } from './client';

export interface Player {
  player_id: number;
  first_name: string;
  last_name: string;
  position: string;
  age: number;
  overall_rating: number;
  current_team_id: number | null;
  roster_status: string;
}

export interface Team {
  team_id: number;
  name: string;
  abbreviation: string;
  city: string;
  conference: string;
  division: string;
  current_cap_space: number;
}

/**
 * Get all teams
 */
export function getAllTeams(): Team[] {
  const db = getDatabase();
  return db.prepare('SELECT * FROM teams ORDER BY conference, division, name').all() as Team[];
}

/**
 * Get team by ID
 */
export function getTeamById(teamId: number): Team | undefined {
  const db = getDatabase();
  return db.prepare('SELECT * FROM teams WHERE team_id = ?').get(teamId) as Team | undefined;
}

/**
 * Get all players for a team
 */
export function getTeamRoster(teamId: number): Player[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT * FROM players
    WHERE current_team_id = ?
    AND roster_status IN ('Active', 'IR', 'PUP')
    ORDER BY position, overall_rating DESC
  `).all(teamId) as Player[];
}

/**
 * Get player by ID with contract
 */
export function getPlayerWithContract(playerId: number) {
  const db = getDatabase();

  const player = db.prepare('SELECT * FROM players WHERE player_id = ?').get(playerId);
  const contract = db.prepare('SELECT * FROM contracts WHERE player_id = ? AND is_active = 1').get(playerId);

  return { player, contract };
}

/**
 * Get all free agents
 */
export function getAllFreeAgents(): any[] {
  const db = getDatabase();
  return db.prepare(`
    SELECT p.*, fa.fa_type, fa.rfa_tender_amount
    FROM players p
    JOIN free_agents fa ON p.player_id = fa.player_id
    WHERE fa.is_available = 1
    ORDER BY p.overall_rating DESC
  `).all();
}

/**
 * Update team cap space
 */
export function updateTeamCapSpace(teamId: number, newCapSpace: number): void {
  const db = getDatabase();
  db.prepare('UPDATE teams SET current_cap_space = ?, updated_at = CURRENT_TIMESTAMP WHERE team_id = ?')
    .run(newCapSpace, teamId);
}

/**
 * Create transaction record
 */
export function createTransaction(
  transactionType: string,
  teamId: number,
  playerId: number | null,
  details: any,
  capImpact: number,
  season: number
): void {
  const db = getDatabase();

  db.prepare(`
    INSERT INTO transactions (
      transaction_type,
      team_id,
      player_id,
      transaction_details,
      cap_impact,
      season,
      transaction_date
    ) VALUES (?, ?, ?, ?, ?, ?, DATE('now'))
  `).run(
    transactionType,
    teamId,
    playerId,
    JSON.stringify(details),
    capImpact,
    season
  );
}
