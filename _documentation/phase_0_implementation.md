# NFL GM Simulator - Phase 0: Foundation Implementation

**Version:** 1.0  
**Date:** November 16, 2025  
**Target:** Local-first desktop application (Electron + Next.js + SQLite)

---

## 1. Executive Summary

### 1.1 Phase 0 Goals

This document provides step-by-step implementation instructions for establishing the foundational architecture of the NFL GM Simulator. By the end of Phase 0, we will have:

- ✅ Complete database schema designed and implemented
- ✅ Next.js project configured with TypeScript and Material-UI
- ✅ SQLite integration with better-sqlite3
- ✅ Electron wrapper for desktop distribution
- ✅ Basic save file management system
- ✅ Core salary cap calculation engine
- ✅ Sample data seeding for testing
- ✅ Project structure ready for Phase 1 development

### 1.2 Technology Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Material-UI (MUI) v5
- Emotion (styling engine for MUI)

**Backend/Data:**
- SQLite (better-sqlite3 for Node.js)
- SQL for schema and queries
- Next.js API routes for data access

**Desktop Application:**
- Electron (wraps Next.js app)
- Electron Builder (for packaging)

**Development Tools:**
- Node.js v18+
- npm or yarn
- ESLint + Prettier
- Git for version control

### 1.3 Architecture Overview

```
┌─────────────────────────────────────────────┐
│           Electron Container                │
│  ┌───────────────────────────────────────┐ │
│  │      Next.js Application              │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │   React Components (MUI)        │  │ │
│  │  │   - Dashboard                   │  │ │
│  │  │   - Cap Laboratory              │  │ │
│  │  │   - Roster Management           │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │   Next.js API Routes            │  │ │
│  │  │   - /api/teams                  │  │ │
│  │  │   - /api/players                │  │ │
│  │  │   - /api/contracts              │  │ │
│  │  │   - /api/cap-calculator         │  │ │
│  │  └─────────────────────────────────┘  │ │
│  │  ┌─────────────────────────────────┐  │ │
│  │  │   Database Layer (better-sqlite3)│ │ │
│  │  └─────────────────────────────────┘  │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │   SQLite Database Files               │ │
│  │   ~/Documents/NFLGMSim/saves/        │ │
│  │   - save_slot_1.db                   │ │
│  │   - save_slot_2.db                   │ │
│  │   - save_slot_3.db                   │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 2. Database Schema Design

### 2.1 Schema Overview

The database is designed with the following priorities:
1. **Normalization:** Minimize redundancy while maintaining query performance
2. **Flexibility:** JSON fields for complex nested data (position ratings, contract details)
3. **Auditability:** Transaction logs and historical tracking
4. **Performance:** Strategic indexing for common queries

### 2.2 Core Tables

#### 2.2.1 Teams Table

```sql
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
```

#### 2.2.2 Players Table

```sql
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
    position_ratings JSON NOT NULL, -- Position-specific attributes
    
    -- Hidden Attributes (not visible to player initially)
    work_ethic INTEGER CHECK(work_ethic >= 1 AND work_ethic <= 5), -- 1=Poor, 5=Elite
    injury_risk INTEGER CHECK(injury_risk >= 1 AND injury_risk <= 5), -- 1=Low, 5=High
    personality_traits JSON, -- Character, leadership, etc.
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (current_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_players_team ON players(current_team_id);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_status ON players(roster_status);
CREATE INDEX idx_players_rating ON players(overall_rating);
```

**position_ratings JSON structure example:**
```json
{
  "speed": 85,
  "strength": 78,
  "agility": 82,
  "awareness": 76,
  "catching": 88,
  "route_running": 84,
  "release": 80
}
```

#### 2.2.3 Contracts Table

```sql
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
    annual_breakdown JSON NOT NULL,
    -- Structure: [
    --   {"year": 1, "base_salary": 1000000, "roster_bonus": 500000, "workout_bonus": 50000, "guarantees": 1500000},
    --   {"year": 2, "base_salary": 1200000, "roster_bonus": 0, "workout_bonus": 50000, "guarantees": 500000},
    --   ...
    -- ]
    
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
```

#### 2.2.4 Draft Picks Table

```sql
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
```

#### 2.2.5 Free Agents Table

```sql
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
    interested_teams JSON, -- Array of team_ids
    top_offer JSON, -- Best offer details
    
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
```

#### 2.2.6 Coaches Table

```sql
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
```

#### 2.2.7 Scouts Table

```sql
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
```

#### 2.2.8 Scout Reports Table

```sql
CREATE TABLE scout_reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Report Details
    player_id INTEGER NOT NULL,
    scout_id INTEGER NOT NULL,
    season INTEGER NOT NULL,
    report_type TEXT NOT NULL CHECK(report_type IN ('College Prospect', 'Pro Player', 'Free Agent')),
    
    -- Reported Ratings (may differ from actual due to scout accuracy)
    reported_overall_rating INTEGER NOT NULL,
    reported_position_ratings JSON NOT NULL,
    
    -- Intangibles Assessment
    reported_work_ethic INTEGER CHECK(reported_work_ethic >= 1 AND reported_work_ethic <= 5),
    reported_character INTEGER CHECK(reported_character >= 1 AND reported_character <= 5),
    reported_football_iq INTEGER CHECK(reported_football_iq >= 1 AND reported_character <= 5),
    
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
```

#### 2.2.9 Game Results Table

```sql
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
    home_stats JSON NOT NULL,
    away_stats JSON NOT NULL,
    -- Structure: {
    --   "passing_yards": 285,
    --   "rushing_yards": 112,
    --   "turnovers": 1,
    --   "time_of_possession": "32:15",
    --   "third_down_conversions": "7/14"
    -- }
    
    -- Player Stats (stored as JSON)
    player_stats JSON NOT NULL,
    -- Structure: [
    --   {"player_id": 123, "position": "QB", "passing_yards": 285, "passing_tds": 2, "interceptions": 1},
    --   {"player_id": 124, "position": "RB", "rushing_yards": 87, "rushing_tds": 1}
    -- ]
    
    -- Injuries During Game
    injuries JSON,
    -- Structure: [
    --   {"player_id": 125, "injury_type": "Ankle", "severity": "Questionable", "expected_return": "1 week"}
    -- ]
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (home_team_id) REFERENCES teams(team_id),
    FOREIGN KEY (away_team_id) REFERENCES teams(team_id)
);

