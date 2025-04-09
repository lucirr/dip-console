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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ReactNode } from 'react';
import type { GroupCode, CommonCode } from "@/types/groupcode"
import { getGroupCode, insertGroupCode, updateGroupCode, getCommonCode, deleteCommonCode, insertCommonCode, updateCommonCode } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { getErrorMessage } from '@/lib/utils';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any, index?: number) => ReactNode;
}



export default function CommonCodePage() {
  const { toast } = useToast()
  const [groupCodeData, setGroupCodeData] = useState<GroupCode[]>([]);
  const [commonCodeData, setCommonCodeData] = useState<CommonCode[]>([]);
  const [isGroupCodeNewSheetOpen, setIsGroupCodeNewSheetOpen] = useState(false);
  const [isGroupCodeEditSheetOpen, setIsGroupCodeEditSheetOpen] = useState(false);
  const [isCommonCodeSheetOpen, setIsCommonCodeSheetOpen] = useState(false);
  const [isCommonCodeNewSheetOpen, setIsCommonCodeNewSheetOpen] = useState(false);
  const [isCommonCodeEditSheetOpen, setIsCommonCodeEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageGroupCode, setPageGroupCode] = useState(1);
  const [pageCommonCode, setPageCommonCode] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedGroupCode, setSelectedGroupCode] = useState<GroupCode | null>(null);
  const [selectedCommonCode, setSelectedCommonCode] = useState<CommonCode | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsGroupCode, setFormErrorsGroupCode] = useState<{ groupCode?: string; groupCodeDesc?: string } | null>(null);
  const [formErrorsCommonCode, setFormErrorsCommonCode] = useState<{ code?: string; codeDesc?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCode, setNewCode] = useState<GroupCode>({
    groupCode: '',
    groupCodeDesc: '',
  });

  const [editGroupCode, setEditGroupCode] = useState<GroupCode>({
    uid: '',
    groupCode: '',
    groupCodeDesc: '',
  });

  const [newCommonCode, setNewCommonCode] = useState<CommonCode>({
    uid: '',
    code: '',
    codeDesc: '',
    enable: true,
    groupCodeId: '',
  });

  const [editCommonCode, setEditCommonCode] = useState<CommonCode>({
    uid: '',
    code: '',
    codeDesc: '',
    enable: false,
    groupCodeId: '',
  });

  const formSchemaGroupCode = z.object({
    groupCode: z.string().min(1, { message: "그룹코드는 필수 입력 항목입니다." }),
    groupCodeDesc: z.string().min(1, { message: "그룹코드 설명은 필수 입력 항목입니다." }),
  });

  const formSchemaCommonCode = z.object({
    code: z.string().min(1, { message: "공통코드는 필수 입력 항목입니다." }),
    codeDesc: z.string().min(1, { message: "공통코드 설명은 필수 입력 항목입니다." }),
  });

  const paginatedData = groupCodeData?.slice((pageGroupCode - 1) * pageSize, pageGroupCode * pageSize) || [];
  const totalPages = Math.ceil((groupCodeData?.length || 0) / pageSize);

  const paginatedCommonCode = commonCodeData?.slice((pageCommonCode - 1) * pageSize, pageCommonCode * pageSize) || [];
  const totalPagesCommonCode = Math.ceil((commonCodeData?.length || 0) / pageSize);

  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageGroupCode - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'groupCode', title: '그룹코드', align: 'left' },
    { key: 'groupCodeDesc', title: '그룹코드 설명', align: 'left' },
    {
      key: 'createdAt', title: '등록일자', align: 'left',
      cell: (row: GroupCode) => {
        if (!row.createdAt) return '-';
        return format(new Date(row.createdAt), 'yyyy-MM-dd');
      }
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: GroupCode) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => groupCodeEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => commonCodeSheetClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              공통코드
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const commonCodeColumns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedCommonCode.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageCommonCode - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'groupCode', title: '그룹코드', align: 'left' },
    { key: 'code', title: '코드', align: 'left' },
    { key: 'codeDesc', title: '코드설명', align: 'left' },
    {
      key: 'enable',
      title: '활성화',
      width: 'w-[100px]',
      align: 'left',
      cell: (row: CommonCode) => (
        <div className="flex justify-left">
          {row.enable && <Check className="h-4 w-4 text-green-500" />}
        </div>
      )
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: CommonCode) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => commonCodeEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => commonCodeDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const fetchGroupCodes = async () => {
    setIsLoading(true);
    try {
      const response = await getGroupCode()
      setGroupCodeData(response);
    } catch (error) {
      setGroupCodeData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommonCodes = async () => {
    setIsLoading(true);
    try {
      if (selectedGroupCode?.uid) {
        const response = await getCommonCode(selectedGroupCode.uid);

        const enhancedResponse = response.map(item => ({
          ...item,
          groupCode: selectedGroupCode.groupCode
        }));

        setCommonCodeData(enhancedResponse);
      } else {
        setCommonCodeData([]);
      }
    } catch (error) {
      console.error('Error fetching common codes:', error);
      setCommonCodeData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupCodes();
  }, []);


  useEffect(() => {
    if (selectedGroupCode && isCommonCodeSheetOpen) {
      fetchCommonCodes();
    }
  }, [selectedGroupCode, isCommonCodeSheetOpen]);

  useEffect(() => {
    setFormErrorsGroupCode(null);
  }, [isGroupCodeNewSheetOpen]);

  useEffect(() => {
    setFormErrorsCommonCode(null);
  }, [isCommonCodeNewSheetOpen]);

  const handleRefresh = () => {
    fetchGroupCodes();
  };

  const handleRefreshCommonCode = () => {
    fetchCommonCodes();
  };

  const groupCodeNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsGroupCode(null);

    const validationResult = formSchemaGroupCode.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        if (field === 'groupCode' || field === 'groupCodeDesc') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsGroupCode(errors);
      return;
    }
    setConfirmAction(() => newGroupCodeSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newGroupCodeSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertGroupCode(newCode);
      toast({
        title: "Success",
        description: "그룹 코드가 성공적으로 추가되었습니다.",
      })
      setNewCode({
        groupCode: '',
        groupCodeDesc: '',
      });
      setIsGroupCodeNewSheetOpen(false);
      fetchGroupCodes();
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

  const commonCodeNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsCommonCode(null);

    const validationResult = formSchemaCommonCode.safeParse(newCommonCode);

    if (!validationResult.success) {
      const errors: { [key: string]: string } = {};
      validationResult.error.errors.forEach(error => {
        if (error.path[0] === 'code') {
          errors.code = error.message;
        }
        if (error.path[0] === 'codeDesc') {
          errors.codeDesc = error.message;
        }
      });
      setFormErrorsCommonCode(errors);
      return;
    }
    setConfirmAction(() => newCommonCodeSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newCommonCodeSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (selectedGroupCode?.uid) {
        newCommonCode.groupCodeId = selectedGroupCode.uid;
        await insertCommonCode(newCommonCode);
        toast({
          title: "Success",
          description: "공통 코드가 성공적으로 추가되었습니다.",
        })
        setNewCommonCode({
          uid: '',
          code: '',
          codeDesc: '',
          enable: true,
          groupCodeId: '',
        });
        setIsCommonCodeNewSheetOpen(false);
        fetchCommonCodes();
      }
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

  const groupCodeEditSheetClick = (row: GroupCode) => {
    setSelectedGroupCode(row);
    setEditGroupCode({
      uid: row.uid,
      groupCode: row.groupCode,
      groupCodeDesc: row.groupCodeDesc,
      createdAt: row.createdAt,
    });
    setFormErrorsGroupCode(null);
    setIsGroupCodeEditSheetOpen(true);
  };

  const groupCodeEditClick = () => {
    if (isSubmitting) return;

    setFormErrorsGroupCode(null);

    const validationResult = formSchemaGroupCode.safeParse(editGroupCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        if (field === 'groupCodeDesc') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsGroupCode(errors);
      return;
    }
    setConfirmAction(() => groupCodeEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const groupCodeEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateGroupCode(editGroupCode);
      toast({
        title: "Success",
        description: "그룹 코드가 성공적으로 수정되었습니다.",
      })
      setIsGroupCodeEditSheetOpen(false);
      fetchGroupCodes();
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

  const editCommonCodeClick = () => {
    if (isSubmitting) return;

    setFormErrorsCommonCode(null);

    const validationResult = formSchemaCommonCode.safeParse(editCommonCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        if (field === 'codeDesc') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsCommonCode(errors);
      return;
    }
    setConfirmAction(() => commonCodeEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const commonCodeEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateCommonCode(editCommonCode);
      toast({
        title: "Success",
        description: "공통 코드가 성공적으로 수정되었습니다.",
      })
      setIsCommonCodeEditSheetOpen(false);
      fetchCommonCodes();
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

  const commonCodeEditSheetClick = (row: CommonCode) => {
    setSelectedCommonCode(row);
    setEditCommonCode({
      uid: row.uid,
      code: row.code,
      codeDesc: row.codeDesc,
      codeCategory: row.codeCategory,
      codeValue: row.codeValue,
      enable: row.enable,
      groupCodeId: row.groupCodeId,
      createdAt: row.createdAt,
    });
    setIsCommonCodeEditSheetOpen(true);
    setFormErrorsCommonCode(null);
  };

  const commonCodeDeleteClick = (row: CommonCode) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => commonCodeDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const commonCodeDeleteSubmit = async (row: CommonCode) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteCommonCode(row);
      toast({
        title: "Success",
        description: "공통 코드가 성공적으로 삭제되었습니다.",
      })
      fetchCommonCodes();
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

  const commonCodeSheetClick = (row: GroupCode) => {
    setSelectedGroupCode(row);
    setIsCommonCodeSheetOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPageGroupCode(newPage);
  };

  const handlePageChangeCommonCode = (newPage: number) => {
    setPageCommonCode(newPage);
  };


  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">공통 코드</h2>
            <p className="mt-1 text-sm text-gray-500">공통 코드를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isGroupCodeNewSheetOpen} onOpenChange={setIsGroupCodeNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                그룹코드 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 그룹코드 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="new-code">그룹코드 <span className="text-red-500 ml-1">*</span></Label>
                    <Input
                      id="new-code"
                      placeholder="그룹코드 입력"
                      value={newCode.groupCode}
                      onChange={(e) => {
                        setNewCode({ ...newCode, groupCode: e.target.value });
                        setFormErrorsGroupCode(prevErrors => ({
                          ...prevErrors,
                          groupCode: undefined,
                        }));
                      }}
                      className={formErrorsGroupCode?.groupCode ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsGroupCode?.groupCode && <p className="text-red-500 text-sm">{formErrorsGroupCode.groupCode}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-desc">그룹코드 설명 <span className="text-red-500 ml-1">*</span></Label>
                    <Input
                      id="new-desc"
                      placeholder="그룹코드 설명 입력"
                      value={newCode.groupCodeDesc}
                      onChange={(e) => {
                        setNewCode({ ...newCode, groupCodeDesc: e.target.value });
                        setFormErrorsGroupCode(prevErrors => ({
                          ...prevErrors,
                          groupCodeDesc: undefined,
                        }));
                      }}
                      className={formErrorsGroupCode?.groupCodeDesc ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsGroupCode?.groupCodeDesc && <p className="text-red-500 text-sm">{formErrorsGroupCode.groupCodeDesc}</p>}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsGroupCodeNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={groupCodeNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isGroupCodeEditSheetOpen} onOpenChange={setIsGroupCodeEditSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>그룹코드 수정</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">그룹코드</Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editGroupCode.groupCode}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">그룹코드 설명</Label>
                    <Input
                      id="edit-desc"
                      placeholder="그룹코드 설명 입력"
                      value={editGroupCode.groupCodeDesc}
                      onChange={(e) => {
                        setEditGroupCode({ ...editGroupCode, groupCodeDesc: e.target.value }),
                          setFormErrorsGroupCode(prevErrors => ({
                            ...prevErrors,
                            groupCodeDesc: undefined,
                          }));
                      }}
                    />
                    {formErrorsGroupCode?.groupCodeDesc && <p className="text-red-500 text-sm">{formErrorsGroupCode.groupCodeDesc}</p>}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsGroupCodeEditSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={groupCodeEditClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isCommonCodeSheetOpen} onOpenChange={setIsCommonCodeSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[850px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>
                    공통 코드
                  </SheetTitle>
                </SheetHeader>
                <div className="flex justify-end gap-2 pb-4 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshCommonCode}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    새로고침
                  </Button>
                  <Sheet open={isCommonCodeNewSheetOpen} onOpenChange={setIsCommonCodeNewSheetOpen}>
                    <SheetTrigger asChild>
                      <Button
                        size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        <span>공통코드 추가</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="min-w-[650px] overflow-y-auto">
                      <div className="flex flex-col h-full">
                        <SheetHeader className='pb-4'>
                          <SheetTitle>새 공통코드 추가</SheetTitle>
                        </SheetHeader>
                        <div className="grid gap-4 py-4 border-t">
                          <div className="space-y-2">
                            <Label htmlFor="new-code">그룹코드</Label>
                            <div className="p-2 bg-muted rounded-md">
                              <span className="text-sm">{selectedGroupCode?.groupCode}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-desc">코드</Label>
                            <Input
                              id="new-code"
                              placeholder="코드"
                              value={newCommonCode.code}
                              onChange={(e) => {
                                setNewCommonCode({ ...newCommonCode, code: e.target.value });
                                setFormErrorsCommonCode(prevErrors => ({
                                  ...prevErrors,
                                  code: undefined,
                                }));
                              }}
                            />
                            {formErrorsCommonCode?.code && <p className="text-red-500 text-sm">{formErrorsCommonCode.code}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-desc">코드설명</Label>
                            <Input
                              id="new-desc"
                              placeholder="코드설명"
                              value={newCommonCode.codeDesc}
                              onChange={(e) => {
                                setNewCommonCode({ ...newCommonCode, codeDesc: e.target.value });
                                setFormErrorsCommonCode(prevErrors => ({
                                  ...prevErrors,
                                  codeDesc: undefined,
                                }));
                              }}
                            />
                            {formErrorsCommonCode?.codeDesc && <p className="text-red-500 text-sm">{formErrorsCommonCode.codeDesc}</p>}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6 pb-6">
                          <Button variant="outline" size="sm" onClick={() => setIsCommonCodeNewSheetOpen(false)}>
                            취소
                          </Button>
                          <Button size="sm" onClick={commonCodeNewClick} disabled={isSubmitting}>
                            저장
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="">
                  <DataTable
                    columns={commonCodeColumns}
                    data={paginatedCommonCode}
                  />
                  <TablePagination
                    currentPage={pageCommonCode}
                    totalPages={totalPagesCommonCode}
                    dataLength={(commonCodeData.length || 0)}
                    onPageChange={handlePageChangeCommonCode}
                    pageSize={pageSize}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isCommonCodeEditSheetOpen} onOpenChange={setIsCommonCodeEditSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>공통코드 수정</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">코드</Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editCommonCode.code}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">코드설명</Label>
                    <Input
                      id="edit-desc"
                      placeholder="코드설명"
                      value={editCommonCode.codeDesc}
                      onChange={(e) => {
                        setEditCommonCode({ ...editCommonCode, codeDesc: e.target.value });
                        setFormErrorsCommonCode(prevErrors => ({
                          ...prevErrors,
                          codeDesc: undefined,
                        }));
                      }}
                    />
                    {formErrorsCommonCode?.codeDesc && <p className="text-red-500 text-sm">{formErrorsCommonCode.codeDesc}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">활성화</Label>
                    <div className="mt-2">
                      <Checkbox
                        id="edit-enable"
                        placeholder="활성화"
                        checked={editCommonCode.enable}
                        onCheckedChange={(checked) => {
                          setEditCommonCode({ ...editCommonCode, enable: checked as boolean });
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsCommonCodeEditSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={editCommonCodeClick} disabled={isSubmitting}>
                    저장
                  </Button>
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
            currentPage={pageGroupCode}
            totalPages={totalPages}
            dataLength={(groupCodeData?.length || 0)}
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
