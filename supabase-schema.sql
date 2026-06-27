-- ============================================
-- AgniCore Technologies — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Users/Employees table (extends Supabase auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role text default 'employee' check (role in ('admin', 'employee')),
  phone text,
  created_at timestamp with time zone default now()
);

-- Clients
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  client_code text unique,
  company_name text not null,
  contact_person text,
  phone text,
  email text,
  client_type text check (client_type in ('Builder', 'PMC Consultant', 'Other')),
  gst_number text,
  address text,
  status text default 'Active' check (status in ('Active', 'Inactive')),
  created_at timestamp with time zone default now()
);

-- Quotations
create table public.quotations (
  id uuid default gen_random_uuid() primary key,
  quotation_number text unique,
  client_id uuid references public.clients(id),
  service text,
  scope text,
  base_amount numeric(12,2),
  gst_rate numeric(5,2) default 18,
  gst_amount numeric(12,2),
  total_amount numeric(12,2),
  include_gst boolean default true,
  project_name text,
  notes text,
  status text default 'Draft' check (status in ('Draft','Sent','Approved','Rejected')),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Invoices
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  invoice_number text unique,
  client_id uuid references public.clients(id),
  quotation_id uuid references public.quotations(id),
  description text,
  base_amount numeric(12,2),
  gst_rate numeric(5,2) default 18,
  gst_amount numeric(12,2),
  total_amount numeric(12,2),
  include_gst boolean default true,
  payment_terms_days integer default 30,
  due_date date,
  status text default 'Unpaid' check (status in ('Unpaid','Paid','Overdue','Cancelled')),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Procurement / Purchase Orders
create table public.procurement (
  id uuid default gen_random_uuid() primary key,
  po_number text unique,
  vendor_name text not null,
  item_description text,
  quantity numeric(10,2),
  unit_price numeric(12,2),
  total_amount numeric(12,2),
  project_name text,
  client_id uuid references public.clients(id),
  status text default 'Ordered' check (status in ('Ordered','Delivered','Cancelled')),
  order_date date default current_date,
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Bills & Expenses
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  expense_code text unique,
  category text check (category in ('Labour','Transport','Tools','Materials','Other')),
  description text,
  amount numeric(12,2),
  expense_date date default current_date,
  project_name text,
  client_id uuid references public.clients(id),
  status text default 'Pending' check (status in ('Pending','Paid')),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default now()
);

-- Service Rates
create table public.service_rates (
  id uuid default gen_random_uuid() primary key,
  service_name text not null,
  unit text,
  rate numeric(12,2),
  gst_rate numeric(5,2) default 18,
  category text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- ============================================
-- Row Level Security (RLS) — All users must be logged in
-- ============================================
alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.quotations enable row level security;
alter table public.invoices enable row level security;
alter table public.procurement enable row level security;
alter table public.expenses enable row level security;
alter table public.service_rates enable row level security;

-- All logged-in users can read everything
create policy "Authenticated users can read" on public.clients for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read" on public.quotations for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read" on public.invoices for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read" on public.procurement for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read" on public.expenses for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read" on public.service_rates for select using (auth.role() = 'authenticated');
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);

-- Only admin can insert/update/delete (checked via profiles table)
create policy "Admin full access clients" on public.clients for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access quotations" on public.quotations for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access invoices" on public.invoices for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access procurement" on public.procurement for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access expenses" on public.expenses for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access rates" on public.service_rates for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Employees can add expenses and procurement
create policy "Employees can add expenses" on public.expenses for insert with check (auth.role() = 'authenticated');
create policy "Employees can add procurement" on public.procurement for insert with check (auth.role() = 'authenticated');

-- ============================================
-- Seed: Default service rates
-- ============================================
insert into public.service_rates (service_name, unit, rate, gst_rate, category) values
('HVAC — Copper piping', 'ft', 180, 18, 'HVAC'),
('HVAC — Indoor unit installation', 'unit', 2500, 18, 'HVAC'),
('Fire alarm cable', 'mtr', 42, 18, 'Fire & Safety'),
('Smoke detector installation', 'unit', 850, 18, 'Fire & Safety'),
('Electrical conduiting', 'ft', 95, 18, 'Electrical'),
('Distribution panel installation', 'unit', 12000, 18, 'Electrical'),
('Interior — False ceiling', 'sqft', 220, 18, 'Interior'),
('Interior — Flooring', 'sqft', 160, 18, 'Interior');

-- ============================================
-- Auto-create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when new.email = 'contact@agnicoretechnologies.com' then 'admin' else 'employee' end
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
