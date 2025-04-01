'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw, Search, Pencil, MoreVertical, Link as LinkIcon, Info } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockData = [
  {
    id: 'PRJ001',
    name: '웹 서비스 프로젝트',
    type: '웹 애플리케이션',
    owner: '김철수',
    status: '활성',
    version: '1.0.0',
    createdAt: '2024-03-20',
    cluster: '개발 클러스터',
    project: '클라우드 플랫폼',
  },
  {
    id: 'PRJ002',
    name: '마이크로서비스',
    type: 'MSA',
    owner: '이영희',
    status: '활성',
    version: '2.1.0',
    createdAt: '2024-03-20',
    cluster: '운영 클러스터',
    project: '마이크로서비스 전환',
  },
];

const columns = [
  { key: 'name', title: '프로젝트명' },
  { key: 'type', title: '유형', width: 'w-[120px]' },
  { key: 'owner', title: '담당자', width: 'w-[100px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'version', title: '버전', width: 'w-[80px]' },
  { key: 'cluster', title: '클러스터', width: 'w-[120px]' },
  { key: 'project', title: '프로젝트', width: 'w-[150px]' },
  { key: 'createdAt', title: '생성일자', width: 'w-[120px]' },
  {
    key: 'actions',
    title: '',
    width: 'w-[40px]',
    cell: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => console.log('Edit', row)}>
            <Pencil className="h-4 w-4 mr-2" />
            편집
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log('Link', row)}>
            <LinkIcon className="h-4 w-4 mr-2" />
            링크
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log('Details', row)}>
            <Info className="h-4 w-4 mr-2" />
            상세
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const clusterOptions = [
  { value: '개발 클러스터', label: '개발 클러스터' },
  { value: '운영 클러스터', label: '운영 클러스터' },
  { value: '스테이징 클러스터', label: '스테이징 클러스터' },
];

const projectOptions = [
  { value: '클라우드 플랫폼', label: '클라우드 플랫폼' },
  { value: '마이크로서비스 전환', label: '마이크로서비스 전환' },
  { value: 'API 게이트웨이', label: 'API 게이트웨이' },
];

const typeOptions = [
  { value: '웹 애플리케이션', label: '웹 애플리케이션' },
  { value: 'MSA', label: 'MSA' },
  { value: 'API', label: 'API' },
];

export default function ProjectCatalogPage() {
  const [data, setData] = useState(mockData);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [newProject, setNewProject] = useState({
    name: '',
    type: '',
    owner: '',
    version: '',
    cluster: '',
    project: '',
  });

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleSearch = () => {
    const filteredData = mockData.filter(item => {
      const clusterMatch = !selectedCluster || item.cluster === selectedCluster;
      const projectMatch = !selectedProject || item.project === selectedProject;
      const typeMatch = !selectedType || item.type === selectedType;
      return clusterMatch && projectMatch && typeMatch;
    });
    setData(filteredData);
  };

  const handleReset = () => {
    setSelectedCluster('');
    setSelectedProject('');
    setSelectedType('');
    setData(mockData);
  };

  const handleNewProjectSubmit = () => {
    const newProjectData = {
      ...newProject,
      id: `PRJ${String(data.length + 1).padStart(3, '0')}`,
      status: '활성',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setData([...data, newProjectData]);
    setNewProject({
      name: '',
      type: '',
      owner: '',
      version: '',
      cluster: '',
      project: '',
    });
    setIsSheetOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">프로젝트 카탈로그</h2>
            <p className="mt-1 text-sm text-gray-500">프로젝트 카탈로그를 조회하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                프로젝트 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>새 프로젝트 추가</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-6 py-4">
                  <div className="space-y-2">
                    <Label>프로젝트명</Label>
                    <Input
                      placeholder="프로젝트명 입력"
                      value={newProject.name}
                      onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>유형</Label>
                    <Select value={newProject.type} onValueChange={(value) => setNewProject({ ...newProject, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>담당자</Label>
                    <Input
                      placeholder="담당자 입력"
                      value={newProject.owner}
                      onChange={(e) => setNewProject({ ...newProject, owner: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>버전</Label>
                    <Input
                      placeholder="버전 입력"
                      value={newProject.version}
                      onChange={(e) => setNewProject({ ...newProject, version: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>클러스터</Label>
                    <Select value={newProject.cluster} onValueChange={(value) => setNewProject({ ...newProject, cluster: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="클러스터 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {clusterOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>프로젝트</Label>
                    <Select value={newProject.project} onValueChange={(value) => setNewProject({ ...newProject, project: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="프로젝트 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleNewProjectSubmit}>
                    저장
                  </Button>
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
                    {clusterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                    {projectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label>카탈로그 유형</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="카탈로그 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
                <Button size="sm" onClick={handleSearch}>
                  <Search className="mr-2 h-4 w-4" />
                  검색
                </Button>
              </div>
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