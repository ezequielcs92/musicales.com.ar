-- ---------------------------------------------------------------------------
-- Arregla `profiles_role_guard`, que bloqueaba a la clave de servicio.
--
-- El disparador prohibia cambiar `role` salvo a un administrador, leyendo el
-- rol de `app_metadata` del JWT. La clave de servicio no lleva `app_metadata`,
-- asi que `app.rol()` devolvia 'suscriptor' y el disparador la rechazaba.
--
-- Los disparadores NO se saltean con la clave de servicio: eso solo vale para
-- RLS. El resultado era al reves de lo esperado: el panel podia cambiar roles
-- y un script de servidor no.
--
-- La clave de servicio se detecta por el rol de base que le asigna PostgREST.
-- ---------------------------------------------------------------------------

create or replace function app.es_servicio()
returns boolean
language sql
stable
set search_path = ''
as $$
  select current_user = 'service_role'
      or coalesce(
           current_setting('request.jwt.claims', true)::jsonb ->> 'role',
           ''
         ) = 'service_role'
$$;

create or replace function app.profiles_role_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and app.rol() <> 'administrador'
     and not app.es_servicio() then
    raise exception
      'Solo un administrador puede cambiar roles.'
      using errcode = '42501';
  end if;

  if new.role is distinct from old.role then
    insert into public.audit_log (actor_id, action, entity, entity_id, detail)
    values (
      (select auth.uid()), 'cambiar_rol', 'profiles', new.id,
      jsonb_build_object(
        'de', old.role,
        'a', new.role,
        'por_servicio', app.es_servicio()
      )
    );
  end if;

  return new;
end;
$$;

grant execute on function app.es_servicio() to anon, authenticated;
