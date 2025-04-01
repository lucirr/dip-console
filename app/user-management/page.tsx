'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';

const lightTheme = createTheme({
  theme: 'light',
  settings: {
    background: '#ffffff',
    foreground: '#24292e',
    selection: '#b3d7ff',
    selectionMatch: '#b3d7ff',
    gutterBackground: '#ffffff',
    gutterForeground: '#6e7781',
  },
  styles: [
    { tag: t.comment, color: '#6a737d' },
    { tag: t.variableName, color: '#24292e' },
    { tag: t.definition(t.variableName), color: '#22863a' },
    { tag: t.keyword, color: '#d73a49' },
    { tag: t.string, color: '#032f62' },
    { tag: t.number, color: '#005cc5' },
    { tag: t.bool, color: '#005cc5' },
    { tag: t.null, color: '#005cc5' },
    { tag: t.propertyName, color: '#005cc5' },
    { tag: t.typeName, color: '#6f42c1' },
    { tag: t.className, color: '#6f42c1' },
    { tag: t.function(t.variableName), color: '#6f42c1' },
    { tag: t.definition(t.typeName), color: '#6f42c1' },
    { tag: t.bracket, color: '#24292e' },
    { tag: t.punctuation, color: '#24292e' },
    { tag: t.operator, color: '#d73a49' },
  ],
});

const mockData = [
  {
    id: 'USR001',
    name: '김철수',
    email: 'kim@example.com',
    role: '개발자',
    department: '개발팀',
    status: '활성',
    lastLogin: '2024-03-20',
  },
  {
    id: 'USR002',
    name: '이영희',
    email: 'lee@example.com',
    role: '개발자',
    department: '개발팀',
    status: '활성',
    lastLogin: '2024-03-20',
  },
];

const columns = [
  { key: 'name', title: '이름', width: 'w-[100px]' },
  { key: 'email', title: '이메일' },
  { key: 'role', title: '역할', width: 'w-[80px]' },
  { key: 'department', title: '부서', width: 'w-[100px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'lastLogin', title: '최근접속일', width: 'w-[120px]' },
];

export default function UserManagementPage() {
  const [data, setData] = useState(mockData);
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    department: '개발팀',
    role: '개발자',
    description: '',
    status: '활성'
  });

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  const handleSearch = () => {
    const filteredData = mockData.filter(item => {
      const nameMatch = !searchName || item.name.toLowerCase().includes(searchName.toLowerCase());
      const emailMatch = !searchEmail || item.email.toLowerCase().includes(searchEmail.toLowerCase());
      const roleMatch = !searchRole || item.role.toLowerCase() === searchRole.toLowerCase();
      const departmentMatch = !searchDepartment || item.department.toLowerCase().includes(searchDepartment.toLowerCase());
      const statusMatch = !searchStatus || item.status.toLowerCase() === searchStatus.toLowerCase();
      return nameMatch && emailMatch && roleMatch && departmentMatch && statusMatch;
    });
    setData(filteredData);
  };

  const handleReset = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchRole('');
    setSearchDepartment('');
    setSearchStatus('');
    setData(mockData);
  };

  const handleNewUserSubmit = () => {
    const newUserData = {
      ...newUser,
      id: `USR${String(data.length + 1).padStart(3, '0')}`,
      lastLogin: new Date().toISOString().split('T')[0]
    };

    setData([...data, newUserData]);
    setNewUser({
      name: '',
      email: '',
      department: '개발팀',
      role: '개발자',
      description: '',
      status: '활성'
    });
    setIsSheetOpen(false);
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">사용자 관리</h2>
            <p className="mt-1 text-sm text-gray-500">사용자를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                사용자 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className="flex-shrink-0">
                  <SheetTitle>새 사용자 추가</SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>부서</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">개발팀</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>역할</Label>
                        <div className="p-2 bg-muted rounded-md">
                          <span className="text-sm">개발자</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>설명</Label>
                      <div className="border rounded-md overflow-hidden">
                        <CodeMirror
                          value={newUser.description}
                          height="200px"
                          theme={lightTheme}
                          extensions={[javascript({ jsx: true })]}
                          onChange={(value) => setNewUser({ ...newUser, description: value })}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
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
      </div>
      <div className="grid gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>이름</Label>
                <Input
                  placeholder="이름으로 검색"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>이메일</Label>
                <Input
                  placeholder="이메일로 검색"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>역할</Label>
                <Input
                  placeholder="역할로 검색"
                  value={searchRole}
                  onChange={(e) => setSearchRole(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>부서</Label>
                <Input
                  placeholder="부서로 검색"
                  value={searchDepartment}
                  onChange={(e) => setSearchDepartment(e.target.value)}
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