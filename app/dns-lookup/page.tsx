'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';

const mockData = [
  {
    id: 'DNS001',
    hostname: 'example.com',
    ipAddress: '192.168.1.1',
    type: 'A',
    ttl: 3600,
    status: '활성',
    updatedAt: '2024-03-20',
  },
  {
    id: 'DNS002',
    hostname: 'mail.example.com',
    ipAddress: '192.168.1.2',
    type: 'MX',
    ttl: 3600,
    status: '활성',
    updatedAt: '2024-03-20',
  },
];

const columns = [
  { key: 'hostname', title: '호스트명' },
  { key: 'ipAddress', title: 'IP 주소', width: 'w-[120px]' },
  { key: 'type', title: '유형', width: 'w-[80px]' },
  { key: 'ttl', title: 'TTL', width: 'w-[80px]' },
  { key: 'status', title: '상태', width: 'w-[80px]' },
  { key: 'updatedAt', title: '수정일자', width: 'w-[120px]' },
];

export default function DnsLookupPage() {
  const [data, setData] = useState(mockData);

  const handleRefresh = () => {
    console.log('Refreshing data...');
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">DNS 조회</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          DNS 추가
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