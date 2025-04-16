'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Globe, Calendar, Users, RefreshCcw, Check } from 'lucide-react';
import { Plus, Search, RotateCcw, Link as LinkIcon, Info, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import Image from 'next/image';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { yaml } from '@codemirror/lang-yaml';
import { CatalogDeploy } from '@/types/catalogdeploy';
import { getClusterCatalogDeploy, getClusters, getCatalogType, deleteProjectCatalogDeploy, updateProjectCatalogDeploy, insertClusterCatalog, getCatalogVersion } from "@/lib/actions"
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommonCode } from '@/types/groupcode';
import { getErrorMessage, codeMirrorStyles } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CatalogType, CatalogVersion } from '@/types/catalogtype';
import { Cluster } from '@/types/cluster';
import { StatusBadge, Status } from '@/components/ui/badgestatus';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';



export default function ClusterCatalogPage() {
  const { toast } = useToast()
  const router = useRouter();
  const [catalogDeployData, setCatalogDeployData] = useState<CatalogDeploy[]>([]);
  const [catalogVersionData, setCatalogVersionData] = useState<CatalogVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("view");
  const [isCatalogNewSheetOpen, setIsCatalogNewSheetOpen] = useState(false);
  const [isCatalogDeployNewSheetOpen, setIsCatalogDeployNewSheetOpen] = useState(false);
  const [isCatalogDeployEditSheetOpen, setIsCatalogDeployEditSheetOpen] = useState(false);
  const [selectedCatalogDeploy, setSelectedCatalogDeploy] = useState<CatalogDeploy | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsCatalogDeploy, setFormErrorsCatalogDeploy] = useState<{
    valuesYaml?: string;
  } | null>(null);
  const [formErrorsCatalog, setFormErrorsCatalog] = useState<{
    catalogTypeId?: string;
    catalogVersionId?: string;
    clusterId?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editCatalogDeploy, setEditCatalogDeploy] = useState<CatalogDeploy>({
    uid: '',
    name: '',
    valuesYaml: '',
    catalogType: '',
  });

  const [newCatalogDeploy, setNewCatalogDeploy] = useState<CatalogDeploy>({
    clusterId: '',
    projectId: '',
    catalogType: '',
    catalogTypeId: '',
    catalogVersionId: '',
    name: '',
    valuesYaml: '',
  });

  const formSchemaCatalogDeploy = z.object({
    valuesYaml: z.string().min(1, { message: "설정값은 필수 입력 항목입니다." }),
  });

  const formSchemaCatalog = z.object({
    catalogTypeId: z.string().min(1, { message: "카탈로그 유형은 필수 입력 항목입니다." }),
    catalogVersionId: z.string().min(1, { message: "카탈로그 버전은 필수 입력 항목입니다." }),
    clusterId: z.string().min(1, { message: "클러스터는 필수 입력 항목입니다." }),
  });

  const [selectedCluster, setSelectedCluster] = useState<string>('');
  const [selectedCatalogType, setSelectedCatalogType] = useState<string>('');

  const [clusterOptions, setClusterOptions] = useState<Cluster[]>([]);
  const [catalogTypeOptions, setCatalogTypeOptions] = useState<CatalogType[]>([]);
  const [catalogTypeCreate, setCatalogTypeCreate] = useState<CatalogType[]>([]);



  const fetchCatalogDeploy = async () => {
    setIsLoading(true);
    try {
      const response = await getClusterCatalogDeploy(selectedCluster, selectedCatalogType);
      setCatalogDeployData(response);
    } catch (error) {
      setCatalogDeployData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (url?: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const fetchClusters = async () => {
    setIsLoading(true);
    try {
      const response = await getClusters()
      setClusterOptions(response);
      return response;
    } catch (error) {
      setClusterOptions([]);
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

  const fetchCatalogVersions = async (catalogTypeId: string) => {
    setIsLoading(true);
    try {
      if (catalogTypeId) {
        const response = await getCatalogVersion(catalogTypeId);
        setCatalogVersionData(response);
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
    fetchClusters();
    fetchCatalogType();
    fetchCatalogDeploy();
  }, []);

  useEffect(() => {
    if (activeTab == 'create') {
      const filteredData = catalogTypeOptions.filter(item =>
        item.enable && item.isAdmin
      );
      setCatalogTypeCreate(filteredData);
    }
  }, [activeTab]);

  useEffect(() => {
    setFormErrorsCatalog(null);
  }, [isCatalogNewSheetOpen]);

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

  const catalogNewSheetClick = (row: CatalogType) => {
    setNewCatalogDeploy({
      catalogTypeId: row.uid,
      catalogType: row.catalogType,
      name: '',
      valuesYaml: row.valuesYaml,
    });
    fetchCatalogVersions(row.uid ?? '')
    setIsCatalogNewSheetOpen(true);
  };

  const catalogNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsCatalog(null);

    const validationResult = formSchemaCatalog.safeParse(newCatalogDeploy);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        console.log(field, error)
        // 필수 입력 필드 검증
        if (field === 'catalogTypeId' || field === 'catalogVersionId' || field === 'clusterId') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsCatalog(errors);
      return;
    }
    setConfirmAction(() => newCatalogSubmit);
    setConfirmDescription("생성하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newCatalogSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const catalogDeploy: CatalogDeploy = {
        clusterId: newCatalogDeploy.clusterId,
        projectId: newCatalogDeploy.projectId,
        catalogTypeId: newCatalogDeploy.catalogTypeId,
        catalogType: newCatalogDeploy.catalogType,
        catalogVersionId: newCatalogDeploy.catalogVersionId,
        name: newCatalogDeploy.catalogType,
        valuesYaml: newCatalogDeploy.valuesYaml,
      };

      await insertClusterCatalog(catalogDeploy);
      toast({
        title: "Success",
        description: "카탈로그가 성공적으로 생성되었습니다.",
      })
      setNewCatalogDeploy({
        clusterId: '',
        projectId: '',
        catalogType: '',
        catalogTypeId: '',
        catalogVersionId: '',
        name: '',
        valuesYaml: '',
      });
      setIsCatalogNewSheetOpen(false);
      fetchCatalogDeploy();
      setActiveTab('view');
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

  // const handleRefresh = () => {
  //   fetchCatalogDeploy();
  // };

  const handleNavigateToDetail = (detailPath: string) => {
    router.push(detailPath);
  };

  const handleReset = () => {
    setSelectedCluster('');
    setSelectedCatalogType('');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const extractImageUrl = (htmlString?: string) => {
    try {
      if (htmlString) {
        // 이스케이프된 문자열 디코딩
        const decodedString = htmlString.replace(/\\u003c/g, '<')
          .replace(/\\u003e/g, '>')
          .replace(/\\"/g, '"');

        const parser = new DOMParser();
        const doc = parser.parseFromString(decodedString, 'text/html');
        const imgElement = doc.querySelector('img');
        return imgElement?.getAttribute('src') || '';
      }
      return '';
    } catch (error) {
      console.error('Error parsing HTML:', error);
      return '';
    }
  };

  const handleImageError = (itemId: string | undefined) => {
    if (!itemId) return; // Skip if itemId is undefined
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const handleRefresh = () => {
    fetchCatalogDeploy();
  };

  const getStatusColor = (status?: string) => {
    const statusColors = {
      '정상': 'bg-green-100 text-green-800',
      '점검중': 'bg-yellow-100 text-yellow-800',
      '중단': 'bg-red-100 text-red-800',
      '배포완료': 'bg-blue-100 text-blue-800',
      '배포중': 'bg-purple-100 text-purple-800',
      '배포실패': 'bg-red-100 text-red-800',
      '배포대기': 'bg-gray-100 text-gray-800'
    };
    // return statusColors[status] || 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4 pt-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">클러스터 카탈로그</h2>
            <p className="mt-1 text-sm text-gray-500">클러스터 카탈로그를 조회하고 관리할 수 있습니다.</p>
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
                        <Label>클러스터</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.clusterName}</span>
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
                            <StatusBadge status={editCatalogDeploy.status as Status} />
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>서비스 상태</Label>
                        <div className="p-2 bg-background rounded-md">
                          <span className="text-sm">
                            <StatusBadge status={editCatalogDeploy.syncStatus as Status} />
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
                        <Label>테넌트 여부</Label>
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
                        {editCatalogDeploy.catalogSvcUrl && (
                          <div className="p-2 bg-muted rounded-md">
                            <span className="text-sm">{editCatalogDeploy.catalogSvcUrl}</span>
                          </div>
                        )}
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
                      <Label className="flex items-center">
                        오류 메시지
                      </Label>
                      <div className="p-2 bg-background rounded-md">
                        <span className="text-sm">{editCatalogDeploy.errorMessage}</span>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="flex items-center">
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
          <Sheet open={isCatalogNewSheetOpen} onOpenChange={setIsCatalogNewSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 카탈로그 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-code">카탈로그 유형</Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{newCatalogDeploy.catalogType}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catalog-service-type" className="flex items-center">
                      카탈로그 버전 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCatalogDeploy.catalogVersionId}
                      onValueChange={(value) => {
                        setNewCatalogDeploy({ ...newCatalogDeploy, catalogVersionId: value });
                        setFormErrorsCatalog(prevErrors => ({
                          ...prevErrors,
                          catalogVersionId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="catalog-service-type"
                        className={formErrorsCatalog?.catalogVersionId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="버전 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogVersionData.map((item) => (
                          <SelectItem key={item.uid || ''} value={item.uid || ''}>
                            {item.catalogVersion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsCatalog?.catalogVersionId && <p className="text-red-500 text-sm">{formErrorsCatalog.catalogVersionId}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="catalog-service-type" className="flex items-center">
                      클러스터 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCatalogDeploy.clusterId}
                      onValueChange={(value) => {
                        setNewCatalogDeploy({ ...newCatalogDeploy, clusterId: value });
                        setFormErrorsCatalog(prevErrors => ({
                          ...prevErrors,
                          clusterId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="catalog-service-type"
                        className={formErrorsCatalog?.clusterId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="클러스터 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {clusterOptions.map((item) => (
                          <SelectItem key={item.uid || ''} value={item.uid || ''}>
                            {item.clusterName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsCatalog?.clusterId && <p className="text-red-500 text-sm">{formErrorsCatalog.clusterId}</p>}
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsCatalogNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={catalogNewClick} disabled={isSubmitting}>
                    생성
                  </Button>
                </div>

              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Tabs defaultValue="view" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="view">조회</TabsTrigger>
              <TabsTrigger value="create">생성</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="view" className="space-y-4 mt-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {(catalogDeployData || []).map((item, index) => (
                <Card key={item.uid} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full flex items-center justify-center bg-gray-50">
                    <div className={`relative ${index === 0 ? 'w-1/2 h-24' : 'w-1/2 h-24'}`}>
                      {extractImageUrl(item.catalogImage) && !(item.uid && imageErrors[item.uid]) ? (
                        <Image
                          src={extractImageUrl(item.catalogImage)}
                          alt={item.catalogType}
                          className="object-contain"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={() => handleImageError(item.uid)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <Server className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{item.name}</CardTitle>
                    </div>
                    <CardDescription>{item.catalogDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">카탈로그 유형</p>
                          <p className="text-sm font-medium">{item.catalogType}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">카탈로그 버전</p>
                          <p className="text-sm font-medium">{item.catalogVersion}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">클러스터</p>
                          <p className="text-sm font-medium">{item.clusterName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">카탈로그 이름</p>
                          <p className="text-sm font-medium">{item.catalogName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">배포 상태</p>
                          <span className="text-sm font-medium"><StatusBadge status={item.status as Status} /></span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">서비스 상태</p>
                          <span className="text-sm font-medium"><StatusBadge status={item.syncStatus as Status} /></span>
                        </div>
                      </div>
                      {/* <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.syncStatus)}`}>
                          {item.syncStatus}
                        </span>
                      </div> */}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 p-4">
                    <Button variant="outline" size="sm" onClick={() => handleClick(item.catalogUrl)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      링크
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => catalogDeployEditSheetClick(item)}>
                      <Info className="h-4 w-4 mr-2" />
                      보기
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => catalogDeployDeleteClick(item)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create">
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                새로고침
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
              {catalogTypeCreate.map((item, index) => (
                <Card key={item.uid} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full flex items-center justify-center bg-gray-100">
                    <div className={`relative ${index === 0 ? 'w-1/2 h-24' : 'w-1/2 h-24'}`}>
                      {extractImageUrl(item.catalogImage) && !(item.uid && imageErrors[item.uid]) ? (
                        <Image
                          src={extractImageUrl(item.catalogImage)}
                          alt={item.catalogType}
                          className="object-contain"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={() => handleImageError(item.uid)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <Server className="h-12 w-12" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{item.catalogType}</CardTitle>
                    </div>
                    <CardDescription>{item.catalogDesc}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-end gap-2 p-4">
                    <Button variant="outline" size="sm" onClick={() => catalogNewSheetClick(item)}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      생성
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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