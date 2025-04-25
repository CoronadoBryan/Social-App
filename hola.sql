-- inserts a row into public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, name)
  values (new.id, new.raw_user_meta_data ->> 'name');
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger createAuthUser
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

  t4p=g&##yLLAi4@