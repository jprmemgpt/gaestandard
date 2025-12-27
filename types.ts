
export type UserRole = 'ADMIN' | 'USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface ScoreboardEntry {
  model: string;
  gae_score: number;
  status: 'PASS' | 'FAIL';
  questions_run: number;
  audit_date: string;
  audit_method: string;
}

export interface BiteEntry {
  model_id: string;
  status: string;
  score: number;
  gem_summary: string;
  pass_count?: string;
  details?: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: string;
  sentiment?: 'positive' | 'neutral' | 'critical';
}

export interface WhitePaper {
  id: string;
  title: string;
  author: string;
  date: string;
  summary: string;
  content: string;
  comments?: Comment[];
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  preview: string;
  commentsCount: number;
}
