'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Code, MoreVertical, Check, RefreshCw } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import TablePagination from "@/components/ui/table-pagination";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { yaml } from '@codemirror/lang-yaml';
import type { ReactNode } from 'react';
import type { Cluster } from "@/types/cluster"
import { getClusters, insertClusterArgoCd, getCommonCodeByGroupCode } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommonCode } from '@/types/groupcode';
import { getErrorMessage } from '@/lib/utils';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any, index?: number) => ReactNode;
}

export default function ArgoClusterRegistrationPage() {
  const { toast } = useToast()
  const [clusterData, setClusterData] = useState<Cluster[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCluster, setPageCluster] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeType, setCodeType] = useState<CommonCode[]>([]);

  const paginatedData = clusterData?.slice((pageCluster - 1) * pageSize, pageCluster * pageSize) || [];
  const totalPages = Math.ceil((clusterData?.length || 0) / pageSize);

  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageCluster - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'clusterName', title: '클러스터 이름', align: 'left' },
    { key: 'clusterType', title: '클러스터 타입', align: 'left' },
    {
      key: 'isArgo', title: 'Argo 등록여부', align: 'left',
      cell: (row: Cluster) => (
        <div className="flex justify-left">
          {row.isArgo && <Check className="h-4 w-4 text-green-500" />}
        </div>
      )
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: Cluster) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => clusterArgoClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              Argo등록
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];



  const fetchClusters = async (currentCodeType: CommonCode[]) => {
    setIsLoading(true);
    try {
      const response = await getClusters()

      const codeTypeMap = currentCodeType.reduce((acc, code) => {
        if (code.uid !== undefined) {
          acc[code.uid] = code.codeDesc ?? '';
        }
        return acc;
      }, {} as Record<string, string>);


      const enhancedResponse = response.map(item => ({
        ...item,
        clusterType: codeTypeMap[item.clusterTypeId ?? ''],
      }));

      setClusterData(enhancedResponse);
    } catch (error) {
      setClusterData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommonCode = async (groupCode: string) => {
    setIsLoading(true);
    try {
      const response = await getCommonCodeByGroupCode(groupCode)
      setCodeType(response);
      return response;
    } catch (error) {
      setCodeType([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const codeTypeData = await fetchCommonCode('cluster_type');
      await fetchClusters(codeTypeData);
    };

    fetchData();
  }, []);


  const handleRefresh = () => {
    fetchClusters(codeType);
  };



  const clusterArgoClick = (row: Cluster) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => clusterArgoSubmit(row));
    setConfirmDescription("등록하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const clusterArgoSubmit = async (row: Cluster) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertClusterArgoCd(row);
      toast({
        title: "Success",
        description: "클러스터가 ArgoCD에 성공적으로 등록되었습니다.",
      })
      fetchClusters(codeType);
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false);
      setIsConfirmOpen(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPageCluster(newPage);
  };

  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4 pt-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">클러스터 등록</h2>
            <p className="mt-1 text-sm text-gray-500">ArgoCD에 클러스터를 등록할 수 있습니다.</p>
          </div>
        </div>
      </div>
      <Card>
        <CardContent className="p-2">
          <DataTable
            columns={columns}
            data={paginatedData}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
          <TablePagination
            currentPage={pageCluster}
            totalPages={totalPages}
            dataLength={(clusterData?.length || 0)}
            onPageChange={handlePageChange}
            pageSize={pageSize}
          />
        </CardContent>
      </Card>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={confirmAction}
        description={confirmDescription}
      />

    </div>
  );
}
