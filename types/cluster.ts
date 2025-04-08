export interface Cluster {
  uid?: string;
  clusterName: string;
  clusterUrl: string;
  clusterToken: string;
  clusterLbIp: string;
  clusterType: string;
  clusterTypeId: string;
  clusterDesc: string;
  domain: string;
  isArgo: boolean;
}

export interface CatalogGit {
  uid?: string;
  gitUrl: string;
  gitUsername: string;
  gitToken: string;
  gitType: string;
  gitTypeId: string;
}