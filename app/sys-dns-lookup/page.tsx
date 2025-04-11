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
import type { Dns } from "@/types/dns"
import { getDns, insertDns, updateDns, deleteDns } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommonCode } from '@/types/groupcode';
import { getErrorMessage } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any, index?: number) => ReactNode;
}



export default function SysDnsLookupPage() {
  const { toast } = useToast()
  const [dnsData, setDnsData] = useState<Dns[]>([]);
  const [isDnsNewSheetOpen, setIsDnsNewSheetOpen] = useState(false);
  const [isDnsEditSheetOpen, setIsDnsEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageDns, setPageDns] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedDns, setSelectedDns] = useState<Dns | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsDns, setFormErrorsDns] = useState<{
    name?: string;
    type?: string;
    value?: string;
    ttl?: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCode, setNewCode] = useState<Dns>({
    name: '',
    type: '',
    value: '',
    ttl: 600,
  });

  const [editDns, setEditDns] = useState<Dns>({
    uid: '',
    name: '',
    type: '',
    value: '',
    ttl: 600,
  });



  const formSchemaDns = z.object({
    name: z.string().min(1, { message: "이름은 필수 입력 항목입니다." }),
    type: z.string().min(1, { message: "유형은 필수 입력 항목입니다." }),
    value: z.string().min(1, { message: "IP는 필수 입력 항목입니다." }),
    ttl: z.number().min(1, { message: "ttl은 필수 입력 항목입니다." }),
  });



  const paginatedData = dnsData?.slice((pageDns - 1) * pageSize, pageDns * pageSize) || [];
  const totalPages = Math.ceil((dnsData?.length || 0) / pageSize);


  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageDns - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'name', title: '이름', align: 'left' },
    {
      key: 'type', title: ' 유형', align: 'left',
      cell: (row: any) => (
        <Badge variant="secondary">{row.type}</Badge>
      )
    },
    { key: 'value', title: 'IP', align: 'left' },
    { key: 'ttl', title: 'ttl', align: 'left' },
    {
      key: 'createdAt', title: '등록일자', align: 'left',
      cell: (row: Dns) => {
        if (!row.createdAt) return '-';
        return format(new Date(row.createdAt), 'yyyy-MM-dd');
      }
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: Dns) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => dnsEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => dnsDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];



  const fetchDns = async () => {
    setIsLoading(true);
    try {
      const response = await getDns()
      setDnsData(response);
    } catch (error) {
      setDnsData([]);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchDns();
  }, []);

  useEffect(() => {
    setFormErrorsDns(null);
  }, [isDnsNewSheetOpen]);

  const handleRefresh = () => {
    fetchDns();
  };

  const dnsNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsDns(null);

    const validationResult = formSchemaDns.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'name' || field === 'type' || field === 'value' || field === 'ttl') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsDns(errors);
      return;
    }
    setConfirmAction(() => newDnsSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newDnsSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertDns(newCode);
      toast({
        title: "Success",
        description: "클러스터가 성공적으로 추가되었습니다.",
      })
      setNewCode({
        name: '',
        type: '',
        value: '',
        ttl: 600,
      });
      setIsDnsNewSheetOpen(false);
      fetchDns();
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



  const dnsEditSheetClick = (row: Dns) => {
    setSelectedDns(row);
    setEditDns({
      uid: row.uid,
      name: row.name,
      type: row.type,
      value: row.value,
      ttl: row.ttl,
    });
    setFormErrorsDns(null);
    setIsDnsEditSheetOpen(true);
  };

  const dnsEditClick = () => {
    if (isSubmitting) return;

    setFormErrorsDns(null);

    const validationResult = formSchemaDns.safeParse(editDns);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'name' || field === 'type' || field === 'value' || field === 'ttl') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsDns(errors);
      return;
    }
    setConfirmAction(() => dnsEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const dnsEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateDns(editDns);
      toast({
        title: "Success",
        description: "클러스터가 성공적으로 수정되었습니다.",
      })
      setIsDnsEditSheetOpen(false);
      fetchDns();
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

  const dnsDeleteClick = (row: Dns) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => dnsDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const dnsDeleteSubmit = async (row: Dns) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteDns(row);
      toast({
        title: "Success",
        description: "클러스터가 성공적으로 삭제되었습니다.",
      })
      fetchDns();
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
    setPageDns(newPage);
  };




  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4 pt-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">DNS 조회</h2>
            <p className="mt-1 text-sm text-gray-500">DNS를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isDnsNewSheetOpen} onOpenChange={setIsDnsNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                DNS 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 DNS 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="dns-name" className="flex items-center">
                      이름 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="dns-name"
                      placeholder="이름 입력"
                      value={newCode.name}
                      onChange={(e) => {
                        setNewCode({ ...newCode, name: e.target.value });
                        setFormErrorsDns(prevErrors => ({
                          ...prevErrors,
                          name: undefined,
                        }));
                      }}
                      className={formErrorsDns?.name ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsDns?.name && <p className="text-red-500 text-sm">{formErrorsDns.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dns-type" className="flex items-center">
                      타입 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCode.type}
                      onValueChange={(value) => {
                        setNewCode({
                          ...newCode,
                          type: value,
                        });
                        setFormErrorsDns(prevErrors => ({
                          ...prevErrors,
                          type: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="dns-type"
                        className={formErrorsDns?.type ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="타입 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="MX">MX</SelectItem>
                        <SelectItem value="CNAME">CNAME</SelectItem>
                        <SelectItem value="TXT">TXT</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrorsDns?.type && <p className="text-red-500 text-sm">{formErrorsDns.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dns-url" className="flex items-center">
                      IP <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="dns-url"
                      placeholder="192.168.1.1"
                      value={newCode.value}
                      onChange={(e) => {
                        setNewCode({ ...newCode, value: e.target.value });
                        setFormErrorsDns(prevErrors => ({
                          ...prevErrors,
                          value: undefined,
                        }));
                      }}
                      className={formErrorsDns?.value ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsDns?.value && <p className="text-red-500 text-sm">{formErrorsDns.value}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain" className="flex items-center">
                      ttl <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="ttl"
                      placeholder="600"
                      value={newCode.ttl}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value) {
                          setNewCode({ ...newCode, ttl: parseInt(value, 10) });
                          setFormErrorsDns(prevErrors => ({
                            ...prevErrors,
                            ttl: undefined,
                          }));
                        }
                      }}
                      type="number"
                      className={formErrorsDns?.ttl ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsDns?.ttl && <p className="text-red-500 text-sm">{formErrorsDns.ttl}</p>}
                  </div>

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsDnsNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={dnsNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isDnsEditSheetOpen} onOpenChange={setIsDnsEditSheetOpen}>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>DNS 수정</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-dns-name" className="flex items-center">
                      이름 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-dns-name"
                      placeholder="이름 입력"
                      value={editDns.name}
                      onChange={(e) => {
                        setEditDns({ ...editDns, name: e.target.value });
                        setFormErrorsDns(prevErrors => ({
                          ...prevErrors,
                          name: undefined,
                        }));
                      }}
                      className={formErrorsDns?.name ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsDns?.name && <p className="text-red-500 text-sm">{formErrorsDns.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-dns-type" className="flex items-center">
                      유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={editDns.type}
                      onValueChange={(value) => {
                        setEditDns({
                          ...editDns,
                          type: value,
                        });
                        setFormErrorsDns(prevErrors => ({
                          ...prevErrors,
                          type: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="edit-dns-type"
                        className={formErrorsDns?.type ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="타입 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="MX">MX</SelectItem>
                        <SelectItem value="CNAME">CNAME</SelectItem>
                        <SelectItem value="TXT">TXT</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrorsDns?.type && <p className="text-red-500 text-sm">{formErrorsDns.type}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-dns-url" className="flex items-center">
                      IP <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-dns-url"
                      placeholder="192.168.1.1"
                      value={editDns.value}
                      onChange={(e) => {
                        setEditDns({ ...editDns, value: e.target.value });
                        setFormErrorsDns(prevErrors => ({
                          ...prevErrors,
                          value: undefined,
                        }));
                      }}
                      className={formErrorsDns?.value ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsDns?.value && <p className="text-red-500 text-sm">{formErrorsDns.value}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-domain" className="flex items-center">
                      ttl <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-domain"
                      placeholder="example.com"
                      value={editDns.ttl}
                      onChange={(e) => {
                        setEditDns({ ...editDns, ttl: parseInt(e.target.value, 10) });
                        setFormErrorsDns(prevErrors => ({
                          ...prevErrors,
                          domain: undefined,
                        }));
                      }}
                      type="number"
                      className={formErrorsDns?.ttl ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsDns?.ttl && <p className="text-red-500 text-sm">{formErrorsDns.ttl}</p>}
                  </div>

                  <div className="flex justify-end space-x-2 mt-6 pb-6">
                    <Button variant="outline" size="sm" onClick={() => setIsDnsEditSheetOpen(false)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={dnsEditClick} disabled={isSubmitting}>
                      저장
                    </Button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>


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
            currentPage={pageDns}
            totalPages={totalPages}
            dataLength={(dnsData?.length || 0)}
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
