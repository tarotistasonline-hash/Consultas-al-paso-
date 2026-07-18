export type FilterLevel = "honesto" | "directo" | "sin-piedad";

export type CategoryId = "rutina" | "sales_copy" | "negocio" | "calculadora" | "libre";

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  placeholder: string;
}

export interface Preset {
  id: string;
  categoryId: CategoryId;
  title: string;
  prompt: string;
  badge: string;
}

export interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  rating?: "up" | "down" | null;
}

export interface DailyStat {
  date: string; // e.g., '2026-05-18' or localized 'Lu', 'Ma' etc.
  dilemmas: number;
  characters: number;
}

export interface UserStats {
  resolvedDilemas: number;
  charactersOfTruth: number;
  categories: Record<CategoryId, number>;
  trend: DailyStat[];
  monthlyTrend?: DailyStat[];
  helpfulCount?: number;
  unhelpfulCount?: number;
}

export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  date: string;
  summary: string;
  content: string[];
  source: string;
}

export interface BmiRecord {
  id: string;
  userId: string;
  weight: number;
  height: number;
  bmi: number;
  date: string; // YYYY-MM-DD format
  createdAt?: any; // Firestore ServerTimestamp or date
}