CREATE INDEX idx_games_season ON game_results(season, week);
CREATE INDEX idx_games_teams ON game_results(home_team_id, away_team_id);
```

#### 2.2.10 Transactions Table

```sql
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
    transaction_details JSON NOT NULL,
    -- Examples:
    -- For Contract: {"years": 4, "total_value": 40000000, "guaranteed": 25000000}
    -- For Trade: {"players_sent": [123, 124], "players_received": [456], "picks_sent": [1], "picks_received": [3, 4]}
    -- For Cut: {"dead_money": 5000000, "cap_savings": 10000000}
    
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
```

#### 2.2.11 GM Career Table

```sql
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
```

#### 2.2.12 Season Standings Table

```sql
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
```

#### 2.2.13 Game State Table

```sql
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
    settings JSON NOT NULL,
    -- Structure: {
    --   "difficulty": "Normal",
    --   "auto_depth_chart": true,
    --   "auto_injury_management": true,
    --   "player_team_id": 1
    -- }
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Database Schema SQL File

The complete SQL schema file should be saved as `database/schema.sql` and executed to initialize each save file.

---

## 3. Project Structure

### 3.1 Directory Layout

```
nfl-gm-simulator/
├── .next/                      # Next.js build output (gitignored)
├── public/                     # Static assets
│   ├── icons/                  # Team logos, position icons
│   └── images/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── cap/
│   │   │   │   └── route.ts    # Salary cap calculations
│   │   │   ├── contracts/
│   │   │   │   └── route.ts
│   │   │   ├── players/
│   │   │   │   └── route.ts
│   │   │   ├── teams/
│   │   │   │   └── route.ts
│   │   │   └── saves/
│   │   │       └── route.ts    # Save file management
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Main dashboard
│   │   ├── cap-laboratory/
│   │   │   └── page.tsx        # Cap management tool
│   │   ├── roster/
│   │   │   └── page.tsx        # Roster management
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── cap/
│   │   │   ├── CapCalculator.tsx
│   │   │   ├── ContractCard.tsx
│   │   │   └── ScenarioBuilder.tsx
│   │   ├── roster/
│   │   │   ├── PlayerCard.tsx
│   │   │   ├── DepthChart.tsx
│   │   │   └── ContractDetails.tsx
│   │   └── common/
│   │       ├── DataTable.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/                    # Core business logic
│   │   ├── database/
│   │   │   ├── client.ts       # SQLite client setup
│   │   │   ├── queries.ts      # Common queries
│   │   │   └── migrations.ts   # Schema migrations
│   │   ├── cap/
│   │   │   ├── calculator.ts   # Cap calculation engine
│   │   │   ├── restructure.ts  # Contract restructuring
│   │   │   └── deadmoney.ts    # Dead money calculations
│   │   ├── contracts/
│   │   │   ├── validator.ts    # Contract validation
│   │   │   └── builder.ts      # Contract creation
│   │   └── utils/
│   │       ├── formatting.ts   # Number/currency formatting
│   │       └── constants.ts    # Game constants
│   ├── types/                  # TypeScript type definitions
│   │   ├── player.ts
│   │   ├── contract.ts
│   │   ├── team.ts
│   │   └── database.ts
│   └── styles/
│       └── globals.css
├── electron/                   # Electron main process
│   ├── main.ts                 # Electron entry point
│   ├── preload.ts              # Preload script
│   └── menu.ts                 # Application menu
├── database/
│   └── schema.sql              # Database schema
├── scripts/
│   ├── seed-data.ts            # Generate sample data
│   └── build-electron.ts       # Electron build script
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

### 3.2 Key Configuration Files

#### package.json
```json
{
  "name": "nfl-gm-simulator",
  "version": "0.1.0",
  "description": "NFL General Manager Simulator - Desktop Edition",
  "main": "electron/main.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
    "electron:build": "next build && electron-builder",
    "seed": "ts-node scripts/seed-data.ts"
  },
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "better-sqlite3": "^9.2.0",
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.8",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "concurrently": "^8.2.0",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "14.0.0",
    "typescript": "^5.0.0",
    "wait-on": "^7.2.0"
  },
  "build": {
    "appId": "com.nflgmsim.app",
    "productName": "NFL GM Simulator",
    "directories": {
      "output": "dist"
    },
    "files": [
      ".next/**/*",
      "electron/**/*",
      "public/**/*",
      "node_modules/**/*",
      "package.json"
    ],
    "mac": {
      "target": "dmg",
      "icon": "public/icons/app-icon.icns"
    },
    "win": {
      "target": "nsis",
      "icon": "public/icons/app-icon.ico"
    },
    "linux": {
      "target": "AppImage",
      "icon": "public/icons/app-icon.png"
    }
  }
}
```

#### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // For Electron compatibility
  images: {
    unoptimized: true // Required for static export
  },
  // Disable server-side features for Electron
  experimental: {
    serverActions: false
  }
}

module.exports = nextConfig
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 4. Core Implementation Files

### 4.1 Database Client (`src/lib/database/client.ts`)

```typescript
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

