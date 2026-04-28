import { getSession } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { CreatePartnerForm } from './create-partner-form';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Configuración</h1>
        <p className="text-gray-500 mt-1">Gestiona tu perfil y tu cuenta compartida</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-medium mb-4">Perfil de Usuario</h2>
        <div className="space-y-2 text-sm text-gray-700">
          <p><span className="font-medium">Nombre:</span> {user?.name}</p>
          <p><span className="font-medium">Usuario:</span> {user?.username}</p>
          <p><span className="font-medium">Rol:</span> {user?.role}</p>
        </div>
      </div>

      {user?.role === 'OWNER' && !user.coupleId && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-medium mb-4">Crear usuario de pareja</h2>
          <p className="text-sm text-gray-500 mb-6">Crea una cuenta para tu pareja. Se les pedirá que cambien la contraseña en su primer inicio de sesión.</p>
          <CreatePartnerForm ownerId={session.id} />
        </div>
      )}

      {user?.coupleId && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-medium mb-4">Conexión de Pareja</h2>
          <p className="text-sm text-gray-500">Tu cuenta está vinculada a una pareja. Pueden visualizar las finanzas compartidas juntos.</p>
        </div>
      )}
    </div>
  );
}
