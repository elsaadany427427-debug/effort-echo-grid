import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  categories: string[];
  onSaveCategory: (oldName: string | null, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}

export function CategoryModal({ 
  open, 
  onClose, 
  categories, 
  onSaveCategory, 
  onDeleteCategory 
}: CategoryModalProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEditingCategory(null);
      setNewCategoryName('');
      setIsAdding(false);
    }
  }, [open]);

  const handleSave = () => {
    if (newCategoryName.trim()) {
      onSaveCategory(editingCategory, newCategoryName.trim());
      setEditingCategory(null);
      setNewCategoryName('');
      setIsAdding(false);
    }
  };

  const handleEdit = (category: string) => {
    setEditingCategory(category);
    setNewCategoryName(category);
    setIsAdding(false);
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingCategory(null);
    setNewCategoryName('');
  };

  const handleDeleteClick = (category: string) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setNewCategoryName('');
    setIsAdding(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-card border-border sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              Manage Categories
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {categories.map((category) => (
              <div 
                key={category} 
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
              >
                {editingCategory === category ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
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
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 hover:bg-primary/10"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                        onClick={() => handleDeleteClick(category)}
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
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name..."
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
              Add Category
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
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete}"? Tasks using this category will keep their current category assignment.
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
