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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { yaml } from '@codemirror/lang-yaml';
import type { ReactNode } from 'react';
import type { Cluster } from "@/types/cluster"
import { getCluster, insertCluster, updateCluster, deleteCluster, getCommonCodeByGroupCode } from "@/lib/actions"
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



export default function ClusterPage() {
  const { toast } = useToast()
  const [clusterData, setClusterData] = useState<Cluster[]>([]);
  const [isClusterNewSheetOpen, setIsClusterNewSheetOpen] = useState(false);
  const [isClusterEditSheetOpen, setIsClusterEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageCluster, setPageCluster] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsCluster, setFormErrorsCluster] = useState<{
    clusterName?: string;
    clusterTypeId?: string;
    clusterUrl?: string;
    domain?: string;
    clusterLbIp?: string;
    clusterToken?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeType, setCodeType] = useState<CommonCode[]>([]);

  const [newCode, setNewCode] = useState<Cluster>({
    clusterName: '',
    clusterUrl: '',
    clusterToken: '',
    clusterLbIp: '',
    clusterType: '',
    clusterTypeId: '',
    clusterDesc: '',
    domain: '',
    isArgo: false,
  });

  const [editCluster, setEditCluster] = useState<Cluster>({
    uid: '',
    clusterName: '',
    clusterUrl: '',
    clusterToken: '',
    clusterLbIp: '',
    clusterType: '',
    clusterTypeId: '',
    clusterDesc: '',
    domain: '',
    isArgo: false,
  });



  const formSchemaCluster = z.object({
    clusterName: z.string().min(1, { message: "클러스터 이름은 필수 입력 항목입니다." }),
    clusterTypeId: z.string().min(1, { message: "클러스터 타입은 필수 입력 항목입니다." }),
    clusterUrl: z.string().min(1, { message: "클러스터 주소는 필수 입력 항목입니다." }),
    domain: z.string().min(1, { message: "서비스 도메인은 필수 입력 항목입니다." }),
    clusterLbIp: z.string().min(1, { message: "클러스터 LB IP는 필수 입력 항목입니다." }),
    clusterToken: z.string().min(1, { message: "클러스터 토큰은  필수 입력 항목입니다." }),
  });



  const paginatedData = clusterData.slice((pageCluster - 1) * pageSize, pageCluster * pageSize);
  const totalPages = Math.ceil(clusterData.length / pageSize);


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
      key: 'isArgo', title: 'Argo 등록여부부', align: 'left',
      cell: (row: Cluster) => (
        <div className="flex justify-left">
          {row.isArgo && <Check className="h-4 w-4 text-green-500" />}
        </div>
      )
    },
    { key: 'clusterDesc', title: '설명', align: 'left' },
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
            <DropdownMenuItem onClick={() => clusterEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              편집
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => clusterDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];



  const fetchClusters = async () => {
    setIsLoading(true);
    try {
      const response = await getCluster()
      setClusterData(response);
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
    } catch (error) {
      setCodeType([]);
    } finally {
      setIsLoading(false);
    }
  };



  useEffect(() => {
    fetchClusters();
    fetchCommonCode('cluster_type');
  }, []);




  useEffect(() => {
    setFormErrorsCluster(null);
  }, [isClusterNewSheetOpen]);



  const handleRefresh = () => {
    fetchClusters();
  };



  const clusterNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsCluster(null);

    const validationResult = formSchemaCluster.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        console.log(field)
        // 필수 입력 필드 검증
        if (field === 'cluster' || field === 'catalogServiceTypeId' || field === 'argoDeployType') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsCluster(errors);
      return;
    }
    setConfirmAction(() => newClusterSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newClusterSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await insertCluster(newCode);
      toast({
        title: "Success",
        description: "클러스터이 성공적으로 추가되었습니다.",
      })
      setNewCode({
        clusterName: '',
        clusterUrl: '',
        clusterToken: '',
        clusterLbIp: '',
        clusterType: '',
        clusterTypeId: '',
        clusterDesc: '',
        domain: '',
        isArgo: false,
      });
      setIsClusterNewSheetOpen(false);
      fetchClusters();
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



  const clusterEditSheetClick = (row: Cluster) => {
    setSelectedCluster(row);
    setEditCluster({
      uid: row.uid,
      clusterName: row.clusterName,
      clusterUrl: row.clusterUrl,
      clusterToken: row.clusterToken,
      clusterLbIp: row.clusterLbIp,
      clusterType: row.clusterType,
      clusterTypeId: row.clusterTypeId,
      clusterDesc: row.clusterDesc,
      domain: row.domain,
      isArgo: row.isArgo,
    });
    setFormErrorsCluster(null);
    setIsClusterEditSheetOpen(true);
  };

  const clusterEditClick = () => {
    if (isSubmitting) return;

    setFormErrorsCluster(null);

    const validationResult = formSchemaCluster.safeParse(editCluster);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'cluster' || field === 'serviceType' || field === 'argoDeployType') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsCluster(errors);
      return;
    }
    setConfirmAction(() => clusterEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const clusterEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateCluster(editCluster);
      toast({
        title: "Success",
        description: "클러스터가 성공적으로 수정되었습니다.",
      })
      setIsClusterEditSheetOpen(false);
      fetchClusters();
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

  const clusterDeleteClick = (row: Cluster) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => clusterSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const clusterSubmit = async (row: Cluster) => {
    console.log(isSubmitting)
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteCluster(row);
      toast({
        title: "Success",
        description: "클러스터가 성공적으로 삭제되었습니다.",
      })
      fetchClusters();
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
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">클러스터</h2>
            <p className="mt-1 text-sm text-gray-500">클러스터을 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isClusterNewSheetOpen} onOpenChange={setIsClusterNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                클러스터 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 클러스터 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="new-code" className="flex items-center">
                      클러스터 이름 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input
                      id="new-code"
                      placeholder="클러스터 입력"
                      value={newCode.clusterName}
                      onChange={(e) => {
                        setNewCode({ ...newCode, clusterName: e.target.value });
                        setFormErrorsCluster(prevErrors => ({
                          ...prevErrors,
                          clusterName: undefined,
                        }));
                      }}
                      className={formErrorsCluster?.clusterName ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsCluster?.clusterName && <p className="text-red-500 text-sm">{formErrorsCluster.clusterName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="catalog-service-type" className="flex items-center">
                      클러스터 타입 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCode.clusterTypeId}
                      onValueChange={(value) => {
                        setNewCode({ ...newCode, clusterTypeId: value });
                        setFormErrorsCluster(prevErrors => ({
                          ...prevErrors,
                          clusterTypeId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="catalog-service-type"
                        className={formErrorsCluster?.clusterTypeId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="클러스터 타입 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {codeType.map((item) => (
                          <SelectItem key={item.uid || ''} value={item.uid || ''}>
                            {item.codeDesc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsCluster?.clusterTypeId && <p className="text-red-500 text-sm">{formErrorsCluster.clusterTypeId}</p>}
                  </div>

                  

                  <div className="space-y-2">
                    <Label htmlFor="catalog-image">클러스터 토큰</Label>
                    <Textarea
                      id="catalog-image"
                      placeholder="이미지 URL 입력"
                      value={newCode.clusterToken}
                      onChange={(e) => setNewCode(prev => ({ ...prev, clusterToken: e.target.value }))}
                      className="min-h-[100px] resize-y"
                      aria-describedby="catalog-image-description"
                    />

                  </div>

                  

                  

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsClusterNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={clusterNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>

              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isClusterEditSheetOpen} onOpenChange={setIsClusterEditSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>클러스터 수정</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-type" className="flex items-center">
                      클러스터 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editCluster.cluster}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-service-type" className="flex items-center">
                      클러스터 배포유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={editCluster.catalogServiceTypeId}
                      onValueChange={(value) => {
                        setEditCluster(prev => ({ ...prev, catalogServiceTypeId: value }));
                        setFormErrorsCluster(prevErrors => ({
                          ...prevErrors,
                          catalogServiceTypeId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="edit-catalog-service-type"
                        className={formErrorsCluster?.catalogServiceTypeId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="배포유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {codeType.map((item) => (
                          <SelectItem key={item.uid || ''} value={item.uid || ''}>
                            {item.codeDesc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsCluster?.catalogServiceTypeId && <p className="text-red-500 text-sm">{formErrorsCluster.catalogServiceTypeId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-argo-deploy-type" className="flex items-center">
                      Argo 배포유형 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={editCluster.argoDeployType}
                      onValueChange={(value) => {
                        setEditCluster(prev => ({ ...prev, argoDeployType: value }));
                        setFormErrorsCluster(prevErrors => ({
                          ...prevErrors,
                          argoDeployType: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="edit-argo-deploy-type"
                        className={formErrorsCluster?.argoDeployType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="배포 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="helm">Helm</SelectItem>
                        <SelectItem value="kustomize">Kustomize</SelectItem>
                        <SelectItem value="directory">Directory</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrorsCluster?.argoDeployType && <p className="text-red-500 text-sm">{formErrorsCluster.argoDeployType}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-image">클러스터 이미지</Label>
                    <Textarea
                      id="edit-catalog-image"
                      placeholder="이미지 URL 입력"
                      value={editCluster.catalogImage}
                      onChange={(e) => setEditCluster(prev => ({ ...prev, catalogImage: e.target.value }))}
                      className="min-h-[100px] resize-y"
                      aria-describedby="edit-catalog-image-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="values-yaml">Values YAML</Label>
                    <div className="border rounded-md overflow-hidden">
                      <CodeMirror
                        value={editCluster.valuesYaml}
                        height="200px"
                        extensions={[yaml(), javascript({ jsx: true })]}
                        onChange={(value) => setEditCluster(prev => ({ ...prev, valuesYaml: value }))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-desc">클러스터 설명</Label>
                    <Textarea
                      id="edit-catalog-desc"
                      placeholder="클러스터 설명 입력"
                      value={editCluster.catalogDesc || ''}
                      onChange={(e) => setEditCluster(prev => ({
                        ...prev,
                        catalogDesc: e.target.value
                      }))}
                      rows={4}
                      className="resize-vertical"
                      maxLength={500}
                      aria-describedby="edit-catalog-desc-description"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enable"
                          checked={editCluster.enable}
                          onCheckedChange={(checked) =>
                            setEditCluster(prev => ({
                              ...prev,
                              enable: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="enable">활성화</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-is-admin"
                          checked={editCluster.isAdmin}
                          onCheckedChange={(checked) =>
                            setEditCluster(prev => ({
                              ...prev,
                              isAdmin: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="edit-is-admin">관리자 배포</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-is-cluster-only"
                          checked={editCluster.isClusterOnly}
                          onCheckedChange={(checked) =>
                            setEditCluster(prev => ({
                              ...prev,
                              isClusterOnly: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="edit-is-cluster-only">클러스터 단독 배포</Label>
                      </div>



                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-is-tenant"
                          checked={editCluster.isTenant}
                          onCheckedChange={(checked) =>
                            setEditCluster(prev => ({
                              ...prev,
                              isTenant: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="edit-is-tenant">테넌트 사용</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="edit-keycloak-use"
                          checked={editCluster.keycloakUse}
                          onCheckedChange={(checked) =>
                            setEditCluster(prev => ({
                              ...prev,
                              keycloakUse: checked as boolean
                            }))
                          }
                        />
                        <Label htmlFor="edit-keycloak-use">Keycloak 사용</Label>
                      </div>
                    </div>
                  </div>

                  {editCluster.keycloakUse && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-keycloak-redirect-uris">Keycloak Redirect URIs</Label>
                      <Input
                        id="edit-keycloak-redirect-uris"
                        placeholder="Redirect URIs 입력"
                        value={editCluster.keycloakRedirectUris || ''}
                        onChange={(e) => setEditCluster(prev => ({ ...prev, keycloakRedirectUris: e.target.value }))}
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsClusterEditSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={clusterEditClick} disabled={isSubmitting}>
                    저장
                  </Button>
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
            currentPage={pageCluster}
            totalPages={totalPages}
            dataLength={clusterData.length}
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
