'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Server, Globe, Calendar, Users, RefreshCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/ui/data-table';

const mockGridData = [
  {
    id: 'CLU001',
    name: '개발 클러스터',
    version: 'v1.24.0',
    status: '운영중',
    nodeCount: 5,
    region: 'KR',
    createdAt: '2024-03-20',
    description: '개발 환경을 위한 쿠버네티스 클러스터',
    cpu: '80%',
    memory: '65%',
    pods: '120/150',
  },
  {
    id: 'CLU002',
    name: '운영 클러스터',
    version: 'v1.25.0',
    status: '운영중',
    nodeCount: 8,
    region: 'KR',
    createdAt: '2024-03-20',
    description: '프로덕션 워크로드를 위한 클러스터',
    cpu: '75%',
    memory: '80%',
    pods: '280/300',
  },
  {
    id: 'CLU003',
    name: '스테이징 클러스터',
    version: 'v1.24.0',
    status: '점검중',
    nodeCount: 3,
    region: 'KR',
    createdAt: '2024-03-20',
    description: '스테이징 환경 클러스터',
    cpu: '45%',
    memory: '50%',
    pods: '85/150',
  },
  {
    id: 'CLU004',
    name: '테스트 클러스터',
    version: 'v1.25.0',
    status: '운영중',
    nodeCount: 4,
    region: 'KR',
    createdAt: '2024-03-20',
    description: 'QA 및 테스트 환경',
    cpu: '30%',
    memory: '40%',
    pods: '65/150',
  },
];

const mockTableData = [
  {
    id: 'CLU001',
    name: '개발 클러스터',
    version: 'v1.24.0',
    status: '운영중',
    nodeCount: 5,
    region: 'KR',
    createdAt: '2024-03-20',
  },
  {
    id: 'CLU002',
    name: '운영 클러스터',
    version: 'v1.25.0',
    status: '운영중',
    nodeCount: 8,
    region: 'KR',
    createdAt: '2024-03-20',
  },
];

const columns = [
  { key: 'name', title: '클러스터명' },
  { key: 'version', title: '버전', width: 'w-[100px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'nodeCount', title: '노드수', width: 'w-[80px]' },
  { key: 'region', title: '리전', width: 'w-[80px]' },
  { key: 'createdAt', title: '생성일자', width: 'w-[120px]' },
];

function getStatusColor(status: string) {
  switch (status) {
    case '운영중':
      return 'bg-green-500';
    case '점검중':
      return 'bg-yellow-500';
    case '중지':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export default function ClusterCatalogPage() {
  const [gridData, setGridData] = useState(mockGridData);
  const [tableData, setTableData] = useState(mockTableData);

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">클러스터 카탈로그</h2>
            <p className="mt-1 text-sm text-gray-500">클러스터 카탈로그를 조회하고 관리할 수 있습니다.</p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            새로고침
          </Button>
        </div>
      </div>

      <Tabs defaultValue="view" className="space-y-4">
        <TabsList>
          <TabsTrigger value="view">조회</TabsTrigger>
          <TabsTrigger value="create">생성</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gridData.map((cluster) => (
              <Card key={cluster.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{cluster.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(cluster.status)}`} />
                  </div>
                  <CardDescription>{cluster.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">버전: {cluster.version}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">리전: {cluster.region}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">노드: {cluster.nodeCount}개</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">생성: {cluster.createdAt}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>CPU</span>
                          <span>{cluster.cpu}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: cluster.cpu }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>메모리</span>
                          <span>{cluster.memory}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-purple-500 rounded-full"
                            style={{ width: cluster.memory }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>파드</span>
                          <span>{cluster.pods}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${(parseInt(cluster.pods.split('/')[0]) / parseInt(cluster.pods.split('/')[1])) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>클러스터 생성</CardTitle>
              <CardDescription>
                새로운 클러스터를 생성하기 위한 정보를 입력하세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={tableData}
                onRefresh={handleRefresh}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}