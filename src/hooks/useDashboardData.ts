import { useState, useEffect, useCallback } from 'react';
import { Task, Goal, DEFAULT_GOALS, DashboardFilters } from '@/types/dashboard';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';

const TASKS_KEY = 'dashboard_tasks';
const GOALS_KEY = 'dashboard_goals';

export function useDashboardData() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
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

  const updateGoal = useCallback((id: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, ...updates } : goal
    ));
  }, []);

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
  const computeGoalProgress = useCallback(() => {
    const weeklyTasks = tasks.filter(task => {
      const now = new Date();
      const taskDate = parseISO(task.date);
      return isWithinInterval(taskDate, {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 })
      });
    });

    const completedTasks = weeklyTasks.filter(t => t.completed);
    
    return goals.map(goal => {
      let currentProgress = 0;
      
      switch (goal.title) {
        case 'Logged Effort':
          currentProgress = weeklyTasks.reduce((sum, t) => sum + t.hours, 0);
          break;
        case 'Effective Meetings':
          currentProgress = weeklyTasks.filter(t => t.category === 'Meetings').reduce((sum, t) => sum + t.hours, 0);
          break;
        case 'Ownership Stories':
          currentProgress = completedTasks.filter(t => t.ownership).length;
          break;
        case 'Training Completion':
          const trainingHours = weeklyTasks.filter(t => t.category === 'Training').reduce((sum, t) => sum + t.hours, 0);
          currentProgress = Math.min(100, (trainingHours / 10) * 100);
          break;
        case 'Security Fixes':
          currentProgress = completedTasks.filter(t => t.category === 'Security').length;
          break;
        case 'Angular Deep Dives':
          currentProgress = weeklyTasks.filter(t => t.category === 'Angular').reduce((sum, t) => sum + t.hours, 0);
          break;
        default:
          currentProgress = goal.currentProgress;
      }
      
      return { ...goal, currentProgress };
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
    updateGoal,
    computeMetrics,
    computeGoalProgress,
    getAlerts,
    getFilteredTasks,
    isLoaded
  };
}
