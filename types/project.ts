export interface ClusterProject {
  id?: string;
  name: string;
  clusterId: string;
  type?: string;
  currentUserId?: number;
  resourceQuota?: ResourceQuota;
  namespaceDefaultResourceQuota?: DefaultResourceQuota;
  s3?: S3Info;
  createdById?: number;
}

export interface ResourceQuota {
  limit?: LimitCpuMemory;
}

export interface DefaultResourceQuota {
  limit?: LimitCpuMemory;
}

export interface S3Info {
  accessKey?: string;
  secretKey?: string;
  path?: string;
}

export interface LimitCpuMemory {
  limitsCpu?: string;
  requestsCpu?: string;
  limitsMemory?: string;
  requestsMemory?: string;
}

export interface Project {
  uid?: string;
  clusterProjectName: string;
  clusterId: string;
  clusterName?: string;
  clusterProjectId?: string;
  limitsCpu?: string;
  requestsCpu?: string;
  limitsMemory?: string;
  requestsMemory?: string;
  accessKey?: string;
  secretKey?: string;
  path?: string;
  createdAt?: string;
  createdById?: number;
}

export interface ProjectUser {
  uid?: string;
  projectUserId?:string;
  userId: string;
  projectId: string;
  userName?: string;
  username?: string;
  clusterProjectName?: string;
  clusterId?: string;
  roleName?: string;
  createdAt?: string;
  createdById?: number;
}

export interface User {
  uid?: string;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleName?: string;
  roles?: string[];
  createdAt?: string;
  createdById?: number;
}

export interface UserRegData {
  data: UserReg;
}

export interface UserReg {
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  password?: string;
  roles?: Role;
  createdById?: number;
}

export interface Role {
  uid?: string;
  name?: string;
  title?: string;
  createdAt?: string;
  createdById?: number;
}