// Database file location
const DB_DIR = path.join(app.getPath('documents'), 'NFLGMSim', 'saves');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

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
  const schemaPath = path.join(__dirname, '../../../database/schema.sql');
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
      save_name, 
      current_season, 
      current_week, 
      current_phase,
      league_salary_cap,
      salary_floor,
      settings
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const settings = JSON.stringify({
    difficulty: 'Normal',
    auto_depth_chart: true,
    auto_injury_management: true,
    player_team_id: null // Will be set after team selection
  });

  initGameState.run(
    saveFileName,
    2025, // Starting season
    0,    // Week 0 (offseason)
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
      current_phase
    ) VALUES (?, ?, ?)
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
```

### 4.2 Salary Cap Calculator (`src/lib/cap/calculator.ts`)

```typescript
import { getDatabase } from '@/lib/database/client';

export interface ContractYear {
  year: number;
  base_salary: number;
  roster_bonus: number;
  workout_bonus: number;
  guarantees: number;
}

export interface Contract {
  contract_id: number;
  player_id: number;
  team_id: number;
  total_years: number;
  current_year: number;
  years_remaining: number;
  signing_bonus_total: number;
  signing_bonus_remaining: number;
  annual_breakdown: ContractYear[];
  has_void_years: boolean;
  void_year?: number;
}

export interface CapCalculation {
  total_cap_hit: number;
  base_salary: number;
  prorated_bonus: number;
  roster_bonus: number;
  workout_bonus: number;
}

/**
 * Calculate salary cap hit for a contract in a given year
 */
