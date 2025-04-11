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
import { getProjectCatalogDeploy, getProjects, getCatalogType, deleteProjectCatalogDeploy, updateProjectCatalogDeploy, insertClusterCatalog, getCatalogVersion } from "@/lib/actions"
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommonCode } from '@/types/groupcode';
import { getErrorMessage } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CatalogType, CatalogVersion } from '@/types/catalogtype';
import { Cluster } from '@/types/cluster';
import { StatusBadge, Status } from '@/components/ui/badgestatus';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Project } from '@/types/project';



export default function CatalogPage() {
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

  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCatalogType, setSelectedCatalogType] = useState<string>('');

  const [projectOptions, setProjectOptions] = useState<Project[]>([]);
  const [catalogTypeOptions, setCatalogTypeOptions] = useState<CatalogType[]>([]);
  const [catalogTypeCreate, setCatalogTypeCreate] = useState<CatalogType[]>([]);


  const fetchCatalogDeploy = async () => {
    setIsLoading(true);
    try {
      const response = await getProjectCatalogDeploy(selectedProject, selectedCatalogType);
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
    fetchProject();
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

  const handleReset = () => {
    setSelectedProject('');
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

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4 pt-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">카탈로그 조회</h2>
            <p className="mt-1 text-sm text-gray-500">카탈로그를 조회하고 관리할 수 있습니다.</p>
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
                        <Label>프로젝트</Label>
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
                        <Label>클러스터</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.clusterName}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>네임스페이스</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">{editCatalogDeploy.namespace}</span>
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
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>프로젝트</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="클러스터 선택" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((option) => (
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
                  {catalogTypeOptions.map((option) => (
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
                    <p className="text-sm text-muted-foreground">프로젝트</p>
                    <p className="text-sm font-medium">{item.clusterProjectName}</p>
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
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmAction}
        description={confirmDescription}
      />
    </div >
  );
}