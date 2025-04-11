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
import type { ClusterProject, Project, ProjectUser, Role, User } from "@/types/project"
import {
  getProjects,
  insertProject,
  deleteProject,
  getProjectUser,
  deleteProjectUser,
  insertProjectUser,
  getClusters,
  updateProject,
  getUsers,
  getRoles,
  getCommonCodeByGroupCode
} from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { z } from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CommonCode } from '@/types/groupcode';
import { getErrorMessage } from '@/lib/utils';
import { Cluster } from '@/types/cluster';

interface Column {
  key: string;
  title: string;
  width?: string;
  align?: string;
  cell?: (row: any, index?: number) => ReactNode;
}



export default function ProjectManagementPage() {
  const { toast } = useToast()
  const [projectData, setProjectData] = useState<Project[]>([]);
  const [projectUserData, setProjectUserData] = useState<ProjectUser[]>([]);
  const [isProjectNewSheetOpen, setIsProjectNewSheetOpen] = useState(false);
  const [isProjectEditSheetOpen, setIsProjectEditSheetOpen] = useState(false);
  const [isProjectUserSheetOpen, setIsProjectUserSheetOpen] = useState(false);
  const [isProjectUserNewSheetOpen, setIsProjectUserNewSheetOpen] = useState(false);
  const [isProjectUserEditSheetOpen, setIsProjectUserEditSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageProject, setPageProject] = useState(1);
  const [pageProjectUser, setPageProjectUser] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectUser, setSelectedProjectUser] = useState<ProjectUser | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(data: any) => Promise<void>>(async () => { });
  const [confirmDescription, setConfirmDescription] = useState<string>("");
  const [formErrorsProject, setFormErrorsProject] = useState<{
    clusterId?: string;
    clusterProjectName?: string;
  } | null>(null);
  const [formErrorsProjectUser, setFormErrorsProjectUser] = useState<{
    projectId?: string;
    userId?: string;
    roleName?: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clusterData, setClusterData] = useState<Cluster[]>([]);
  const [codeType, setCodeType] = useState<CommonCode[]>([]);

  const [newCode, setNewCode] = useState<Project>({
    clusterProjectName: '',
    clusterId: '',
  });

  const [editProject, setEditProject] = useState<Project>({
    uid: '',
    clusterProjectName: '',
    clusterId: '',
  });

  const [newProjectUser, setNewProjectUser] = useState<ProjectUser>({
    uid: '',
    projectId: '',
    userId: '',
    roleName: '',
    userName: '',
  });

  const [editProjectUser, setEditProjectUser] = useState<ProjectUser>({
    uid: '',
    projectId: '',
    userId: '',
    roleName: '',
  });

  const [projectOptions, setProjectOptions] = useState<Project[]>([]);
  const [userOptions, setUserOptions] = useState<User[]>([]);
  const [roleOptions, setRoleOptions] = useState<Role[]>([]);

  const formSchemaProject = z.object({
    clusterId: z.string().min(1, { message: "클러스터는 필수 입력 항목입니다." }),
    clusterProjectName: z.string().min(1, { message: "프로젝트 이름은 필수 입력 항목입니다." }),
  });

  const formSchemaProjectUser = z.object({
    projectId: z.string().min(1, { message: "프로젝트는 필수 입력 항목입니다." }),
    userId: z.string().min(1, { message: "사용자는 필수 입력 항목입니다." }),
    roleName: z.string().min(1, { message: "역할은 필수 입력 항목입니다." }),
  });

  const paginatedData = projectData?.slice((pageProject - 1) * pageSize, pageProject * pageSize) || [];
  const totalPages = Math.ceil((projectData?.length || 0) / pageSize);

  const paginatedProjectUser = projectUserData?.slice((pageProjectUser - 1) * pageSize, pageProjectUser * pageSize) || [];
  const totalPagesProjectUser = Math.ceil((projectUserData?.length || 0) / pageSize);

  const columns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedData.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageProject - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'clusterName', title: '클러스터', align: 'left' },
    { key: 'clusterProjectName', title: '프로젝트', align: 'left' },
    {
      key: 'createdAt', title: '등록일자', align: 'left',
      cell: (row: Project) => {
        if (!row.createdAt) return '-';
        return format(new Date(row.createdAt), 'yyyy-MM-dd');
      }
    },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: Project) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => projectEditSheetClick(row)}>
              <Pencil className="h-4 w-4 mr-2" />
              보기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => projectUserSheetClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              사용자
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => projectDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const projectUserColumns: Column[] = [
    {
      key: 'sequence',
      title: '번호',
      width: 'w-[80px]',
      align: 'center',
      cell: (row: any, index?: number) => {
        const rowIndex = paginatedProjectUser.findIndex(item => item === row);
        return (
          <div className="text-center">{(pageProjectUser - 1) * pageSize + rowIndex + 1}</div>
        );
      }
    },
    { key: 'clusterProjectName', title: '프로젝트', align: 'left' },
    { key: 'userName', title: '사용자', align: 'left' },
    { key: 'roleName', title: '역할', align: 'left' },
    {
      key: 'actions',
      title: '',
      width: 'w-[40px]',
      cell: (row: ProjectUser) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => projectUserDeleteClick(row)}>
              <Code className="h-4 w-4 mr-2" />
              삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const fetchProjects = async (currentClusters: Cluster[]) => {
    setIsLoading(true);
    try {
      const response = await getProjects();

      const clustersMap = currentClusters.reduce((acc, cluster) => {
        if (cluster.uid !== undefined) {
          acc[cluster.uid] = cluster.clusterName ?? '';
        }
        return acc;
      }, {} as Record<string, string>);


      const enhancedResponse = response.map(item => ({
        ...item,
        clusterName: clustersMap[item.clusterId ?? ''],
      }));

      setProjectData(enhancedResponse);
    } catch (error) {
      setProjectData([]);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchProjectUsers = async () => {
    setIsLoading(true);
    try {
      if (selectedProject?.uid) {
        const response = await getProjectUser(selectedProject.uid);
        
        setProjectUserData(response);
      } else {
        setProjectUserData([]);
      }
    } catch (error) {
      console.error('Error fetching common codes:', error);
      setProjectUserData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClusters = async (currentCodeType: CommonCode[]) => {
    setIsLoading(true);
    try {
      const response = await getClusters();

      const codeTypeMap = currentCodeType.reduce((acc, code) => {
        if (code.uid !== undefined && code.code == 'common') {
          acc[code.uid] = code.uid;
        }
        return acc;
      }, {} as Record<string, string>);

      const filteredData = response.filter(item =>
        item.clusterTypeId != codeTypeMap[item.clusterTypeId ?? '']
      );

      setClusterData(filteredData);
      return response;
    } catch (error) {
      setClusterData([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getUsers();
      if (projectUserData) {
        const projectUsers = new Set(projectUserData.map(pu => pu.userName));
        const filteredData = response.filter(item =>
          item.uid !== undefined && !projectUsers.has(item.username)
        );
        setUserOptions(filteredData);
      } else {
        setUserOptions(response);
      }

    } catch (error) {
      console.log(error)
      setUserOptions([]);

    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const response = await getRoles();
      const filteredData = response.filter(item =>
        item.name != 'root'
      );
      setRoleOptions(filteredData);
      return response;
    } catch (error) {
      setRoleOptions([]);
      return [];
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
    fetchRoles();

    const fetchProjectData = async () => {
      const codeTypeData = await fetchCommonCode('cluster_type');
      const clusterData = await fetchClusters(codeTypeData);
      fetchProjects(clusterData);
    };

    fetchProjectData();
  }, []);


  useEffect(() => {
    if (selectedProject && isProjectUserSheetOpen) {
      fetchProjectUsers();
    }
  }, [selectedProject, isProjectUserSheetOpen]);

  useEffect(() => {
    setFormErrorsProject(null);
  }, [isProjectNewSheetOpen]);

  useEffect(() => {
    setFormErrorsProjectUser(null);
  }, [isProjectUserNewSheetOpen]);

  useEffect(() => {
    if (selectedProject && isProjectUserNewSheetOpen) {
      fetchUsers();
    }
  }, [selectedProject, isProjectUserNewSheetOpen]);

  const handleRefresh = () => {
    fetchProjects(clusterData);
  };

  const handleRefreshProjectUser = () => {
    fetchProjectUsers();
  };

  const projectNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsProject(null);

    const validationResult = formSchemaProject.safeParse(newCode);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'clusterId' || field === 'clusterProjectName') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });

      setFormErrorsProject(errors);
      return;
    }
    setConfirmAction(() => newProjectSubmit);
    setConfirmDescription("저장하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const newProjectSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const clusterProject: ClusterProject = {
        name: newCode.clusterProjectName,
        clusterId: newCode.clusterId,
      };

      await insertProject(clusterProject);
      toast({
        title: "Success",
        description: "프로젝트가 성공적으로 추가되었습니다.",
      })
      setNewCode({
        clusterProjectName: '',
        clusterId: '',
      });
      setIsProjectNewSheetOpen(false);
      fetchProjects(clusterData);
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

  const projectUserNewClick = () => {
    if (isSubmitting) return;

    setFormErrorsProjectUser(null);

    if (selectedProject?.uid) {
      newProjectUser.projectId = selectedProject?.uid;

      const validationResult = formSchemaProjectUser.safeParse(newProjectUser);

      if (!validationResult.success) {
        const errors = validationResult.error.errors.reduce((acc, error) => {
          const field = error.path[0] as string;
          // 필수 입력 필드 검증
          if (field === 'projectId' || field === 'userId' || field === 'roleName') {
            acc[field] = error.message;
          }
          return acc;
        }, {} as { [key: string]: string });
        setFormErrorsProjectUser(errors);
        return;
      }
      setConfirmAction(() => newProjectUserSubmit);
      setConfirmDescription("저장하시겠습니까?");
      setIsConfirmOpen(true);
    }
  };

  const newProjectUserSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      newProjectUser.clusterId = selectedProject?.clusterId;
      newProjectUser.projectUserId = newProjectUser.userId;
      newProjectUser.username = newProjectUser.userName;
      await insertProjectUser(newProjectUser);

      toast({
        title: "Success",
        description: "사용자가 성공적으로 추가되었습니다.",
      })
      setNewProjectUser({
        uid: '',
        projectId: '',
        userId: '',
        roleName: '',
      });
      setIsProjectUserNewSheetOpen(false);
      fetchProjectUsers();

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

  const projectEditSheetClick = (row: Project) => {
    setSelectedProject(row);
    setEditProject({
      uid: row.uid,
      clusterProjectName: row.clusterProjectName,
      clusterId: row.clusterId,
      clusterName: row.clusterName
    });
    setFormErrorsProject(null);
    setIsProjectEditSheetOpen(true);
  };

  const projectEditClick = () => {
    if (isSubmitting) return;

    setFormErrorsProject(null);

    const validationResult = formSchemaProject.safeParse(editProject);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.reduce((acc, error) => {
        const field = error.path[0] as string;
        // 필수 입력 필드 검증
        if (field === 'clusterProjectName' || field === 'clusterId') {
          acc[field] = error.message;
        }
        return acc;
      }, {} as { [key: string]: string });
      setFormErrorsProject(errors);
      return;
    }
    setConfirmAction(() => projectEditSubmit);
    setConfirmDescription("수정하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const projectEditSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateProject(editProject);
      toast({
        title: "Success",
        description: "카탈로그 유형이 성공적으로 수정되었습니다.",
      })
      setIsProjectEditSheetOpen(false);
      fetchProjects(clusterData);
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

  const projectDeleteClick = (row: Project) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => projectDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const projectDeleteSubmit = async (row: Project) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await deleteProject(row);
      toast({
        title: "Success",
        description: "프로젝트가 성공적으로 삭제되었습니다.",
      })
      fetchProjects(clusterData);
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




  const projectUserDeleteClick = (row: ProjectUser) => {
    if (isSubmitting) return;

    setConfirmAction(() => () => projectUserDeleteSubmit(row));
    setConfirmDescription("삭제하시겠습니까?");
    setIsConfirmOpen(true);
  };

  const projectUserDeleteSubmit = async (row: ProjectUser) => {
    if (!row) return;
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (selectedProject?.clusterId) {
        row.clusterId = selectedProject?.clusterId
        
        await deleteProjectUser(row);
        toast({
          title: "Success",
          description: "사용자가 성공적으로 삭제되었습니다.",
        })
        fetchProjectUsers();
      }
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

  const projectUserSheetClick = (row: Project) => {
    setSelectedProject(row);
    setIsProjectUserSheetOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPageProject(newPage);
  };

  const handlePageChangeProjectUser = (newPage: number) => {
    setPageProjectUser(newPage);
  };


  return (
    <div className="flex-1 space-y-4 py-4">
      <div className="bg-white border-b shadow-sm -mx-4">
        <div className="flex items-center justify-between px-6 py-4 pt-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">프로젝트 관리</h2>
            <p className="mt-1 text-sm text-gray-500">프로젝트를 생성하고 관리할 수 있습니다.</p>
          </div>
          <Sheet open={isProjectNewSheetOpen} onOpenChange={setIsProjectNewSheetOpen}>
            <SheetTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                프로젝트 추가
              </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>새 프로젝트 추가</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="catalog-service-type" className="flex items-center">
                      클러스터 <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                      value={newCode.clusterId}
                      onValueChange={(value) => {
                        setNewCode({ ...newCode, clusterId: value });
                        setFormErrorsProject(prevErrors => ({
                          ...prevErrors,
                          clusterId: undefined,
                        }));
                      }}
                    >
                      <SelectTrigger
                        id="catalog-service-type"
                        className={formErrorsProject?.clusterId ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="클러스터 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {clusterData.map((item) => (
                          <SelectItem key={item.uid || ''} value={item.uid || ''}>
                            {item.clusterName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrorsProject?.clusterId && <p className="text-red-500 text-sm">{formErrorsProject.clusterId}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-name">프로젝트 이름 <span className="text-red-500 ml-1">*</span></Label>
                    <Input
                      id="project-name"
                      placeholder="프로젝트 이름 입력"
                      value={newCode.clusterProjectName || ''}
                      onChange={(e) => {
                        setNewCode({ ...newCode, clusterProjectName: e.target.value });
                        setFormErrorsProject(prevErrors => ({
                          ...prevErrors,
                          clusterProjectName: undefined,
                        }));
                      }}
                      className={formErrorsProject?.clusterProjectName ? "border-red-500" : ""}
                      required
                    />
                    {formErrorsProject?.clusterProjectName && <p className="text-red-500 text-sm">{formErrorsProject.clusterProjectName}</p>}
                  </div>

                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsProjectNewSheetOpen(false)}>
                    취소
                  </Button>
                  <Button size="sm" onClick={projectNewClick} disabled={isSubmitting}>
                    저장
                  </Button>
                </div>

              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isProjectEditSheetOpen} onOpenChange={setIsProjectEditSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[650px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>프로젝트 상세 정보</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-type" className="flex items-center">
                      클러스터
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editProject.clusterName}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-catalog-service-type" className="flex items-center">
                      프로젝트
                    </Label>
                    <div className="p-2 bg-muted rounded-md">
                      <span className="text-sm">{editProject.clusterProjectName}</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6 pb-6">
                  <Button variant="outline" size="sm" onClick={() => setIsProjectEditSheetOpen(false)}>
                    취소
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Sheet open={isProjectUserSheetOpen} onOpenChange={setIsProjectUserSheetOpen}>
            <SheetTrigger asChild>
            </SheetTrigger>
            <SheetContent className="min-w-[850px] overflow-y-auto">
              <div className="flex flex-col h-full">
                <SheetHeader className='pb-4'>
                  <SheetTitle>
                    프로젝트 사용자
                  </SheetTitle>
                </SheetHeader>
                <div className="flex justify-end gap-2 pb-4 border-t pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshProjectUser}
                    disabled={isLoading}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    새로고침
                  </Button>
                  <Sheet open={isProjectUserNewSheetOpen} onOpenChange={setIsProjectUserNewSheetOpen}>
                    <SheetTrigger asChild>
                      <Button
                        size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        <span>사용자 추가</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent className="min-w-[650px] overflow-y-auto">
                      <div className="flex flex-col h-full">
                        <SheetHeader className='pb-4'>
                          <SheetTitle>새 사용자 추가</SheetTitle>
                        </SheetHeader>
                        <div className="grid gap-4 py-4 border-t">
                          <div className="space-y-2">
                            <Label htmlFor="new-catalog-type">프로젝트 <span className="text-red-500 ml-1">*</span></Label>
                            <div className="p-2 bg-muted rounded-md">
                              <span className="text-sm">{selectedProject?.clusterProjectName}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-catalog-version" className="flex items-center">
                              사용자 <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Select
                              value={newProjectUser.userId}
                              onValueChange={(value) => {
                                //setNewProjectUser({ ...newProjectUser, userId: value });
                                const selectedUser = userOptions.find(user => user.uid === value);
                                setNewProjectUser({
                                  ...newProjectUser,
                                  userId: value,
                                  userName: selectedUser?.username,
                                });
                                setFormErrorsProjectUser(prevErrors => ({
                                  ...prevErrors,
                                  userId: undefined,
                                }));
                              }}
                            >
                              <SelectTrigger
                                id="catalog-service-type"
                                className={formErrorsProjectUser?.userId ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="사용자 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {userOptions.map((item) => (
                                  <SelectItem key={item.uid || ''} value={item.uid || ''}>
                                    {item.username}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrorsProjectUser?.userId && <p className="text-red-500 text-sm">{formErrorsProjectUser.userId}</p>}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="new-catalog-version" className="flex items-center">
                              역할 <span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Select
                              value={newProjectUser.roleName}
                              onValueChange={(value) => {
                                setNewProjectUser({ ...newProjectUser, roleName: value });
                                setFormErrorsProjectUser(prevErrors => ({
                                  ...prevErrors,
                                  roleName: undefined,
                                }));
                              }}
                            >
                              <SelectTrigger
                                id="catalog-service-type"
                                className={formErrorsProjectUser?.roleName ? "border-red-500" : ""}
                              >
                                <SelectValue placeholder="역할 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {roleOptions.map((item) => (
                                  <SelectItem key={item.name || ''} value={item.name || ''}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {formErrorsProjectUser?.roleName && <p className="text-red-500 text-sm">{formErrorsProjectUser.roleName}</p>}
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-6 pb-6">
                          <Button variant="outline" size="sm" onClick={() => setIsProjectUserNewSheetOpen(false)}>
                            취소
                          </Button>
                          <Button size="sm" onClick={projectUserNewClick} disabled={isSubmitting}>
                            저장
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                <div className="">
                  <DataTable
                    columns={projectUserColumns}
                    data={paginatedProjectUser}
                  />
                  <TablePagination
                    currentPage={pageProjectUser}
                    totalPages={totalPagesProjectUser}
                    dataLength={(projectUserData?.length || 0)}
                    onPageChange={handlePageChangeProjectUser}
                    pageSize={pageSize}
                  />
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
            currentPage={pageProject}
            totalPages={totalPages}
            dataLength={(projectData?.length || 0)}
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
