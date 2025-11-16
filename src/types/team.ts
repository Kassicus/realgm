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
