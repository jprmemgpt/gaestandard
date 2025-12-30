
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

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  type: 'PAGE_VIEW' | 'PAPER_READ' | 'CASE_FILE_VIEW' | 'EXTERNAL_LINK';
  target: string;
  source: string; 
  location: {
    language: string;
    userAgent: string;
    screen: string;
    ip: string; 
  };
}
