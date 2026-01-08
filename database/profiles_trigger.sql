-- Create or replace trigger to mirror auth metadata into public.profiles on signup
-- Run this in your Supabase SQL editor.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, organization, updated_at)
  values (new.id,
          coalesce(new.raw_user_meta_data->>'full_name', null),
          coalesce(new.raw_user_meta_data->>'role', 'viewer'),
          coalesce(new.raw_user_meta_data->>'organization', null),
          now())
  on conflict (id) do update set
    full_name = excluded.full_name,
    role = excluded.role,
    organization = excluded.organization,
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
