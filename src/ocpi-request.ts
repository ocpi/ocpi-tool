import { V211CDR } from "./ocpimsgs/cdr.schema";
import { V211Location } from "./ocpimsgs/location.schema";
import { V211Session } from "./ocpimsgs/session.schema";
import { V211Tariff } from "./ocpimsgs/tariff.schema";
import axios, { AxiosError } from "axios";
import { readFile, writeFile } from "node:fs/promises";
import { Readable } from "node:stream";
import parse from "parse-link-header";

// A bunch of TODOs at this point:
//  * support relative URLs in given endpoints (resolve at login time?)
//  * better error reporting: not logged in, unexpected HTTP error, auth failure...

/**
 * The identifiers of OCPI modules.
 *
 * This is restricted to the so-called 'Functional Modules', that serve data that can be exported using this tool
 */
export type ModuleID =
  | "cdrs"
  | "chargingprofiles"
  | "locations"
  | "sessions"
  | "tariffs"
  | "tokens";

export interface OcpiModule<Name extends ModuleID, ObjectType> {
  name: Name & string;
}
export const cdrs: OcpiModule<"cdrs", V211CDR> = {
  name: "cdrs",
};
export const chargingprofiles: OcpiModule<"chargingprofiles", {}> = {
  name: "chargingprofiles",
};
export const locations: OcpiModule<"locations", V211Location> = {
  name: "locations",
};
export const sessions: OcpiModule<"sessions", V211Session> = {
  name: "sessions",
};
export const tariffs: OcpiModule<"tariffs", V211Tariff> = {
  name: "tariffs",
};

export function getModuleByName(
  moduleName: string
): OcpiModule<any, any> | null {
  return (
    [locations, tariffs, sessions].find((m) => m.name === moduleName) ?? null
  );
}

interface OcpiPageParameters {
  offset: number;
  limit: number;
}

export interface OcpiResponse<T> {
  data: T;
  status_code: number;
  status_message?: string;
  timestamp: string;
  nextPage?: OcpiPageParameters;
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

const SESSION_FILE =
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

  const headerLinks = parse(resp.headers["link"]);
  const linkToNextPage = headerLinks === null ? null : headerLinks["next"];
  const nextPage =
    linkToNextPage === null
      ? undefined
      : {
          offset: linkToNextPage?.offset,
          limit: linkToNextPage?.limit,
        };

  const ocpiResponse = { ...resp.data, nextPage } as OcpiResponse<T>;
  return ocpiResponse;
}

export type NoSuchEndpoint = "no such endpoint";

/**
 * Fetch all data of a certain module from the OCPI platform that the tool is currently logged in to
 *
 * @param module The module to fetch data from
 * @returns A Node Readable that you can stream the OCPI objects from the module from
 */
export function fetchDataForModule<N extends ModuleID, T>(
  module: OcpiModule<N, T>
): Readable {
  let nextPage: OcpiPageParameters | "done" | "notstarted" = "notstarted";

  return new Readable({
    objectMode: true,
    read: async function (size: number) {
      console.debug(`Node streams engine called read, size = ${size}`);

      if (nextPage === "done") {
        console.debug(
          "read() called while page fetching is already done; returning without pushing"
        );
        return;
      }

      const firstPageParameters = { offset: 0, limit: size };
      const nextPageData = await pullPageOfData(
        module,
        nextPage === "notstarted" ? firstPageParameters : nextPage
      );
      if (nextPageData === "no such endpoint") {
        throw new Error(`no endpoint found for module ${module.name}`);
      }
      console.debug("Page fetched", nextPageData);

      nextPage = nextPageData.nextPage ?? "done";

      nextPageData.data.forEach((object) => {
        const shouldContinue = this.push(object);
        console.debug("push returned", shouldContinue);
      });

      console.debug("Done pushing");

      // end the stream if this is the last page
      if (nextPage === "done") {
        console.debug("No next page given in response, ending object stream");
        this.push(null);
      }
    },
  });
}

type OcpiPagedGetResponse<T> = {
  data: T[];
  nextPage?: OcpiPageParameters;
};

async function pullPageOfData<N extends ModuleID, T>(
  module: OcpiModule<N, T>,
  page: OcpiPageParameters
): Promise<OcpiPagedGetResponse<T> | NoSuchEndpoint> {
  const sess = await loadSession();

  const moduleUrl = sess.endpoints.find((ep) => ep.identifier === module.name);

  if (moduleUrl) {
    return ocpiRequest<T[]>(
      "get",
      `${moduleUrl.url}?offset=${page.offset}&limit=${page.limit}`
    );
  } else return "no such endpoint";
}

async function loadSession(): Promise<OcpiSession> {
  const sessionFileContents = await readFile(SESSION_FILE, {
    encoding: "utf-8",
  });
  return JSON.parse(sessionFileContents).session as OcpiSession;
}

export async function setSession(session: OcpiSession): Promise<void> {
  return writeFile(SESSION_FILE, JSON.stringify({ session }), { mode: "0600" });
}
