import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  projects: string[];
  onSaveProject: (oldName: string | null, newName: string) => void;
  onDeleteProject: (name: string) => void;
}

export function ProjectModal({ open, onClose, projects, onSaveProject, onDeleteProject }: ProjectModalProps) {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEditingProject(null);
      setNewProjectName('');
      setIsAdding(false);
    }
  }, [open]);

  const handleSave = () => {
    if (newProjectName.trim()) {
      onSaveProject(editingProject, newProjectName.trim());
      setEditingProject(null);
      setNewProjectName('');
      setIsAdding(false);
    }
  };

  const handleEdit = (project: string) => {
    setEditingProject(project);
    setNewProjectName(project);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingProject(null);
    setNewProjectName('');
  };

  const handleDeleteClick = (project: string) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      onDeleteProject(projectToDelete);
      setProjectToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleCancel = () => {
    setEditingProject(null);
    setNewProjectName('');
    setIsAdding(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-primary" />
              Manage Projects
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
              >
                {editingProject === project ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="bg-background border-border flex-1"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                        if (e.key === 'Escape') handleCancel();
                      }}
                    />
                    <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90">
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <>
                    <span className="font-medium">{project}</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={() => handleEdit(project)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                        onClick={() => handleDeleteClick(project)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {isAdding && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-primary/50">
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name..."
                  className="bg-background border-border flex-1"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
                <Button size="sm" onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  Add
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button onClick={handleAdd} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete}"? Tasks using this project will keep their current project assignment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
