import { V211Tariff } from "./ocpimsgs/tariff.schema";
import { V211Location } from "./ocpimsgs/location.schema";
import axios, { AxiosError } from "axios";
import { readFile, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";

// A bunch of TODOs at this point:
//  * support relative URLs in given endpoints (resolve at login time?)
//  * paging
//  * better error reporting: not logged in, unexpected HTTP error, auth failure...

export interface OcpiModule<Name, ObjectType> {
  name: Name & string;
}
export const locations: OcpiModule<"locations", V211Location> = {
  name: "locations",
};
export const tariffs: OcpiModule<"tariffs", V211Tariff> = {
  name: "tariffs",
};

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
  return writeFile(SESSION_FILE, JSON.stringify({ session }), { mode: "0600" });
}

export type NoSuchEndpoint = "no such endpoint";

export type OcpiObject = 1;

export function fetchDataForModule<N, T>(module: OcpiModule<N, T>): Readable {
  let retrievedUpTo: Date | null = null;

  return new Readable({
    objectMode: true,
    read: async function (size: number) {
      console.log(`Read called for ${size}`);
      const nextPage = await pullPageOfData(module);
      if (nextPage === "no such endpoint") {
        throw new Error(`no endpoint found for module ${module.name}`);
      }
      console.log("Page fetched");

      nextPage.forEach((object) => {
        console.log("pushing one object");
        const wut = this.push(object);
        console.log(`got back from push: ${wut}`);
      });
      console.log("Done pushing");
    },
  });
}

export async function pullPageOfData<N, T>(
  module: OcpiModule<N, T>
): Promise<T[] | NoSuchEndpoint> {
  const sess = await loadSession();

  const moduleUrl = sess.endpoints.find((ep) => ep.identifier === module.name);

  if (moduleUrl) {
    const getResponse = await ocpiRequest<T[]>("get", moduleUrl.url);
    return getResponse.data;
  } else return "no such endpoint";
}

async function loadSession(): Promise<OcpiSession> {
  const sessionFileContents = await readFile(SESSION_FILE, {
    encoding: "utf-8",
  });
  return JSON.parse(sessionFileContents).session as OcpiSession;
}
