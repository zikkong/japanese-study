// npm install --no-save @electric-sql/pglite@0.3.14
// PGLITE_ENTRY may point to an already installed dist/index.js for offline runs.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const {PGlite}=await import(process.env.PGLITE_ENTRY||'@electric-sql/pglite');
const db=new PGlite();let checks=0;
await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key);
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;
 insert into auth.users values ('11111111-1111-4111-8111-111111111111'),('22222222-2222-4222-8222-222222222222');`);
const schema=await fs.readFile(new URL('../schema.sql',import.meta.url),'utf8');await db.exec(schema);checks++;await db.exec(schema);checks++;
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
const payload={completed:{1:'2026-11-03'},wrong:{},history:{'2026-11-03':[1]},started:'2026-11-03'};
async function as(role,id,fn){await db.exec(`set role ${role};`);await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id||'']);try{return await fn();}finally{await db.exec('reset role');}}
await as('anon','',async()=>{await assert.rejects(db.query('select * from public.study_progress'));checks++;await assert.rejects(db.query('select public.save_study_progress(0,$1)',[payload]));checks++;});
await as('authenticated',a,async()=>{const r=await db.query('select public.save_study_progress(0,$1) as r',[payload]);assert.equal(r.rows[0].r.revision,1);checks++;const stale=await db.query('select public.save_study_progress(0,$1) as r',[{...payload,completed:{2:'stale'}}]);assert.equal(stale.rows[0].r.conflict,true);assert.equal(stale.rows[0].r.payload.completed[1],'2026-11-03');checks++;});
await as('authenticated',b,async()=>{assert.equal((await db.query('select * from public.study_progress')).rows.length,0);checks++;await assert.rejects(db.query('insert into public.study_progress(user_id,payload) values($1,$2)',[a,payload]));checks++;assert.equal((await db.query('update public.study_progress set revision=99 where user_id=$1 returning *',[a])).rows.length,0);checks++;const r=await db.query('select public.save_study_progress(0,$1) as r',[{...payload,completed:{2:'b'}}]);assert.equal(r.rows[0].r.payload.completed[1],undefined);checks++;});
await as('authenticated',a,async()=>{assert.equal((await db.query('select * from public.study_progress')).rows.length,1);checks++;await assert.rejects(db.query('update public.study_progress set user_id=$1',[b]));checks++;await assert.rejects(db.query('delete from public.study_progress'));checks++;await assert.rejects(db.query('select public.save_study_progress(1,$1)',[{bad:true}]));checks++;const r=await db.query('select payload from public.study_progress');assert.equal(r.rows[0].payload.completed[1],'2026-11-03');checks++;});
await db.close();console.log(`PostgreSQL schema / RLS / CAS: ${checks} assertions passed (isolated PGlite; Supabase Auth not contacted)`);
