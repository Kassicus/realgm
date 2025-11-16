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
