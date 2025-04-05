export interface CatalogType {
  uid?: string;
  catalogType: string;
  serviceType: string;
  catalogServiceTypeId: string;
  argoDeployType: string;
  catalogImage: string;
  enable: boolean;
  isClusterOnly: boolean;
  isTenant: boolean;
  keycloakUse: boolean;
  keycloakRedirectUris: string;
  valuesYaml: string;
  isAdmin: boolean;
  catalogDesc: string;
}

export interface CatalogVersion {
  uid?: string;
  catalogType: string;
  catalogVersion: string;
}