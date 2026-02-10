
# Plan: Add Project Management Modal (like Categories)

Create a "Manage Projects" modal identical to the existing CategoryModal, allowing users to add, edit, and delete projects. Wire it into the dashboard with a dedicated button.

## Changes

### 1. Create `src/components/dashboard/ProjectModal.tsx`
- Clone the `CategoryModal` component, replacing "Category" with "Project" throughout
- Same props pattern: `projects: string[]`, `onSaveProject`, `onDeleteProject`
- Same UI: list of projects with edit/delete buttons, inline editing, add button, delete confirmation dialog
- Use `FolderOpen` icon instead of `Tag`

### 2. Update `src/pages/Index.tsx`
- Import `ProjectModal`
- Add `projectModalOpen` state
- Add a new Settings-style button (e.g., `FolderOpen` icon) next to the existing Categories settings button
- Render `ProjectModal` with `projects`, `saveProject`, and `deleteProject` from `useDashboardData`

### 3. No backend changes needed
- `saveProject` and `deleteProject` functions already exist in `useDashboardData.ts`
- The `projects` table with RLS is already in place
- These functions are already returned from the hook but not wired up in `Index.tsx`

## Summary
| Action | File | What |
|--------|------|------|
| Create | `src/components/dashboard/ProjectModal.tsx` | New modal component mirroring CategoryModal |
| Modify | `src/pages/Index.tsx` | Add project modal state, button, and render |
