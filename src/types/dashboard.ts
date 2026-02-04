export interface Task {
  id: string;
  name: string;
  date: string;
  category: string;
  hours: number;
  aiUsed: boolean;
  ownership: boolean;
  outcome: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentProgress: number;
  unit: 'hours' | 'stories' | '%';
}

export type FilterPeriod = 'week' | 'month' | 'all';
export type FilterCategory = string;

export interface DashboardFilters {
  period: FilterPeriod;
  category: FilterCategory;
}

export const DEFAULT_GOALS: Goal[] = [
  { id: '1', title: 'Logged Effort', targetValue: 40, currentProgress: 0, unit: 'hours' },
  { id: '2', title: 'Effective Meetings', targetValue: 10, currentProgress: 0, unit: 'hours' },
  { id: '3', title: 'Ownership Stories', targetValue: 5, currentProgress: 0, unit: 'stories' },
  { id: '4', title: 'Training Completion', targetValue: 100, currentProgress: 0, unit: '%' },
  { id: '5', title: 'Security Fixes', targetValue: 8, currentProgress: 0, unit: 'stories' },
  { id: '6', title: 'Angular Deep Dives', targetValue: 12, currentProgress: 0, unit: 'hours' },
];
