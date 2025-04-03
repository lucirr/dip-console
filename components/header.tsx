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
import { useEffect } from 'react';

export function Header() {
  const { activeMenu, setActiveMenu, setActiveSubMenu } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 시스템 메뉴의 하위 경로들
    const systemPaths = [
      '/common-code',
      '/catalog-types',
      '/cluster',
      '/argocd',
      '/dns-lookup',
      '/system-catalog'
    ];

    // 데이터관리 메뉴의 하위 경로들
    const dataPaths = ['/catalog', '/projects'];

    // 시스템관리 메뉴의 하위 경로들
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

    // 현재 경로가 어느 메뉴에 속하는지 확인
    if (systemPaths.some(path => pathname.startsWith(path))) {
      setActiveMenu('시스템');
      setActiveSubMenu(pathname);
    } else if (dataPaths.some(path => pathname.startsWith(path))) {
      setActiveMenu('데이터관리');
      setActiveSubMenu(pathname);
    } else if (systemManagementPaths.some(path => pathname.startsWith(path))) {
      setActiveMenu('시스템관리');
      setActiveSubMenu(pathname);
    }
  }, [pathname, setActiveMenu, setActiveSubMenu]);

  const handleMenuClick = (menu: string, defaultPath: string) => {
    setActiveMenu(menu);
    setActiveSubMenu(defaultPath);
    router.push(defaultPath);
  };

  const isMenuActive = (menu: string) => activeMenu === menu;

  return (
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
              <NavigationMenuContent className="bg-white absolute">
                <ul className="grid w-[200px] gap-2 p-3">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/catalog"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <Database className="h-4 w-4" />
                        <span>카탈로그 조회</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/projects"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                      >
                        <FolderKanban className="h-4 w-4" />
                        <span>프로젝트 관리</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger 
                onClick={() => handleMenuClick('시스템관리', '/cluster-catalog')}
                className={`text-white hover:text-white hover:bg-gray-800 h-8 ${isMenuActive('시스템관리') ? 'bg-gray-800' : 'bg-black'}`}
              >
                시스템관리
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-white absolute">
                <ul className="w-[300px] gap-2 p-3">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/cluster-catalog"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <Server className="h-4 w-4 flex-shrink-0" />
                        <span>클러스터 카탈로그</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/project-catalog"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <Folder className="h-4 w-4 flex-shrink-0" />
                        <span>프로젝트 카탈로그</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/system-catalog"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <HardDrive className="h-4 w-4 flex-shrink-0" />
                        <span>시스템 카탈로그</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/project-management"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <FolderKanban className="h-4 w-4 flex-shrink-0" />
                        <span>프로젝트관리</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/user-management"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <Users className="h-4 w-4 flex-shrink-0" />
                        <span>사용자관리</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/dns-lookup"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <Globe className="h-4 w-4 flex-shrink-0" />
                        <span>DNS조회</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/catalog-types"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <FileType className="h-4 w-4 flex-shrink-0" />
                        <span>카탈로그 유형</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/license-management"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <Key className="h-4 w-4 flex-shrink-0" />
                        <span>라이센스 관리</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger 
                onClick={() => handleMenuClick('시스템', '/common-code')}
                className={`text-white hover:text-white hover:bg-gray-800 h-8 ${isMenuActive('시스템') ? 'bg-gray-800' : 'bg-black'}`}
              >
                시스템
              </NavigationMenuTrigger>
              <NavigationMenuContent className="bg-white absolute" style={{ transform: 'translateX(-50%)', left: '50%' }}>
                <ul className="w-[200px] gap-2 p-3">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/common-code"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <Code className="h-4 w-4" />
                        <span>공통코드</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/catalog-types"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <FileType className="h-4 w-4" />
                        <span>카탈로그 유형</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/cluster"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <Server className="h-4 w-4" />
                        <span>클러스터</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/argocd"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <GitBranch className="h-4 w-4" />
                        <span>ArgoCD</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/dns-lookup"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <Globe className="h-4 w-4" />
                        <span>DNS 조회</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link 
                        href="/system-catalog"
                        className="flex items-center gap-2 select-none rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground whitespace-nowrap"
                      >
                        <HardDrive className="h-4 w-4" />
                        <span>시스템 카탈로그</span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
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
            {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
            {/* <DropdownMenuItem>Settings</DropdownMenuItem> */}
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}