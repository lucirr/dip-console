'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Search, RotateCcw, Link as LinkIcon, Info, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Image from 'next/image';

const mockData = [
  {
    id: 'CAT001',
    name: '웹 애플리케이션',
    type: 'WEB',
    version: '1.0.0',
    description: '표준 웹 애플리케이션 템플릿',
    deployStatus: '배포완료',
    serviceStatus: '정상',
    project: '클라우드 플랫폼',
    image: 'https://paasup.github.io/guide/img/langfuse.svg',
    lastUpdated: '2024-03-20'
  },
  {
    id: 'CAT002',
    name: '마이크로서비스',
    type: 'MSA',
    version: '2.1.0',
    description: '마이크로서비스 아키텍처 기반 애플리케이션',
    deployStatus: '배포중',
    serviceStatus: '점검중',
    project: '마이크로서비스 전환',
    image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=500&q=80',
    lastUpdated: '2024-03-20'
  },
  {
    id: 'CAT003',
    name: 'API 서버',
    type: 'API',
    version: '1.2.0',
    description: 'RESTful API 서버 템플릿',
    deployStatus: '배포완료',
    serviceStatus: '정상',
    project: 'API 게이트웨이',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80',
    lastUpdated: '2024-03-20'
  },
  {
    id: 'CAT004',
    name: '데이터 파이프라인',
    type: 'DATA',
    version: '1.0.1',
    description: '데이터 수집 및 처리 파이프라인',
    deployStatus: '배포실패',
    serviceStatus: '중단',
    project: '데이터 레이크',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80',
    lastUpdated: '2024-03-20'
  }
];

const projectOptions = [
  { value: '클라우드 플랫폼', label: '클라우드 플랫폼' },
  { value: '마이크로서비스 전환', label: '마이크로서비스 전환' },
  { value: 'API 게이트웨이', label: 'API 게이트웨이' },
  { value: '데이터 레이크', label: '데이터 레이크' }
];

const typeOptions = [
  { value: 'WEB', label: '웹 애플리케이션' },
  { value: 'MSA', label: '마이크로서비스' },
  { value: 'API', label: 'API 서버' },
  { value: 'DATA', label: '데이터 파이프라인' }
];

export default function CatalogPage() {
  const [data, setData] = useState(mockData);
  const [searchProject, setSearchProject] = useState('');
  const [searchType, setSearchType] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [newCatalog, setNewCatalog] = useState({
    name: '',
    type: '',
    version: '',
    description: '',
    project: '',
    deployStatus: '배포대기',
    serviceStatus: '준비중'
  });

  const getStatusColor = (status: string) => {
    const statusColors = {
      '정상': 'bg-green-100 text-green-800',
      '점검중': 'bg-yellow-100 text-yellow-800',
      '중단': 'bg-red-100 text-red-800',
      '배포완료': 'bg-blue-100 text-blue-800',
      '배포중': 'bg-purple-100 text-purple-800',
      '배포실패': 'bg-red-100 text-red-800',
      '배포대기': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSearch = () => {
    const filteredData = mockData.filter(item => {
      const projectMatch = !searchProject || item.project === searchProject;
      const typeMatch = !searchType || item.type === searchType;
      return projectMatch && typeMatch;
    });
    setData(filteredData);
  };

  const handleReset = () => {
    setSearchProject('');
    setSearchType('');
    setData(mockData);
  };

  const handleNewCatalogSubmit = () => {
    const newCatalogData = {
      ...newCatalog,
      id: `CAT${String(data.length + 1).padStart(3, '0')}`,
      lastUpdated: new Date().toISOString().split('T')[0],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80'
    };

    setData([...data, newCatalogData]);
    setNewCatalog({
      name: '',
      type: '',
      version: '',
      description: '',
      project: '',
      deployStatus: '배포대기',
      serviceStatus: '준비중'
    });
    setIsSheetOpen(false);
  };

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.id !== id));
  };

  return (
    <div className="flex-1 space-y-3 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">카탈로그 조회</h2>
            <p className="mt-1 text-sm text-gray-500">클라우드 플랫폼의 다양한 카탈로그를 조회하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                카탈로그 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
              <SheetHeader>
                <SheetTitle>새 카탈로그 추가</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="new-name">이름</label>
                  <input
                    id="new-name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="이름 입력"
                    value={newCatalog.name}
                    onChange={(e) => setNewCatalog({ ...newCatalog, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-type">유형</label>
                  <input
                    id="new-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="유형 입력"
                    value={newCatalog.type}
                    onChange={(e) => setNewCatalog({ ...newCatalog, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-version">버전</label>
                  <input
                    id="new-version"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="버전 입력"
                    value={newCatalog.version}
                    onChange={(e) => setNewCatalog({ ...newCatalog, version: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-project">프로젝트</label>
                  <input
                    id="new-project"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="프로젝트 입력"
                    value={newCatalog.project}
                    onChange={(e) => setNewCatalog({ ...newCatalog, project: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="new-description">설명</label>
                  <input
                    id="new-description"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="설명 입력"
                    value={newCatalog.description}
                    onChange={(e) => setNewCatalog({ ...newCatalog, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" size="sm" onClick={() => setIsSheetOpen(false)}>
                  취소
                </Button>
                <Button size="sm" onClick={handleNewCatalogSubmit}>
                  저장
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card className="border-0 shadow-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={searchProject} onValueChange={setSearchProject}>
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
            <Select value={searchType} onValueChange={setSearchType}>
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
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              초기화
            </Button>
            <Button size="sm" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item, index) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full flex items-center justify-center bg-gray-50">
              <div className={`relative ${index === 0 ? 'w-1/2 h-24' : 'w-full h-48'}`}>
                <Image
                  src={item.image}
                  alt={item.name}
                  className="object-contain"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{item.name}</CardTitle>
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">카탈로그 유형</p>
                    <p className="text-sm font-medium">{item.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">카탈로그 버전</p>
                    <p className="text-sm font-medium">{item.version}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">프로젝트</p>
                    <p className="text-sm font-medium">{item.project}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">최근 수정일</p>
                    <p className="text-sm font-medium">{item.lastUpdated}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.deployStatus)}`}>
                    {item.deployStatus}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.serviceStatus)}`}>
                    {item.serviceStatus}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-4">
              <Button variant="outline" size="sm">
                <LinkIcon className="h-4 w-4 mr-2" />
                링크
              </Button>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4 mr-2" />
                상세
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                삭제
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}