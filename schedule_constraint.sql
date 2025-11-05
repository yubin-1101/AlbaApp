ALTER TABLE public.schedules
ADD CONSTRAINT schedules_user_id_date_key UNIQUE (user_id, date);
