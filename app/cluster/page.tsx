'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const mockData = [
  {
    id: 'CLU001',
    name: '개발 클러스터',
    type: 'Kubernetes',
    version: 'v1.24.0',
    region: 'KR',
    nodeCount: 5,
    status: '운영중',
    createdAt: '2024-03-20',
  },
  {
    id: 'CLU002',
    name: '운영 클러스터',
    type: 'Kubernetes',
    version: 'v1.25.0',
    region: 'KR',
    nodeCount: 8,
    status: '운영중',
    createdAt: '2024-03-20',
  },
  {
    id: 'CLU003',
    name: '스테이징 클러스터',
    type: 'Kubernetes',
    version: 'v1.24.0',
    region: 'KR',
    nodeCount: 3,
    status: '점검중',
    createdAt: '2024-03-20',
  },
];

const columns = [
  { key: 'name', title: '클러스터명' },
  { key: 'type', title: '유형', width: 'w-[100px]' },
  { key: 'version', title: '버전', width: 'w-[100px]' },
  { key: 'region', title: '리전', width: 'w-[80px]' },
  { key: 'nodeCount', title: '노드수', width: 'w-[80px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'createdAt', title: '생성일자', width: 'w-[120px]' },
];

export default function ClusterPage() {
  const [data, setData] = useState(mockData);
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchVersion, setSearchVersion] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [newCluster, setNewCluster] = useState({
    name: '',
    type: 'Kubernetes',
    version: '',
    region: 'KR',
    nodeCount: '',
    status: '준비중'
  });

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleSearch = () => {
    const filteredData = mockData.filter(item => {
      const nameMatch = !searchName || item.name.toLowerCase().includes(searchName.toLowerCase());
      const typeMatch = !searchType || item.type.toLowerCase() === searchType.toLowerCase();
      const versionMatch = !searchVersion || item.version.toLowerCase().includes(searchVersion.toLowerCase());
      const statusMatch = !searchStatus || item.status.toLowerCase() === searchStatus.toLowerCase();
      return nameMatch && typeMatch && versionMatch && statusMatch;
    });
    setData(filteredData);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchType('');
    setSearchVersion('');
    setSearchStatus('');
    setData(mockData);
  };

  const handleNewClusterSubmit = () => {
    const newClusterData = {
      ...newCluster,
      id: `CLU${String(data.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString().split('T')[0],
      nodeCount: parseInt(newCluster.nodeCount) || 0
    };

    setData([...data, newClusterData]);
    setNewCluster({
      name: '',
      type: 'Kubernetes',
      version: '',
      region: 'KR',
      nodeCount: '',
      status: '준비중'
    });
    setIsSheetOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">클러스터</h2>
            <p className="mt-1 text-sm text-gray-500">클러스터를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                클러스터 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>새 클러스터 추가</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">클러스터명</Label>
                  <Input
                    id="new-name"
                    placeholder="클러스터명 입력"
                    value={newCluster.name}
                    onChange={(e) => setNewCluster({ ...newCluster, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-version">버전</Label>
                  <Input
                    id="new-version"
                    placeholder="버전 입력"
                    value={newCluster.version}
                    onChange={(e) => setNewCluster({ ...newCluster, version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-region">리전</Label>
                  <Input
                    id="new-region"
                    placeholder="리전 입력"
                    value={newCluster.region}
                    onChange={(e) => setNewCluster({ ...newCluster, region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-node-count">노드 수</Label>
                  <Input
                    id="new-node-count"
                    type="number"
                    placeholder="노드 수 입력"
                    value={newCluster.nodeCount}
                    onChange={(e) => setNewCluster({ ...newCluster, nodeCount: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setIsSheetOpen(false)}>
                  취소
                </Button>
                <Button size="sm" onClick={handleNewClusterSubmit}>
                  저장
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">클러스터명</Label>
                <Input
                  id="name"
                  placeholder="클러스터명으로 검색"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">유형</Label>
                <Input
                  id="type"
                  placeholder="유형으로 검색"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="version">버전</Label>
                <Input
                  id="version"
                  placeholder="버전으로 검색"
                  value={searchVersion}
                  onChange={(e) => setSearchVersion(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">상태</Label>
                <Input
                  id="status"
                  placeholder="상태로 검색"
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" size="sm" onClick={handleReset}>
                초기화
              </Button>
              <Button size="sm" onClick={handleSearch}>
                검색
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <DataTable
              columns={columns}
              data={data}
              onRefresh={handleRefresh}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}