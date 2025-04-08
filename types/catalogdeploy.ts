export interface CatalogDeploy {
  uid?: string;
  projectId?: string;
  catalogTypeId?: string;
  catalogVersionId?: string;
  name: string;
  catalogName?: string;
  namespace?: string;
  ValuesYaml?: string;
  userId?: string;
  status?: string;
  syncStatus?: string;
  errorMessage?: string;
  catalogUrl?: string;
  catalogUser?: string;
  IsAdminDeploy?: string;
  clusterId?: string;
  catalogDeployId?: string;
  clientId?: string;
  catalogSvcUrl?: string;
  createdAt?: string;
  clusterProjectName?: string;
  catalogType?: string;
  catalogVersion?: string;
  clusterName?: string;
  username?: string;
}

