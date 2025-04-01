'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

const mockData = [
  {
    id: 'LIC001',
    name: '기업용 라이센스',
    type: '상용',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: '활성',
    seats: 100,
  },
  {
    id: 'LIC002',
    name: '개발용 라이센스',
    type: '개발',
    startDate: '2024-03-01',
    endDate: '2024-12-31',
    status: '활성',
    seats: 20,
  },
];

const columns = [
  { key: 'name', title: '라이센스명' },
  { key: 'type', title: '유형', width: 'w-[80px]' },
  { key: 'startDate', title: '시작일', width: 'w-[100px]' },
  { key: 'endDate', title: '만료일', width: 'w-[100px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'seats', title: '사용자수', width: 'w-[100px]' },
];

export default function LicenseManagementPage() {
  const [data, setData] = useState(mockData);

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">라이센스 관리</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          라이센스 추가
        </Button>
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