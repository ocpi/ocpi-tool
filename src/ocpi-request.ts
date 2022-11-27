import axios, { AxiosError } from "axios";
import { readFile, writeFile } from "node:fs/promises";

// A bunch of TODOs at this point:
//  * support relative URLs in given endpoints (resolve at login time?)
//  * paging
//  * better error reporting: not logged in, unexpected HTTP error, auth failure...

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
  const sessionObject = await loadSession();
  return ocpiRequestWithGivenToken(method, url, sessionObject.token);
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

export type NoSuchEndpoint = "no such endpoint";

export async function pullData(
  module: string
): Promise<unknown[] | NoSuchEndpoint> {
  const sess = await loadSession();

  const moduleUrl = sess.endpoints.find((ep) => ep.identifier === module);

  if (moduleUrl) {
    const getResponse = await ocpiRequest<unknown[]>("get", moduleUrl.url);
    return getResponse.data;
  } else return "no such endpoint";
}

async function loadSession(): Promise<OcpiSession> {
  const sessionFileContents = await readFile(SESSION_FILE, {
    encoding: "utf-8",
  });
  return JSON.parse(sessionFileContents).session as OcpiSession;
}
