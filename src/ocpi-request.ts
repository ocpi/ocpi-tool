import axios, { AxiosError } from "axios";

export interface OcpiResponse<T> {
  data: T;
  status_code: number;
  status_message?: string;
  timestamp: string;
}

export async function ocpiRequest<T>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  token: string
): Promise<OcpiResponse<T>> {
  let resp;
  try {
    resp = await axios(url, {
      method: method,
      headers: { Authorization: `Token ${token}` },
    });
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.isAxiosError) {
      throw new Error(
        `Failed to make OCPI request to platform: HTTP status is [${axiosError.response?.status}]; body is [${axiosError.response?.data}]`
      );
    } else throw error;
  }

  const ocpiResponse = resp.data as OcpiResponse<T>;
  return ocpiResponse;
}
