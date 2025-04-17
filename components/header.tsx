'use client';

import {
  Bell,
  CircleHelp,
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { getRuntimeConfig } from '@/utils/runtime-config';
import { MenuKey, MenuItem, menuItems, hasAccess, getAccessibleMenuItems } from '@/lib/menu-items';
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { updateSessionUser } from "@/lib/actions";

export function Header() {
  const { activeMenu, setActiveMenu, setActiveSubMenu } = useSidebarStore();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const config = getRuntimeConfig();
  const { toast } = useToast();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [profileData, setProfileData] = useState({
    nickname: session?.user?.name || '',
    password: '',
    confirmPassword: '',
  });

  const userRoles = session?.roles || [];
  const username = session?.user?.name || '사용자';
  const nickname = session?.nickname || username;
  const email = session?.user?.email || '';

  // Profile validation schema
  const profileSchema = z.object({
    nickname: z.string().min(1, "닉네임은 필수 입력 항목입니다."),
    password: z.string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
      .max(50, "비밀번호는 50자를 초과할 수 없습니다.")
      .refine((value) => {
        if (value === '') return true; // Allow empty password (no change)
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[@$!%*?&]/.test(value);
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      }, {
        message: "비밀번호는 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다."
      }),
    confirmPassword: z.string(),
  }).refine((data) => {
    if (data.password === '') return true; // Skip validation if password is empty
    return data.password === data.confirmPassword;
  }, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["confirmPassword"],
  });

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

  const handleProfileSubmit = async () => {
    try {
      const validationResult = profileSchema.safeParse(profileData);

      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        toast({
          title: "Validation Error",
          description: errors[0].message,
          variant: "destructive"
        });
        return;
      }

      setIsSubmitting(true);

      // Only include password if it was changed
      const updateData = {
        uid: session?.uid,
        username: username,
        nickname: profileData.nickname,
        ...(profileData.password && { password: profileData.password })
      };

      await updateSessionUser(updateData);

      toast({
        title: "Success",
        description: "프로필이 성공적으로 업데이트되었습니다.",
      });

      setIsProfileOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "프로필 업데이트에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {/* <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-gray-800 h-8 w-8">
            <CircleHelp className="h-4 w-4" />
          </Button> */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-gray-800 h-8 w-8">
                <CircleHelp className="h-4 w-4" />
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-70">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">DIP (Data Intelligence Platform)</h4>
                <p className="text-sm text-muted-foreground">
                  Version: 1.0.0
                </p>
                <div className="flex items-center pt-2">
                  <span className="text-xs text-muted-foreground">
                    Latest Release: April 2025
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-white hover:bg-gray-800 h-8 w-8">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {/* {username} */}
                <p className="text-sm font-medium leading-none">{nickname}</p>
                <p className="text-xs leading-none text-muted-foreground pt-2">{username}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsProfileOpen(true)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <div className="flex flex-col h-full">
          <SheetContent className="sm:max-w-[425px] overflow-y-auto">
            <SheetHeader className='pb-4'>
              <SheetTitle>Edit Profile</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-4 border-t">
              <div className="space-y-2">
                <Label>이름</Label>
                <div className="p-2 bg-muted rounded-md">
                  <span className="text-sm">{username}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-2 bg-muted rounded-md">
                  <span className="text-sm">{email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">닉네임 <span className="text-red-500 ml-1">*</span></Label>
                <Input
                  id="nickname"
                  value={profileData.nickname}
                  onChange={(e) => setProfileData({ ...profileData, nickname: e.target.value })}
                  placeholder="Enter nickname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">새 비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={profileData.password}
                  onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                  placeholder="Enter new password (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={profileData.confirmPassword}
                  onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
                취소
              </Button>
              <Button onClick={handleProfileSubmit} disabled={isSubmitting}>
                저장
              </Button>
            </div>
          </SheetContent>
        </div>
      </Sheet>
    </div>
  );
}