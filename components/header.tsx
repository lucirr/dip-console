'use client';

import {
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getRuntimeConfig } from '@/utils/runtime-config';
import { MenuKey, MenuItem, menuItems, hasAccess, getAccessibleMenuItems } from '@/lib/menu-items';
import { GET } from "@/app/api/config/route";

export function Header() {
  const { activeMenu, setActiveMenu, setActiveSubMenu } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const config = getRuntimeConfig();

  const userRoles = session?.roles || [];
  const username = session?.user?.name || '사용자';

  // Use the hasAccess function from the imported module
  const checkAccess = (roles?: string[]) => hasAccess(userRoles, roles);

  // Memoize accessible menu categories to avoid recalculation on each render
  const accessibleMenuCategories = useMemo(() => {
    return Object.entries(menuItems).reduce((acc, [key, items]) => {
      // Check if user has access to any item in this category
      const hasAccessToCategory = items.some(item => checkAccess(item.roles));
      if (hasAccessToCategory) {
        acc.push(key as MenuKey);
      }
      return acc;
    }, [] as MenuKey[]);
  }, [userRoles]);

  useEffect(() => {
    // Find which menu category contains the current path
    for (const [menuKey, items] of Object.entries(menuItems)) {
      // Check main menu items
      const mainMenuItem = items.find(item =>
        pathname === item.href ||
        // Also check if pathname starts with item.href for nested routes
        (item.href !== '/' && pathname == (item.href)) ||
        // Check subItems if they exist
        item.subItems?.some(subItem =>
          pathname === subItem.href ||
          (subItem.href !== '/' && pathname == (subItem.href))
        )
      );

      if (mainMenuItem && checkAccess(mainMenuItem.roles)) {
        setActiveMenu(menuKey as MenuKey);

        // If we matched a subItem, set that as the active submenu
        const matchedSubItem = mainMenuItem.subItems?.find(subItem =>
          (pathname === subItem.href ||
            (subItem.href !== '/' && pathname == (subItem.href))) &&
          checkAccess(subItem.roles)
        );

        setActiveSubMenu(matchedSubItem?.href || pathname);
        break;
      }
    }
  }, [pathname, setActiveMenu, setActiveSubMenu, userRoles]);

  const handleMenuClick = (menu: MenuKey, defaultPath: string) => {
    setActiveMenu(menu);
    setActiveSubMenu(defaultPath);
    router.push(defaultPath);
  };

  // useEffect(() => {
  //   fetch('/api/config')
  //     .then(res => res.json())
  //     .then(data => console.log(data));
  // }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = config.KEYCLOAK_ISSUER + '/protocol/openid-connect/logout?redirect_uri=' + window.location.origin;
  };

  // Render menu items for a specific category
  const renderMenuItems = (categoryKey: MenuKey, defaultPath: string) => {
    const items = getAccessibleMenuItems(categoryKey, userRoles);

    if (items.length === 0) return null;

    return (
      <NavigationMenuItem key={categoryKey}>
        <NavigationMenuTrigger
          onClick={() => handleMenuClick(categoryKey, defaultPath)}
          className={`text-white hover:text-white hover:bg-gray-800 h-8 ${isMenuActive(categoryKey) ? 'bg-gray-800' : 'bg-black'}`}
        >
          {categoryKey}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 absolute left-0 top-0 w-full">
          <div className={`w-[500px] p-4 ${items.length > 4 ? 'grid grid-cols-2' : ''}`}>
            {items.map(item => {
              const Icon = item.icon;
              return (
                <NavigationMenuLink key={item.href} asChild>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                </NavigationMenuLink>
              );
            })}
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  };

  const isMenuActive = (menu: string) => activeMenu === menu;

  return (
    <div>
      <header className="fixed top-0 left-0 right-0 z-50 flex h-12 items-center justify-between border-b bg-black">
        <div className="flex items-center">
          <Link href="/" className="w-56 px-6 text-lg font-bold text-white">
            <img src="/paasuplogo.png" alt="Logo" className="h-8" />
          </Link>
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {accessibleMenuCategories.includes('데이터관리') &&
                renderMenuItems('데이터관리', '/catalog')}

              {accessibleMenuCategories.includes('시스템관리') &&
                renderMenuItems('시스템관리', '/cluster-catalog')}

              {accessibleMenuCategories.includes('시스템') &&
                renderMenuItems('시스템', '/common-code')}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center gap-2 md:gap-4 px-6">
          <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-gray-800 h-8 w-8">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-gray-800 h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {username}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </div>
  );
}