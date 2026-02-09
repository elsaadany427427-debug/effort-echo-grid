
-- Add project_name column to tasks
ALTER TABLE public.tasks ADD COLUMN project_name text NOT NULL DEFAULT '';

-- Add target_date column to profiles
ALTER TABLE public.profiles ADD COLUMN target_date date DEFAULT '2026-06-01';

-- Create projects table
CREATE TABLE public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Update handle_new_user to seed default project
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'));
  
  INSERT INTO public.categories (user_id, name) VALUES
    (NEW.id, 'Angular'),
    (NEW.id, 'Security'),
    (NEW.id, 'Training'),
    (NEW.id, 'Meetings'),
    (NEW.id, 'Skills'),
    (NEW.id, 'Documentation'),
    (NEW.id, 'Code Review'),
    (NEW.id, 'Bug Fixes');
  
  INSERT INTO public.goals (user_id, title, target_value, unit, description, linked_category) VALUES
    (NEW.id, 'Logged Effort', 880, 'hours', '800-960 hours by 06-2026', 'all'),
    (NEW.id, 'Effective Meetings', 48, 'stories', 'Prepared meetings with follow-ups', 'Meetings'),
    (NEW.id, 'Ownership Stories', 5, 'stories', 'At least 5 stories owned', 'ownership'),
    (NEW.id, 'AI Usage', 100, 'stories', 'Tasks completed with AI assistance', 'ai'),
    (NEW.id, 'Certificate / Training', 100, '%', 'Course completion progress', 'Training'),
    (NEW.id, 'Personal Skills', 100, '%', 'Soft skills, documentation, communication', 'Skills'),
    (NEW.id, 'Security Improvements', 24, 'stories', 'NPM audit fixes and enhancements', 'Security'),
    (NEW.id, 'Angular Contributions', 20, 'stories', 'Refactorings and deep dives', 'Angular');

  INSERT INTO public.projects (user_id, name) VALUES
    (NEW.id, 'Default');
  
  RETURN NEW;
END;
$function$;
