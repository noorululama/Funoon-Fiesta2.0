export type SectionType = "single" | "group" | "general";
export type CategoryType = "A" | "B" | "C" | "none";
export type GradeType = "A" | "B" | "C" | "none";

export interface Team {
  id: string;
  name: string;
  leader: string;
  leader_photo: string;
  color: string;
  description: string;
  contact: string;
  total_points: number;
}

export interface Student {
  id: string;
  name: string;
  team_id: string;
  chest_no: string;
  avatar?: string;
  total_points: number;
}

export interface Program {
  id: string;
  name: string;
  section: SectionType;
  stage: boolean;
  category: CategoryType;
}

export interface Jury {
  id: string;
  name: string;
  password: string;
}

export interface AssignedProgram {
  program_id: string;
  jury_id: string;
  status: "pending" | "submitted" | "completed";
}

export interface ResultEntry {
  position: 1 | 2 | 3;
  student_id?: string;
  team_id?: string;
  grade?: GradeType;
  score: number;
}

export interface ResultRecord {
  id: string;
  program_id: string;
  jury_id: string;
  submitted_by: string;
  submitted_at: string;
  entries: ResultEntry[];
  status: "pending" | "approved";
  notes?: string;
}

export interface LiveScore {
  team_id: string;
  total_points: number;
}

