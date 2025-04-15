import {
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
  GitFork,
  LucideProps
} from 'lucide-react';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

// Define menu item type with specific icon type for better type safety
export type MenuItem = {
  name: string;
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  subItems?: MenuItem[];
  roles?: string[];
};

// Define menu key type
export type MenuKey = '데이터관리' | '시스템관리' | '시스템';

// Export the common menu items
export const menuItems: Record<MenuKey, MenuItem[]> = {
  '데이터관리': [
    { name: '카탈로그 조회', href: '/catalog', icon: Database, roles: ['root', 'admin', 'manager', 'member'] },
    { name: '프로젝트 관리', href: '/projects', icon: FolderKanban, roles: ['root', 'admin', 'manager'] },
  ],
  '시스템관리': [
    { name: '클러스터 카탈로그', href: '/cluster-catalog', icon: Server, roles: ['root', 'admin'] },
    { name: '프로젝트 카탈로그', href: '/project-catalog', icon: Folder, roles: ['root', 'admin'] },
    { name: '시스템 카탈로그', href: '/system-catalog', icon: HardDrive, roles: ['root', 'admin'] },
    { name: '프로젝트관리', href: '/project-management', icon: FolderKanban, roles: ['root', 'admin'] },
    { name: '사용자관리', href: '/user-management', icon: Users, roles: ['root', 'admin'] },
    { name: 'DNS조회', href: '/dns-lookup', icon: Globe, roles: ['root', 'admin'] },
    { name: '카탈로그 유형', href: '/catalog-types', icon: FileType, roles: ['root', 'admin'] },
    { name: '라이센스 관리', href: '/license-management', icon: Key, roles: ['root', 'admin'] },
  ],
  '시스템': [
    { name: '공통코드', href: '/common-code', icon: Code, roles: ['root'] },
    { name: '카탈로그 유형', href: '/sys-catalog-types', icon: FileType, roles: ['root'] },
    { name: '클러스터', href: '/cluster', icon: Server, roles: ['root'] },
    {
      name: 'ArgoCD',
      href: '/argocd/cluster-registration',
      icon: GitBranch,
      subItems: [
        { name: '클러스터 등록', href: '/argocd/cluster-registration', icon: Plus, roles: ['root'] },
        { name: 'Repo 등록', href: '/argocd/repo-registration', icon: GitFork, roles: ['root'] },
      ],
      roles: ['root']
    },
    { name: 'DNS 조회', href: '/sys-dns-lookup', icon: Globe, roles: ['root'] },
    { name: '시스템 카탈로그', href: '/system-link', icon: HardDrive, roles: ['root'] },
  ],
};

// Helper function to check if user has access to a menu item
export const hasAccess = (userRoles: string[], roles?: string[]) => {
  if (!roles || roles.length === 0) return true;
  return roles.some(role => userRoles.includes(role));
};

// Helper function to get accessible menu items for a category
export const getAccessibleMenuItems = (categoryKey: MenuKey, userRoles: string[]) => {
  return menuItems[categoryKey].filter(item => hasAccess(userRoles, item.roles));
};