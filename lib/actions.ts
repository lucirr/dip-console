"use client"

import type { GroupCode, CommonCode } from "@/types/groupcode"
import type { CatalogType, CatalogVersion } from "@/types/catalogtype"
import type { CatalogGit, Cluster } from "@/types/cluster"


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

  // try {
  //   const response = await fetch(`${apiUrl}/code/common?groupcode=${groupCode}`, {
  //     method: 'GET',
  //     headers: headers,
  //   });

  //   if (!response.ok) {
  //     // const errorText = await response.text().catch(() => response.statusText);
  //     // throw new Error(`Server error ${response.status}: ${errorText}`);
  //     const errorData = await response.json();
  //     const errorMessage = errorData.errors?.[0]?.message || String(errorData);
  //     throw new Error(errorMessage);
  //   }

  //   const responseData: CommonCode[] = await response.json();
  //   return responseData
  // } catch (error) {
  //   console.error(error)
  //   throw new Error(error instanceof Error ? error.message : String(error))
  // }
}

export async function getGroupCode(): Promise<GroupCode[]> {
  return fetchApi<GroupCode[]>({ endpoint: `${apiAuth}/code/group` });
}

export async function insertGroupCode(data: GroupCode) {
  return fetchApi<GroupCode>({
    endpoint: '/code/group',
    method: 'POST',
    body: data,
  });

  // try {
  //   const response = await fetch(apiUrl + '/code/group', {
  //     method: 'POST',
  //     headers: headers,
  //     body: JSON.stringify(data),
  //   });

  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     const errorMessage = errorData.errors?.[0]?.message || String(errorData);
  //     throw new Error(errorMessage);
  //   }

  //   const responseData = await response.json();
  //   return responseData
  // } catch (error) {
  //   console.error(error)
  //   throw new Error(error instanceof Error ? error.message : String(error))
  // }
}

export async function updateGroupCode(data: GroupCode) {
  return fetchApi<GroupCode>({
    endpoint: `${apiAuth}/code/group/${data.uid}`,
    method: 'PUT',
    body: data,
  });

  // try {
  //   const response = await fetch(`${apiUrl}/code/group/${data.uid}`, {
  //     method: 'PUT',
  //     headers: headers,
  //     body: JSON.stringify(data),
  //   });

  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     const errorMessage = errorData.errors?.[0]?.message || String(errorData);
  //     throw new Error(errorMessage);
  //   }

  //   const responseData = await response.json();
  //   return responseData
  // } catch (error) {
  //   console.error(error)
  //   throw new Error(error instanceof Error ? error.message : String(error))
  // }
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

  // try {
  //   const response = await fetch(`${apiUrl}/code/common/${commonCode.groupCodeId}/${commonCode.uid}`, {
  //     method: 'DELETE',
  //     headers: headers,
  //   });

  //   if (!response.ok) {
  //     const errorData = await response.json();
  //     const errorMessage = errorData.errors?.[0]?.message || String(errorData);
  //     throw new Error(errorMessage);
  //   }

  //   const responseData = await response.json();
  //   return responseData
  // } catch (error) {
  //   console.error(error)
  //   throw new Error(error instanceof Error ? error.message : String(error))
  // }
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
  return fetchApi<Cluster[]>({ endpoint: `${apiAuth}/clusters` });
}

export async function insertCluster(data: Cluster) {
  return fetchApi<Cluster>({
    endpoint: `${apiAuth}/clusters`,
    method: 'POST',
    body: data
  });
}

export async function updateCluster(data: Cluster) {
  return fetchApi<Cluster>({
    endpoint: `${apiAuth}/clusters/${data.uid}`,
    method: 'PUT',
    body: data
  });
}

export async function deleteCluster(data: Cluster) {
  return fetchApi<Cluster>({
    endpoint: `${apiAuth}/clusters/${data.uid}`,
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
  return fetchApi<CatalogGit[]>({ endpoint: `${apiAuth}/clusters` });
}

export async function insertCatalogGit(data: CatalogGit) {
  return fetchApi<CatalogGit>({
    endpoint: `${apiAuth}/clusters`,
    method: 'POST',
    body: data
  });
}

export async function deleteCatalogGit(data: CatalogGit) {
  return fetchApi<CatalogGit>({
    endpoint: `${apiAuth}/clusters/${data.uid}`,
    method: 'DELETE',
  });
}