import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq, or, and } from 'drizzle-orm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectForm } from './project-form';

export default async function ProjectsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const myProjects = await db.query.projects.findMany({
    where: or(
      eq(projects.userId, session.id),
      and(eq(projects.visibility, 'SHARED'), session.coupleId ? eq(projects.userId, session.coupleId) : undefined)
    ),
    orderBy: (projects, { desc }) => [desc(projects.createdAt)]
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Proyectos de Ahorro</h1>
        <p className="text-gray-500 mt-1">Metas financieras, porcentajes de avance y aportes.</p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 border-r border-gray-100 pr-8">
          <Card className="rounded-2xl border-none shadow-sm sticky top-8">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-xl">Nuevo Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <ProjectForm coupleActive={!!session.coupleId} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="grid md:grid-cols-2 gap-6">
             {myProjects.length === 0 ? (
               <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
                 No tienes proyectos de ahorro activos.
               </div>
             ) : (
                myProjects.map(project => {
                  const target = Number(project.targetAmount);
                  const current = Number(project.currentAmount);
                  const remaining = target - current;
                  const progress = Math.min((current / target) * 100, 100);
                  
                  // Calculate months remaining
                  const today = new Date();
                  const tDate = new Date(project.targetDate);
                  const monthsRemaining = (tDate.getFullYear() - today.getFullYear()) * 12 + (tDate.getMonth() - today.getMonth());
                  const suggestedAmount = monthsRemaining > 0 ? (remaining / monthsRemaining) : remaining;

                  return (
                    <div key={project.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">{project.name}</p>
                            {project.visibility === 'SHARED' && (
                              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Compartido</span>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{project.status}</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 space-y-4">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-xs text-gray-500">Ahorro Acumulado</p>
                            <p className="font-semibold text-lg text-green-600">L {current.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Meta</p>
                            <p className="font-medium">L {target.toFixed(2)}</p>
                          </div>
                        </div>
                        
                        {/* usage bar */}
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                          <div 
                            className="absolute top-0 left-0 h-full bg-green-500" 
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-50">
                          <p>Falta: L {remaining.toFixed(2)}</p>
                          <p>Sugerido: L {suggestedAmount.toFixed(2)}/mes</p>
                        </div>
                      </div>
                    </div>
                  );
                })
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
