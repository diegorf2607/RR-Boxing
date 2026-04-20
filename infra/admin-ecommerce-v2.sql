-- ============================================================
-- Admin ecommerce v2 — ejecutar en Supabase SQL Editor
-- No elimina datos; amplía tablas y crea tablas nuevas.
-- ============================================================

-- ---------- PRODUCTOS ----------
alter table public.products add column if not exists listing_status text not null default 'active'
  check (listing_status in ('draft', 'active', 'inactive'));

update public.products
set listing_status = case when active then 'active' else 'inactive' end
where listing_status is null or listing_status = '';

alter table public.products add column if not exists sku text;
create unique index if not exists products_sku_unique
  on public.products (lower(trim(sku)))
  where sku is not null and trim(sku) <> '';

alter table public.products add column if not exists display_order integer not null default 0;
alter table public.products add column if not exists weight_grams integer;
alter table public.products add column if not exists internal_notes text;
alter table public.products add column if not exists updated_at timestamptz not null default now();

-- ---------- IMÁGENES (portada + orden) ----------
alter table public.product_images add column if not exists is_primary boolean not null default false;

-- ---------- PEDIDOS (pago + fulfillment + notas) ----------
alter table public.orders add column if not exists customer_name text;
alter table public.orders add column if not exists payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid', 'paid', 'failed', 'refunded'));
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists internal_notes text;

-- Sincroniza payment_status con status legacy al migrar
update public.orders
set payment_status = case
  when status::text = 'paid' then 'paid'
  when status::text = 'cancelled' then 'unpaid'
  else 'unpaid'
end
where payment_status = 'unpaid';

-- Convierte orders.status a TEXT para permitir más estados (ENUM → text)
do $$
begin
  alter table public.orders alter column status type text using status::text;
exception
  when others then null;
end $$;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (
  status in ('pending', 'paid', 'cancelled', 'processing', 'shipped', 'delivered')
);

-- ---------- NOTIFICACIONES ADMIN ----------
create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity text not null default 'info' check (severity in ('info', 'warning', 'critical')),
  title text not null,
  body text,
  link text,
  entity_type text,
  entity_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_notifications_unread on public.admin_notifications (created_at desc) where read_at is null;
create index if not exists admin_notifications_entity on public.admin_notifications (type, entity_id);

-- ---------- CONFIG TIENDA (fila única) ----------
create table if not exists public.store_settings (
  id integer primary key default 1 check (id = 1),
  store_name text not null default 'RRBOXING',
  default_currency_display text not null default 'PEN',
  low_stock_threshold integer not null default 5,
  support_contact_text text not null default '',
  checkout_helper_text text not null default '',
  store_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (1)
on conflict (id) do nothing;

-- RLS: solo service role / backend (sin políticas públicas)
alter table public.admin_notifications enable row level security;
alter table public.store_settings enable row level security;
