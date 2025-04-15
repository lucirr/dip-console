'use client';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MenuItem, MenuKey, menuItems, hasAccess } from '@/lib/menu-items';

export function Sidebar() {
  const pathname = usePathname();
  const { activeMenu } = useSidebarStore();
  const currentMenuItems = activeMenu ? menuItems[activeMenu as MenuKey] : [];
  const { data: session } = useSession();

  const userRoles = session?.roles || [];
  const isRoot = userRoles.includes('root');
  const isAdmin = userRoles.includes('admin');
  const isManager = userRoles.includes('manager');

  return (
    <div className="hidden md:flex w-56 flex-shrink-0 bg-white border-r overflow-y-auto">
      <nav className="flex-1 space-y-1 p-4">
        {currentMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.subItems) {
            return (hasAccess(userRoles, item.roles) &&
              <div key={item.name} className="space-y-1">
                <div className={cn(
                  'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium',
                  isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                )}>
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </div>
                <div className="pl-4 space-y-1">
                  {item.subItems.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={cn(
                          'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm',
                          isSubActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        <SubIcon className="h-4 w-4" />
                        <span>{subItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          return (hasAccess(userRoles, item.roles) &&
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 rounded-lg px-3 py-2 text-sm',
                isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}