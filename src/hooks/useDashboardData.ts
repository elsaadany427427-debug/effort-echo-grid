import { useState, useEffect, useCallback } from 'react';
import { Task, DashboardFilters } from '@/types/dashboard';
import { GoalWithMeta } from '@/components/dashboard/GoalModal';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO, format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useDashboardData() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<GoalWithMeta[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({ period: 'week', category: 'all' });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from Supabase
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Fetch tasks
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        // Fetch goals
        const { data: goalsData } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id);

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id);

        if (tasksData) {
          setTasks(tasksData.map(t => ({
            id: t.id,
            name: t.name,
            date: t.date,
            category: t.category,
            hours: Number(t.hours),
            aiUsed: t.ai_used,
            ownership: t.ownership,
            outcome: t.outcome,
            completed: t.completed
          })));
        }

        if (goalsData) {
          setGoals(goalsData.map(g => ({
            id: g.id,
            title: g.title,
            targetValue: Number(g.target_value),
            currentProgress: 0,
            unit: g.unit as 'hours' | 'stories' | '%',
            description: g.description || '',
            linkedCategory: g.linked_category || 'all'
          })));
        }

        if (categoriesData) {
          setCategories(categoriesData.map(c => c.name));
        }

        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error loading data',
          description: 'Please refresh the page to try again.',
          variant: 'destructive'
        });
      }
    };

    loadData();
  }, [user, toast]);

  // Filter tasks by period and category
  const getFilteredTasks = useCallback(() => {
    const now = new Date();
    
    return tasks.filter(task => {
      const taskDate = parseISO(task.date);
      
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
      
      const inCategory = filters.category === 'all' || task.category === filters.category;
      
      return inPeriod && inCategory;
    });
  }, [tasks, filters]);

  // CRUD Operations
  const addTask = useCallback(async (task: Omit<Task, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        name: task.name,
        date: task.date,
        category: task.category,
        hours: task.hours,
        ai_used: task.aiUsed,
        ownership: task.ownership,
        outcome: task.outcome,
        completed: task.completed
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding task', variant: 'destructive' });
      return;
    }

    if (data) {
      setTasks(prev => [{
        id: data.id,
        name: data.name,
        date: data.date,
        category: data.category,
        hours: Number(data.hours),
        aiUsed: data.ai_used,
        ownership: data.ownership,
        outcome: data.outcome,
        completed: data.completed
      }, ...prev]);
    }
  }, [user, toast]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.hours !== undefined) dbUpdates.hours = updates.hours;
    if (updates.aiUsed !== undefined) dbUpdates.ai_used = updates.aiUsed;
    if (updates.ownership !== undefined) dbUpdates.ownership = updates.ownership;
    if (updates.outcome !== undefined) dbUpdates.outcome = updates.outcome;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error updating task', variant: 'destructive' });
      return;
    }

    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, [toast]);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting task', variant: 'destructive' });
      return;
    }

    setTasks(prev => prev.filter(task => task.id !== id));
  }, [toast]);

  // Goal CRUD
  const saveGoal = useCallback(async (goal: GoalWithMeta) => {
    if (!user) return;

    const exists = goals.find(g => g.id === goal.id);
    
    if (exists) {
      const { error } = await supabase
        .from('goals')
        .update({
          title: goal.title,
          target_value: goal.targetValue,
          unit: goal.unit,
          description: goal.description,
          linked_category: goal.linkedCategory
        })
        .eq('id', goal.id);

      if (error) {
        toast({ title: 'Error updating goal', variant: 'destructive' });
        return;
      }

      setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
    } else {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          title: goal.title,
          target_value: goal.targetValue,
          unit: goal.unit,
          description: goal.description,
          linked_category: goal.linkedCategory
        })
        .select()
        .single();

      if (error) {
        toast({ title: 'Error adding goal', variant: 'destructive' });
        return;
      }

      if (data) {
        setGoals(prev => [...prev, {
          id: data.id,
          title: data.title,
          targetValue: Number(data.target_value),
          currentProgress: 0,
          unit: data.unit as 'hours' | 'stories' | '%',
          description: data.description || '',
          linkedCategory: data.linked_category || 'all'
        }]);
      }
    }
  }, [user, goals, toast]);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting goal', variant: 'destructive' });
      return;
    }

    setGoals(prev => prev.filter(goal => goal.id !== id));
  }, [toast]);

  // Category CRUD
  const saveCategory = useCallback(async (oldName: string | null, newName: string) => {
    if (!user) return;

    if (oldName) {
      // Find category ID and update
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', oldName)
        .maybeSingle();

      if (catData) {
        await supabase
          .from('categories')
          .update({ name: newName })
          .eq('id', catData.id);

        // Update tasks with old category name
        await supabase
          .from('tasks')
          .update({ category: newName })
          .eq('user_id', user.id)
          .eq('category', oldName);

        setCategories(prev => prev.map(cat => cat === oldName ? newName : cat));
        setTasks(prev => prev.map(task => 
          task.category === oldName ? { ...task, category: newName } : task
        ));
      }
    } else {
      const { data, error } = await supabase
        .from('categories')
        .insert({ user_id: user.id, name: newName })
        .select()
        .single();

      if (!error && data) {
        setCategories(prev => [...prev, newName]);
      }
    }
  }, [user]);

  const deleteCategory = useCallback(async (name: string) => {
    if (!user) return;

    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .maybeSingle();

    if (catData) {
      await supabase
        .from('categories')
        .delete()
        .eq('id', catData.id);

      setCategories(prev => prev.filter(cat => cat !== name));
    }
  }, [user]);

  // Computed metrics
  const computeMetrics = useCallback(() => {
    const filtered = getFilteredTasks();
    
    const totalHoursFiltered = filtered.reduce((sum, t) => sum + t.hours, 0);
    const aiTimeSavedFiltered = filtered.filter(t => t.aiUsed).reduce((sum, t) => sum + t.hours * 0.3, 0);
    const activeStories = tasks.filter(t => t.ownership && !t.completed).length;
    
    const targetDate = new Date('2026-06-01');
    const daysUntilTarget = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalHoursFiltered,
      aiTimeSavedFiltered,
      activeStories,
      daysUntilTarget,
      filteredTasks: filtered,
      allTasks: tasks
    };
  }, [tasks, getFilteredTasks]);

  // Compute goal progress
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
    categories,
    filters,
    setFilters,
    addTask,
    updateTask,
    deleteTask,
    saveGoal,
    deleteGoal,
    saveCategory,
    deleteCategory,
    computeMetrics,
    computeGoalProgress,
    getAlerts,
    getFilteredTasks,
    isLoaded
  };
}
