-- Supabase SQL Editor에서 전체 실행. 기존 수업 기록을 삭제하지 않습니다.
begin;
create table if not exists public.study_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 revision bigint not null default 0 check (revision >= 0),
 payload jsonb not null default '{"completed":{},"wrong":{},"history":{},"started":""}'::jsonb,
 updated_at timestamptz not null default now(),
 constraint study_payload_object check (
  jsonb_typeof(payload)='object' and
  jsonb_typeof(payload->'completed')='object' and
  jsonb_typeof(payload->'wrong')='object' and
  jsonb_typeof(payload->'history')='object' and
  jsonb_typeof(payload->'started')='string' and
  payload ?& array['completed','wrong','history','started']
 )
);
alter table public.study_progress enable row level security;
alter table public.study_progress force row level security;
revoke all on public.study_progress from public, anon, authenticated;
grant select, insert, update on public.study_progress to authenticated;
drop policy if exists study_select_own on public.study_progress;
create policy study_select_own on public.study_progress for select to authenticated using ((select auth.uid())=user_id);
drop policy if exists study_insert_own on public.study_progress;
create policy study_insert_own on public.study_progress for insert to authenticated with check ((select auth.uid())=user_id);
drop policy if exists study_update_own on public.study_progress;
create policy study_update_own on public.study_progress for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
-- Compare-and-swap under a row lock: concurrent devices cannot silently overwrite.
create or replace function public.save_study_progress(expected_revision bigint, new_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare current_row public.study_progress%rowtype;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if new_payload is null or octet_length(new_payload::text)>1048576 then raise exception 'Invalid or oversized payload'; end if;
 insert into public.study_progress(user_id) values(auth.uid()) on conflict(user_id) do nothing;
 select * into current_row from public.study_progress where user_id=auth.uid() for update;
 if current_row.revision <> expected_revision then
  return jsonb_build_object('conflict',true,'revision',current_row.revision,'payload',current_row.payload);
 end if;
 update public.study_progress set payload=new_payload,revision=revision+1,updated_at=now() where user_id=auth.uid() returning * into current_row;
 return jsonb_build_object('conflict',false,'revision',current_row.revision,'payload',current_row.payload);
end; $$;
revoke all on function public.save_study_progress(bigint,jsonb) from public, anon;
grant execute on function public.save_study_progress(bigint,jsonb) to authenticated;
commit;
