alter table public.user_subscriptions
  add column if not exists paypal_subscription_id text;

create unique index if not exists user_subscriptions_paypal_subscription_id_key
  on public.user_subscriptions (paypal_subscription_id)
  where paypal_subscription_id is not null;
