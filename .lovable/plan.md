

# Plan: All Requested Features + Recommendations

## Overview
This plan covers all 4 user-requested features plus the recommended improvements discovered during code review.

---

## Part A: User-Requested Features

### 1. Filter by Day
Add a "Day" option to the period filter with a date picker.

- Add `day` to `FilterPeriod` type and `selectedDate` to `DashboardFilters` in `src/types/dashboard.ts`
- Update `DashboardFilters.tsx` to show a date picker (using Shadcn Calendar/Popover) when "Day" is selected
- Update `getFilteredTasks()` in `useDashboardData.ts` to filter by exact date match
- MetricsCards label updates to show "Daily" when day filter is active

### 2. Project Name Field on Tasks
Add a project selector to each task (like category dropdown).

**Database migration:**
- Add `project_name` column (text, default '') to `tasks` table
- Create `projects` table (id, user_id, name, created_at) with full RLS
- Seed default projects ("Default") via the `handle_new_user` trigger

**Code changes:**
- Add `projectName` to `Task` type
- Update `TaskModal.tsx` with a project name dropdown + ability to type new project names
- Add "Project" column to `TaskTable.tsx`
- Update `useDashboardData.ts` to handle project_name in CRUD and expose projects list
- Add project CRUD functions (save/delete) similar to categories
- Pass projects to Index.tsx for modal usage

### 3. Copy / Paste (Export & Import) Tasks
Add two buttons to the task table toolbar.

- **Copy button**: Serializes all currently filtered/visible tasks as JSON to clipboard (excludes internal IDs so re-import creates fresh records)
- **Import button**: Opens a dialog with a textarea. User pastes JSON, validates structure, then bulk-inserts as new tasks
- Add `bulkAddTasks` function to `useDashboardData.ts` that inserts multiple tasks in one Supabase call
- Show toast notifications for success/error with count of imported tasks

### 4. Editable "Days to Goal" Target Date
Make the hardcoded June 2026 target date user-configurable.

**Database migration:**
- Add `target_date` column (date, default '2026-06-01') to `profiles` table

**Code changes:**
- Load `targetDate` from profile in `useDashboardData.ts`
- Update `MetricsCards.tsx`: add a clickable edit icon on "Days to Goal" card that opens a date picker popover
- Save updated target date to profiles table
- Update `Notifications.tsx` to use the stored target date instead of hardcoded value

---

## Part B: Recommended Improvements

### 5. Fix Charts to Respect Filters
Currently `DashboardCharts` receives `tasks` (all tasks) instead of filtered tasks.

- Update `Index.tsx` to pass `metrics.filteredTasks` instead of `tasks` to `DashboardCharts`
- Charts will then reflect the active period/category/day filter

### 6. Task Table Column Sorting
Add clickable column headers to sort the task table.

- Add `sortColumn` and `sortDirection` state to `TaskTable.tsx`
- Clicking a column header toggles ascending/descending sort
- Show sort direction arrows on active column header
- Sortable columns: Task name, Category, Hours, Date

### 7. CSV Export Button
Add a "Download CSV" button next to the Copy/Import buttons.

- Serialize filtered tasks to CSV format (comma-separated with headers)
- Trigger browser download of the CSV file
- Useful for sharing data with managers or importing into spreadsheets

### 8. Empty/Loading States for Charts
Add visual feedback when charts have no data.

- Show "No data for selected period" message when filtered tasks are empty
- Prevents showing blank/broken charts

---

## Database Migrations

```text
Migration 1: Add project support and target date
  - ALTER TABLE tasks ADD COLUMN project_name text NOT NULL DEFAULT '';
  - CREATE TABLE projects (id uuid PK, user_id uuid NOT NULL, name text NOT NULL, created_at timestamptz);
  - RLS on projects (same pattern as categories)
  - ALTER TABLE profiles ADD COLUMN target_date date DEFAULT '2026-06-01';
  - Update handle_new_user trigger to seed a default project
```

---

## File Changes Summary

| Action | File | What |
|--------|------|------|
| Migration | SQL | projects table, tasks.project_name, profiles.target_date |
| Modify | `src/types/dashboard.ts` | Add projectName to Task, day to FilterPeriod, selectedDate to DashboardFilters |
| Modify | `src/components/dashboard/DashboardFilters.tsx` | Add "Day" option + date picker |
| Modify | `src/components/dashboard/TaskModal.tsx` | Add project name dropdown |
| Modify | `src/components/dashboard/TaskTable.tsx` | Project column, copy/import buttons, column sorting, CSV export |
| Modify | `src/components/dashboard/MetricsCards.tsx` | Editable target date on Days to Goal card |
| Modify | `src/components/dashboard/DashboardCharts.tsx` | Empty state handling |
| Modify | `src/hooks/useDashboardData.ts` | Day filter, project_name CRUD, bulk insert, target date, projects state |
| Modify | `src/pages/Index.tsx` | Pass filtered tasks to charts, wire up projects, pass target date |
| Modify | `src/pages/Notifications.tsx` | Use stored target date |

