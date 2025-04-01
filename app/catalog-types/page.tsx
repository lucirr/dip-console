'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

const mockData = [
  {
    id: 'TYPE001',
    code: 'WEB_APP',
    name: '웹 애플리케이션',
    description: '웹 기반 애플리케이션',
    category: '애플리케이션',
    useYn: 'Y',
    createdAt: '2024-03-20',
  },
  {
    id: 'TYPE002',
    code: 'MSA',
    name: '마이크로서비스',
    description: '마이크로서비스 아키텍처',
    category: '아키텍처',
    useYn: 'Y',
    createdAt: '2024-03-20',
  },
];

const columns = [
  { key: 'code', title: '코드', width: 'w-[100px]' },
  { key: 'name', title: '이름' },
  { key: 'description', title: '설명' },
  { key: 'category', title: '카테고리', width: 'w-[100px]' },
  { key: 'useYn', title: '사용여부', width: 'w-[80px]' },
  { key: 'createdAt', title: '생성일자', width: 'w-[120px]' },
];

export default function CatalogTypesPage() {
  const [data, setData] = useState(mockData);

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">카탈로그 유형</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          유형 추가
        </Button>
      </div>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>카탈로그 유형 목록</CardTitle>
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