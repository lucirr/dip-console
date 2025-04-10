'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Code, MoreVertical, Check, RefreshCw } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import TablePagination from "@/components/ui/table-pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { yaml } from '@codemirror/lang-yaml';
import type { ReactNode } from 'react';
import type { Role, User } from "@/types/project"
import { getUsers, insertUser, updateUser, deleteUser, getRoles } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommonCode } from '@/types/groupcode';
import { getErrorMessage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any, index?: number) => ReactNode;
}



export default function UserManagementPage() {
  const { toast } = useToast()
  const [userData, setUserData] = useState<User[]>([]);
  const [isUserNewSheetOpen, setIsUserNewSheetOpen] = useState(false);
  const [isUserEditSheetOpen, setIsUserEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageUser, setPageUser] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsUser, setFormErrorsUser] = useState<{
    username?: string;
    nickname?: string;
    password?: string;
    email?: string;
    roleName?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCode, setNewCode] = useState<User>({
    username: '',
    nickname: '',
    password: '',
    email: '',
    roleName: '',
  });

  const [editUser, setEditUser] = useState<User>({
    uid: '',
    username: '',
    nickname: '',
    password: '',
    email: '',
    roleName: '',
  });

  const [roleOptions, setRoleOptions] = useState<Role[]>([]);



  const formSchemaUser = z.object({
    username: z.string().min(1, { message: "이름은 필수 입력 항목입니다." }),
    nickname: z.string().min(1, { message: "닉네임은 필수 입력 항목입니다." }),
    email: z.string().min(1, { message: "이메일은 필수 입력 항목입니다." }),
    roleName: z.string().min(1, { message: "역할은 필수 입력 항목입니다." }),
    password: z
      .string()
      .min(8, { message: "비밀번호는 최소 8자 이상이어야 합니다." })
      .max(50, { message: "비밀번호는 50자를 초과할 수 없습니다." })
      .refine((value) => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /[0-9]/.test(value);
        const hasSpecialChar = /[@$!%*?&]/.test(value);
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      }, {
        message: "비밀번호는 대소문자, 숫자, 특수문자(@$!%*?&)를 각각 하나 이상 포함해야 합니다."
      }),
  });



  const paginatedData = userData?.slice((pageUser - 1) * pageSize, pageUser * pageSize) || [];
  const totalPages = Math.ceil((userData?.length || 0) / pageSize);


  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageUser - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'username', title: '이름', align: 'left' },
    { key: 'nickname', title: '닉네임', align: 'left' },
    { key: 'roleName', title: '역할', align: 'left' },
    {
      key: 'createdAt', title: '등록일자', align: 'left',
      cell: (row: User) => {
        if (!row.createdAt) return '-';
        return format(new Date(row.createdAt), 'yyyy-MM-dd');
      }
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => userEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => userDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];



  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers();
      setUserData(response);
    } catch (error) {
      setUserData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await getRoles();
      const filteredData = response.filter(item =>
        item.name != 'root'
      );
      setRoleOptions(filteredData);
      return response;
    } catch (error) {
      setRoleOptions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUser();
  }, []);

  useEffect(() => {
    setFormErrorsUser(null);
  }, [isUserNewSheetOpen]);

  const handleRefresh = () => {
    fetchUser();
  };

  const userNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsUser(null);

    const validationResult = formSchemaUser.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'username' || field === 'nickname' || field === 'password' || field === 'email' || field === 'roleName') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsUser(errors);
      return;
    }
    setConfirmAction(() => newUserSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newUserSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertUser(newCode);
      toast({
        title: "Success",
        description: "사용자가 성공적으로 추가되었습니다.",
      })
      setNewCode({
        username: '',
        nickname: '',
        password: '',
        email: '',
        roleName: '',
      });
      setIsUserNewSheetOpen(false);
      fetchUser();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };



  const userEditSheetClick = (row: User) => {
    setSelectedUser(row);
    setEditUser({
      uid: row.uid,
      username: row.username,
      nickname: row.nickname,
      password: row.password,
      email: row.email,
      roleName: row.roleName,
    });
    setFormErrorsUser(null);
    setIsUserEditSheetOpen(true);
  };

  const userEditClick = () => {
    if (isSubmitting) return;

    setFormErrorsUser(null);

    const validationResult = formSchemaUser.safeParse(editUser);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'nickname' || field === 'email' || field === 'roleName') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsUser(errors);
      return;
    }
    setConfirmAction(() => userEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const userEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateUser(editUser);
      toast({
        title: "Success",
        description: "사용자가 성공적으로 수정되었습니다.",
      })
      setIsUserEditSheetOpen(false);
      fetchUser();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const userDeleteClick = (row: User) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => userDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const userDeleteSubmit = async (row: User) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteUser(row);
      toast({
        title: "Success",
        description: "사용자가 성공적으로 삭제되었습니다.",
      })
      fetchUser();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };



  const handlePageChange = (newPage: number) => {
    setPageUser(newPage);
  };




  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">사용자 관리</h2>
            <p className="mt-1 text-sm text-gray-500">사용자를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isUserNewSheetOpen} onOpenChange={setIsUserNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                사용자 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 사용자 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="user-name" className="flex items-center">
                      이름 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="user-name"
                      placeholder="이름 입력"
                      value={newCode.username}
                      onChange={(e) => {
                        setNewCode({ ...newCode, username: e.target.value });
                        setFormErrorsUser(prevErrors => ({
                          ...prevErrors,
                          username: undefined,
                        }));
                      }}
                      className={formErrorsUser?.username ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsUser?.username && <p className="text-red-500 text-sm">{formErrorsUser.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-name" className="flex items-center">
                      비밀번호 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="user-name"
                      placeholder="비밀번호 입력"
                      value={newCode.password}
                      onChange={(e) => {
                        setNewCode({ ...newCode, password: e.target.value });
                        setFormErrorsUser(prevErrors => ({
                          ...prevErrors,
                          password: undefined,
                        }));
                      }}
                      className={formErrorsUser?.password ? "border-red-500" : ""}
                      type="password"
                      required
                    />
                    {formErrorsUser?.password && <p className="text-red-500 text-sm">{formErrorsUser.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-name" className="flex items-center">
                      닉네임 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="user-name"
                      placeholder="닉네임 입력"
                      value={newCode.nickname}
                      onChange={(e) => {
                        setNewCode({ ...newCode, nickname: e.target.value });
                        setFormErrorsUser(prevErrors => ({
                          ...prevErrors,
                          nickname: undefined,
                        }));
                      }}
                      className={formErrorsUser?.nickname ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsUser?.nickname && <p className="text-red-500 text-sm">{formErrorsUser.nickname}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-name" className="flex items-center">
                      이메일 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="user-name"
                      placeholder="이메일 입력"
                      value={newCode.email}
                      onChange={(e) => {
                        setNewCode({ ...newCode, email: e.target.value });
                        setFormErrorsUser(prevErrors => ({
                          ...prevErrors,
                          email: undefined,
                        }));
                      }}
                      className={formErrorsUser?.email ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsUser?.email && <p className="text-red-500 text-sm">{formErrorsUser.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-catalog-version" className="flex items-center">
                      역할 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCode.roleName}
                      onValueChange={(value) => {
                        setNewCode({ ...newCode, roleName: value });
                        setFormErrorsUser(prevErrors => ({
                          ...prevErrors,
                          roleName: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="catalog-service-type"
                        className={formErrorsUser?.roleName ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="역할 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((item) => (
                          <SelectItem key={item.name || ''} value={item.name || ''}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsUser?.roleName && <p className="text-red-500 text-sm">{formErrorsUser.roleName}</p>}
                  </div>

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsUserNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={userNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isUserEditSheetOpen} onOpenChange={setIsUserEditSheetOpen}>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>사용자 수정</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="edit-catalog-type" className="flex items-center">
                        이름
                      </Label>
                      <div className="p-2 bg-muted rounded-md">
                        <span className="text-sm">{editUser.nickname}</span>
                      </div>
                    </div>
                    <Label htmlFor="edit-user-name" className="flex items-center">
                      닉네임 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-user-name"
                      placeholder="닉네임 입력"
                      value={editUser.nickname}
                      onChange={(e) => {
                        setEditUser({ ...editUser, nickname: e.target.value });
                        setFormErrorsUser(prevErrors => ({
                          ...prevErrors,
                          nickname: undefined,
                        }));
                      }}
                      className={formErrorsUser?.nickname ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsUser?.nickname && <p className="text-red-500 text-sm">{formErrorsUser.nickname}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-type" className="flex items-center">
                      이메일
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editUser.email}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-user-type" className="flex items-center">
                      역할 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={editUser.roleName}
                      onValueChange={(value) => {
                        setEditUser({
                          ...editUser,
                          roleName: value,
                        });
                        setFormErrorsUser(prevErrors => ({
                          ...prevErrors,
                          roleName: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="edit-user-type"
                        className={formErrorsUser?.roleName ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="타입 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((item) => (
                          <SelectItem key={item.name || ''} value={item.name || ''}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsUser?.roleName && <p className="text-red-500 text-sm">{formErrorsUser.roleName}</p>}
                  </div>

                  <div className="flex justify-end space-x-2 mt-6 pb-6">
                    <Button variant="outline" size="sm" onClick={() => setIsUserEditSheetOpen(false)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={userEditClick} disabled={isSubmitting}>
                      저장
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>


        </div>
      </div>
      <Card>
        <CardContent className="p-2">
          <DataTable
            columns={columns}
            data={paginatedData}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
          <TablePagination
            currentPage={pageUser}
            totalPages={totalPages}
            dataLength={(userData?.length || 0)}
            onPageChange={handlePageChange}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmAction}
        description={confirmDescription}
      />

    </div>
  );
}
