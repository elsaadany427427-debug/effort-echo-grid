 # Goal Tracker - Documentation
 
 ## 1. Project Overview
 
 **Goal Tracker** is a personal performance dashboard designed for software engineers to track their work, goals, and progress over time. It helps users log tasks, monitor goal completion, and visualize their productivity through charts and metrics.
 
 ### Tech Stack
 
 | Technology | Purpose |
 |------------|---------|
 | **React 18** | UI framework |
 | **TypeScript** | Type-safe JavaScript |
 | **Tailwind CSS** | Utility-first styling |
 | **Shadcn/UI** | Component library |
 | **Vite** | Build tool |
 | **Lovable Cloud** | Backend (PostgreSQL database, authentication) |
 | **React Query** | Data fetching and caching |
 | **Recharts** | Data visualization |
 | **date-fns** | Date manipulation |
 | **Zod** | Form validation |
 
 ---
 
 ## 2. Features
 
 ### 2.1 User Authentication
 - **Sign Up**: Create account with email, password, and display name
 - **Sign In**: Email and password login
 - **Auto Redirect**: Authenticated users are redirected to dashboard
 - **Protected Routes**: Unauthenticated users cannot access the dashboard
 
 ### 2.2 Task Management
 - **Add Tasks**: Log work with name, category, hours, date, and flags
 - **Edit Tasks**: Modify existing task details
 - **Delete Tasks**: Remove tasks with confirmation
 - **Mark Complete**: Toggle task completion status
 - **Search**: Filter tasks by name, category, or outcome
 - **Pagination**: Navigate through tasks with page controls (10, 25, 50 per page)
 
 ### 2.3 Goal Tracking
 - **Create Goals**: Set targets with title, value, unit, and linked category
 - **Auto Progress**: Goals automatically calculate progress from related tasks
 - **Edit/Delete Goals**: Manage existing goals
 - **Visual Progress**: Progress bars show completion percentage
 
 ### 2.4 Category Management
 - **Default Categories**: Angular, Security, Training, Meetings, Skills, Documentation, Code Review, Bug Fixes
 - **Add Categories**: Create custom categories
 - **Edit/Delete**: Manage category names
 
 ### 2.5 Dashboard Analytics
 - **Metrics Cards**: Total hours, AI time saved, active stories, days until target
 - **Charts**: Weekly hours by category, task distribution pie chart
 - **Filters**: View data by week, month, or all time; filter by category
 
 ### 2.6 Project Name
 - **Customizable**: Set a project name displayed in the header
 - **Inline Edit**: Click to edit the project name directly
 - **Per-User**: Each user has their own project name
 
 ### 2.7 Notifications
 - **Alerts**: Warnings for low weekly hours or missing ownership tasks
 - **Alert Count**: Badge shows number of active alerts
 
 ---
 
 ## 3. Data Models
 
 ### 3.1 User Profile
 
 | Field | Type | Description |
 |-------|------|-------------|
 | `id` | UUID | Primary key (linked to auth user) |
 | `display_name` | Text | User's display name |
 | `project_name` | Text | Custom dashboard project name |
 | `avatar_url` | Text | Profile picture URL (optional) |
 | `created_at` | Timestamp | Account creation date |
 
 ### 3.2 Task
 
 | Field | Type | Description |
 |-------|------|-------------|
 | `id` | UUID | Primary key |
 | `user_id` | UUID | Owner's user ID |
 | `name` | Text | Task name/description |
 | `date` | Date | Task date |
 | `category` | Text | Category name |
 | `hours` | Number | Time spent (hours) |
 | `ai_used` | Boolean | AI assistance was used |
 | `ownership` | Boolean | User owned this task |
 | `outcome` | Text | Task outcome/result |
 | `completed` | Boolean | Task completion status |
 
 ### 3.3 Goal
 
 | Field | Type | Description |
 |-------|------|-------------|
 | `id` | UUID | Primary key |
 | `user_id` | UUID | Owner's user ID |
 | `title` | Text | Goal title |
 | `target_value` | Number | Target to reach |
 | `unit` | Text | Unit type: hours, stories, or % |
 | `description` | Text | Goal description |
 | `linked_category` | Text | Category to track (or 'all', 'ownership', 'ai') |
 
 ### 3.4 Category
 
 | Field | Type | Description |
 |-------|------|-------------|
 | `id` | UUID | Primary key |
 | `user_id` | UUID | Owner's user ID |
 | `name` | Text | Category name |
 
 ---
 
 ## 4. Getting Started
 
 ### 4.1 Creating an Account
 
 1. Navigate to the app URL
 2. Click "Sign Up" tab
 3. Enter your display name, email, and password
 4. Check your email for a confirmation link
 5. Click the link to verify your account
 6. Sign in with your credentials
 
 ### 4.2 Adding Your First Task
 
 1. Click "Add Task" button in the top right
 2. Fill in the task details:
    - **Name**: What you worked on
    - **Category**: Select or create a category
    - **Date**: When the work was done
    - **Hours**: Time spent
    - **AI Used**: Check if AI assistance was used
    - **Ownership**: Check if you owned this task
    - **Outcome**: Describe the result
 3. Click "Save Task"
 
 ### 4.3 Understanding Goals
 
 Goals automatically track progress based on their linked category:
 
 - **'all'**: Counts total hours from all tasks
 - **'ownership'**: Counts completed tasks marked as owned
 - **'ai'**: Counts completed tasks that used AI
 - **Category name**: Counts hours or completed tasks in that category
 
 ### 4.4 Customizing Your Project Name
 
 1. Hover over the subtitle below "Goal Tracker"
 2. Click to edit
 3. Type your project name (e.g., "Performance Review 2026")
 4. Press Enter or click the checkmark to save
 
 ---
 
 ## 5. Architecture
 
 ```
 ┌─────────────────────────────────────────────────────────────┐
 │                        Frontend                             │
 │  ┌─────────────────────────────────────────────────────┐   │
 │  │                  React Application                   │   │
 │  │  ┌───────────┐  ┌───────────┐  ┌───────────────┐   │   │
 │  │  │   Pages   │  │Components │  │    Hooks      │   │   │
 │  │  │  - Index  │  │- TaskTable│  │-useDashboard  │   │   │
 │  │  │  - Auth   │  │- GoalCards│  │-useAuth       │   │   │
 │  │  │  - Notif  │  │- Charts   │  │               │   │   │
 │  │  └───────────┘  └───────────┘  └───────────────┘   │   │
 │  └─────────────────────────────────────────────────────┘   │
 └─────────────────────────────────────────────────────────────┘
                              │
                              ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                    Lovable Cloud Backend                    │
 │  ┌─────────────────────────────────────────────────────┐   │
 │  │                   PostgreSQL Database                │   │
 │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
 │  │  │ profiles │ │  tasks   │ │  goals   │ │ categ. │ │   │
 │  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
 │  └─────────────────────────────────────────────────────┘   │
 │  ┌─────────────────────────────────────────────────────┐   │
 │  │               Authentication (Email/Pass)            │   │
 │  └─────────────────────────────────────────────────────┘   │
 │  ┌─────────────────────────────────────────────────────┐   │
 │  │            Row Level Security (RLS)                  │   │
 │  │         Users can only access their own data         │   │
 │  └─────────────────────────────────────────────────────┘   │
 └─────────────────────────────────────────────────────────────┘
 ```
 
 ---
 
 ## 6. Security
 
 ### Row Level Security (RLS)
 
 All database tables have RLS enabled. Users can only:
 - **SELECT**: View their own records
 - **INSERT**: Create records with their user ID
 - **UPDATE**: Modify their own records
 - **DELETE**: Remove their own records
 
 ### Authentication Flow
 
 1. User signs up with email/password
 2. Email confirmation is required (unless disabled)
 3. Profile is auto-created via database trigger
 4. Default categories and goals are created for new users
 5. Session tokens are managed via Lovable Cloud auth
 
 ---
 
 ## 7. File Structure
 
 ```
 src/
 ├── components/
 │   ├── auth/
 │   │   ├── LoginForm.tsx
 │   │   └── SignupForm.tsx
 │   ├── dashboard/
 │   │   ├── TaskTable.tsx
 │   │   ├── TaskPagination.tsx
 │   │   ├── GoalCards.tsx
 │   │   ├── DashboardCharts.tsx
 │   │   ├── MetricsCards.tsx
 │   │   ├── ProjectHeader.tsx
 │   │   └── ...
 │   └── ui/
 │       └── ... (shadcn components)
 ├── contexts/
 │   └── AuthContext.tsx
 ├── hooks/
 │   ├── useDashboardData.ts
 │   └── use-toast.ts
 ├── pages/
 │   ├── Index.tsx
 │   ├── Auth.tsx
 │   └── Notifications.tsx
 ├── types/
 │   └── dashboard.ts
 └── App.tsx
 ```
 
 ---
 
 ## 8. Troubleshooting
 
 ### "Email not confirmed" error
 - Check your email for a confirmation link
 - Check spam folder
 - Request a new confirmation email
 
 ### Data not loading
 - Refresh the page
 - Check your internet connection
 - Sign out and sign back in
 
 ### Tasks not saving
 - Ensure all required fields are filled
 - Check for error messages in the form
 - Refresh and try again
 
 ---
 
 ## 9. Contact & Support
 
 For issues or questions, please contact the project administrator or submit an issue through the project repository.