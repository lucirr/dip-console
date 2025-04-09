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
import type { SystemLink } from "@/types/systemlink"
import { getSystemLink, insertSystemLink, updateSystemLink, deleteSystemLink } from "@/lib/actions"
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



export default function SystemLinkPage() {
  const { toast } = useToast()
  const [systemLinkData, setSystemLinkData] = useState<SystemLink[]>([]);
  const [isSystemLinkNewSheetOpen, setIsSystemLinkNewSheetOpen] = useState(false);
  const [isSystemLinkEditSheetOpen, setIsSystemLinkEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSystemLink, setPageSystemLink] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedSystemLink, setSelectedSystemLink] = useState<SystemLink | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsSystemLink, setFormErrorsSystemLink] = useState<{
    systemName?: string;
    linkUrl?: string;
    // image?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newCode, setNewCode] = useState<SystemLink>({
    systemName: '',
    linkUrl: '',
    image: '',
    enable: false,
  });

  const [editSystemLink, setEditSystemLink] = useState<SystemLink>({
    uid: '',
    systemName: '',
    linkUrl: '',
    image: '',
    enable: false,
  });



  const formSchemaSystemLink = z.object({
    systemName: z.string().min(1, { message: "시스템명은 필수 입력 항목입니다." }),
    linkUrl: z.string().min(1, { message: "URL은 필수 입력 항목입니다." }),
    // image: z.string().min(1, { message: "이미지는 필수 입력 항목입니다." }),
  });



  const paginatedData = systemLinkData?.slice((pageSystemLink - 1) * pageSize, pageSystemLink * pageSize) || [];
  const totalPages = Math.ceil((systemLinkData?.length || 0) / pageSize);


  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageSystemLink - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'systemName', title: '시스템명', align: 'left' },
    { key: 'linkUrl', title: 'URL', align: 'left' },
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
      key: 'createdAt', title: '등록일자', align: 'left',
      cell: (row: SystemLink) => {
        if (!row.createdAt) return '-';
        return format(new Date(row.createdAt), 'yyyy-MM-dd');
      }
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: SystemLink) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleClick(row.linkUrl)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              링크
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => systemLinkEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => systemLinkDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];



  const fetchSystemLink = async () => {
    setIsLoading(true);
    try {
      const response = await getSystemLink()
      setSystemLinkData(response);
    } catch (error) {
      setSystemLinkData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    fetchSystemLink();
  }, []);

  useEffect(() => {
    setFormErrorsSystemLink(null);
  }, [isSystemLinkNewSheetOpen]);

  const handleRefresh = () => {
    fetchSystemLink();
  };

  const systemLinkNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsSystemLink(null);

    const validationResult = formSchemaSystemLink.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'systemName' || field === 'linkUrl' || field === 'image') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsSystemLink(errors);
      return;
    }
    setConfirmAction(() => newSystemLinkSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newSystemLinkSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertSystemLink(newCode);
      toast({
        title: "Success",
        description: "시스템 카탈로그가 성공적으로 추가되었습니다.",
      })
      setNewCode({
        systemName: '',
        linkUrl: '',
        image: '',
        enable: false,
      });
      setIsSystemLinkNewSheetOpen(false);
      fetchSystemLink();
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



  const systemLinkEditSheetClick = (row: SystemLink) => {
    setSelectedSystemLink(row);
    setEditSystemLink({
      uid: row.uid,
      systemName: row.systemName,
      linkUrl: row.linkUrl,
      image: row.image,
      enable: row.enable,
    });
    setFormErrorsSystemLink(null);
    setIsSystemLinkEditSheetOpen(true);
  };

  const systemLinkEditClick = () => {
    if (isSubmitting) return;

    setFormErrorsSystemLink(null);

    const validationResult = formSchemaSystemLink.safeParse(editSystemLink);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'systemName' || field === 'linkUrl' || field === 'image') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsSystemLink(errors);
      return;
    }
    setConfirmAction(() => systemLinkEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const systemLinkEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateSystemLink(editSystemLink);
      toast({
        title: "Success",
        description: "시스템 카탈로그가 성공적으로 수정되었습니다.",
      })
      setIsSystemLinkEditSheetOpen(false);
      fetchSystemLink();
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

  const systemLinkDeleteClick = (row: SystemLink) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => systemLinkDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const systemLinkDeleteSubmit = async (row: SystemLink) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteSystemLink(row);
      toast({
        title: "Success",
        description: "시스템 카탈로그가 성공적으로 삭제되었습니다.",
      })
      fetchSystemLink();
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
    setPageSystemLink(newPage);
  };




  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">시스템 카탈로그</h2>
            <p className="mt-1 text-sm text-gray-500">시스템 카탈로그를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isSystemLinkNewSheetOpen} onOpenChange={setIsSystemLinkNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                시스템 카탈로그
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 시스템 카탈로그 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="systemLink-name" className="flex items-center">
                      시스템명 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="systemLink-name"
                      placeholder="시스템명 입력"
                      value={newCode.systemName}
                      onChange={(e) => {
                        setNewCode({ ...newCode, systemName: e.target.value });
                        setFormErrorsSystemLink(prevErrors => ({
                          ...prevErrors,
                          systemName: undefined,
                        }));
                      }}
                      className={formErrorsSystemLink?.systemName ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsSystemLink?.systemName && <p className="text-red-500 text-sm">{formErrorsSystemLink.systemName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemLink-url" className="flex items-center">
                      URL <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="systemLink-url"
                      placeholder=""
                      value={newCode.linkUrl}
                      onChange={(e) => {
                        setNewCode({ ...newCode, linkUrl: e.target.value });
                        setFormErrorsSystemLink(prevErrors => ({
                          ...prevErrors,
                          linkUrl: undefined,
                        }));
                      }}
                      className={formErrorsSystemLink?.linkUrl ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsSystemLink?.linkUrl && <p className="text-red-500 text-sm">{formErrorsSystemLink.linkUrl}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catalog-image">카탈로그 이미지</Label>
                    <Textarea
                      id="catalog-image"
                      placeholder="이미지 URL 입력"
                      value={newCode.image}
                      onChange={(e) => setNewCode(prev => ({ ...prev, image: e.target.value }))}
                      className="min-h-[100px] resize-y"
                      aria-describedby="catalog-image-description"
                    />
                  </div>

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsSystemLinkNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={systemLinkNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isSystemLinkEditSheetOpen} onOpenChange={setIsSystemLinkEditSheetOpen}>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>시스템 카탈로그 수정</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-systemLink-name" className="flex items-center">
                      시스템명 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-systemLink-name"
                      placeholder="시스템명 입력"
                      value={editSystemLink.systemName}
                      onChange={(e) => {
                        setEditSystemLink({ ...editSystemLink, systemName: e.target.value });
                        setFormErrorsSystemLink(prevErrors => ({
                          ...prevErrors,
                          systemName: undefined,
                        }));
                      }}
                      className={formErrorsSystemLink?.systemName ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsSystemLink?.systemName && <p className="text-red-500 text-sm">{formErrorsSystemLink.systemName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-systemLink-url" className="flex items-center">
                      URL <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="edit-systemLink-url"
                      placeholder=""
                      value={editSystemLink.linkUrl}
                      onChange={(e) => {
                        setEditSystemLink({ ...editSystemLink, linkUrl: e.target.value });
                        setFormErrorsSystemLink(prevErrors => ({
                          ...prevErrors,
                          linkUrl: undefined,
                        }));
                      }}
                      className={formErrorsSystemLink?.linkUrl ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsSystemLink?.linkUrl && <p className="text-red-500 text-sm">{formErrorsSystemLink.linkUrl}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-image">이미지</Label>
                    <Textarea
                      id="edit-catalog-image"
                      placeholder="이미지 입력"
                      value={editSystemLink.image}
                      onChange={(e) => setEditSystemLink(prev => ({ ...prev, image: e.target.value }))}
                      className="min-h-[100px] resize-y"
                      aria-describedby="edit-catalog-image-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-desc">활성화</Label>
                    <div className="mt-2">
                      <Checkbox
                        id="edit-enable"
                        placeholder="활성화"
                        checked={editSystemLink.enable}
                        onCheckedChange={(checked) => {
                          setEditSystemLink({ ...editSystemLink, enable: checked as boolean });
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6 pb-6">
                    <Button variant="outline" size="sm" onClick={() => setIsSystemLinkEditSheetOpen(false)}>
                      취소
                    </Button>
                    <Button size="sm" onClick={systemLinkEditClick} disabled={isSubmitting}>
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
            currentPage={pageSystemLink}
            totalPages={totalPages}
            dataLength={(systemLinkData?.length || 0)}
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
