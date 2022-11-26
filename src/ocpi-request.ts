import axios, { AxiosError } from "axios";
import { readFile, writeFile } from "node:fs/promises";

export interface OcpiResponse<T> {
  data: T;
  status_code: number;
  status_message?: string;
  timestamp: string;
}

export interface OcpiEndpoint {
  identifier: string;
  url: string;
  role?: "SENDER" | "RECEIVER";
}

export interface OcpiSession {
  token: string;
  version: "2.1.1" | "2.0" | "2.1";
  endpoints: OcpiEndpoint[];
}

export const SESSION_FILE =
  process.env.OCPI_SESSION_FILE ?? `${process.env.HOME}/.ocpi`;

export async function ocpiRequest<T>(
  method: "get" | "post" | "put" | "delete",
  url: string
): Promise<OcpiResponse<T>> {
  const sessionFileContents = await readFile(SESSION_FILE, {
    encoding: "utf-8",
  });
  const sessionObject = JSON.parse(sessionFileContents);
  return ocpiRequestWithGivenToken(method, url, sessionObject.session?.token);
}

export async function ocpiRequestWithGivenToken<T>(
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

export async function setSession(session: OcpiSession): Promise<void> {
  return writeFile(SESSION_FILE, JSON.stringify({ session }));
}
