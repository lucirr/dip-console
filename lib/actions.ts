"use client"

import type { GroupCode, CommonCode } from "@/types/groupcode"

const apiUrl: string = process.env.NEXT_PUBLIC_API_URL ?? 'https://dip-api.paasup.io/api/v1';
// const apiUrl: string = '/api/v1';
//const token: string = 'Basic ' + btoa((process.env.NEXT_PUBLIC_DIP_API_USER ?? '')+':'+ (process.env.NEXT_PUBLIC_DIP_API_TOKEN ?? ''));
const token: string = 'Basic ' + btoa('admin:admin');
const hostname: string = 'paasup.inopt.paasup.io';
const headers: any = {
  'Authorization': token,
  'X-Hostname': hostname,
  "Content-Type": "application/json",
};

export async function getGroupCode(): Promise<GroupCode[]> {
  try {
    const response = await fetch(apiUrl + '/code/group', {
      method: 'GET',
      headers: headers,
    });

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

    const responseData = await response.json();
    console.log("Delete Success:", responseData);
  } catch (error) {
    console.error(error)
    throw new Error(error instanceof Error ? error.message : String(error))
  }
}