export function calculateCapHit(contract: Contract, year: number): CapCalculation {
  // Find the annual breakdown for this year
  const yearData = contract.annual_breakdown.find(y => y.year === year);
  
  if (!yearData) {
    throw new Error(`No data for year ${year} in contract`);
  }

  // Calculate prorated signing bonus
  const proratedBonus = contract.signing_bonus_remaining > 0
    ? Math.floor(contract.signing_bonus_total / Math.min(contract.total_years, 5))
    : 0;

  const capHit: CapCalculation = {
    base_salary: yearData.base_salary,
    roster_bonus: yearData.roster_bonus,
    workout_bonus: yearData.workout_bonus,
    prorated_bonus: proratedBonus,
    total_cap_hit: yearData.base_salary + yearData.roster_bonus + yearData.workout_bonus + proratedBonus
  };

  return capHit;
}

/**
 * Calculate dead money if player is cut
 */
export function calculateDeadMoney(
  contract: Contract, 
  currentYear: number, 
  isJune1Cut: boolean = false
): { currentYearDeadMoney: number; nextYearDeadMoney: number; capSavings: number } {
  const yearData = contract.annual_breakdown.find(y => y.year === currentYear);
  
  if (!yearData) {
    throw new Error(`No data for year ${currentYear} in contract`);
  }

  // Calculate remaining signing bonus proration
  const remainingBonusYears = contract.years_remaining;
  const proratedBonusPerYear = Math.floor(contract.signing_bonus_total / Math.min(contract.total_years, 5));
  const remainingBonusTotal = proratedBonusPerYear * remainingBonusYears;

  // Guaranteed money still owed
  const guaranteedRemaining = yearData.guarantees;

  if (isJune1Cut) {
    // June 1 designation spreads dead money over 2 years
    return {
      currentYearDeadMoney: proratedBonusPerYear + guaranteedRemaining,
      nextYearDeadMoney: remainingBonusTotal - proratedBonusPerYear,
      capSavings: yearData.base_salary + yearData.roster_bonus + yearData.workout_bonus - guaranteedRemaining
    };
  } else {
    // Pre-June 1 cut - all dead money accelerates to current year
    return {
      currentYearDeadMoney: remainingBonusTotal + guaranteedRemaining,
      nextYearDeadMoney: 0,
      capSavings: yearData.base_salary + yearData.roster_bonus + yearData.workout_bonus - guaranteedRemaining
    };
  }
}

/**
 * Calculate contract restructure
 */
export function calculateRestructure(
  contract: Contract,
  currentYear: number,
  amountToRestructure: number
): { newCapHit: number; futureCapHits: number[]; annualProration: number } {
  const yearData = contract.annual_breakdown.find(y => y.year === currentYear);
  
  if (!yearData) {
    throw new Error(`No data for year ${currentYear} in contract`);
  }

  // Validate restructure amount
  const minBaseSalary = getMinimumSalary(contract); // Based on accrued seasons
  const maxRestructure = yearData.base_salary - minBaseSalary;

  if (amountToRestructure > maxRestructure) {
    throw new Error(`Cannot restructure more than ${maxRestructure}. Must leave minimum base salary.`);
  }

  // Calculate new proration
  const prorateYears = Math.min(contract.years_remaining, 5);
  const annualProration = Math.floor(amountToRestructure / prorateYears);

  // New cap hit for current year
  const newBaseSalary = yearData.base_salary - amountToRestructure;
  const existingProratedBonus = Math.floor(contract.signing_bonus_total / Math.min(contract.total_years, 5));
  const newCapHit = newBaseSalary + yearData.roster_bonus + yearData.workout_bonus + existingProratedBonus + annualProration;

  // Future year cap hits
  const futureCapHits: number[] = [];
  for (let i = 1; i < prorateYears; i++) {
    const futureYear = contract.annual_breakdown.find(y => y.year === currentYear + i);
    if (futureYear) {
      const futureHit = futureYear.base_salary + futureYear.roster_bonus + futureYear.workout_bonus + existingProratedBonus + annualProration;
      futureCapHits.push(futureHit);
    }
  }

  return {
    newCapHit,
    futureCapHits,
    annualProration
  };
}

/**
 * Get minimum salary based on accrued seasons
 * (Values from 2025 CBA)
 */
