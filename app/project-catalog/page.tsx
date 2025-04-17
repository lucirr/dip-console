'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Code, MoreVertical, Check, RefreshCw, LinkIcon, RotateCcw, Search } from 'lucide-react';
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
import type { CatalogDeploy } from "@/types/catalogdeploy"
import { getProjectClusterCatalogDeploy, updateProjectCatalogDeploy, deleteProjectCatalogDeploy, getClusters, getCatalogType, getProjects, getCommonCodeByGroupCode } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommonCode } from '@/types/groupcode';
import { getErrorMessage, codeMirrorStyles } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/badgestatus';
import { Cluster } from '@/types/cluster';
import { Project } from '@/types/project';
import { CatalogType } from '@/types/catalogtype';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any, index?: number) => ReactNode;
}



export default function ProjectCatalogPage() {
  const { toast } = useToast()
  const [catalogDeployData, setCatalogDeployData] = useState<CatalogDeploy[]>([]);
  const [isCatalogDeployNewSheetOpen, setIsCatalogDeployNewSheetOpen] = useState(false);
  const [isCatalogDeployEditSheetOpen, setIsCatalogDeployEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCatalogDeploy, setPageCatalogDeploy] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCatalogDeploy, setSelectedCatalogDeploy] = useState<CatalogDeploy | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsCatalogDeploy, setFormErrorsCatalogDeploy] = useState<{
    valuesYaml?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editCatalogDeploy, setEditCatalogDeploy] = useState<CatalogDeploy>({
    uid: '',
    name: '',
    valuesYaml: '',
    catalogType: '',
  });

  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCatalogType, setSelectedCatalogType] = useState<string>('');

  const [clusterOptions, setClusterOptions] = useState<Cluster[]>([]);
  const [projectOptions, setProjectOptions] = useState<Project[]>([]);
  const [catalogTypeOptions, setCatalogTypeOptions] = useState<CatalogType[]>([]);

  const [codeType, setCodeType] = useState<CommonCode[]>([]);

  const formSchemaCatalogDeploy = z.object({
    valuesYaml: z.string().min(1, { message: "설정값은 필수 입력 항목입니다." }),
  });

  const paginatedData = catalogDeployData?.slice((pageCatalogDeploy - 1) * pageSize, pageCatalogDeploy * pageSize) || [];
  const totalPages = Math.ceil((catalogDeployData?.length || 0) / pageSize);


  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageCatalogDeploy - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'clusterName', title: '클러스터', align: 'left' },
    { key: 'clusterProjectName', title: '프로젝트', align: 'left' },
    { key: 'catalogType', title: '카탈로그 유형', align: 'left' },
    { key: 'catalogVersion', title: '카탈로그 버전', align: 'left' },
    { key: 'catalogName', title: '카탈로그 이름', align: 'left' },
    {
      key: 'status', title: '배포 상태', align: 'left',
      cell: (row: any) => (
        <StatusBadge status={row.status} />
      )
    },
    {
      key: 'syncStatus', title: '서비스 상태', align: 'left',
      cell: (row: any) => (
        <StatusBadge status={row.syncStatus} />
      )
    },
    // {
    //   key: 'createdAt', title: '등록일자', align: 'left',
    //   cell: (row: CatalogDeploy) => {
    //     if (!row.createdAt) return '-';
    //     return format(new Date(row.createdAt), 'yyyy-MM-dd');
    //   }
    // },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: CatalogDeploy) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                if (row.catalogUrl) {
                  handleClick(row.catalogUrl);
                }
              }}
              disabled={!row.catalogUrl}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              링크
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => catalogDeployEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              보기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => catalogDeployDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];



  const fetchCatalogDeploy = async () => {
    setIsLoading(true);
    try {
      const response = await getProjectClusterCatalogDeploy(selectedCluster, selectedProject, selectedCatalogType)
      setCatalogDeployData(response);
    } catch (error) {
      setCatalogDeployData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClusters = async () => {
    setIsLoading(true);
    try {
      const codeTypeData = await fetchCommonCode('cluster_type');
      const codeTypeMap = codeTypeData.reduce((acc, code) => {
        if (code.uid !== undefined && code.code == 'common') {
          acc[code.uid] = code.uid;
        }
        return acc;
      }, {} as Record<string, string>);

      const response = await getClusters()
      const filteredData = response.filter(item =>
        item.clusterTypeId != codeTypeMap[item.clusterTypeId ?? '']
      );
      setClusterOptions(filteredData);
      return response;
    } catch (error) {
      setClusterOptions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProject = async () => {
    setIsLoading(true);
    try {
      const response = await getProjects()
      setProjectOptions(response);
      return response;
    } catch (error) {
      setProjectOptions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCatalogType = async () => {
    setIsLoading(true);
    try {
      const response = await getCatalogType()
      setCatalogTypeOptions(response);
      return response;
    } catch (error) {
      setCatalogTypeOptions([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommonCode = async (groupCode: string) => {
    setIsLoading(true);
    try {
      const response = await getCommonCodeByGroupCode(groupCode)
      setCodeType(response);
      return response;
    } catch (error) {
      setCodeType([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    fetchClusters();
    fetchProject();
    fetchCatalogType();
    fetchCatalogDeploy();
  }, []);

  useEffect(() => {
    setFormErrorsCatalogDeploy(null);
  }, [isCatalogDeployNewSheetOpen]);

  const handleRefresh = () => {
    fetchCatalogDeploy();
  };

  const handleReset = () => {
    setSelectedCluster('');
    setSelectedProject('');
    setSelectedCatalogType('');
  };

  useEffect(() => {
    fetchCatalogDeploy();
  }, [selectedCluster, selectedProject, selectedCatalogType]);


  const catalogDeployEditSheetClick = (row: CatalogDeploy) => {
    setSelectedCatalogDeploy(row);
    setEditCatalogDeploy({
      uid: row.uid || '',
      projectId: row.projectId,
      catalogTypeId: row.catalogTypeId,
      catalogVersionId: row.catalogVersionId,
      name: row.name,
      catalogName: row.catalogName,
      namespace: row.namespace,
      valuesYaml: row.valuesYaml || '',
      userId: row.userId,
      status: row.status,
      syncStatus: row.syncStatus,
      errorMessage: row.errorMessage,
      catalogUrl: row.catalogUrl,
      catalogUser: row.catalogUser,
      isAdminDeploy: row.isAdminDeploy,
      isTenant: row.isTenant,
      clusterId: row.clusterId,
      catalogDeployId: row.catalogDeployId,
      clientId: row.clientId,
      catalogSvcUrl: row.catalogSvcUrl,
      createdAt: row.createdAt,
      clusterProjectName: row.clusterProjectName,
      catalogType: row.catalogType,
      catalogVersion: row.catalogVersion,
      clusterName: row.clusterName,
      username: row.username
    });
    setFormErrorsCatalogDeploy(null);
    setIsCatalogDeployEditSheetOpen(true);
  };

  const catalogDeployEditClick = () => {
    if (isSubmitting) return;

    setFormErrorsCatalogDeploy(null);

    const validationResult = formSchemaCatalogDeploy.safeParse(editCatalogDeploy);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'valuesYaml') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsCatalogDeploy(errors);
      return;
    }
    setConfirmAction(() => catalogDeployEditSubmit);
    setConfirmDescription("재배포 하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const catalogDeployEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateProjectCatalogDeploy(editCatalogDeploy);
      toast({
        title: "Success",
        description: "재배포가 성공적으로 실행되었습니다.",
      })
      setIsCatalogDeployEditSheetOpen(false);
      fetchCatalogDeploy();
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

  const catalogDeployDeleteClick = (row: CatalogDeploy) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => catalogDeployDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const catalogDeployDeleteSubmit = async (row: CatalogDeploy) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteProjectCatalogDeploy(row);
      toast({
        title: "Success",
        description: "카탈로그가 성공적으로 삭제되었습니다.",
      })
      fetchCatalogDeploy();
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
    setPageCatalogDeploy(newPage);
  };




  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4 pt-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">프로젝트 카탈로그</h2>
            <p className="mt-1 text-sm text-gray-500">프로젝트에 배포한 카탈로그를 관리할 수 있습니다.</p>
          </div>

          <Sheet open={isCatalogDeployEditSheetOpen} onOpenChange={setIsCatalogDeployEditSheetOpen}>
            <SheetContent className="min-w-[750px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>카탈로그 상세정보</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>카탈로그 유형</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.catalogType}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>카탈로그 버전</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.catalogVersion}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>프로젝트 이름</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.clusterProjectName}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>카탈로그 이름</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.catalogName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>배포 상태</Label>
                        <div className="p-2 bg-background rounded-md">
                          <span className="text-sm">
                            <StatusBadge status={editCatalogDeploy.status as "install" | "deployed" | "healthy" | "error"} />
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>서비스 상태</Label>
                        <div className="p-2 bg-background rounded-md">
                          <span className="text-sm">
                            <StatusBadge status={editCatalogDeploy.syncStatus as "install" | "deployed" | "healthy" | "error"} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>네임스페이스</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.namespace}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-desc">테넌트 여부</Label>
                        <div className="mt-2">
                          {/* {editCatalogDeploy.isTenant == false && <Check className="h-4 w-4 text-green-500" />} */}
                          <Checkbox
                            id="edit-enable"
                            placeholder="테넌트 여부"
                            checked={editCatalogDeploy.isTenant}
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>카탈로그 주소</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.catalogUrl}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>카탈로그 내부 주소</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.catalogSvcUrl}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>설정값 (yaml) <span className="text-red-500 ml-1">*</span></Label>
                      <div className="border rounded-md overflow-hidden">
                        <CodeMirror
                          value={editCatalogDeploy.valuesYaml}
                          height="200px"
                          extensions={[yaml(), javascript({ jsx: true })]}
                          onChange={
                            (value) => {
                              setEditCatalogDeploy({ ...editCatalogDeploy, valuesYaml: value });
                              setFormErrorsCatalogDeploy(prevErrors => ({
                                ...prevErrors,
                                valuesYaml: undefined,
                              }));
                            }}
                          className="text-sm"
                          style={codeMirrorStyles}
                        />
                      </div>
                      {formErrorsCatalogDeploy?.valuesYaml && <p className="text-red-500 text-sm">{formErrorsCatalogDeploy.valuesYaml}</p>}
                    </div>
                  </div>
                  {editCatalogDeploy.errorMessage !== ' ' && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-catalog-type" className="flex items-center">
                        오류 메시지
                      </Label>
                      <div className="p-2 bg-background rounded-md">
                        <span className="text-sm">{editCatalogDeploy.errorMessage}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-type" className="flex items-center">
                      등록 일자
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">
                        {editCatalogDeploy.createdAt && !isNaN(new Date(editCatalogDeploy.createdAt).getTime())
                          ? format(new Date(editCatalogDeploy.createdAt), 'yyyy-MM-dd HH:mm:ss')
                          : '-'
                        }
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6 pb-6">
                    <Button variant="outline" size="sm" onClick={() => setIsCatalogDeployEditSheetOpen(false)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={catalogDeployEditClick} disabled={isSubmitting}>
                      재배포
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="grid gap-4 px-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <Label>클러스터</Label>
                <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                  <SelectTrigger>
                    <SelectValue placeholder="클러스터 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusterOptions?.map((option) => (
                      <SelectItem key={option.uid || ''} value={option.uid || ''}>
                        {option.clusterName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>프로젝트</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="프로젝트 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectOptions?.map((option) => (
                      <SelectItem key={option.uid || ''} value={option.uid || ''}>
                        {option.clusterProjectName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>카탈로그 유형</Label>
                <Select value={selectedCatalogType} onValueChange={setSelectedCatalogType}>
                  <SelectTrigger>
                    <SelectValue placeholder="카탈로그 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogTypeOptions?.map((option) => (
                      <SelectItem key={option.uid || ''} value={option.uid || ''}>
                        {option.catalogType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 md:ml-4">
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  초기화
                </Button>
                <Button size="sm" onClick={handleRefresh}>
                  <Search className="mr-2 h-4 w-4" />
                  검색
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2">
            <DataTable
              columns={columns}
              data={paginatedData}
              // onRefresh={handleRefresh}
              isLoading={isLoading}
            />
            <TablePagination
              currentPage={pageCatalogDeploy}
              totalPages={totalPages}
              dataLength={(catalogDeployData?.length || 0)}
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
    </div>
  );
}
