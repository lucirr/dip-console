"use client"

import type { GroupCode, CommonCode } from "@/types/groupcode"
import type { CatalogType, CatalogVersion } from "@/types/catalogtype"

const apiUrl: string = process.env.NEXT_PUBLIC_API_URL ?? '/api/v1';
const token: string = 'Basic ' + btoa((process.env.NEXT_PUBLIC_DIP_API_USER ?? '') + ':' + (process.env.NEXT_PUBLIC_DIP_API_TOKEN ?? ''));
const hostname: string = 'paasup.inopt.paasup.io';
const headers: any = {
  'Authorization': token,
  'X-Hostname': hostname,
  "Content-Type": "application/json",
};

export async function getCommonCodeByGroupCode(groupCode: string) {
  try {
    const response = await fetch(`${apiUrl}/code/common?groupcode=${groupCode}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData: CommonCode[] = await response.json();
    return responseData
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export async function getGroupCode(): Promise<GroupCode[]> {
  try {
    const response = await fetch(apiUrl + '/code/group', {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData: GroupCode[] = await response.json();
    return responseData
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export async function insertGroupCode(newData: GroupCode) {
  try {
    const response = await fetch(apiUrl + '/code/group', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Success:", responseData);
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export async function updateGroupCode(updateData: GroupCode) {
  try {
    const response = await fetch(`${apiUrl}/code/group/${updateData.uid}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Update Success:", responseData);
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export async function getCommonCode(groupCodeId: string) {
  try {
    const response = await fetch(`${apiUrl}/code/common/${groupCodeId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData: CommonCode[] = await response.json();
    return responseData
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export async function insertCommonCode(newData: CommonCode) {
  try {
    const response = await fetch(apiUrl + `/code/common/${newData.groupCodeId}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Success:", responseData);
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export async function updateCommonCode(updateData: CommonCode) {
  try {
    const response = await fetch(`${apiUrl}/code/common/${updateData.groupCodeId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Update Success:", responseData);
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

export async function deleteCommonCode(commonCode: CommonCode) {
  try {
    const response = await fetch(`${apiUrl}/code/common/${commonCode.groupCodeId}/${commonCode.uid}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Delete Success:", responseData);
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

// ------------------------------------------------------------------------------------------------------

export async function getCatalogType(): Promise<CatalogType[]> {
  try {
    const response = await fetch(`${apiUrl}/catalogs`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData: CatalogType[] = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error(`${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function insertCatalogType(newData: CatalogType) {
  try {
    const response = await fetch(`${apiUrl}/catalogs`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Success:", responseData);
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function updateCatalogType(updateData: CatalogType) {
  try {
    const response = await fetch(`${apiUrl}/catalogs/${updateData.uid}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Update Success:", responseData);
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error(`${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function getCatalogVersion(catalogTypeId: string) {
  try {
    const response = await fetch(`${apiUrl}/catalogs/version/${catalogTypeId}`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData: CatalogVersion[] = await response.json();
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error(`${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function insertCatalogVersion(newData: CatalogVersion) {
  try {
    const response = await fetch(`${apiUrl}/catalogs/version/${newData.catalogTypeId}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(newData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Success:", responseData);
    return responseData; 
  } catch (error) {
    console.error(error);
    throw new Error(`${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function updateCatalogVersion(updateData: CatalogVersion) {
  try {
    const response = await fetch(`${apiUrl}/catalogs/version/${updateData.catalogTypeId}`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Update Success:", responseData);
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error(`${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function deleteCatalogVersion(catalogVersion: CatalogVersion) {
  try {
    const response = await fetch(`${apiUrl}/catalogs/version/${catalogVersion.catalogTypeId}/${catalogVersion.uid}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Server error ${response.status}: ${errorText}`);
    }

    const responseData = await response.json();
    console.log("Delete Success:", responseData);
    return responseData;
  } catch (error) {
    console.error(error);
    throw new Error(`${error instanceof Error ? error.message : String(error)}`);
  }
}