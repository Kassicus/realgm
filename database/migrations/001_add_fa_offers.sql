-- Migration: Add fa_offers table for tracking free agency contract offers
-- Date: 2024-11-16
-- Phase: 1 - Free Agency System

-- ============================================================================
-- FA Offers Table - Tracks all contract offers made to free agents
-- ============================================================================
CREATE TABLE IF NOT EXISTS fa_offers (
    offer_id INTEGER PRIMARY KEY AUTOINCREMENT,

    -- Offer Details
    player_id INTEGER NOT NULL,
    team_id INTEGER NOT NULL,

    -- Contract Terms
    total_years INTEGER NOT NULL CHECK(total_years >= 1 AND total_years <= 7),
    total_value INTEGER NOT NULL,
    guaranteed_money INTEGER NOT NULL DEFAULT 0,
    signing_bonus INTEGER NOT NULL DEFAULT 0,

    -- Annual Breakdown
    annual_breakdown TEXT, -- JSON array of year-by-year salary structure

    -- Contract Structure
    structure_type TEXT CHECK(structure_type IN ('frontloaded', 'backloaded', 'even')),

    -- Offer Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'countered', 'withdrawn')),

    -- Negotiation Tracking
    negotiation_round INTEGER NOT NULL DEFAULT 1,
    is_counter_offer BOOLEAN NOT NULL DEFAULT 0,
    parent_offer_id INTEGER, -- If this is a counter, link to original

    -- Player Response
    player_response TEXT, -- JSON: Contains decision, message, counter terms if applicable
    response_date TIMESTAMP,

    -- Offer Evaluation
    offer_score INTEGER, -- 0-100 rating of how close to player demands

    -- Metadata
    offered_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_date TIMESTAMP, -- Some offers may have expiration

    FOREIGN KEY (player_id) REFERENCES players(player_id),
    FOREIGN KEY (team_id) REFERENCES teams(team_id),
    FOREIGN KEY (parent_offer_id) REFERENCES fa_offers(offer_id)
);

CREATE INDEX idx_fa_offers_player ON fa_offers(player_id);
CREATE INDEX idx_fa_offers_team ON fa_offers(team_id);
CREATE INDEX idx_fa_offers_status ON fa_offers(status);
CREATE INDEX idx_fa_offers_date ON fa_offers(offered_date);
