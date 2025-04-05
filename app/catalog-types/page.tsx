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
import type { CatalogType, CatalogVersion } from "@/types/catalogtype"
import { getCatalogType, insertCatalogType, updateCatalogType, getCatalogVersion, deleteCatalogVersion, insertCatalogVersion, updateCatalogVersion } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any, index?: number) => ReactNode;
}



export default function CatalogTypesPage() {
  const { toast } = useToast()
  const [catalogTypeData, setCatalogTypeData] = useState<CatalogType[]>([]);
  const [catalogVersionData, setCatalogVersionData] = useState<CatalogVersion[]>([]);
  const [isCatalogTypeNewSheetOpen, setIsCatalogTypeNewSheetOpen] = useState(false);
  const [isCatalogTypeEditSheetOpen, setIsCatalogTypeEditSheetOpen] = useState(false);
  const [isCatalogVersionSheetOpen, setIsCatalogVersionSheetOpen] = useState(false);
  const [isCatalogVersionNewSheetOpen, setIsCatalogVersionNewSheetOpen] = useState(false);
  const [isCatalogVersionEditSheetOpen, setIsCatalogVersionEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCatalogType, setPageCatalogType] = useState(1);
  const [pageCatalogVersion, setPageCatalogVersion] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCatalogType, setSelectedCatalogType] = useState<CatalogType | null>(null);
  const [selectedCatalogVersion, setSelectedCatalogVersion] = useState<CatalogVersion | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsCatalogType, setFormErrorsCatalogType] = useState<{ catalogType?: string; catalogTypeDesc?: string } | null>(null);
  const [formErrorsCatalogVersion, setFormErrorsCatalogVersion] = useState<{ code?: string; codeDesc?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCode, setNewCode] = useState<CatalogType>({
    catalogType: '',
    serviceType: '',
    catalogServiceTypeId: '',
    argoDeployType: '',
    catalogImage: '',
    enable: true,
    isClusterOnly: false,
    isTenant: false,
    keycloakUse: false,
    keycloakRedirectUris: '',
    valuesYaml: '',
    isAdmin: false,
    catalogDesc: '',
  });

  const [editCatalogType, setEditCatalogType] = useState<CatalogType>({
    uid: '',
    catalogType: '',
    serviceType: '',
    catalogServiceTypeId: '',
    argoDeployType: '',
    catalogImage: '',
    enable: true,
    isClusterOnly: false,
    isTenant: false,
    keycloakUse: false,
    keycloakRedirectUris: '',
    valuesYaml: '',
    isAdmin: false,
    catalogDesc: '',
  });

  const [newCatalogVersion, setNewCatalogVersion] = useState<CatalogVersion>({
    uid: '',
    catalogType: '',
    catalogVersion: '',
    catalogTypeId: '',
  });

  const [editCatalogVersion, setEditCatalogVersion] = useState<CatalogVersion>({
    uid: '',
    catalogType: '',
    catalogVersion: '',
    catalogTypeId: '',
  });

  const formSchemaCatalogType = z.object({
    catalogType: z.string().min(1, { message: "카탈로그 유형은 필수 입력 항목입니다." }),
    serviceType: z.string().min(1, { message: "카탈로그 배포유형은 필수 입력 항목입니다." }),
    argoDeployType: z.string().min(1, { message: "Argo 배포유형은 필수 입력 항목입니다." }),
  });

  const formSchemaCatalogVersion = z.object({
    catalogTypeId: z.string().min(1, { message: "카탈로그는 필수 입력 항목입니다." }),
    catalogVersion: z.string().min(1, { message: "카탈로그 버전은 필수 입력 항목입니다." }),
  });

  const paginatedData = catalogTypeData.slice((pageCatalogType - 1) * pageSize, pageCatalogType * pageSize);
  const totalPages = Math.ceil(catalogTypeData.length / pageSize);

  const paginatedCatalogVersion = catalogVersionData.slice((pageCatalogVersion - 1) * pageSize, pageCatalogVersion * pageSize);
  const totalPagesCatalogVersion = Math.ceil(catalogVersionData.length / pageSize);

  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageCatalogType - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'catalogType', title: '카탈로그 유형', align: 'left' },
    {
      key: 'isTenant', title: '테넌트 여부', align: 'left',
      cell: (row: CatalogType) => (
        <div className="flex justify-left">
          {row.isTenant && <Check className="h-4 w-4 text-green-500" />}
        </div>
      )
    },
    {
      key: 'keycloakUse', title: 'Keycloak 연계', align: 'left',
      cell: (row: CatalogType) => (
        <div className="flex justify-left">
          {row.keycloakUse && <Check className="h-4 w-4 text-green-500" />}
        </div>
      )
    },
    {
      key: 'enable', title: '활성화', align: 'left',
      cell: (row: CatalogType) => (
        <div className="flex justify-left">
          {row.enable && <Check className="h-4 w-4 text-green-500" />}
        </div>
      )
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: CatalogType) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => catalogTypeEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => catalogVersionSheetClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              버전
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const catalogVersionColumns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedCatalogVersion.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageCatalogVersion - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'catalogType', title: '그룹코드', align: 'left' },
    { key: 'code', title: '코드', align: 'left' },
    { key: 'codeDesc', title: '코드설명', align: 'left' },
    {
      key: 'enable',
      title: '활성화',
      width: 'w-[100px]',
      align: 'left',
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: CatalogVersion) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => catalogVersionEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => catalogVersionDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const fetchCatalogTypes = async () => {
    setIsLoading(true);
    try {
      const response = await getCatalogType()
      setCatalogTypeData(response);
    } catch (error) {
      setCatalogTypeData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalogVersions = async () => {
    setIsLoading(true);
    try {
      if (selectedCatalogType?.uid) {
        const response = await getCatalogVersion(selectedCatalogType.uid);

        const enhancedResponse = response.map(item => ({
          ...item,
          catalogType: selectedCatalogType.catalogType
        }));

        setCatalogVersionData(enhancedResponse);
      } else {
        setCatalogVersionData([]);
      }
    } catch (error) {
      console.error('Error fetching common codes:', error);
      setCatalogVersionData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalogTypes();
  }, []);


  useEffect(() => {
    if (selectedCatalogType && isCatalogVersionSheetOpen) {
      fetchCatalogVersions();
    }
  }, [selectedCatalogType, isCatalogVersionSheetOpen]);

  useEffect(() => {
    setFormErrorsCatalogType(null);
  }, [isCatalogTypeNewSheetOpen]);

  useEffect(() => {
    setFormErrorsCatalogVersion(null);
  }, [isCatalogVersionNewSheetOpen]);

  const handleRefresh = () => {
    fetchCatalogTypes();
  };

  const handleRefreshCatalogVersion = () => {
    fetchCatalogVersions();
  };

  const catalogTypeNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsCatalogType(null);

    const validationResult = formSchemaCatalogType.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        if (field === 'catalogType' || field === 'catalogTypeDesc') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsCatalogType(errors);
      return;
    }
    setConfirmAction(() => newCatalogTypeSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newCatalogTypeSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertCatalogType(newCode);
      toast({
        title: "Success",
        description: "카탈로그 유형이 성공적으로 추가되었습니다.",
      })
      setNewCode({
        catalogType: '',
        serviceType: '',
        catalogServiceTypeId: '',
        argoDeployType: '',
        catalogImage: '',
        enable: true,
        isClusterOnly: false,
        isTenant: false,
        keycloakUse: false,
        keycloakRedirectUris: '',
        valuesYaml: '',
        isAdmin: false,
        catalogDesc: '',
      });
      setIsCatalogTypeNewSheetOpen(false);
      fetchCatalogTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "카탈로그 유형 추가에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const catalogVersionNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsCatalogVersion(null);

    const validationResult = formSchemaCatalogVersion.safeParse(newCatalogVersion);

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
      setFormErrorsCatalogVersion(errors);
      return;
    }
    setConfirmAction(() => newCatalogVersionSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newCatalogVersionSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (selectedCatalogType?.uid) {
        newCatalogVersion.catalogTypeId = selectedCatalogType.uid;
        await insertCatalogVersion(newCatalogVersion);
        toast({
          title: "Success",
          description: "카탈로그 버전이 성공적으로 추가되었습니다.",
        })
        setNewCatalogVersion({
          uid: '',
          catalogType: '',
          catalogVersion: '',
          catalogTypeId: '',
        });
        setIsCatalogVersionNewSheetOpen(false);
        fetchCatalogVersions();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "카탈로그 버전 추가에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const catalogTypeEditSheetClick = (row: CatalogType) => {
    setSelectedCatalogType(row);
    setEditCatalogType({
      uid: row.uid,
      catalogType: row.catalogType,
      serviceType: row.serviceType,
      catalogServiceTypeId: row.catalogServiceTypeId,
      argoDeployType: row.argoDeployType,
      catalogImage: row.catalogImage,
      enable: row.enable,
      isClusterOnly: row.isClusterOnly,
      isTenant: row.isTenant,
      keycloakUse: row.keycloakUse,
      keycloakRedirectUris: row.keycloakRedirectUris,
      valuesYaml: row.valuesYaml,
      isAdmin: row.isAdmin,
      catalogDesc: row.catalogDesc,
    });
    setFormErrorsCatalogType(null);
    setIsCatalogTypeEditSheetOpen(true);
  };

  const catalogTypeEditClick = () => {
    if (isSubmitting) return;

    setFormErrorsCatalogType(null);

    const validationResult = formSchemaCatalogType.safeParse(editCatalogType);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        if (field === 'catalogTypeDesc') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsCatalogType(errors);
      return;
    }
    setConfirmAction(() => catalogTypeEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const catalogTypeEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateCatalogType(editCatalogType);
      toast({
        title: "Success",
        description: "카탈로그 유형이 성공적으로 수정되었습니다.",
      })
      setIsCatalogTypeEditSheetOpen(false);
      fetchCatalogTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "카탈로그 유형 수정에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const editCatalogVersionClick = () => {
    if (isSubmitting) return;

    setFormErrorsCatalogVersion(null);

    const validationResult = formSchemaCatalogVersion.safeParse(editCatalogVersion);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        if (field === 'codeDesc') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsCatalogVersion(errors);
      return;
    }
    setConfirmAction(() => catalogVersionEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const catalogVersionEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateCatalogVersion(editCatalogVersion);
      toast({
        title: "Success",
        description: "카탈로그 버전이 성공적으로 수정되었습니다.",
      })
      setIsCatalogVersionEditSheetOpen(false);
      fetchCatalogVersions();
    } catch (error) {
      toast({
        title: "Error",
        description: "카탈로그 버전 수정에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const catalogVersionEditSheetClick = (row: CatalogVersion) => {
    setSelectedCatalogVersion(row);
    setEditCatalogVersion({
      uid: row.uid,
      catalogType: row.catalogType,
      catalogVersion: row.catalogVersion,
      catalogTypeId: row.catalogTypeId,
    });
    setIsCatalogVersionEditSheetOpen(true);
    setFormErrorsCatalogVersion(null);
  };

  const catalogVersionDeleteClick = (row: CatalogVersion) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => catalogVersionDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const catalogVersionDeleteSubmit = async (row: CatalogVersion) => {
    console.log(isSubmitting)
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteCatalogVersion(row);
      toast({
        title: "Success",
        description: "카탈로그 버전이 성공적으로 삭제되었습니다.",
      })
      fetchCatalogVersions();
    } catch (error) {
      toast({
        title: "Error",
        description: "카탈로그 버전 삭제에 실패했습니다.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const catalogVersionSheetClick = (row: CatalogType) => {
    setSelectedCatalogType(row);
    setIsCatalogVersionSheetOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPageCatalogType(newPage);
  };

  const handlePageChangeCatalogVersion = (newPage: number) => {
    setPageCatalogVersion(newPage);
  };


  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">카탈로그 유형</h2>
            <p className="mt-1 text-sm text-gray-500">카탈로그 유형을 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isCatalogTypeNewSheetOpen} onOpenChange={setIsCatalogTypeNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                카탈로그 유형 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 카탈로그 유형 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="new-code">카탈로그 유형</Label>
                    <Input
                      id="new-code"
                      placeholder="그룹코드 입력"
                      value={newCode.catalogType}
                      onChange={(e) => {
                        setNewCode({ ...newCode, catalogType: e.target.value });
                        setFormErrorsCatalogType(prevErrors => ({
                          ...prevErrors,
                          catalogType: undefined,
                        }));
                      }}
                    />
                    {formErrorsCatalogType?.catalogType && <p className="text-red-500 text-sm">{formErrorsCatalogType.catalogType}</p>}
                  </div>

                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" size="sm" onClick={() => setIsCatalogTypeNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={catalogTypeNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isCatalogTypeEditSheetOpen} onOpenChange={setIsCatalogTypeEditSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>카탈로그 유형 수정</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">그룹코드</Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editCatalogType.catalogType}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">그룹코드 설명</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" size="sm" onClick={() => setIsCatalogTypeEditSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={catalogTypeEditClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isCatalogVersionSheetOpen} onOpenChange={setIsCatalogVersionSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[850px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>
                    카탈로그 버전
                  </SheetTitle>
                </SheetHeader>
                <div className="flex justify-end gap-2 pb-4 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshCatalogVersion}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    새로고침
                  </Button>
                  <Sheet open={isCatalogVersionNewSheetOpen} onOpenChange={setIsCatalogVersionNewSheetOpen}>
                    <SheetTrigger asChild>
                      <Button
                        size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        <span>카탈로그 버전 추가</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="min-w-[650px] overflow-y-auto">
                      <div className="flex flex-col h-full">
                        <SheetHeader className='pb-4'>
                          <SheetTitle>새 카탈로그 버전 추가</SheetTitle>
                        </SheetHeader>
                        <div className="grid gap-4 py-4 border-t">
                          <div className="space-y-2">
                            <Label htmlFor="new-code">그룹코드</Label>
                            <div className="p-2 bg-muted rounded-md">
                              <span className="text-sm">{selectedCatalogType?.catalogType}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-desc">코드</Label>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-desc">코드설명</Label>

                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" size="sm" onClick={() => setIsCatalogVersionNewSheetOpen(false)}>
                            취소
                          </Button>
                          <Button size="sm" onClick={catalogVersionNewClick} disabled={isSubmitting}>
                            저장
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="">
                  <DataTable
                    columns={catalogVersionColumns}
                    data={paginatedCatalogVersion}
                  />
                  <TablePagination
                    currentPage={pageCatalogVersion}
                    totalPages={totalPagesCatalogVersion}
                    dataLength={catalogVersionData.length}
                    onPageChange={handlePageChangeCatalogVersion}
                    pageSize={pageSize}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isCatalogVersionEditSheetOpen} onOpenChange={setIsCatalogVersionEditSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>카탈로그 버전 수정</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">코드</Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm"> </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">코드설명</Label>

                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">활성화</Label>
                    <div className="mt-2">

                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" size="sm" onClick={() => setIsCatalogVersionEditSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={editCatalogVersionClick} disabled={isSubmitting}>
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
            currentPage={pageCatalogType}
            totalPages={totalPages}
            dataLength={catalogTypeData.length}
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
