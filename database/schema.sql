-- NFL GM Simulator Database Schema
-- Version: 1.0
-- All tables for Phase 0 implementation

-- ============================================================================
-- 1. Teams Table
-- ============================================================================
CREATE TABLE teams (
    team_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL UNIQUE,
    city TEXT NOT NULL,

    -- Conference/Division
    conference TEXT NOT NULL CHECK(conference IN ('AFC', 'NFC')),
    division TEXT NOT NULL CHECK(division IN ('North', 'South', 'East', 'West')),

    -- Financial
    market_size TEXT NOT NULL CHECK(market_size IN ('Small', 'Small-Medium', 'Medium', 'Medium-Large', 'Large')),
    stadium_capacity INTEGER NOT NULL,

    -- Cap Management
    current_cap_space INTEGER NOT NULL DEFAULT 0, -- in dollars
    rollover_cap INTEGER NOT NULL DEFAULT 0,      -- in dollars

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_division ON teams(conference, division);

-- ============================================================================
-- 2. Players Table
-- ============================================================================
CREATE TABLE players (
    player_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    position TEXT NOT NULL,
    age INTEGER NOT NULL,
    college TEXT,

    -- Draft Info
    draft_year INTEGER,
    draft_round INTEGER,
    draft_pick INTEGER,
    accrued_seasons INTEGER NOT NULL DEFAULT 0,

    -- Current Team
    current_team_id INTEGER,
    roster_status TEXT CHECK(roster_status IN ('Active', 'Practice Squad', 'IR', 'PUP', 'NFI', 'Free Agent', 'Retired')),

    -- Ratings (Madden-style 54-99)
    overall_rating INTEGER NOT NULL CHECK(overall_rating >= 54 AND overall_rating <= 99),
    position_ratings TEXT NOT NULL, -- JSON: Position-specific attributes

    -- Hidden Attributes (not visible to player initially)
    work_ethic INTEGER CHECK(work_ethic >= 1 AND work_ethic <= 5), -- 1=Poor, 5=Elite
    injury_risk INTEGER CHECK(injury_risk >= 1 AND injury_risk <= 5), -- 1=Low, 5=High
    personality_traits TEXT, -- JSON: Character, leadership, etc.

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (current_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_players_team ON players(current_team_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_status ON players(roster_status);
CREATE INDEX idx_players_rating ON players(overall_rating);

-- ============================================================================
-- 3. Contracts Table
-- ============================================================================
CREATE TABLE contracts (
    contract_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,

    -- Contract Duration
    signed_date DATE NOT NULL,
    total_years INTEGER NOT NULL,
    current_year INTEGER NOT NULL DEFAULT 1,
    years_remaining INTEGER NOT NULL,

    -- Financial Structure
    total_value INTEGER NOT NULL, -- Total contract value in dollars
    signing_bonus_total INTEGER NOT NULL DEFAULT 0,
    signing_bonus_remaining INTEGER NOT NULL DEFAULT 0,

    -- Annual Breakdown (stored as JSON for flexibility)
    annual_breakdown TEXT NOT NULL, -- JSON array

    -- Guarantees
    guaranteed_money_remaining INTEGER NOT NULL DEFAULT 0,
    guaranteed_at_signing INTEGER NOT NULL DEFAULT 0,

    -- Special Clauses
    has_void_years BOOLEAN NOT NULL DEFAULT 0,
    void_year INTEGER, -- Which year the contract voids
    has_option BOOLEAN NOT NULL DEFAULT 0,
    option_type TEXT CHECK(option_type IN ('Team', 'Player', NULL)),
    option_year INTEGER,

    -- Cap Impact Tracking
    current_cap_hit INTEGER NOT NULL DEFAULT 0,
    dead_money_if_cut INTEGER NOT NULL DEFAULT 0,

    -- Contract Type
    contract_type TEXT NOT NULL CHECK(contract_type IN ('Rookie', 'Veteran', 'Extension', 'Franchise Tag', 'Transition Tag')),
    is_rookie_deal BOOLEAN NOT NULL DEFAULT 0,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT 1,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_contracts_player ON contracts(player_id);
CREATE INDEX idx_contracts_team ON contracts(team_id);
CREATE INDEX idx_contracts_active ON contracts(is_active);
CREATE INDEX idx_contracts_year ON contracts(current_year, years_remaining);

-- ============================================================================
-- 4. Draft Picks Table
-- ============================================================================
CREATE TABLE draft_picks (
    pick_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Draft Details
    draft_year INTEGER NOT NULL,
    round INTEGER NOT NULL CHECK(round >= 1 AND round <= 7),
    pick_number INTEGER NOT NULL CHECK(pick_number >= 1 AND pick_number <= 32),
    overall_pick INTEGER NOT NULL, -- 1-256 overall

    -- Ownership
    original_team_id INTEGER NOT NULL,
    current_team_id INTEGER NOT NULL,

    -- Usage
    is_used BOOLEAN NOT NULL DEFAULT 0,
    player_selected_id INTEGER,

    -- Compensation
    is_compensatory BOOLEAN NOT NULL DEFAULT 0,
    compensatory_reason TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (original_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (current_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (player_selected_id) REFERENCES players(player_id)
);

CREATE INDEX idx_picks_year ON draft_picks(draft_year);
CREATE INDEX idx_picks_team ON draft_picks(current_team_id);
CREATE INDEX idx_picks_used ON draft_picks(is_used);

-- ============================================================================
-- 5. Free Agents Table
-- ============================================================================
CREATE TABLE free_agents (
    free_agent_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL UNIQUE,

    -- Free Agent Type
    fa_type TEXT NOT NULL CHECK(fa_type IN ('UFA', 'RFA', 'ERFA')),

    -- For RFA
    rfa_tender_amount INTEGER, -- If RFA, the tender amount
    rfa_compensation_type TEXT CHECK(rfa_compensation_type IN ('None', 'Original Round', '2nd Round', '1st Round', '1st Round (No Tag)')),

    -- Contract Demands (hidden from player initially)
    desired_years INTEGER,
    desired_total_value INTEGER,
    desired_guaranteed INTEGER,

    -- Market Interest
    interested_teams TEXT, -- JSON: Array of team_ids
    top_offer TEXT, -- JSON: Best offer details

    -- Status
    is_available BOOLEAN NOT NULL DEFAULT 1,
    signed_date DATE,
    signed_team_id INTEGER,

    -- Compensatory Pick Eligible
    comp_pick_eligible BOOLEAN NOT NULL DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (signed_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_fa_type ON free_agents(fa_type);
CREATE INDEX idx_fa_available ON free_agents(is_available);
CREATE INDEX idx_fa_player ON free_agents(player_id);

-- ============================================================================
-- 6. Coaches Table
-- ============================================================================
CREATE TABLE coaches (
    coach_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    age INTEGER NOT NULL,

    -- Position
    position TEXT NOT NULL CHECK(position IN (
        'Head Coach',
        'Offensive Coordinator',
        'Defensive Coordinator',
        'Quarterbacks Coach',
        'Running Backs Coach',
        'Wide Receivers Coach',
        'Offensive Line Coach',
        'Defensive Line Coach',
        'Linebackers Coach',
        'Defensive Backs Coach',
        'Special Teams Coordinator'
    )),

    -- Current Team
    current_team_id INTEGER,

    -- Ratings (Madden-style 54-99)
    overall_rating INTEGER NOT NULL CHECK(overall_rating >= 54 AND overall_rating <= 99),

    -- Specific Skills (visible)
    development_rating INTEGER CHECK(development_rating >= 54 AND development_rating <= 99),
    scheme_rating INTEGER CHECK(scheme_rating >= 54 AND scheme_rating <= 99),
    motivation_rating INTEGER CHECK(motivation_rating >= 54 AND motivation_rating <= 99),
    game_management_rating INTEGER CHECK(game_management_rating >= 54 AND game_management_rating <= 99),

    -- Scheme Preferences
    offensive_scheme TEXT CHECK(offensive_scheme IN ('West Coast', 'Air Raid', 'Power Run', 'Zone Run', 'Spread', 'Pro Style', NULL)),
    defensive_scheme TEXT CHECK(defensive_scheme IN ('4-3', '3-4', 'Multiple', 'Tampa 2', 'Cover 3', NULL)),

    -- Contract
    contract_years_remaining INTEGER NOT NULL DEFAULT 0,
    annual_salary INTEGER NOT NULL,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (current_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_coaches_team ON coaches(current_team_id);
CREATE INDEX idx_coaches_position ON coaches(position);

-- ============================================================================
-- 7. Scouts Table
-- ============================================================================
CREATE TABLE scouts (
    scout_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Basic Info
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,

    -- Scout Type
    scout_type TEXT NOT NULL CHECK(scout_type IN ('College', 'Pro')),

    -- For College Scouts
    assigned_region TEXT, -- 'Southeast', 'Midwest', etc.

    -- Current Team
    current_team_id INTEGER,

    -- Ratings (Madden-style 54-99)
    overall_rating INTEGER NOT NULL CHECK(overall_rating >= 54 AND overall_rating <= 99),
    accuracy_rating INTEGER NOT NULL CHECK(accuracy_rating >= 54 AND accuracy_rating <= 99),

    -- Contract
    annual_salary INTEGER NOT NULL,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (current_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_scouts_team ON scouts(current_team_id);
CREATE INDEX idx_scouts_type ON scouts(scout_type);

-- ============================================================================
-- 8. Scout Reports Table
-- ============================================================================
CREATE TABLE scout_reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Report Details
    player_id INTEGER NOT NULL,
    scout_id INTEGER NOT NULL,
    season INTEGER NOT NULL,
    report_type TEXT NOT NULL CHECK(report_type IN ('College Prospect', 'Pro Player', 'Free Agent')),

    -- Reported Ratings (may differ from actual due to scout accuracy)
    reported_overall_rating INTEGER NOT NULL,
    reported_position_ratings TEXT NOT NULL, -- JSON

    -- Intangibles Assessment
    reported_work_ethic INTEGER CHECK(reported_work_ethic >= 1 AND reported_work_ethic <= 5),
    reported_character INTEGER CHECK(reported_character >= 1 AND reported_character <= 5),
    reported_football_iq INTEGER CHECK(reported_football_iq >= 1 AND reported_football_iq <= 5),

    -- Draft Grade (for college prospects)
    draft_grade TEXT CHECK(draft_grade IN ('1st Round', '2nd-3rd Round', '4th-5th Round', '6th-7th Round', 'UDFA', 'Not NFL Caliber')),

    -- Notes
    scout_notes TEXT,

    -- Accuracy Tracking (for post-draft analysis)
    actual_overall_rating INTEGER, -- Filled in after player enters NFL
    accuracy_differential INTEGER, -- reported - actual

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (scout_id) REFERENCES scouts(scout_id)
);

CREATE INDEX idx_reports_player ON scout_reports(player_id);
CREATE INDEX idx_reports_scout ON scout_reports(scout_id);
CREATE INDEX idx_reports_season ON scout_reports(season);

-- ============================================================================
-- 9. Game Results Table
-- ============================================================================
CREATE TABLE game_results (
    game_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Game Details
    season INTEGER NOT NULL,
    week INTEGER NOT NULL,
    game_type TEXT NOT NULL CHECK(game_type IN ('Preseason', 'Regular', 'Wild Card', 'Divisional', 'Conference Championship', 'Super Bowl')),

    -- Teams
    home_team_id INTEGER NOT NULL,
    away_team_id INTEGER NOT NULL,

    -- Score
    home_score INTEGER NOT NULL,
    away_score INTEGER NOT NULL,

    -- Stats (stored as JSON for flexibility)
    home_stats TEXT NOT NULL, -- JSON
    away_stats TEXT NOT NULL, -- JSON

    -- Player Stats (stored as JSON)
    player_stats TEXT NOT NULL, -- JSON array

    -- Injuries During Game
    injuries TEXT, -- JSON array

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (away_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_games_season ON game_results(season, week);
CREATE INDEX idx_games_teams ON game_results(home_team_id, away_team_id);

-- ============================================================================
-- 10. Transactions Table
-- ============================================================================
CREATE TABLE transactions (
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Transaction Type
    transaction_type TEXT NOT NULL CHECK(transaction_type IN (
        'Contract Signed',
        'Contract Extension',
        'Player Cut',
        'Player Traded',
        'Draft Pick Traded',
        'Franchise Tag',
        'Roster Move',
        'Injury Designation',
        'Contract Restructure'
    )),

    -- Teams Involved
    team_id INTEGER NOT NULL,
    other_team_id INTEGER, -- For trades

    -- Players Involved
    player_id INTEGER,

    -- Transaction Details (JSON for flexibility)
    transaction_details TEXT NOT NULL, -- JSON

    -- Financial Impact
    cap_impact INTEGER, -- Change to team's cap space (can be negative)

    -- Season Context
    season INTEGER NOT NULL,
    week INTEGER,

    -- Metadata
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (other_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE INDEX idx_transactions_team ON transactions(team_id);
CREATE INDEX idx_transactions_player ON transactions(player_id);
CREATE INDEX idx_transactions_season ON transactions(season);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- ============================================================================
-- 11. GM Career Table
-- ============================================================================
CREATE TABLE gm_career (
    career_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- GM Info
    gm_name TEXT NOT NULL,
    current_team_id INTEGER,

    -- Career Stats
    total_seasons INTEGER NOT NULL DEFAULT 0,
    total_wins INTEGER NOT NULL DEFAULT 0,
    total_losses INTEGER NOT NULL DEFAULT 0,
    playoff_appearances INTEGER NOT NULL DEFAULT 0,
    championships INTEGER NOT NULL DEFAULT 0,

    -- Job Status
    is_active BOOLEAN NOT NULL DEFAULT 1,
    job_security TEXT CHECK(job_security IN ('Secure', 'Stable', 'Hot Seat', 'Very Hot Seat')),

    -- Reputation (affects negotiations, job offers)
    reputation INTEGER NOT NULL DEFAULT 50 CHECK(reputation >= 0 AND reputation <= 100),

    -- Current Season Context
    current_season INTEGER NOT NULL,
    current_week INTEGER NOT NULL DEFAULT 0,
    current_phase TEXT NOT NULL CHECK(current_phase IN (
        'Post-Season',
        'Pre-Free Agency',
        'Free Agency',
        'Pre-Draft',
        'Draft',
        'Post-Draft',
        'Training Camp',
        'Regular Season',
        'Playoffs'
    )),

    -- Awards
    executive_of_year_awards INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    career_start_date DATE NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (current_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_gm_career_team ON gm_career(current_team_id);

-- ============================================================================
-- 12. Season Standings Table
-- ============================================================================
CREATE TABLE season_standings (
    standing_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Season Context
    season INTEGER NOT NULL,
    team_id INTEGER NOT NULL,

    -- Record
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    ties INTEGER NOT NULL DEFAULT 0,

    -- Division
    division_rank INTEGER,

    -- Conference
    conference_rank INTEGER,

    -- Playoff Status
    made_playoffs BOOLEAN NOT NULL DEFAULT 0,
    playoff_seed INTEGER,
    playoff_result TEXT CHECK(playoff_result IN ('Wild Card Loss', 'Divisional Loss', 'Conference Championship Loss', 'Super Bowl Loss', 'Super Bowl Win', NULL)),

    -- Points
    points_for INTEGER NOT NULL DEFAULT 0,
    points_against INTEGER NOT NULL DEFAULT 0,

    -- Metadata
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    UNIQUE(season, team_id)
);

CREATE INDEX idx_standings_season ON season_standings(season);
CREATE INDEX idx_standings_team ON season_standings(team_id);

-- ============================================================================
-- 13. Game State Table
-- ============================================================================
CREATE TABLE game_state (
    state_id INTEGER PRIMARY KEY CHECK(state_id = 1), -- Only one row

    -- Save File Info
    save_name TEXT NOT NULL,

    -- Current Context
    current_season INTEGER NOT NULL,
    current_week INTEGER NOT NULL DEFAULT 0,
    current_phase TEXT NOT NULL,

    -- Salary Cap Info
    league_salary_cap INTEGER NOT NULL, -- Current year's cap
    salary_floor INTEGER NOT NULL,      -- 89% of cap

    -- Important Dates
    free_agency_start_date DATE,
    draft_date DATE,

    -- Game Settings
    settings TEXT NOT NULL, -- JSON

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