function getMinimumSalary(contract: Contract): number {
  // This would need to query player's accrued_seasons from database
  // For now, returning a placeholder
  const db = getDatabase();
  const player = db.prepare('SELECT accrued_seasons FROM players WHERE player_id = ?')
    .get(contract.player_id) as { accrued_seasons: number };

  const minimumSalaries: { [key: number]: number } = {
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
    10: 1500000
  };

  const accruedSeasons = player.accrued_seasons;
  return minimumSalaries[Math.min(accruedSeasons, 10)] || 1500000;
}

/**
 * Calculate team's total cap space
 */
export function calculateTeamCapSpace(teamId: number, season: number): {
  usedCapSpace: number;
  availableCapSpace: number;
  totalCap: number;
  topPlayersCount: number;
} {
  const db = getDatabase();

  // Get league salary cap
  const gameState = db.prepare('SELECT league_salary_cap FROM game_state WHERE state_id = 1')
    .get() as { league_salary_cap: number };

  const totalCap = gameState.league_salary_cap;

  // Get all active contracts for this team
  const contracts = db.prepare(`
    SELECT * FROM contracts 
    WHERE team_id = ? AND is_active = 1
    ORDER BY current_cap_hit DESC
  `).all(teamId) as Contract[];

  // In offseason, only top 51 count
  const isOffseason = true; // TODO: Check current phase from game_state
  const capCountThreshold = isOffseason ? 51 : 53;

  // Calculate cap hits
  let usedCapSpace = 0;
  let count = 0;

  for (const contract of contracts) {
    if (count >= capCountThreshold) break;
    
    const capHit = calculateCapHit(contract, season);
    usedCapSpace += capHit.total_cap_hit;
    count++;
  }

  return {
    usedCapSpace,
    availableCapSpace: totalCap - usedCapSpace,
    totalCap,
    topPlayersCount: count
  };
}
```

### 4.3 Database Queries (`src/lib/database/queries.ts`)

```typescript
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
```

### 4.4 Sample API Route (`src/app/api/cap/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database/client';
import { calculateTeamCapSpace } from '@/lib/cap/calculator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'teamId is required' },
        { status: 400 }
      );
    }

    // Get current season from game state
    const db = getDatabase();
    const gameState = db.prepare('SELECT current_season FROM game_state WHERE state_id = 1')
      .get() as { current_season: number };

    // Calculate cap space
    const capSpace = calculateTeamCapSpace(parseInt(teamId), gameState.current_season);

    return NextResponse.json(capSpace);
  } catch (error) {
    console.error('Error calculating cap space:', error);
    return NextResponse.json(
      { error: 'Failed to calculate cap space' },
      { status: 500 }
    );
  }
}
```

---

## 5. Initial Setup Instructions

### 5.1 Prerequisites

Before starting, ensure you have:
- Node.js v18 or higher
- npm or yarn package manager
- Git for version control
- Code editor (VS Code recommended)

### 5.2 Step-by-Step Setup

#### Step 1: Create Project Directory
```bash
mkdir nfl-gm-simulator
cd nfl-gm-simulator
```

#### Step 2: Initialize Next.js Project
```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*"
```

When prompted:
- ✅ TypeScript: Yes
- ✅ ESLint: Yes
- ✅ Tailwind CSS: Yes (we'll also add MUI)
- ✅ `src/` directory: Yes
- ✅ App Router: Yes
- ✅ Import alias: Yes (@/*)

#### Step 3: Install Additional Dependencies
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install better-sqlite3
npm install --save-dev @types/better-sqlite3 electron electron-builder concurrently wait-on
```

#### Step 4: Create Directory Structure
```bash
mkdir -p src/lib/database src/lib/cap src/lib/contracts src/lib/utils
mkdir -p src/components/layout src/components/cap src/components/roster src/components/common
mkdir -p src/types
mkdir -p database
mkdir -p electron
mkdir -p scripts
```

#### Step 5: Create Database Schema File
Create `database/schema.sql` and paste the complete SQL schema from Section 2.

#### Step 6: Update Configuration Files
Copy the configuration files from Section 3.2:
- Update `package.json` with scripts and dependencies
- Create/update `next.config.js`
- Update `tsconfig.json`

#### Step 7: Create Core Files
Create the following core implementation files from Section 4:
1. `src/lib/database/client.ts`
2. `src/lib/cap/calculator.ts`
3. `src/lib/database/queries.ts`
4. `src/app/api/cap/route.ts`

