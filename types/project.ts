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
  clusterProjectId?: string;
  limitsCpu?: string;
  requestsCpu?: string;
  limitsMemory?: string;
  requestsMemory?: string;
  accessKey?: string;
  secretKey?: string;
  path?: string;
  clusterTableId?: string;
  createdAt?: string;
}