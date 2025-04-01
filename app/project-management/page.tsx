'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const mockData = [
  {
    id: 'PRJ001',
    name: '클라우드 플랫폼 구축',
    type: '개발',
    manager: '김철수',
    department: '클라우드팀',
    status: '진행중',
    priority: '높음',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
  {
    id: 'PRJ002',
    name: '마이크로서비스 전환',
    type: '운영',
    manager: '이영희',
    department: '개발팀',
    status: '계획',
    priority: '중간',
    startDate: '2024-04-01',
    endDate: '2024-09-30',
  },
  {
    id: 'PRJ003',
    name: '보안 시스템 강화',
    type: '보안',
    manager: '박지훈',
    department: '보안팀',
    status: '완료',
    priority: '긴급',
    startDate: '2024-02-01',
    endDate: '2024-03-31',
  },
];

const columns = [
  { key: 'name', title: '프로젝트명' },
  { key: 'type', title: '유형', width: 'w-[80px]' },
  { key: 'manager', title: '담당자', width: 'w-[100px]' },
  { key: 'department', title: '부서', width: 'w-[100px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'priority', title: '우선순위', width: 'w-[80px]' },
  { key: 'startDate', title: '시작일', width: 'w-[100px]' },
  { key: 'endDate', title: '종료일', width: 'w-[100px]' },
];

export default function ProjectManagementPage() {
  const [data, setData] = useState(mockData);
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchManager, setSearchManager] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchPriority, setSearchPriority] = useState('');

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleSearch = () => {
    const filteredData = mockData.filter(item => {
      const nameMatch = !searchName || item.name.toLowerCase().includes(searchName.toLowerCase());
      const typeMatch = !searchType || item.type.toLowerCase() === searchType.toLowerCase();
      const managerMatch = !searchManager || item.manager.toLowerCase().includes(searchManager.toLowerCase());
      const departmentMatch = !searchDepartment || item.department.toLowerCase().includes(searchDepartment.toLowerCase());
      const statusMatch = !searchStatus || item.status.toLowerCase() === searchStatus.toLowerCase();
      const priorityMatch = !searchPriority || item.priority.toLowerCase() === searchPriority.toLowerCase();
      return nameMatch && typeMatch && managerMatch && departmentMatch && statusMatch && priorityMatch;
    });
    setData(filteredData);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchType('');
    setSearchManager('');
    setSearchDepartment('');
    setSearchStatus('');
    setSearchPriority('');
    setData(mockData);
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">프로젝트 관리</h2>
            <p className="mt-1 text-sm text-gray-500">프로젝트를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            프로젝트 추가
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>검색 조건</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">프로젝트명</Label>
                <Input
                  id="name"
                  placeholder="프로젝트명으로 검색"
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
                <Label htmlFor="manager">담당자</Label>
                <Input
                  id="manager"
                  placeholder="담당자로 검색"
                  value={searchManager}
                  onChange={(e) => setSearchManager(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">부서</Label>
                <Input
                  id="department"
                  placeholder="부서로 검색"
                  value={searchDepartment}
                  onChange={(e) => setSearchDepartment(e.target.value)}
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
              <div className="space-y-2">
                <Label htmlFor="priority">우선순위</Label>
                <Input
                  id="priority"
                  placeholder="우선순위로 검색"
                  value={searchPriority}
                  onChange={(e) => setSearchPriority(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={handleReset}>
                초기화
              </Button>
              <Button onClick={handleSearch}>
                검색
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>프로젝트 목록</CardTitle>
          </CardHeader>
          <CardContent>
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