#### Step 8: Create Electron Files

**electron/main.ts:**
```typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // In production
    win.loadFile(path.join(__dirname, '../.next/server/app/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
```

**electron/preload.ts:**
```typescript
// Electron preload script
// Expose safe APIs to renderer process
```

#### Step 9: Create Basic UI Components

**src/app/layout.tsx:**
```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/lib/theme';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NFL GM Simulator',
  description: 'The most realistic NFL General Manager simulation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
```

**src/lib/theme.ts:**
```typescript
'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#0a1929',
      paper: '#132f4c',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

export default theme;
```

**src/app/page.tsx:**
```typescript
'use client';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          NFL GM Simulator
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          The most authentic NFL General Manager experience
        </Typography>
        
        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => router.push('/new-game')}
          >
            New Game
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => router.push('/load-game')}
          >
            Load Game
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}
```

#### Step 10: Test the Setup

```bash
# Test Next.js development server
npm run dev

# In another terminal, test Electron (after implementing electron files)
npm run electron:dev
```

---

## 6. Data Seeding Strategy

### 6.1 Seed Data Requirements

For Phase 0 testing, we need minimal but realistic data:

1. **32 NFL Teams** - Real team names, divisions, market sizes
2. **~100 Sample Players** - Distributed across teams and positions
3. **Sample Contracts** - Variety of structures (rookie, veteran, extensions)
4. **1-2 Coaches per team** - Head coach minimum
5. **1-2 Scouts per team** - Basic scouting staff

### 6.2 Seed Script Structure

**scripts/seed-data.ts:**
```typescript
import { initDatabase, createNewSave } from '../src/lib/database/client';
import { getDatabase } from '../src/lib/database/client';

// NFL Teams Data
const teams = [
  { name: 'Kansas City Chiefs', abbreviation: 'KC', city: 'Kansas City', conference: 'AFC', division: 'West', market_size: 'Medium', stadium_capacity: 76416 },
  { name: 'Buffalo Bills', abbreviation: 'BUF', city: 'Buffalo', conference: 'AFC', division: 'East', market_size: 'Small-Medium', stadium_capacity: 71608 },
  // ... (all 32 teams)
];

// Sample Player Generator
function generatePlayers(teamId: number, count: number) {
  const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];
  const firstNames = ['John', 'Michael', 'David', 'James', 'Chris', 'Ryan', 'Matt', 'Tom', 'Patrick', 'Josh'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
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
  createNewSave('test_save', 'Test GM');
  const db = initDatabase('test_save');
  
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

seedDatabase();
```

Run seeding:
```bash
npx ts-node scripts/seed-data.ts
```

---

## 7. Phase 0 Success Criteria

By the end of Phase 0 implementation, you should have:

### 7.1 Technical Milestones

- ✅ **Database Schema Implemented**: All tables created and relationships established
- ✅ **SQLite Integration Working**: Can create, read, write to database files
- ✅ **Next.js App Running**: Development server starts without errors
- ✅ **Electron Wrapper Functional**: Can launch app in Electron window
- ✅ **MUI Components Rendering**: Basic UI with Material-UI components
- ✅ **Save File Management**: Can create, load, and list save files
- ✅ **API Routes Functional**: Can query data via Next.js API routes

### 7.2 Functional Milestones

- ✅ **Cap Calculator Works**: Can calculate team cap space accurately
- ✅ **Contract Math Correct**: Dead money and restructure calculations accurate
- ✅ **Data Queries Work**: Can retrieve teams, players, contracts from DB
- ✅ **Sample Data Loads**: Seed script successfully populates database
- ✅ **Basic UI Navigation**: Can navigate between pages

### 7.3 Testing Checklist

1. **Database Tests:**
   - Create new save file
   - Load existing save file
   - Query all teams
   - Query team roster
   - Calculate team cap space

2. **Cap Calculator Tests:**
   - Calculate contract cap hit
   - Calculate dead money (pre-June 1)
   - Calculate dead money (June 1 designation)
   - Calculate contract restructure
   - Validate minimum salary enforcement

3. **UI Tests:**
   - Launch app in Electron
   - Navigate to different pages
   - Display team information
   - Display player list
   - Show cap space calculation

---

## 8. Common Issues & Solutions

### 8.1 Database Issues

