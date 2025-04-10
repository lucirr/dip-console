'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Globe, Calendar, Users, RefreshCcw } from 'lucide-react';
import { Plus, Search, RotateCcw, Link as LinkIcon, Info, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';
import Image from 'next/image';
import { CatalogDeploy } from '@/types/catalogdeploy';
import { getClusterCatalogDeploy, getClusters, getCatalogType } from "@/lib/actions"
import SystemCatalogLinkPage from '@/components/system-catalog-link';
import { Label } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CatalogType } from '@/types/catalogtype';
import { Cluster } from '@/types/cluster';



export default function ClusterCatalogPage() {
  const [catalogDeployData, setCatalogDeployData] = useState<CatalogDeploy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState("view");

  const [isCatalogDeployNewSheetOpen, setIsCatalogDeployNewSheetOpen] = useState(false);
  const [isCatalogDeployEditSheetOpen, setIsCatalogDeployEditSheetOpen] = useState(false);
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
  const [selectedCatalogType, setSelectedCatalogType] = useState<string>('');

  const [clusterOptions, setClusterOptions] = useState<Cluster[]>([]);
  const [catalogTypeOptions, setCatalogTypeOptions] = useState<CatalogType[]>([]);


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

  useEffect(() => {
    fetchClusters();
    fetchCatalogType();
    fetchCatalogDeploy();
  }, []);

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
      IsAdminDeploy: row.IsAdminDeploy,
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


  // const handleRefresh = () => {
  //   fetchCatalogDeploy();
  // };

  const handleReset = () => {
    setSelectedCluster('');
    setSelectedCatalogType('');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const extractImageUrl = (htmlString: string) => {
    try {
      // 이스케이프된 문자열 디코딩
      const decodedString = htmlString.replace(/\\u003c/g, '<')
        .replace(/\\u003e/g, '>')
        .replace(/\\"/g, '"');

      const parser = new DOMParser();
      const doc = parser.parseFromString(decodedString, 'text/html');
      const imgElement = doc.querySelector('img');
      return imgElement?.getAttribute('src') || '';
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
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">클러스터 카탈로그</h2>
            <p className="mt-1 text-sm text-gray-500">클러스터 카탈로그를 조회하고 관리할 수 있습니다.</p>
          </div>
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
                        {clusterOptions.map((option) => (
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
              {catalogDeployData.map((item, index) => (
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
                      </div>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.syncStatus)}`}>
                          {item.syncStatus}
                        </span>
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
          </TabsContent>

          <TabsContent value="create">
            <div>

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}