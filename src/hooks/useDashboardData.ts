import { useState, useEffect, useCallback } from 'react';
import { Task, Goal, DashboardFilters, TaskCategory } from '@/types/dashboard';
import { GoalWithMeta } from '@/components/dashboard/GoalModal';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const TASKS_KEY = 'dashboard_tasks';
const GOALS_KEY = 'dashboard_goals_v2';

const DEFAULT_GOALS: GoalWithMeta[] = [
  { id: '1', title: 'Logged Effort', targetValue: 880, currentProgress: 0, unit: 'hours', description: '800-960 hours by 06-2026', linkedCategory: 'all' },
  { id: '2', title: 'Effective Meetings', targetValue: 48, currentProgress: 0, unit: 'stories', description: 'Prepared meetings with follow-ups', linkedCategory: 'Meetings' },
  { id: '3', title: 'Ownership Stories', targetValue: 5, currentProgress: 0, unit: 'stories', description: 'At least 5 stories owned', linkedCategory: 'ownership' },
  { id: '4', title: 'AI Usage', targetValue: 100, currentProgress: 0, unit: 'stories', description: 'Tasks completed with AI assistance', linkedCategory: 'ai' },
  { id: '5', title: 'Certificate / Training', targetValue: 100, currentProgress: 0, unit: '%', description: 'Course completion progress', linkedCategory: 'Training' },
  { id: '6', title: 'Personal Skills', targetValue: 100, currentProgress: 0, unit: '%', description: 'Soft skills, documentation, communication', linkedCategory: 'Skills' },
  { id: '7', title: 'Security Improvements', targetValue: 24, currentProgress: 0, unit: 'stories', description: 'NPM audit fixes and enhancements', linkedCategory: 'Security' },
  { id: '8', title: 'Angular Contributions', targetValue: 20, currentProgress: 0, unit: 'stories', description: 'Refactorings and deep dives', linkedCategory: 'Angular' },
];

export function useDashboardData() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<GoalWithMeta[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({ period: 'week', category: 'all' });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem(TASKS_KEY);
    const savedGoals = localStorage.getItem(GOALS_KEY);
    
    setTasks(savedTasks ? JSON.parse(savedTasks) : []);
    setGoals(savedGoals ? JSON.parse(savedGoals) : DEFAULT_GOALS);
    setIsLoaded(true);
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    }
  }, [tasks, isLoaded]);

  // Save goals to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
    }
  }, [goals, isLoaded]);

  // Filter tasks by period and category
  const getFilteredTasks = useCallback(() => {
    const now = new Date();
    
    return tasks.filter(task => {
      const taskDate = parseISO(task.date);
      
      // Period filter
      let inPeriod = true;
      if (filters.period === 'week') {
        inPeriod = isWithinInterval(taskDate, {
          start: startOfWeek(now, { weekStartsOn: 1 }),
          end: endOfWeek(now, { weekStartsOn: 1 })
        });
      } else if (filters.period === 'month') {
        inPeriod = isWithinInterval(taskDate, {
          start: startOfMonth(now),
          end: endOfMonth(now)
        });
      }
      
      // Category filter
      const inCategory = filters.category === 'all' || task.category === filters.category;
      
      return inPeriod && inCategory;
    });
  }, [tasks, filters]);

  // CRUD Operations
  const addTask = useCallback((task: Omit<Task, 'id'>) => {
    const newTask: Task = { ...task, id: crypto.randomUUID() };
    setTasks(prev => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  // Goal CRUD
  const addGoal = useCallback((goal: GoalWithMeta) => {
    setGoals(prev => [...prev, goal]);
  }, []);

  const updateGoal = useCallback((id: string, updates: Partial<GoalWithMeta>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  }, []);

  const deleteGoal = useCallback((id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  }, []);

  const saveGoal = useCallback((goal: GoalWithMeta) => {
    const exists = goals.find(g => g.id === goal.id);
    if (exists) {
      updateGoal(goal.id, goal);
    } else {
      addGoal(goal);
    }
  }, [goals, addGoal, updateGoal]);

  // Computed metrics
  const computeMetrics = useCallback(() => {
    const filtered = getFilteredTasks();
    const weeklyTasks = tasks.filter(task => {
      const now = new Date();
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 })
      });
    });

    const totalHoursWeekly = weeklyTasks.reduce((sum, t) => sum + t.hours, 0);
    const aiTimeSaved = weeklyTasks.filter(t => t.aiUsed).reduce((sum, t) => sum + t.hours * 0.3, 0);
    const activeStories = tasks.filter(t => t.ownership && !t.completed).length;
    
    // Days until June 2026
    const targetDate = new Date('2026-06-01');
    const daysUntilTarget = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalHoursWeekly,
      aiTimeSaved,
      activeStories,
      daysUntilTarget,
      filteredTasks: filtered,
      allTasks: tasks
    };
  }, [tasks, getFilteredTasks]);

  // Compute goal progress from tasks
  const computeGoalProgress = useCallback((): GoalWithMeta[] => {
    return goals.map(goal => {
      let currentProgress = 0;
      const completedTasks = tasks.filter(t => t.completed);
      
      switch (goal.linkedCategory) {
        case 'all':
          currentProgress = tasks.reduce((sum, t) => sum + t.hours, 0);
          break;
        case 'ownership':
          currentProgress = completedTasks.filter(t => t.ownership).length;
          break;
        case 'ai':
          currentProgress = completedTasks.filter(t => t.aiUsed).length;
          break;
        default:
          // Category-based
          if (goal.linkedCategory) {
            const categoryTasks = tasks.filter(t => t.category === goal.linkedCategory);
            if (goal.unit === '%') {
              const categoryHours = categoryTasks.reduce((sum, t) => sum + t.hours, 0);
              currentProgress = Math.min(100, Math.round((categoryHours / 10) * 100));
            } else if (goal.unit === 'hours') {
              currentProgress = categoryTasks.reduce((sum, t) => sum + t.hours, 0);
            } else {
              currentProgress = categoryTasks.filter(t => t.completed).length;
            }
          }
          break;
      }
      
      return { ...goal, currentProgress: Math.round(currentProgress * 10) / 10 };
    });
  }, [tasks, goals]);

  // Alerts
  const getAlerts = useCallback(() => {
    const alerts: string[] = [];
    const weeklyTasks = tasks.filter(task => {
      const now = new Date();
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 })
      });
    });
    
    const totalHours = weeklyTasks.reduce((sum, t) => sum + t.hours, 0);
    
    if (totalHours < 25) {
      alerts.push(`Weekly hours (${totalHours.toFixed(1)}h) are below target minimum of 25h`);
    }
    
    const ownershipTasks = weeklyTasks.filter(t => t.ownership);
    if (ownershipTasks.length === 0) {
      alerts.push('No ownership tasks logged this week');
    }
    
    return alerts;
  }, [tasks]);

  return {
    tasks,
    goals,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    saveGoal,
    deleteGoal,
    computeMetrics,
    computeGoalProgress,
    getAlerts,
    getFilteredTasks,
    isLoaded
  };
}
