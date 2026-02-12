import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Settings, Bell, FolderOpen } from 'lucide-react';
import { useDashboardData, GoalSubtask } from '@/hooks/useDashboardData';
import { MetricsCards } from '@/components/dashboard/MetricsCards';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { GoalCards } from '@/components/dashboard/GoalCards';
import { TaskTable } from '@/components/dashboard/TaskTable';
import { TaskModal } from '@/components/dashboard/TaskModal';
import { GoalModal, GoalWithMeta } from '@/components/dashboard/GoalModal';
import { CategoryModal } from '@/components/dashboard/CategoryModal';
import { ProjectModal } from '@/components/dashboard/ProjectModal';
import { DashboardFiltersComponent } from '@/components/dashboard/DashboardFilters';
import { ProjectHeader } from '@/components/dashboard/ProjectHeader';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/dashboard';

const Index = () => {
  const {
    tasks,
    categories,
    projects,
    subtasks,
    targetDate,
    filters,
    setFilters,
    addTask,
    bulkAddTasks,
    updateTask,
    deleteTask,
    saveGoal,
    deleteGoal,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    assignTaskToSubtask,
    unassignTask,
    saveCategory,
    deleteCategory,
    saveProject,
    deleteProject,
    updateTargetDate,
    computeMetrics,
    computeGoalProgress,
    getAlerts,
    isLoaded
  } = useDashboardData();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<GoalWithMeta | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const metrics = computeMetrics();
  const goalsWithProgress = computeGoalProgress();
  const alerts = getAlerts();
  const alertCount = alerts.length;
  
  const periodLabel = filters.period === 'day' ? 'Daily' : filters.period === 'week' ? 'Weekly' : filters.period === 'month' ? 'Monthly' : 'All Time';

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, 'id'> | Task) => {
    if ('id' in taskData) {
      updateTask(taskData.id, taskData);
    } else {
      addTask(taskData);
    }
  };

  const handleToggleComplete = (id: string, completed: boolean) => {
    updateTask(id, { completed });
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setGoalModalOpen(true);
  };

  const handleEditGoal = (goal: GoalWithMeta) => {
    setEditingGoal(goal);
    setGoalModalOpen(true);
  };

  const handleCreateTaskFromSubtask = (subtask: GoalSubtask, goalTitle: string) => {
    setEditingTask(null);
    setTaskModalOpen(true);
    // Pre-fill will happen through the task modal's default values
    // We use a slight delay to let the modal open, then we could pass initial data
    // For simplicity, we open the modal with the subtask name pre-filled
    setTimeout(() => {
      const nameInput = document.querySelector<HTMLInputElement>('#task-name');
      if (nameInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        nativeInputValueSetter?.call(nameInput, subtask.name);
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, 100);
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <ProjectHeader />
          
          <div className="flex items-center gap-3">
            <DashboardFiltersComponent filters={filters} onFiltersChange={setFilters} categories={categories} />
            <Link to="/notifications">
              <Button 
                variant="outline" 
                size="icon"
                title="View Notifications"
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {alertCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button 
              onClick={() => setCategoryModalOpen(true)} 
              variant="outline" 
              size="icon"
              title="Manage Categories"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => setProjectModalOpen(true)} 
              variant="outline" 
              size="icon"
              title="Manage Projects"
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
            <Button onClick={handleAddTask} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Metrics Row */}
        <MetricsCards
          totalHoursFiltered={metrics.totalHoursFiltered}
          aiTimeSavedFiltered={metrics.aiTimeSavedFiltered}
          activeStories={metrics.activeStories}
          daysUntilTarget={metrics.daysUntilTarget}
          periodLabel={periodLabel}
          targetDate={targetDate}
          onTargetDateChange={updateTargetDate}
        />

        {/* Goal Cards */}
        <GoalCards 
          goals={goalsWithProgress}
          subtasks={subtasks}
          tasks={tasks}
          onEditGoal={handleEditGoal}
          onAddGoal={handleAddGoal}
          onAddSubtask={addSubtask}
          onUpdateSubtask={updateSubtask}
          onDeleteSubtask={deleteSubtask}
          onCreateTaskFromSubtask={handleCreateTaskFromSubtask}
          onAssignTask={assignTaskToSubtask}
          onUnassignTask={unassignTask}
        />

        {/* Charts - now using filtered tasks */}
        <DashboardCharts tasks={metrics.filteredTasks} />

        {/* Task Table */}
        <TaskTable
          tasks={metrics.filteredTasks}
          onEdit={handleEditTask}
          onDelete={deleteTask}
          onToggleComplete={handleToggleComplete}
          onImport={bulkAddTasks}
        />

        {/* Task Modal */}
        <TaskModal
          open={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          onSave={handleSaveTask}
          task={editingTask}
          categories={categories}
          projects={projects}
        />

        {/* Goal Modal */}
        <GoalModal
          open={goalModalOpen}
          onClose={() => setGoalModalOpen(false)}
          onSave={saveGoal}
          onDelete={deleteGoal}
          goal={editingGoal}
          categories={categories}
        />

        {/* Category Modal */}
        <CategoryModal
          open={categoryModalOpen}
          onClose={() => setCategoryModalOpen(false)}
          categories={categories}
          onSaveCategory={saveCategory}
          onDeleteCategory={deleteCategory}
        />

        {/* Project Modal */}
        <ProjectModal
          open={projectModalOpen}
          onClose={() => setProjectModalOpen(false)}
          projects={projects}
          onSaveProject={saveProject}
          onDeleteProject={deleteProject}
        />
      </div>
    </div>
  );
};

export default Index;
