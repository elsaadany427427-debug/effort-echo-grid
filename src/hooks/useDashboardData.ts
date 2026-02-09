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
  const [projects, setProjects] = useState<string[]>([]);
  const [targetDate, setTargetDateState] = useState<string>('2026-06-01');
  const [filters, setFilters] = useState<DashboardFilters>({ period: 'week', category: 'all' });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from Supabase
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [tasksRes, goalsRes, categoriesRes, projectsRes, profileRes] = await Promise.all([
          supabase.from('tasks').select('*').eq('user_id', user.id).order('date', { ascending: false }),
          supabase.from('goals').select('*').eq('user_id', user.id),
          supabase.from('categories').select('*').eq('user_id', user.id),
          supabase.from('projects').select('*').eq('user_id', user.id),
          supabase.from('profiles').select('target_date').eq('id', user.id).single(),
        ]);

        if (tasksRes.data) {
          setTasks(tasksRes.data.map(t => ({
            id: t.id,
            name: t.name,
            date: t.date,
            category: t.category,
            hours: Number(t.hours),
            aiUsed: t.ai_used,
            ownership: t.ownership,
            outcome: t.outcome,
            completed: t.completed,
            projectName: (t as any).project_name || '',
          })));
        }

        if (goalsRes.data) {
          setGoals(goalsRes.data.map(g => ({
            id: g.id,
            title: g.title,
            targetValue: Number(g.target_value),
            currentProgress: 0,
            unit: g.unit as 'hours' | 'stories' | '%',
            description: g.description || '',
            linkedCategory: g.linked_category || 'all'
          })));
        }

        if (categoriesRes.data) {
          setCategories(categoriesRes.data.map(c => c.name));
        }

        if (projectsRes.data) {
          setProjects(projectsRes.data.map((p: any) => p.name));
        }

        if (profileRes.data) {
          setTargetDateState((profileRes.data as any).target_date || '2026-06-01');
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

  // Filter tasks
  const getFilteredTasks = useCallback(() => {
    const now = new Date();
    
    return tasks.filter(task => {
      const taskDate = parseISO(task.date);
      
      let inPeriod = true;
      if (filters.period === 'day') {
        const selected = filters.selectedDate || format(now, 'yyyy-MM-dd');
        inPeriod = task.date === selected;
      } else if (filters.period === 'week') {
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
        completed: task.completed,
        project_name: task.projectName,
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
        completed: data.completed,
        projectName: (data as any).project_name || '',
      }, ...prev]);
    }
  }, [user, toast]);

  const bulkAddTasks = useCallback(async (tasksToAdd: Omit<Task, 'id'>[]) => {
    if (!user) return 0;

    const rows = tasksToAdd.map(t => ({
      user_id: user.id,
      name: t.name,
      date: t.date,
      category: t.category,
      hours: t.hours,
      ai_used: t.aiUsed,
      ownership: t.ownership,
      outcome: t.outcome,
      completed: t.completed,
      project_name: t.projectName,
    }));

    const { data, error } = await supabase.from('tasks').insert(rows).select();

    if (error) {
      toast({ title: 'Error importing tasks', variant: 'destructive' });
      return 0;
    }

    if (data) {
      const newTasks: Task[] = data.map(d => ({
        id: d.id,
        name: d.name,
        date: d.date,
        category: d.category,
        hours: Number(d.hours),
        aiUsed: d.ai_used,
        ownership: d.ownership,
        outcome: d.outcome,
        completed: d.completed,
        projectName: (d as any).project_name || '',
      }));
      setTasks(prev => [...newTasks, ...prev]);
      return newTasks.length;
    }
    return 0;
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
    if (updates.projectName !== undefined) dbUpdates.project_name = updates.projectName;

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);

    if (error) {
      toast({ title: 'Error updating task', variant: 'destructive' });
      return;
    }

    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, [toast]);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);

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
    const { error } = await supabase.from('goals').delete().eq('id', id);

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
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', oldName)
        .maybeSingle();

      if (catData) {
        await supabase.from('categories').update({ name: newName }).eq('id', catData.id);
        await supabase.from('tasks').update({ category: newName }).eq('user_id', user.id).eq('category', oldName);

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
      await supabase.from('categories').delete().eq('id', catData.id);
      setCategories(prev => prev.filter(cat => cat !== name));
    }
  }, [user]);

  // Project CRUD
  const saveProject = useCallback(async (oldName: string | null, newName: string) => {
    if (!user) return;

    if (oldName) {
      const { data: projData } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', oldName)
        .maybeSingle();

      if (projData) {
        await supabase.from('projects').update({ name: newName }).eq('id', (projData as any).id);
        await supabase.from('tasks').update({ project_name: newName }).eq('user_id', user.id).eq('project_name', oldName);
        setProjects(prev => prev.map(p => p === oldName ? newName : p));
        setTasks(prev => prev.map(t => t.projectName === oldName ? { ...t, projectName: newName } : t));
      }
    } else {
      const { data, error } = await supabase
        .from('projects')
        .insert({ user_id: user.id, name: newName })
        .select()
        .single();

      if (!error && data) {
        setProjects(prev => [...prev, newName]);
      }
    }
  }, [user]);

  const deleteProject = useCallback(async (name: string) => {
    if (!user) return;

    const { data: projData } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name)
      .maybeSingle();

    if (projData) {
      await supabase.from('projects').delete().eq('id', (projData as any).id);
      setProjects(prev => prev.filter(p => p !== name));
    }
  }, [user]);

  // Update target date
  const updateTargetDate = useCallback(async (date: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ target_date: date } as any)
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Error updating target date', variant: 'destructive' });
      return;
    }

    setTargetDateState(date);
  }, [user, toast]);

  // Computed metrics
  const computeMetrics = useCallback(() => {
    const filtered = getFilteredTasks();
    
    const totalHoursFiltered = filtered.reduce((sum, t) => sum + t.hours, 0);
    const aiTimeSavedFiltered = filtered.filter(t => t.aiUsed).reduce((sum, t) => sum + t.hours * 0.3, 0);
    const activeStories = tasks.filter(t => t.ownership && !t.completed).length;
    
    const target = new Date(targetDate);
    const daysUntilTarget = Math.ceil((target.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

    return {
      totalHoursFiltered,
      aiTimeSavedFiltered,
      activeStories,
      daysUntilTarget,
      filteredTasks: filtered,
      allTasks: tasks
    };
  }, [tasks, getFilteredTasks, targetDate]);

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
    projects,
    targetDate,
    filters,
    setFilters,
    addTask,
    bulkAddTasks,
    updateTask,
    deleteTask,
    saveGoal,
    deleteGoal,
    saveCategory,
    deleteCategory,
    saveProject,
    deleteProject,
    updateTargetDate,
    computeMetrics,
    computeGoalProgress,
    getAlerts,
    getFilteredTasks,
    isLoaded
  };
}