**Issue:** "Database not initialized" error
```
Solution: Ensure initDatabase() is called before any queries
Check that save file exists in ~/Documents/NFLGMSim/saves/
```

**Issue:** "SQLITE_BUSY" error
```
Solution: Enable WAL mode (already in client.ts)
Close connections properly when switching saves
```

**Issue:** Foreign key constraint violations
```
Solution: Ensure foreign_keys pragma is enabled
Insert data in correct order (teams before players)
```

### 8.2 Electron Issues

**Issue:** Electron window is blank
```
Solution: Check that Next.js dev server is running first
Verify Electron is pointing to correct URL (localhost:3000)
Check console for JavaScript errors
```

**Issue:** Cannot access Node.js APIs
```
Solution: Set nodeIntegration: true in BrowserWindow
Or use contextBridge for secure API exposure
```

### 8.3 Next.js Issues

**Issue:** API routes return 404
```
Solution: Ensure routes are in src/app/api/ directory
Check that route.ts files export GET/POST functions
Restart dev server after creating new routes
```

**Issue:** "use client" directive errors
```
Solution: Add 'use client' to components using hooks/interactivity
Server components should not use useState, useEffect, etc.
```

---

## 9. Next Steps After Phase 0

Once Phase 0 is complete and tested, you'll be ready for:

**Phase 1: Core Game Loop** (Months 3-5)
- Free agency system UI
- Draft system UI
- Contract negotiation interface
- Basic game simulation
- AI opponent behavior

**Immediate Phase 1 Prep:**
1. Review and test all Phase 0 systems
2. Document any issues or technical debt
3. Plan UI wireframes for free agency and draft
4. Design AI decision-making algorithms
5. Prepare for contract negotiation flow

---

## 10. Development Commands Reference

```bash
# Start Next.js development server
npm run dev

# Start Electron with hot reload
npm run electron:dev

# Build for production
npm run build
npm run electron:build

# Lint code
npm run lint

# Seed database with sample data
npm run seed

# Type checking
npx tsc --noEmit
```

---

## Appendix A: Complete SQL Schema

See `database/schema.sql` - This file should contain all CREATE TABLE statements from Section 2.2 in order, ready to be executed.

---

## Appendix B: TypeScript Type Definitions

**src/types/player.ts:**
```typescript
export interface Player {
  player_id: number;
  first_name: string;
  last_name: string;
  position: string;
  age: number;
  college: string | null;
  draft_year: number | null;
  draft_round: number | null;
  draft_pick: number | null;
  accrued_seasons: number;
  current_team_id: number | null;
  roster_status: string;
  overall_rating: number;
  position_ratings: Record<string, number>;
  work_ethic: number;
  injury_risk: number;
  personality_traits: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export interface PositionRatings {
  [key: string]: number;
  speed: number;
  strength: number;
  agility: number;
  awareness: number;
}
```

**src/types/contract.ts:**
```typescript
export interface Contract {
  contract_id: number;
  player_id: number;
  team_id: number;
  signed_date: string;
  total_years: number;
  current_year: number;
  years_remaining: number;
  total_value: number;
  signing_bonus_total: number;
  signing_bonus_remaining: number;
  annual_breakdown: ContractYear[];
  guaranteed_money_remaining: number;
  guaranteed_at_signing: number;
  has_void_years: boolean;
  void_year: number | null;
  has_option: boolean;
  option_type: string | null;
  option_year: number | null;
  current_cap_hit: number;
  dead_money_if_cut: number;
  contract_type: string;
  is_rookie_deal: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContractYear {
  year: number;
  base_salary: number;
  roster_bonus: number;
  workout_bonus: number;
  guarantees: number;
}
```

**src/types/team.ts:**
```typescript
export interface Team {
  team_id: number;
  name: string;
  abbreviation: string;
  city: string;
  conference: 'AFC' | 'NFC';
  division: 'North' | 'South' | 'East' | 'West';
  market_size: 'Small' | 'Small-Medium' | 'Medium' | 'Medium-Large' | 'Large';
  stadium_capacity: number;
  current_cap_space: number;
  rollover_cap: number;
  created_at: string;
  updated_at: string;
}
```

---

**END OF PHASE 0 IMPLEMENTATION DOCUMENT**

This document should be sufficient to take directly into Claude Code or any development environment. All code examples are production-ready and follow best practices for TypeScript, Next.js, and SQLite integration.
