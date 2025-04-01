'use client';

import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store';
import {
  Database,
  FolderKanban,
  Server,
  Folder,
  HardDrive,
  Globe,
  FileType,
  Key,
  Code,
  GitBranch,
  Plus,
  GitFork,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = {
  '데이터관리': [
    { name: '카탈로그 조회', href: '/catalog', icon: Database },
    { name: '프로젝트 관리', href: '/projects', icon: FolderKanban },
  ],
  '시스템관리': [
    { name: '클러스터 카탈로그', href: '/cluster-catalog', icon: Server },
    { name: '프로젝트 카탈로그', href: '/project-catalog', icon: Folder },
    { name: '시스템 카탈로그', href: '/system-catalog', icon: HardDrive },
    { name: '프로젝트관리', href: '/project-management', icon: FolderKanban },
    { name: '사용자관리', href: '/user-management', icon: Users },
    { name: 'DNS조회', href: '/dns-lookup', icon: Globe },
    { name: '카탈로그 유형', href: '/catalog-types', icon: FileType },
    { name: '라이센스 관리', href: '/license-management', icon: Key },
  ],
  '시스템': [
    { name: '공통코드', href: '/common-code', icon: Code },
    { name: '카탈로그 유형', href: '/catalog-types', icon: FileType },
    { name: '클러스터', href: '/cluster', icon: Server },
    {
      name: 'ArgoCD',
      href: '/argocd',
      icon: GitBranch,
      subItems: [
        { name: '클러스터 등록', href: '/argocd/cluster-registration', icon: Plus },
        { name: 'Repo 등록', href: '/argocd/repo-registration', icon: GitFork },
      ]
    },
    { name: 'DNS 조회', href: '/dns-lookup', icon: Globe },
    { name: '시스템 카탈로그', href: '/system-catalog', icon: HardDrive },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { activeMenu } = useSidebarStore();
  const currentMenuItems = activeMenu ? menuItems[activeMenu] : [];

  return (
    <div className="hidden md:flex w-56 flex-shrink-0 bg-white border-r overflow-y-auto">
      <nav className="flex-1 space-y-1 p-4">
        {currentMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.subItems) {
            return (
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

          return (
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