export type HackathonMode = "online" | "in-person" | "hybrid";
export type HackathonStatus = "upcoming" | "open" | "closed" | "expired";
export type ViewMode = "list" | "grid";
export type SortMode = "deadline" | "prize" | "newest";
export type LocationPreset =
  | "all"
  | "India-wide"
  | "Chennai"
  | "Bangalore"
  | "Delhi"
  | "Mumbai"
  | "Hyderabad"
  | "Noida"
  | "Patiala"
  | "Kolkata"
  | "Singapore"
  | "Remote International"
  | "APAC"
  | "Thailand"
  | "Chennai, in-person"
  | "Delhi / NIT Delhi"
  | "Bangalore / in-person";

export interface HackathonRow {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  mode: HackathonMode;
  location: string;
  prize_pool: string;
  ppo_possible: boolean;
  registration_link: string;
  linkedin_post_link: string | null;
  github_link: string | null;
  status: HackathonStatus;
  source: string;
  approved: boolean;
  reported: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SubmissionRow extends HackathonRow {
  submitter_email: string | null;
}

export interface ReportRow {
  id: string;
  hackathon_id: string | null;
  hackathon_title: string;
  reason: string;
  reporter_email: string | null;
  resolved: boolean;
  resolved_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HackathonFilters {
  search: string;
  dateFrom: string;
  dateTo: string;
  mode: HackathonMode | "all";
  location: LocationPreset;
  ppoOnly: boolean;
  majorOnly: boolean;
  prizeTier: "all" | "50k" | "1lakh" | "international";
  status: HackathonStatus | "all" | "closing-soon";
  sortMode: SortMode;
  viewMode: ViewMode;
}

export interface PublicHackathonForm {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  mode: HackathonMode;
  location: string;
  prize_pool: string;
  ppo_possible: boolean;
  registration_link: string;
  linkedin_post_link?: string;
  github_link?: string;
  source: string;
  submitter_email?: string;
}
