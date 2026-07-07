-- Allow dynamic plan IDs (UUIDs) instead of fixed slug enum

alter table public.user_subscriptions
  drop constraint if exists user_subscriptions_plan_id_check;

alter table public.user_subscriptions
  alter column plan_id set default 'free';
