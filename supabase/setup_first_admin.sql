-- Plantilla para asignar el primer administrador.
-- Sustituir USER_ID_AQUI por el id del usuario creado en Supabase Auth.
-- No guardar claves ni contrasenas en este archivo.

insert into memberships (organization_id, user_id, role)
select organizations.id, 'USER_ID_AQUI'::uuid, 'admin'
from organizations
where slug = 'vox-majadahonda'
on conflict (organization_id, user_id) do update
set
  role = excluded.role,
  active = true;
