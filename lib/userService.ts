import { User } from "@/types/project";
import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const apiUrl: string = process.env.NODE_ENV === "production" ? 'http://dip-api:8087/' : process.env.NEXT_PUBLIC_API_URL ?? '/';
const apiAuth: string = 'api/v1';
const token: string = 'Basic ' + btoa((process.env.NEXT_PUBLIC_DIP_API_USER ?? '') + ':' + (process.env.NEXT_PUBLIC_DIP_API_TOKEN ?? ''));
const hostname: string = process.env.NEXT_PUBLIC_X_HOSTNAME ?? '';
const headers: any = {
  'Authorization': token,
  'X-Hostname': hostname,
  "Content-Type": "application/json",
};

export async function getLoginUserRoles(username: string): Promise<User> {
  return await axios.get<User>(`${apiUrl}${apiAuth}/users/${username}/roles`, { headers: headers, httpsAgent })
    .then(function (response) {
      //console.log(response.data);
      return response.data as User;
    })
    .catch(function (error) {
      console.log(error);
      throw new Error(error instanceof Error ? error.message : String(error));
    })
}