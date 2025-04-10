"use client"

import type { GroupCode, CommonCode } from "@/types/groupcode"
import type { CatalogType, CatalogVersion } from "@/types/catalogtype"
import type { CatalogGit, Cluster } from "@/types/cluster"
import { Dns } from "@/types/dns";
import { SystemLink } from "@/types/systemlink";
import { License } from "@/types/license";
import { CatalogDeploy } from "@/types/catalogdeploy";
import { ClusterProject, Project, ProjectUser, Role, User, UserRegData } from "@/types/project";


const apiUrl: string = process.env.NEXT_PUBLIC_API_URL ?? '/';
const apiAuth: string = 'api/v1';
const apiNonAuth: string = 'sapi/v1'
const token: string = 'Basic ' + btoa((process.env.NEXT_PUBLIC_DIP_API_USER ?? '') + ':' + (process.env.NEXT_PUBLIC_DIP_API_TOKEN ?? ''));
const hostname: string = 'paasup.inopt.paasup.io';
const headers: any = {
  'Authorization': token,
  'X-Hostname': hostname,
  "Content-Type": "application/json",
};

type ApiConfig = {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

async function fetchApi<T>({ endpoint, method = 'GET', body }: ApiConfig): Promise<T> {
  try {
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.errors?.[0]?.message || String(errorData);
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

export async function getCommonCodeByGroupCode(groupCode: string): Promise<CommonCode[]> {
  return fetchApi<CommonCode[]>({ endpoint: `${apiAuth}/code/common?groupcode=${groupCode}` });
}

// ------------------------------------------------------------------------------------------------------

export async function getGroupCode(): Promise<GroupCode[]> {
  return fetchApi<GroupCode[]>({ endpoint: `${apiAuth}/code/group` });
}

export async function insertGroupCode(data: GroupCode) {
  return fetchApi<GroupCode>({
    endpoint: '/code/group',
    method: 'POST',
    body: data,
  });
}

export async function updateGroupCode(data: GroupCode) {
  return fetchApi<GroupCode>({
    endpoint: `${apiAuth}/code/group/${data.uid}`,
    method: 'PUT',
    body: data,
  });
}

export async function getCommonCode(groupCodeId: string) {
  return fetchApi<CommonCode[]>({ endpoint: `${apiAuth}/code/common/${groupCodeId}` });
}

export async function insertCommonCode(data: CommonCode) {
  return fetchApi<CommonCode>({
    endpoint: `${apiAuth}/code/common/${data.groupCodeId}`,
    method: 'POST',
    body: data,
  });
}

export async function updateCommonCode(data: CommonCode) {
  return fetchApi<CommonCode>({
    endpoint: `${apiAuth}/code/common/${data.groupCodeId}`,
    method: 'PUT',
    body: data,
  });
}

export async function deleteCommonCode(data: CommonCode) {
  return fetchApi<CommonCode>({
    endpoint: `${apiAuth}/code/common/${data.groupCodeId}/${data.uid}`,
    method: 'DELETE'
  });
}

// ------------------------------------------------------------------------------------------------------

export async function getCatalogType(): Promise<CatalogType[]> {
  return fetchApi<CatalogType[]>({ endpoint: `${apiAuth}/catalogs` });
}

export async function insertCatalogType(data: CatalogType) {
  return fetchApi<CatalogType>({
    endpoint: `${apiAuth}/catalogs`,
    method: 'POST',
    body: data,
  });
}

export async function updateCatalogType(data: CatalogType) {
  return fetchApi<CatalogType>({
    endpoint: `${apiAuth}/catalogs/${data.uid}`,
    method: 'PUT',
    body: data,
  });
}

export async function deleteCatalogType(data: CatalogType) {
  return fetchApi<CatalogType>({
    endpoint: `${apiAuth}/catalogs/${data.uid}`,
    method: 'DELETE',
  });
}

export async function getCatalogVersion(catalogTypeId: string): Promise<CatalogVersion[]> {
  return fetchApi<CatalogVersion[]>({ endpoint: `${apiAuth}/catalogtype/version/${catalogTypeId}` });
}

export async function insertCatalogVersion(data: CatalogVersion) {
  return fetchApi<CatalogVersion>({
    endpoint: `${apiAuth}/catalogtype/version`,
    method: 'POST',
    body: data,
  });
}

export async function updateCatalogVersion(data: CatalogVersion) {
  return fetchApi<CatalogVersion>({
    endpoint: `${apiAuth}/catalogtype/version/${data.uid}`,
    method: 'PUT',
    body: data,
  });
}

export async function deleteCatalogVersion(data: CatalogVersion) {
  return fetchApi<CatalogVersion>({
    endpoint: `${apiAuth}/catalogtype/version/${data.catalogTypeId}/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function getClusters(): Promise<Cluster[]> {
  return fetchApi<Cluster[]>({ endpoint: `${apiNonAuth}/clusters` });
}

export async function insertCluster(data: Cluster) {
  return fetchApi<Cluster>({
    endpoint: `${apiNonAuth}/clusters`,
    method: 'POST',
    body: data
  });
}

export async function updateCluster(data: Cluster) {
  return fetchApi<Cluster>({
    endpoint: `${apiNonAuth}/clusters/${data.uid}`,
    method: 'PUT',
    body: data
  });
}

export async function deleteCluster(data: Cluster) {
  return fetchApi<Cluster>({
    endpoint: `${apiNonAuth}/clusters/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function insertClusterArgoCd(data: Cluster) {
  return fetchApi<Cluster>({
    endpoint: `${apiNonAuth}/system/clusters/${data.uid}`,
    method: 'POST',
  });
}

export async function getCatalogGits(): Promise<CatalogGit[]> {
  return fetchApi<CatalogGit[]>({ endpoint: `${apiNonAuth}/catalogs/git` });
}

export async function insertCatalogGit(data: CatalogGit) {
  return fetchApi<CatalogGit>({
    endpoint: `${apiNonAuth}/system/repositories`,
    method: 'POST',
    body: data
  });
}

export async function deleteCatalogGit(data: CatalogGit) {
  return fetchApi<CatalogGit>({
    endpoint: `${apiNonAuth}/system/repositories/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function getDns(): Promise<Dns[]> {
  return fetchApi<Dns[]>({ endpoint: `${apiAuth}/dns` });
}

export async function insertDns(data: Dns) {
  return fetchApi<Dns>({
    endpoint: `${apiAuth}/dns`,
    method: 'POST',
    body: data
  });
}

export async function updateDns(data: Dns) {
  return fetchApi<Dns>({
    endpoint: `${apiAuth}/dns/${data.uid}`,
    method: 'PUT',
    body: data
  });
}

export async function deleteDns(data: Dns) {
  return fetchApi<Dns>({
    endpoint: `${apiAuth}/dns/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function getSystemLink(): Promise<SystemLink[]> {
  return fetchApi<SystemLink[]>({ endpoint: `${apiNonAuth}/systemlink` });
}

export async function insertSystemLink(data: SystemLink) {
  return fetchApi<SystemLink>({
    endpoint: `${apiNonAuth}/systemlink`,
    method: 'POST',
    body: data
  });
}

export async function updateSystemLink(data: SystemLink) {
  return fetchApi<SystemLink>({
    endpoint: `${apiNonAuth}/systemlink/${data.uid}`,
    method: 'PUT',
    body: data
  });
}

export async function deleteSystemLink(data: SystemLink) {
  return fetchApi<SystemLink>({
    endpoint: `${apiNonAuth}/systemlink/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function getLicense(): Promise<License[]> {
  return fetchApi<License[]>({ endpoint: `${apiNonAuth}/license` });
}

export async function insertLicense(data: License) {
  return fetchApi<License>({
    endpoint: `${apiNonAuth}/license`,
    method: 'POST',
    body: data
  });
}

export async function deleteLicense(data: License) {
  return fetchApi<License>({
    endpoint: `${apiNonAuth}/license/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function getProjectClusterCatalogDeploy(selectedCluster: string, selectedProject: string, selectedCatalogType: string): Promise<CatalogDeploy[]> {
  return fetchApi<CatalogDeploy[]>({ endpoint: `${apiAuth}/catalogs/project?cluster=${selectedCluster}&project=${selectedProject}&catalogtype=${selectedCatalogType}` });
}

export async function getProjectCatalogDeploy(selectedProject: string, selectedCatalogType: string): Promise<CatalogDeploy[]> {
  return fetchApi<CatalogDeploy[]>({ endpoint: `${apiAuth}/catalogs/project?project=${selectedProject}&catalogtype=${selectedCatalogType}` });
}

export async function getClusterCatalogDeploy(selectedCluster: string, selectedCatalogType: string): Promise<CatalogDeploy[]> {
  return fetchApi<CatalogDeploy[]>({ endpoint: `${apiAuth}/catalogs/cluster?cluster=${selectedCluster}&catalogtype=${selectedCatalogType}` });
}

export async function getClusterCatalogDeployAll(selectedCluster: string, selectedProject: string): Promise<CatalogDeploy[]> {
  return fetchApi<CatalogDeploy[]>({ endpoint: `${apiAuth}/catalogs/cluster?cluster=${selectedCluster}&project=${selectedProject}` });
}

export async function updateProjectCatalogDeploy(data: CatalogDeploy) {
  return fetchApi<CatalogDeploy>({
    endpoint: `${apiAuth}/tenant/${data.clusterId}/${data.uid}`,
    method: 'PUT',
    body: data
  });
}

export async function deleteProjectCatalogDeploy(data: CatalogDeploy) {
  return fetchApi<CatalogDeploy>({
    endpoint: `${apiAuth}/catalog/${data.clusterId}/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function getProjects(): Promise<Project[]> {
  return fetchApi<Project[]>({ endpoint: `${apiAuth}/projects` });
}

export async function insertProject(data: ClusterProject) {
  return fetchApi<ClusterProject>({
    endpoint: `${apiAuth}/projects/${data.clusterId}`,
    method: 'POST',
    body: data
  });
}

export async function updateProject(data: Project) {
  return fetchApi<Project>({
    endpoint: `${apiAuth}/projects/${data.uid}`,
    method: 'PUT',
    body: data
  });
}

export async function deleteProject(data: Project) {
  return fetchApi<Project>({
    endpoint: `${apiAuth}/projects/${data.clusterId}/${data.uid}`,
    method: 'DELETE',
  });
}

export async function getProjectUser(projectId: string): Promise<ProjectUser[]> {
  return fetchApi<ProjectUser[]>({ endpoint: `${apiAuth}/project/users/${projectId}` });
}

export async function insertProjectUser(data: ProjectUser) {
  return fetchApi<ProjectUser>({
    endpoint: `${apiAuth}/users/${data.clusterId}`,
    method: 'POST',
    body: data
  });
}

export async function deleteProjectUser(data: ProjectUser) {
  return fetchApi<ProjectUser>({
    endpoint: `${apiAuth}/users/${data.clusterId}/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function getUsers(): Promise<User[]> {
  return fetchApi<User[]>({ endpoint: `${apiAuth}/users` });
}

export async function getRoles(): Promise<Role[]> {
  return fetchApi<Role[]>({ endpoint: `${apiAuth}/roles` });
}

export async function insertUser(data: UserRegData) {
  return fetchApi<User>({
    endpoint: `${apiNonAuth}/kclusers`,
    method: 'POST',
    body: data
  });
}

export async function updateUser(data: User) {
  return fetchApi<User>({
    endpoint: `${apiNonAuth}/kclusers/${data.uid}`,
    method: 'PUT',
    body: data
  });
}

export async function deleteUser(data: User) {
  return fetchApi<User>({
    endpoint: `${apiNonAuth}/kclusers/${data.uid}`,
    method: 'DELETE',
  });
}

// --------------------------------------------------------------------------------

export async function insertClusterCatalog(data: CatalogDeploy) {
  return fetchApi<User>({
    endpoint: `${apiAuth}/catalog/${data.clusterId}`,
    method: 'POST',
    body: data
  });
}

export async function insertTenantCatalog(data: CatalogDeploy) {
  return fetchApi<User>({
    endpoint: `${apiAuth}/tenant/${data.clusterId}`,
    method: 'POST',
    body: data
  });
}