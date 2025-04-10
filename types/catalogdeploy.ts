export interface CatalogDeploy {
  uid?: string;
  projectId?: string;
  catalogTypeId?: string;
  catalogVersionId?: string;
  name: string;
  catalogName?: string;
  namespace?: string;
  valuesYaml?: string;
  userId?: string;
  status?: string;
  syncStatus?: string;
  errorMessage?: string;
  catalogUrl?: string;
  catalogUser?: string;
  isAdminDeploy?: string;
  clusterId?: string;
  catalogDeployId?: string;
  clientId?: string;
  catalogSvcUrl?: string;
  createdAt?: string;
  clusterProjectName?: string;
  catalogType: string;
  catalogVersion?: string;
  clusterName?: string;
  username?: string;
  isTenant?: boolean;
  catalogImage?: string;
  catalogDesc?: string;
}

