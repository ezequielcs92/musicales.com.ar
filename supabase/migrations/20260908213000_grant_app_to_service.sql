-- ---------------------------------------------------------------------------
-- Le da acceso al esquema `app` al rol `service_role`.
--
-- La migracion de fundaciones concedio USAGE solo a `anon` y `authenticated`.
-- Faltaba `service_role`, y como los disparadores viven en `app`, cualquier
-- escritura hecha con la clave de servicio sobre una tabla con disparador
-- fallaba con "permission denied for schema app".
--
-- Que la funcion sea SECURITY DEFINER no alcanza: para invocarla, el rol que
-- llama necesita USAGE sobre el esquema donde vive.
-- ---------------------------------------------------------------------------

grant usage on schema app to service_role;

grant execute on function app.rol() to service_role;
grant execute on function app.es_staff() to service_role;
grant execute on function app.es_servicio() to service_role;
grant execute on function app.unaccent(text) to service_role;

-- Que no vuelva a pasar con funciones futuras.
alter default privileges in schema app
  grant execute on functions to anon, authenticated, service_role;
