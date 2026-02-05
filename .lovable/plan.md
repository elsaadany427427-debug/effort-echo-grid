
# Plan: Database, Authentication, Pagination & Project Name

## Overview
This plan adds your two new requirements (project name + task pagination) to the previously approved database/auth implementation.

---

## Phase 1: Enable Supabase Backend

### 1.1 Initialize Lovable Cloud
- Enable Supabase integration for managed PostgreSQL database
- Auto-generates type-safe client

---

## Phase 2: Database Schema

### 2.1 Database Tables

| Table | Key Columns |
|-------|-------------|
| **profiles** | id, username, display_name, avatar_url, created_at |
| **tasks** | id, user_id, name, date, category, hours, ai_used, ownership, outcome, completed |
| **goals** | id, user_id, title, target_value, unit, description, linked_category |
| **categories** | id, user_id, name |

### 2.2 Row Level Security
- Enable RLS on all tables
- Policy: `user_id = auth.uid()` for all operations

---

## Phase 3: Authentication

### 3.1 Auth Page (`/auth`)
- Login form (email + password)
- Signup form (email + password + display name)
- Form validation with zod
- Auto-redirect to dashboard when logged in

### 3.2 Protected Routes
- `AuthProvider` context for session management
- Redirect unauthenticated users to `/auth`
- Add user avatar + logout button to dashboard header

### 3.3 Profile Trigger
- Database function to auto-create profile on signup

---

## Phase 4: Project Name

### 4.1 Update Header
Modify dashboard header to display a customizable project name:

```text
+------------------------------------------+
|  [Logo] Goal Tracker                     |
|  "Project: Performance Review 2026"      |
+------------------------------------------+
```

### 4.2 Implementation
- Store project name in `profiles` table (new column: `project_name`)
- Allow editing via a small settings dropdown in the header
- Default: "My Goals Dashboard"

---

## Phase 5: Task Table Pagination

### 5.1 Pagination Component
Add pagination controls below the task table:

```text
+---------------------------------------+
|  Task Log              [Search...]    |
+---------------------------------------+
| Done | Task | Category | Hours | ...  |
|------|------|----------|-------|------|
| ...  | ...  | ...      | ...   | ...  |
+---------------------------------------+
| Showing 1-10 of 45 tasks              |
| [<] [1] [2] [3] [4] [5] [>]           |
+---------------------------------------+
```

### 5.2 Implementation Details
- Default: 10 tasks per page
- Page size selector: 10, 25, 50 tasks
- Pagination state managed locally in component
- Works with search filter (paginate filtered results)
- Shows "Showing X-Y of Z tasks" info

---

## Phase 6: Data Migration

### 6.1 Update `useDashboardData` Hook
- Replace localStorage with Supabase queries
- Use React Query for caching
- Maintain same component API (minimal UI changes)

---

## Phase 7: Documentation

### 7.1 Create `DOCUMENTATION.md`
Comprehensive guide covering:
1. Project Overview & Tech Stack
2. Features (auth, tasks, goals, categories, charts)
3. Data Models with field descriptions
4. Getting Started guide
5. Architecture diagram
6. Developer setup instructions

---

## File Changes Summary

| Action | File |
|--------|------|
| Create | `src/pages/Auth.tsx` |
| Create | `src/contexts/AuthContext.tsx` |
| Create | `src/components/auth/LoginForm.tsx` |
| Create | `src/components/auth/SignupForm.tsx` |
| Create | `DOCUMENTATION.md` |
| Modify | `src/App.tsx` - add auth route, AuthProvider |
| Modify | `src/pages/Index.tsx` - add project name display, user info, logout |
| Modify | `src/components/dashboard/TaskTable.tsx` - add pagination |
| Modify | `src/hooks/useDashboardData.ts` - Supabase queries |
| SQL | Migration for tables, RLS, triggers, project_name column |

---

## Technical Notes

### Pagination Logic
```
totalPages = Math.ceil(filteredTasks.length / pageSize)
startIndex = (currentPage - 1) * pageSize
displayedTasks = filteredTasks.slice(startIndex, startIndex + pageSize)
```

### Project Name
- Stored per-user in `profiles.project_name`
- Editable via inline edit or dropdown menu
- Displays prominently in header subtitle
