export interface GroupCode {
  uid?: string;
  groupCode: string;
  groupCodeDesc: string;
  createdAt?: string;
  createdById?: number;
}

export interface CommonCode {
  uid?: string;
  code: string;
  codeDesc: string;
  codeCategory?: string;
  codeValue?: string;
  enable: boolean;
  groupCodeId: string;
  groupCode?: string;
  createdAt?: string;
  createdById?: number;
}