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
import type { CatalogType, CatalogVersion } from "@/types/catalogtype"
import { getCatalogType, insertCatalogType, updateCatalogType, deleteCatalogType, getCatalogVersion, deleteCatalogVersion, insertCatalogVersion, updateCatalogVersion, getCommonCodeByGroupCode } from "@/lib/actions"
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



export default function SysCatalogTypesPage() {
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
  const [formErrorsCatalogType, setFormErrorsCatalogType] = useState<{
    catalogType?: string;
    catalogServiceTypeId?: string;
    argoDeployType?: string;
  } | null>(null);
  const [formErrorsCatalogVersion, setFormErrorsCatalogVersion] = useState<{ catalogTypeId?: string; catalogVersion?: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeType, setCodeType] = useState<CommonCode[]>([]);

  const [newCode, setNewCode] = useState<CatalogType>({
    catalogType: '',
    serviceType: '',
    catalogServiceTypeId: '',
    argoDeployType: '',
    catalogImage: '<p style="text-align:center"><img src=""   width="80px" height="80px"></p>',
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
    catalogServiceTypeId: z.string().min(1, { message: "카탈로그 배포유형은 필수 입력 항목입니다." }),
    argoDeployType: z.string().min(1, { message: "Argo 배포유형은 필수 입력 항목입니다." }),
  });

  const formSchemaCatalogVersion = z.object({
    catalogVersion: z.string().min(1, { message: "카탈로그 버전은 필수 입력 항목입니다." }),
  });

  const paginatedData = catalogTypeData?.slice((pageCatalogType - 1) * pageSize, pageCatalogType * pageSize) || [];
  const totalPages = Math.ceil((catalogTypeData?.length || 0) / pageSize);

  const paginatedCatalogVersion = catalogVersionData?.slice((pageCatalogVersion - 1) * pageSize, pageCatalogVersion * pageSize) || [];
  const totalPagesCatalogVersion = Math.ceil((catalogVersionData?.length || 0) / pageSize);

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
            {row.enable == false && (
              <DropdownMenuItem onClick={() => catalogTypeDeleteClick(row)}>
                <Code className="h-4 w-4 mr-2" />
                삭제
              </DropdownMenuItem>
            )}
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
    { key: 'catalogType', title: '카탈로그', align: 'left' },
    { key: 'catalogVersion', title: '카탈로그 버전', align: 'left' },
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
    fetchCommonCode('service_type');
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
        // 필수 입력 필드 검증
        if (field === 'catalogType' || field === 'catalogServiceTypeId' || field === 'argoDeployType') {
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
        catalogImage: '<p style="text-align:center"><img src=""   width="80px" height="80px"></p>',
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
        description: getErrorMessage(error),
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
        if (error.path[0] === 'catalogVersion') {
          errors.catalogVersion = error.message;
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
        newCatalogVersion.catalogType = selectedCatalogType.catalogType
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
        description: getErrorMessage(error),
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
        // 필수 입력 필드 검증
        if (field === 'catalogType' || field === 'serviceType' || field === 'argoDeployType') {
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
        description: getErrorMessage(error),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const catalogTypeDeleteClick = (row: CatalogType) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => catalogTypeSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const catalogTypeSubmit = async (row: CatalogType) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteCatalogType(row);
      toast({
        title: "Success",
        description: "카탈로그 유형이 성공적으로 삭제되었습니다.",
      })
      fetchCatalogTypes();
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

  const editCatalogVersionClick = () => {
    if (isSubmitting) return;

    setFormErrorsCatalogVersion(null);

    const validationResult = formSchemaCatalogVersion.safeParse(editCatalogVersion);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        if (field === 'catalogTypeId' || field === 'catalogVersion') {
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
        description: getErrorMessage(error),
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
        description: getErrorMessage(error),
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
        <div className="flex items-center justify-between px-6 py-4 pt-0">
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
                    <Label htmlFor="new-code" className="flex items-center">
                      카탈로그 유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="new-code"
                      placeholder="카탈로그 유형 입력"
                      value={newCode.catalogType}
                      onChange={(e) => {
                        setNewCode({ ...newCode, catalogType: e.target.value });
                        setFormErrorsCatalogType(prevErrors => ({
                          ...prevErrors,
                          catalogType: undefined,
                        }));
                      }}
                      className={formErrorsCatalogType?.catalogType ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsCatalogType?.catalogType && <p className="text-red-500 text-sm">{formErrorsCatalogType.catalogType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catalog-service-type" className="flex items-center">
                      카탈로그 배포유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCode.catalogServiceTypeId}
                      onValueChange={(value) => {
                        setNewCode({ ...newCode, catalogServiceTypeId: value });
                        setFormErrorsCatalogType(prevErrors => ({
                          ...prevErrors,
                          catalogServiceTypeId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="catalog-service-type"
                        className={formErrorsCatalogType?.catalogServiceTypeId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="배포유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {codeType.map((item) => (
                          <SelectItem key={item.uid || ''} value={item.uid || ''}>
                            {item.codeDesc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsCatalogType?.catalogServiceTypeId && <p className="text-red-500 text-sm">{formErrorsCatalogType.catalogServiceTypeId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="argo-deploy-type" className="flex items-center">
                      Argo 배포유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCode.argoDeployType}
                      onValueChange={(value) => {
                        setNewCode({ ...newCode, argoDeployType: value });
                        setFormErrorsCatalogType(prevErrors => ({
                          ...prevErrors,
                          argoDeployType: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="argo-deploy-type"
                        className={formErrorsCatalogType?.argoDeployType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="배포 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="helm">Helm</SelectItem>
                        <SelectItem value="kustomize">Kustomize</SelectItem>
                        <SelectItem value="directory">Directory</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrorsCatalogType?.argoDeployType && <p className="text-red-500 text-sm">{formErrorsCatalogType.argoDeployType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catalog-image">카탈로그 이미지</Label>
                    <Textarea
                      id="catalog-image"
                      placeholder="이미지 URL 입력"
                      value={newCode.catalogImage}
                      onChange={(e) => setNewCode(prev => ({ ...prev, catalogImage: e.target.value }))}
                      className="min-h-[100px] resize-y"
                      aria-describedby="catalog-image-description"
                    />

                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="values-yaml">Values YAML</Label>
                    <div className="border rounded-md overflow-hidden">
                      <CodeMirror
                        value={newCode.valuesYaml}
                        height="200px"
                        extensions={[yaml(), javascript({ jsx: true })]}
                        onChange={(value) => setNewCode({ ...newCode, valuesYaml: value })}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catalog-desc">카탈로그 설명</Label>
                    <Textarea
                      id="catalog-desc"
                      placeholder="카탈로그 설명 입력"
                      value={newCode.catalogDesc || ''}
                      onChange={(e) => setNewCode(prev => ({
                        ...prev,
                        catalogDesc: e.target.value
                      }))}
                      rows={4}
                      className="resize-vertical"
                      maxLength={500}
                      aria-describedby="catalog-desc-description"
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enable"
                        checked={newCode.enable}
                        onCheckedChange={(checked) =>
                          setNewCode({ ...newCode, enable: checked as boolean })
                        }
                      />
                      <Label htmlFor="enable">활성화</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-admin"
                        checked={newCode.isAdmin}
                        onCheckedChange={(checked) =>
                          setNewCode({ ...newCode, isAdmin: checked as boolean })
                        }
                      />
                      <Label htmlFor="is-admin">관리자 배포</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-cluster-only"
                        checked={newCode.isClusterOnly}
                        onCheckedChange={(checked) =>
                          setNewCode({ ...newCode, isClusterOnly: checked as boolean })
                        }
                      />
                      <Label htmlFor="is-cluster-only">클러스터 단독 배포</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is-tenant"
                        checked={newCode.isTenant}
                        onCheckedChange={(checked) =>
                          setNewCode({ ...newCode, isTenant: checked as boolean })
                        }
                      />
                      <Label htmlFor="is-tenant">테넌트 사용</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="keycloak-use"
                        checked={newCode.keycloakUse}
                        onCheckedChange={(checked) =>
                          setNewCode({ ...newCode, keycloakUse: checked as boolean })
                        }
                      />
                      <Label htmlFor="keycloak-use">Keycloak 사용</Label>
                    </div>


                  </div>

                  {newCode.keycloakUse && (
                    <div className="space-y-2">
                      <Label htmlFor="keycloak-uri">Keycloak Redirect URIs</Label>
                      <Input
                        id="keycloak-uri"
                        placeholder="Keycloak URI 입력"
                        value={newCode.keycloakRedirectUris || ''}
                        onChange={(e) => setNewCode(prev => ({
                          ...prev,
                          keycloakRedirectUris: e.target.value
                        }))}
                        aria-describedby="keycloak-uri-description"
                      />

                    </div>
                  )}

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
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
                    <Label htmlFor="edit-catalog-type" className="flex items-center">
                      카탈로그 유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editCatalogType.catalogType}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-service-type" className="flex items-center">
                      카탈로그 배포유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={editCatalogType.catalogServiceTypeId}
                      onValueChange={(value) => {
                        setEditCatalogType(prev => ({ ...prev, catalogServiceTypeId: value }));
                        setFormErrorsCatalogType(prevErrors => ({
                          ...prevErrors,
                          catalogServiceTypeId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="edit-catalog-service-type"
                        className={formErrorsCatalogType?.catalogServiceTypeId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="배포유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {codeType.map((item) => (
                          <SelectItem key={item.uid || ''} value={item.uid || ''}>
                            {item.codeDesc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsCatalogType?.catalogServiceTypeId && <p className="text-red-500 text-sm">{formErrorsCatalogType.catalogServiceTypeId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-argo-deploy-type" className="flex items-center">
                      Argo 배포유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={editCatalogType.argoDeployType}
                      onValueChange={(value) => {
                        setEditCatalogType(prev => ({ ...prev, argoDeployType: value }));
                        setFormErrorsCatalogType(prevErrors => ({
                          ...prevErrors,
                          argoDeployType: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="edit-argo-deploy-type"
                        className={formErrorsCatalogType?.argoDeployType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="배포 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="helm">Helm</SelectItem>
                        <SelectItem value="kustomize">Kustomize</SelectItem>
                        <SelectItem value="directory">Directory</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrorsCatalogType?.argoDeployType && <p className="text-red-500 text-sm">{formErrorsCatalogType.argoDeployType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-image">카탈로그 이미지</Label>
                    <Textarea
                      id="edit-catalog-image"
                      placeholder="이미지 URL 입력"
                      value={editCatalogType.catalogImage}
                      onChange={(e) => setEditCatalogType(prev => ({ ...prev, catalogImage: e.target.value }))}
                      className="min-h-[100px] resize-y"
                      aria-describedby="edit-catalog-image-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="values-yaml">Values YAML</Label>
                    <div className="border rounded-md overflow-hidden">
                      <CodeMirror
                        value={editCatalogType.valuesYaml}
                        height="200px"
                        extensions={[yaml(), javascript({ jsx: true })]}
                        onChange={(value) => setEditCatalogType(prev => ({ ...prev, valuesYaml: value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-desc">카탈로그 설명</Label>
                    <Textarea
                      id="edit-catalog-desc"
                      placeholder="카탈로그 설명 입력"
                      value={editCatalogType.catalogDesc || ''}
                      onChange={(e) => setEditCatalogType(prev => ({
                        ...prev,
                        catalogDesc: e.target.value
                      }))}
                      rows={4}
                      className="resize-vertical"
                      maxLength={500}
                      aria-describedby="edit-catalog-desc-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enable"
                          checked={editCatalogType.enable}
                          onCheckedChange={(checked) =>
                            setEditCatalogType(prev => ({
                              ...prev,
                              enable: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="enable">활성화</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-is-admin"
                          checked={editCatalogType.isAdmin}
                          onCheckedChange={(checked) =>
                            setEditCatalogType(prev => ({
                              ...prev,
                              isAdmin: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="edit-is-admin">관리자 배포</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-is-cluster-only"
                          checked={editCatalogType.isClusterOnly}
                          onCheckedChange={(checked) =>
                            setEditCatalogType(prev => ({
                              ...prev,
                              isClusterOnly: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="edit-is-cluster-only">클러스터 단독 배포</Label>
                      </div>



                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-is-tenant"
                          checked={editCatalogType.isTenant}
                          onCheckedChange={(checked) =>
                            setEditCatalogType(prev => ({
                              ...prev,
                              isTenant: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="edit-is-tenant">테넌트 사용</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-keycloak-use"
                          checked={editCatalogType.keycloakUse}
                          onCheckedChange={(checked) =>
                            setEditCatalogType(prev => ({
                              ...prev,
                              keycloakUse: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="edit-keycloak-use">Keycloak 사용</Label>
                      </div>
                    </div>
                  </div>

                  {editCatalogType.keycloakUse && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-keycloak-redirect-uris">Keycloak Redirect URIs</Label>
                      <Input
                        id="edit-keycloak-redirect-uris"
                        placeholder="Redirect URIs 입력"
                        value={editCatalogType.keycloakRedirectUris || ''}
                        onChange={(e) => setEditCatalogType(prev => ({ ...prev, keycloakRedirectUris: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
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
                            <Label htmlFor="new-catalog-type">카탈로그 유형</Label>
                            <div className="p-2 bg-muted rounded-md">
                              <span className="text-sm">{selectedCatalogType?.catalogType}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-catalog-version" className="flex items-center">
                              카탈로그 버전 <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                              id="new-catalog-version"
                              placeholder="카탈로그 버전 입력"
                              value={newCatalogVersion.catalogVersion}
                              onChange={(e) => {
                                setNewCatalogVersion({ ...newCatalogVersion, catalogVersion: e.target.value });
                                setFormErrorsCatalogVersion(prevErrors => ({
                                  ...prevErrors,
                                  catalogVersion: undefined,
                                }));
                              }}
                              className={formErrorsCatalogVersion?.catalogVersion ? "border-red-500" : ""}
                              required
                            />
                            {formErrorsCatalogVersion?.catalogVersion && <p className="text-red-500 text-sm">{formErrorsCatalogVersion.catalogVersion}</p>}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6 pb-6">
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
                    dataLength={(catalogVersionData?.length || 0)}
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
                    <Label htmlFor="edit-catalog-type">카탈로그 유형</Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{selectedCatalogType?.catalogType}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-version" className="flex items-center">
                      카탈로그 버전 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-catalog-version"
                      placeholder="카탈로그 버전 입력"
                      value={editCatalogVersion.catalogVersion}
                      onChange={(e) => {
                        setEditCatalogVersion({ ...editCatalogVersion, catalogVersion: e.target.value });
                        setFormErrorsCatalogVersion(prevErrors => ({
                          ...prevErrors,
                          catalogVersion: undefined,
                        }));
                      }}
                      className={formErrorsCatalogVersion?.catalogVersion ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsCatalogVersion?.catalogVersion && <p className="text-red-500 text-sm">{formErrorsCatalogVersion.catalogVersion}</p>}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
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
            dataLength={(catalogTypeData?.length || 0)}
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
