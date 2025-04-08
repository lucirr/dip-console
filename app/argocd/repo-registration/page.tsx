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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { yaml } from '@codemirror/lang-yaml';
import type { ReactNode } from 'react';
import type { CatalogGit } from "@/types/cluster"
import { getCatalogGits, insertCatalogGit, deleteCatalogGit, getCommonCodeByGroupCode } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommonCode } from '@/types/groupcode';
import { getErrorMessage } from '@/lib/utils';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any, index?: number) => ReactNode;
}



export default function ArgoRepoRegistrationPage() {
  const { toast } = useToast()
  const [catalogGitData, setCatalogGitData] = useState<CatalogGit[]>([]);
  const [isCatalogGitNewSheetOpen, setIsCatalogGitNewSheetOpen] = useState(false);
  const [isCatalogGitEditSheetOpen, setIsCatalogGitEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCatalogGit, setPageCatalogGit] = useState(1);
  const [pageCatalogVersion, setPageCatalogVersion] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCatalogGit, setSelectedCatalogGit] = useState<CatalogGit | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsCatalogGit, setFormErrorsCatalogGit] = useState<{
    gitTypeId?: string;
    gitUrl?: string;
    gitUsername?: string;
    gitToken?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeType, setCodeType] = useState<CommonCode[]>([]);

  const [newCode, setNewCode] = useState<CatalogGit>({
    gitUrl: '',
    gitUsername: '',
    gitToken: '',
    gitType: '',
    gitTypeId: '',
  });

  const [editCatalogGit, setEditCatalogGit] = useState<CatalogGit>({
    uid: '',
    gitUrl: '',
    gitUsername: '',
    gitToken: '',
    gitType: '',
    gitTypeId: '',
  });

  const formSchemaCatalogGit = z.object({
    gitTypeId: z.string().min(1, { message: "GIT 유형은 필수 입력 항목입니다." }),
    gitUrl: z.string().min(1, { message: "GIT 주소는 필수 입력 항목입니다." }),
    gitUsername: z.string().min(1, { message: "GIT 사용자는 필수 입력 항목입니다." }),
    gitToken: z.string().min(1, { message: "GIT 토큰은 필수 입력 항목입니다." }),
  });


  const paginatedData = catalogGitData.slice((pageCatalogGit - 1) * pageSize, pageCatalogGit * pageSize);
  const totalPages = Math.ceil(catalogGitData.length / pageSize);

  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageCatalogGit - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'gitTypeId', title: 'GIT 유형', align: 'left' },
    { key: 'gitUrl', title: 'GIT 주소', align: 'left' },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: CatalogGit) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => catalogGitEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              보기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => catalogGitDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const fetchCatalogGits = async () => {
    setIsLoading(true);
    try {
      const response = await getCatalogGits()
      setCatalogGitData(response);
    } catch (error) {
      setCatalogGitData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommonCode = async (groupCode: string) => {
    setIsLoading(true);
    try {
      const response = await getCommonCodeByGroupCode(groupCode)
      setCodeType(response);
    } catch (error) {
      setCodeType([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogGits();
    fetchCommonCode('service_type');
  }, []);

  useEffect(() => {
    setFormErrorsCatalogGit(null);
  }, [isCatalogGitNewSheetOpen]);

  const handleRefresh = () => {
    fetchCatalogGits();
  };

  const catalogGitNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsCatalogGit(null);

    const validationResult = formSchemaCatalogGit.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'gitTypeId' || field === 'gitUrl' || field === 'gitUsername' || field === 'gitToken') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsCatalogGit(errors);
      return;
    }
    setConfirmAction(() => newCatalogGitSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newCatalogGitSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertCatalogGit(newCode);
      toast({
        title: "Success",
        description: "Repo가 성공적으로 추가되었습니다.",
      })
      setNewCode({
        gitUrl: '',
        gitUsername: '',
        gitToken: '',
        gitType: '',
        gitTypeId: '',
      });
      setIsCatalogGitNewSheetOpen(false);
      fetchCatalogGits();
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



  const catalogGitEditSheetClick = (row: CatalogGit) => {
    setSelectedCatalogGit(row);
    setEditCatalogGit({
      uid: row.uid,
      gitUrl: '',
      gitUsername: '',
      gitToken: '',
      gitType: '',
      gitTypeId: '',
    });
    setFormErrorsCatalogGit(null);
    setIsCatalogGitEditSheetOpen(true);
  };

  const catalogGitDeleteClick = (row: CatalogGit) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => catalogGitDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const catalogGitDeleteSubmit = async (row: CatalogGit) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteCatalogGit(row);
      toast({
        title: "Success",
        description: "Repo가 성공적으로 삭제되었습니다.",
      })
      fetchCatalogGits();
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
    setPageCatalogGit(newPage);
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Repo 등록</h2>
            <p className="mt-1 text-sm text-gray-500">ArgoCD에 Repo를 등록할 수 있습니다.</p>
          </div>
          <Sheet open={isCatalogGitNewSheetOpen} onOpenChange={setIsCatalogGitNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Repo 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 Repo 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="catalog-service-type" className="flex items-center">
                      GIT 유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCode.gitTypeId}
                      onValueChange={(value) => {
                        setNewCode({ ...newCode, gitTypeId: value });
                        setFormErrorsCatalogGit(prevErrors => ({
                          ...prevErrors,
                          gitTypeId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="catalog-service-type"
                        className={formErrorsCatalogGit?.gitTypeId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="GIT유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {codeType.map((item) => (
                          <SelectItem key={item.uid || ''} value={item.uid || ''}>
                            {item.codeDesc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsCatalogGit?.gitTypeId && <p className="text-red-500 text-sm">{formErrorsCatalogGit.gitTypeId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-code" className="flex items-center">
                      GIT 주소 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="new-code"
                      placeholder="GIT 주소 입력"
                      value={newCode.gitUrl}
                      onChange={(e) => {
                        setNewCode({ ...newCode, gitUrl: e.target.value });
                        setFormErrorsCatalogGit(prevErrors => ({
                          ...prevErrors,
                          gitUrl: undefined,
                        }));
                      }}
                      className={formErrorsCatalogGit?.gitUrl ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsCatalogGit?.gitUrl && <p className="text-red-500 text-sm">{formErrorsCatalogGit.gitUrl}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-code" className="flex items-center">
                      GIT 사용자 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="new-code"
                      placeholder="GIT 사용자 입력"
                      value={newCode.gitUsername}
                      onChange={(e) => {
                        setNewCode({ ...newCode, gitUsername: e.target.value });
                        setFormErrorsCatalogGit(prevErrors => ({
                          ...prevErrors,
                          gitUsername: undefined,
                        }));
                      }}
                      className={formErrorsCatalogGit?.gitUsername ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsCatalogGit?.gitUsername && <p className="text-red-500 text-sm">{formErrorsCatalogGit.gitUsername}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-code" className="flex items-center">
                      GIT 토큰 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="new-code"
                      placeholder="GIT 토큰 입력"
                      value={newCode.gitToken}
                      onChange={(e) => {
                        setNewCode({ ...newCode, gitToken: e.target.value });
                        setFormErrorsCatalogGit(prevErrors => ({
                          ...prevErrors,
                          gitToken: undefined,
                        }));
                      }}
                      className={formErrorsCatalogGit?.gitToken ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsCatalogGit?.gitToken && <p className="text-red-500 text-sm">{formErrorsCatalogGit.gitToken}</p>}
                  </div>

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsCatalogGitNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={catalogGitNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>

              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isCatalogGitEditSheetOpen} onOpenChange={setIsCatalogGitEditSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>Repo 세부 정보</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-type" className="flex items-center">
                      GIT 유형
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editCatalogGit.gitType}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-type" className="flex items-center">
                      GIT 주소
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editCatalogGit.gitUrl}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-type" className="flex items-center">
                      GIT 사용자
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editCatalogGit.gitUsername}</span>
                    </div>
                  </div>

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsCatalogGitEditSheetOpen(false)}>
                    취소
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
            currentPage={pageCatalogGit}
            totalPages={totalPages}
            dataLength={catalogGitData.length}
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
