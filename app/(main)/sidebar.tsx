'use client';

import { UserPayload } from '@/lib/auth';
import { logoutUser } from '@/app/actions/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wallet, CreditCard, PieChart, Receipt, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Sidebar({ user }: { user: UserPayload }) {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Ingresos', href: '/incomes', icon: Wallet },
    { name: 'Gastos', href: '/expenses', icon: Receipt },
    { name: 'Compartidos', href: '/shared', icon: Users },
    { name: 'Tarjetas', href: '/cards', icon: CreditCard },
    { name: 'Gastos Fijos', href: '/fixed-expenses', icon: Calendar },
    { name: 'Proyectos', href: '/projects', icon: PieChart },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">BYL Finanzas</h2>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors",
                isActive 
                  ? "bg-gray-100 text-gray-900 font-medium" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className="w-4 h-4" />
              {link.name}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{user.name}</span>
            <span className="text-xs text-gray-500">{user.role === 'OWNER' ? 'Administrador' : 'Pareja'}</span>
          </div>
          <form action={logoutUser}>
            <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-900">
              <LogOut className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
