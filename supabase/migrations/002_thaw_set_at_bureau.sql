-- Add set_at_bureau flag to thaw_reminders to distinguish between
-- thaws actually confirmed at the bureau website vs app-set reminders.
ALTER TABLE public.thaw_reminders
  ADD COLUMN set_at_bureau boolean DEFAULT false NOT NULL;
