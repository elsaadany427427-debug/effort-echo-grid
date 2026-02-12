

# Plan: Assign Existing Tasks to Subtasks

## Problem
Subtasks and tasks are completely disconnected in the database. You can only create a *new* task from a subtask, but cannot link an existing task to one.

## Solution
Add a `subtask_id` foreign key on the `tasks` table so any task can optionally be linked to a subtask. Then add UI to assign/unassign existing tasks from subtask rows.

---

## Changes

### 1. Database Migration
- Add `subtask_id` (uuid, nullable) column to the `tasks` table
- This allows any task to optionally reference a subtask

### 2. Update Types and Hook
- Add `subtaskId` to the `Task` type in `src/types/dashboard.ts`
- Update `useDashboardData.ts` to read/write `subtask_id` in all task CRUD operations
- Add an `assignTaskToSubtask(taskId, subtaskId)` helper function

### 3. Update Subtask UI (`GoalCards.tsx`)
- Add a "Link task" button (chain/link icon) on each subtask row (next to the existing +, pencil, trash icons)
- Clicking it opens a small popover/dropdown listing unassigned tasks for the user to pick from
- Once assigned, show the linked task name beneath the subtask with an "unlink" option
- The existing "+" (create task) button stays as-is for creating new tasks

### 4. Visual Indicator
- Show a small badge or linked task name under each subtask that has an assigned task
- Allow unlinking by clicking an "x" next to the linked task name

---

## File Changes Summary

| Action | File | What |
|--------|------|------|
| Migration | SQL | Add `subtask_id` uuid nullable column to `tasks` |
| Modify | `src/types/dashboard.ts` | Add `subtaskId?: string` to Task |
| Modify | `src/hooks/useDashboardData.ts` | Handle subtask_id in CRUD, add assign/unassign helpers |
| Modify | `src/components/dashboard/GoalCards.tsx` | Add link-task popover and linked-task display on subtasks |

