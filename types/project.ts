export interface ClusterProject {
  id?: string;
  name: string;
  clusterId: string;
  type?: string;
  resourceQuota?: ResourceQuota;
  namespaceDefaultResourceQuota?: DefaultResourceQuota;
  s3?: S3Info;
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
}

export interface ProjectUser {
  uid?: string;
  userId: string;
  projectId: string;
  roleId: string;
  userName?: string;
  projectName?: string;
  roleName?: string;
  createdAt?: string;
}

export interface User {
  uid?: string;
  username: string;
  nickname?: string;
  email?: string;
  phone?: string;
  password?: string;
  createdAt?: string;
}

export interface Role {
  uid?: string;
  name: string;
  title?: string;
  createdAt?: string;
}