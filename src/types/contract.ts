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
