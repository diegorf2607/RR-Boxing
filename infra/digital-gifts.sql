-- Regalos digitales + vínculo a pedidos + log de envíos (Supabase SQL Editor)
-- Reutiliza bucket existente product-images con prefijo digital-gifts/ (subida vía API admin).

create table if not exists public.digital_gifts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gift_type text not null check (gift_type in ('pdf', 'video', 'link')),
  description text not null default '',
  content_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_digital_gifts (
  order_id text not null references public.orders (id) on delete cascade,
  digital_gift_id uuid not null references public.digital_gifts (id) on delete restrict,
  sort_order integer not null default 0,
  primary key (order_id, digital_gift_id)
);

create index if not exists order_digital_gifts_order_idx on public.order_digital_gifts (order_id);

create table if not exists public.order_digital_gift_send_events (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  created_at timestamptz not null default now(),
  recipient_email text not null,
  is_resend boolean not null default false,
  channel text not null check (channel in ('resend', 'manual')),
  success boolean not null default true,
  provider_message_id text,
  error_text text,
  body_preview text,
  admin_note text
);

create index if not exists order_digital_gift_send_events_order_idx
  on public.order_digital_gift_send_events (order_id, created_at desc);

alter table public.digital_gifts enable row level security;
alter table public.order_digital_gifts enable row level security;
alter table public.order_digital_gift_send_events enable row level security;
