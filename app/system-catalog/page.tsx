'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

const mockData = [
  {
    id: 'SYS001',
    name: '기본 시스템',
    type: '운영체제',
    version: '1.0.0',
    status: '활성',
    maintainer: '시스템팀',
    createdAt: '2024-03-20',
  },
  {
    id: 'SYS002',
    name: '모니터링 시스템',
    type: '모니터링',
    version: '2.1.0',
    status: '활성',
    maintainer: '운영팀',
    createdAt: '2024-03-20',
  },
];

const columns = [
  { key: 'name', title: '시스템명' },
  { key: 'type', title: '유형', width: 'w-[100px]' },
  { key: 'version', title: '버전', width: 'w-[80px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'maintainer', title: '담당팀', width: 'w-[100px]' },
  { key: 'createdAt', title: '생성일자', width: 'w-[120px]' },
];

export default function SystemCatalogPage() {
  const [data, setData] = useState(mockData);

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">시스템 카탈로그</h2>
            <p className="mt-1 text-sm text-gray-500">시스템 카탈로그를 조회하고 관리할 수 있습니다.</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            시스템 추가
          </Button>
        </div>
      </div>
      <div className="grid gap-4">
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