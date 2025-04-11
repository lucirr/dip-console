'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Code, MoreVertical, Check, RefreshCw, LinkIcon } from 'lucide-react';
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
import type { License } from "@/types/license"
import { getLicense, insertLicense, deleteLicense } from "@/lib/actions"
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



export default function LicenseManagementPage() {
  const { toast } = useToast()
  const [licenseData, setLicenseData] = useState<License[]>([]);
  const [isLicenseNewSheetOpen, setIsLicenseNewSheetOpen] = useState(false);
  const [isLicenseEditSheetOpen, setIsLicenseEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLicense, setPageLicense] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsLicense, setFormErrorsLicense] = useState<{
    file?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCode, setNewCode] = useState<License>({
    file: '',
    enable: true,
  });

  const [editLicense, setEditLicense] = useState<License>({
    name: '',
    catalogs: '',
    hosts: '',
    file: '',
    validDate: '',
    createdDate: '',
    enable: false,
  });



  const formSchemaLicense = z.object({
    file: z.string().min(1, { message: "파일은 필수 입력 항목입니다." }),
  });



  const paginatedData = licenseData.slice((pageLicense - 1) * pageSize, pageLicense * pageSize);
  const totalPages = Math.ceil(licenseData.length / pageSize);


  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageLicense - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'name', title: '이름', align: 'left' },
    { key: 'createdDate', title: '발행일자', align: 'left' },
    { key: 'validDate', title: '유효일자', align: 'left' },
    {
      key: 'enable',
      title: '활성화',
      width: 'w-[100px]',
      align: 'left',
      cell: (row: CommonCode) => (
        <div className="flex justify-left">
          {row.enable && <Check className="h-4 w-4 text-green-500" />}
        </div>
      )
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: License) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => licenseEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              보기
            </DropdownMenuItem>
            {row.enable == false && (
              <DropdownMenuItem onClick={() => licenseDeleteClick(row)}>
                <Code className="h-4 w-4 mr-2" />
                삭제
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];



  const fetchLicense = async () => {
    setIsLoading(true);
    try {
      const response = await getLicense()
      setLicenseData(response);
    } catch (error) {
      setLicenseData([]);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchLicense();
  }, []);

  useEffect(() => {
    setFormErrorsLicense(null);
  }, [isLicenseNewSheetOpen]);

  const handleRefresh = () => {
    fetchLicense();
  };

  const licenseNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsLicense(null);

    const validationResult = formSchemaLicense.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'file') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsLicense(errors);
      return;
    }
    setConfirmAction(() => newLicenseSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newLicenseSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertLicense(newCode);
      toast({
        title: "Success",
        description: "라이센스가 성공적으로 추가되었습니다.",
      })
      setNewCode({
        file: '',
        enable: true,
      });
      setIsLicenseNewSheetOpen(false);
      fetchLicense();
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



  const licenseEditSheetClick = (row: License) => {
    setSelectedLicense(row);
    setEditLicense({
      uid: row.uid,
      name: row.name,
      catalogs: row.catalogs,
      hosts: row.hosts,
      file: row.file,
      validDate: row.validDate,
      createdDate: row.createdDate,
      enable: row.enable,
    });
    setFormErrorsLicense(null);
    setIsLicenseEditSheetOpen(true);
  };



  const licenseDeleteClick = (row: License) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => licenseDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const licenseDeleteSubmit = async (row: License) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteLicense(row);
      toast({
        title: "Success",
        description: "라이센스가 성공적으로 삭제되었습니다.",
      })
      fetchLicense();
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
    setPageLicense(newPage);
  };




  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4 pt-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">라이센스 관리</h2>
            <p className="mt-1 text-sm text-gray-500">라이센스를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isLicenseNewSheetOpen} onOpenChange={setIsLicenseNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                라이센스
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 라이센스 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="file" className="flex items-center">
                      파일 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Textarea
                      id="file"
                      placeholder=""
                      value={newCode.file}
                      onChange={(e) => {
                        setNewCode({ ...newCode, file: e.target.value });
                        setFormErrorsLicense(prevErrors => ({
                          ...prevErrors,
                          file: undefined,
                        }));
                      }}
                      className="min-h-[160px] resize-y"
                      aria-describedby="catalog-image-description"
                      required
                    />
                    {formErrorsLicense?.file && <p className="text-red-500 text-sm">{formErrorsLicense.file}</p>}
                  </div>

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsLicenseNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={licenseNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isLicenseEditSheetOpen} onOpenChange={setIsLicenseEditSheetOpen}>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>라이센스 세부 정보</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-license-name" className="flex items-center">
                      이름
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editLicense.name}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-createdDate" className="flex items-center">
                      발행일자
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editLicense.createdDate}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-validDate" className="flex items-center">
                      유효일자
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editLicense.validDate}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-enable" className="flex items-center">
                      활성화
                    </Label>
                    <div className="mt-2">
                      <Checkbox
                        id="edit-enable"
                        placeholder="활성화"
                        checked={editLicense.enable}
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-host" className="flex items-center">
                      허용 Host
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editLicense.hosts}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog" className="flex items-center">
                      허용 카탈로그
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editLicense.catalogs}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-file" className="flex items-center">
                      파일
                    </Label>
                    <Textarea
                      id="file"
                      placeholder=""
                      value={editLicense.file}
                      className="min-h-[160px] resize-y"
                      aria-describedby="catalog-image-description"
                      disabled
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-6 pb-6">
                    <Button variant="outline" size="sm" onClick={() => setIsLicenseEditSheetOpen(false)}>
                      취소
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
            currentPage={pageLicense}
            totalPages={totalPages}
            dataLength={licenseData.length}
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
