'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RotateCcw, Search, UserPlus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const departmentOptions = [
  { value: '개발팀', label: '개발팀' },
  { value: '기획팀', label: '기획팀' },
  { value: '운영팀', label: '운영팀' },
  { value: '디자인팀', label: '디자인팀' },
  { value: '보안팀', label: '보안팀' }
];

const roleOptions = [
  { value: '개발자', label: '개발자' },
  { value: '기획자', label: '기획자' },
  { value: '운영자', label: '운영자' },
  { value: '디자이너', label: '디자이너' },
  { value: '보안담당자', label: '보안담당자' }
];

const mockUsers = [
  { id: 'USR001', name: '김철수', email: 'kim@example.com', department: '개발팀', role: '개발자', description: '백엔드 개발자' },
  { id: 'USR002', name: '이영희', email: 'lee@example.com', department: '기획팀', role: '기획자', description: '서비스 기획자' },
  { id: 'USR003', name: '박지훈', email: 'park@example.com', department: '개발팀', role: '개발자', description: '프론트엔드 개발자' },
];

const userColumns = [
  { key: 'name', title: '이름' },
  { key: 'email', title: '이메일' },
  { key: 'department', title: '부서' },
  { key: 'role', title: '역할' },
];

const mockData = [
  {
    id: 'PRJ001',
    name: '클라우드 플랫폼',
    type: '개발',
    manager: '김철수',
    status: '진행중',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
  },
  {
    id: 'PRJ002',
    name: '마이크로서비스 구축',
    type: '운영',
    manager: '이영희',
    status: '계획',
    startDate: '2024-04-01',
    endDate: '2024-09-30',
  },
];

const columns = [
  { key: 'name', title: '프로젝트명' },
  { key: 'type', title: '유형', width: 'w-[80px]' },
  { key: 'manager', title: '담당자', width: 'w-[100px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'startDate', title: '시작일', width: 'w-[100px]' },
  { key: 'endDate', title: '종료일', width: 'w-[100px]' },
];

export default function ProjectsPage() {
  const [data, setData] = useState(mockData);
  const [users, setUsers] = useState(mockUsers);
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchManager, setSearchManager] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false);
  const [isUserSheetOpen, setIsUserSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const [newProject, setNewProject] = useState({
    name: '',
    type: '',
    manager: '',
    status: '계획',
    startDate: '',
    endDate: ''
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    description: ''
  });

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleSearch = () => {
    const filteredData = mockData.filter(item => {
      const nameMatch = item.name.toLowerCase().includes(searchName.toLowerCase());
      const typeMatch = !searchType || item.type.toLowerCase() === searchType.toLowerCase();
      const managerMatch = !searchManager || item.manager.toLowerCase().includes(searchManager.toLowerCase());
      const statusMatch = !searchStatus || item.status.toLowerCase() === searchStatus.toLowerCase();
      return nameMatch && typeMatch && managerMatch && statusMatch;
    });
    setData(filteredData);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchType('');
    setSearchManager('');
    setSearchStatus('');
    setData(mockData);
  };

  const handleNewProjectSubmit = () => {
    const selectedUserData = users.find(user => user.id === selectedUser);
    const newProjectData = {
      ...newProject,
      id: `PRJ${String(data.length + 1).padStart(3, '0')}`,
      manager: selectedUserData ? selectedUserData.name : newProject.manager
    };

    setData([...data, newProjectData]);
    setNewProject({
      name: '',
      type: '',
      manager: '',
      status: '계획',
      startDate: '',
      endDate: ''
    });
    setSelectedUser(null);
    setIsProjectSheetOpen(false);
  };

  const handleNewUserSubmit = () => {
    const newUserData = {
      ...newUser,
      id: `USR${String(users.length + 1).padStart(3, '0')}`,
    };

    setUsers([...users, newUserData]);
    setNewUser({
      name: '',
      email: '',
      department: '',
      role: '',
      description: ''
    });
    setIsUserSheetOpen(false);
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUser(userId);
    const user = users.find(u => u.id === userId);
    if (user) {
      setNewProject(prev => ({
        ...prev,
        manager: user.name
      }));
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">프로젝트 관리</h2>
        <Sheet open={isProjectSheetOpen} onOpenChange={setIsProjectSheetOpen}>
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
                  <Input
                    placeholder="유형 입력"
                    value={newProject.type}
                    onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Input
                    placeholder="상태 입력"
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>시작일</Label>
                  <Input
                    type="date"
                    value={newProject.startDate}
                    onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>종료일</Label>
                  <Input
                    type="date"
                    value={newProject.endDate}
                    onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <Label>담당자 선택</Label>
                  <Sheet open={isUserSheetOpen} onOpenChange={setIsUserSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="h-4 w-4 mr-2" />
                        사용자 추가
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="min-w-[650px] overflow-y-auto">
                      <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
                        <SheetHeader>
                          <SheetTitle>새 사용자 추가</SheetTitle>
                        </SheetHeader>
                        <div className="grid grid-cols-2 gap-6 py-4">
                          <div className="space-y-2">
                            <Label>이름</Label>
                            <Input
                              placeholder="이름 입력"
                              value={newUser.name}
                              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>이메일</Label>
                            <Input
                              type="email"
                              placeholder="이메일 입력"
                              value={newUser.email}
                              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>부서</Label>
                            <Select 
                              value={newUser.department} 
                              onValueChange={(value) => setNewUser({ ...newUser, department: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="부서 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {departmentOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>역할</Label>
                            <Select 
                              value={newUser.role} 
                              onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="역할 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {roleOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label>설명</Label>
                            <div className="border rounded-md overflow-hidden">
                              <CodeMirror
                                value={newUser.description}
                                height="200px"
                                theme={oneDark}
                                extensions={[javascript({ jsx: true })]}
                                onChange={(value) => setNewUser({ ...newUser, description: value })}
                                className="text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6">
                          <Button variant="outline" onClick={() => setIsUserSheetOpen(false)}>
                            취소
                          </Button>
                          <Button onClick={handleNewUserSubmit}>
                            저장
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">선택</th>
                        {userColumns.map((column) => (
                          <th key={column.key} className="p-2 text-left">{column.title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr 
                          key={user.id} 
                          className={`border-t hover:bg-muted/50 ${selectedUser === user.id ? 'bg-muted/50' : ''}`}
                          onClick={() => handleUserSelect(user.id)}
                        >
                          <td className="p-2">
                            <input
                              type="radio"
                              checked={selectedUser === user.id}
                              onChange={() => handleUserSelect(user.id)}
                              className="rounded-full"
                            />
                          </td>
                          <td className="p-2">{user.name}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">{user.department}</td>
                          <td className="p-2">{user.role}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline" onClick={() => setIsProjectSheetOpen(false)}>
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
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>검색 조건</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>프로젝트명</Label>
                <Input
                  placeholder="프로젝트명으로 검색"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>유형</Label>
                <Input
                  placeholder="유형으로 검색"
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>담당자</Label>
                <Input
                  placeholder="담당자로 검색"
                  value={searchManager}
                  onChange={(e) => setSearchManager(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>상태</Label>
                <Input
                  placeholder="상태로 검색"
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
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