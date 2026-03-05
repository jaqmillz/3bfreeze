-- RPC for users to delete their own account.
-- Deletes the auth.users row, which cascades to public.users and all related tables.
create or replace function public.delete_user_account()
returns void as $$
begin
  -- Delete from auth.users; ON DELETE CASCADE handles all public tables
  delete from auth.users where id = auth.uid();
end;
$$ language plpgsql security definer;
