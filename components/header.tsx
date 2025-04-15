'use client';

import {
  Bell,
  User,
  Database,
  FolderKanban,
  Users,
  Globe,
  FileType,
  Key,
  Server,
  Folder,
  HardDrive,
  Code,
  GitBranch,
  Plus,
  GitFork
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebarStore } from '@/lib/store';
import { logout } from '@/lib/auth';
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
} from "@/components/ui/navigation-menu";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getRuntimeConfig } from '../utils/runtime-config';

// interface AuthConfig {
//   keycloakClientId?: string;
//   keycloakClientSecret?: string;
//   keycloakIssuer?: string;
// }

export function Header() {
  const { activeMenu, setActiveMenu, setActiveSubMenu } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const config = getRuntimeConfig();

  const userRoles = session?.roles || [];
  const isRoot = userRoles.includes('root');
  const isAdmin = userRoles.includes('admin');
  const isManager = userRoles.includes('manager');

  // const keycloakIssuer = config.KEYCLOAK_ISSUER
  // const [config, setConfig] = useState<AuthConfig>({});



  // useEffect(() => {
  //   fetch('/api/config')
  //     .then(res => res.json())
  //     .then(data => setConfig(data));
  // }, []);

  useEffect(() => {
    const systemPaths = [
      '/common-code',
      '/sys-catalog-types',
      '/cluster',
      '/argocd',
      '/sys-dns-lookup',
      '/system-link'
    ];

    const dataPaths = ['/catalog', '/projects'];

    const systemManagementPaths = [
      '/cluster-catalog',
      '/project-catalog',
      '/system-catalog',
      '/project-management',
      '/user-management',
      '/dns-lookup',
      '/catalog-types',
      '/license-management'
    ];

    if (systemPaths.some(path => pathname == path)) {
      setActiveMenu('시스템');
      setActiveSubMenu(pathname);
    } else if (dataPaths.some(path => pathname == path)) {
      setActiveMenu('데이터관리');
      setActiveSubMenu(pathname);
    } else if (systemManagementPaths.some(path => pathname == path)) {
      setActiveMenu('시스템관리');
      setActiveSubMenu(pathname);
    }
  }, [pathname, setActiveMenu, setActiveSubMenu]);

  const handleMenuClick = (menu: string, defaultPath: string) => {
    setActiveMenu(menu);
    setActiveSubMenu(defaultPath);
    router.push(defaultPath);
  };

  // const handleLogout = () => {
  //   logout();
  // };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = config.KEYCLOAK_ISSUER + '/protocol/openid-connect/logout?redirect_uri=' + window.location.origin;

    // const response = await fetch('/api/auth/logout');
    // const data = await response.json();
    // window.location.href = data.url + window.location.origin;

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
              <NavigationMenuItem>
                <NavigationMenuTrigger
                  onClick={() => handleMenuClick('데이터관리', '/catalog')}
                  className={`text-white hover:text-white hover:bg-gray-800 h-8 ${isMenuActive('데이터관리') ? 'bg-gray-800' : 'bg-black'}`}
                >
                  데이터관리
                </NavigationMenuTrigger>
                <NavigationMenuContent className="data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 absolute left-0 top-0 w-full">
                  <div className="w-[500px] p-4">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/catalog"
                        className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                      >
                        <Database className="h-4 w-4" />
                        <span>카탈로그 조회</span>
                      </Link>
                    </NavigationMenuLink>
                    {(isRoot || isAdmin || isManager) && (
                      <NavigationMenuLink asChild>
                        <Link
                          href="/projects"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <FolderKanban className="h-4 w-4" />
                          <span>프로젝트 관리</span>
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {(isRoot || isAdmin) && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => handleMenuClick('시스템관리', '/cluster-catalog')}
                    className={`text-white hover:text-white hover:bg-gray-800 h-8 ${isMenuActive('시스템관리') ? 'bg-gray-800' : 'bg-black'}`}
                  >
                    시스템관리
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 absolute left-0 top-0 w-full">
                    <div className="w-[500px] p-4 grid grid-cols-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/cluster-catalog"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <Server className="h-4 w-4" />
                          <span>클러스터 카탈로그</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/project-catalog"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <Folder className="h-4 w-4" />
                          <span>프로젝트 카탈로그</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/system-catalog"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <HardDrive className="h-4 w-4" />
                          <span>시스템 카탈로그</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/project-management"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <FolderKanban className="h-4 w-4" />
                          <span>프로젝트관리</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/user-management"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <Users className="h-4 w-4" />
                          <span>사용자관리</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/dns-lookup"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <Globe className="h-4 w-4" />
                          <span>DNS조회</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/catalog-types"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <FileType className="h-4 w-4" />
                          <span>카탈로그 유형</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/license-management"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <Key className="h-4 w-4" />
                          <span>라이센스 관리</span>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}

              {isRoot && (
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => handleMenuClick('시스템', '/common-code')}
                    className={`text-white hover:text-white hover:bg-gray-800 h-8 ${isMenuActive('시스템') ? 'bg-gray-800' : 'bg-black'}`}
                  >
                    시스템
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 absolute left-0 top-0 w-full">
                    <div className="w-[500px] p-4 grid grid-cols-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/common-code"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <Code className="h-4 w-4" />
                          <span>공통코드</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/sys-catalog-types"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <FileType className="h-4 w-4" />
                          <span>카탈로그 유형</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/cluster"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <Server className="h-4 w-4" />
                          <span>클러스터</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/argocd/cluster-registration"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <GitBranch className="h-4 w-4" />
                          <span>ArgoCD</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/sys-dns-lookup"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <Globe className="h-4 w-4" />
                          <span>DNS 조회</span>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link
                          href="/system-link"
                          className="flex items-center gap-2 rounded-md p-1 hover:bg-accent"
                        >
                          <HardDrive className="h-4 w-4" />
                          <span>시스템 카탈로그</span>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )}
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
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
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