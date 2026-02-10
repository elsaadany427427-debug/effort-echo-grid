
-- Create goal_subtasks table
CREATE TABLE public.goal_subtasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  name TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.goal_subtasks ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own subtasks"
  ON public.goal_subtasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subtasks"
  ON public.goal_subtasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subtasks"
  ON public.goal_subtasks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subtasks"
  ON public.goal_subtasks FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_goal_subtasks_updated_at
  BEFORE UPDATE ON public.goal_subtasks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
