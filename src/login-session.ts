import { readFile, writeFile } from "node:fs/promises";
import { OcpiVersion, OcpiEndpoint } from "./ocpi-request";

export type LoginSession = {
  token: string;
  partyId: string;
  version: OcpiVersion;
  endpoints: OcpiEndpoint[];
};

export const NOT_LOGGED_IN_ERROR_MESSAGE =
  "You are not logged in to an OCPI platform. Use the `ocpi login` command to log in before getting data.";

export async function loadSession(): Promise<LoginSession> {
  try {
    const sessionFileContents = await readFile(sessionFile(), {
      encoding: "utf-8",
    });
    return JSON.parse(sessionFileContents).session as LoginSession;
  } catch {
    return Promise.reject(new Error(NOT_LOGGED_IN_ERROR_MESSAGE));
  }
}

export async function setSession(session: LoginSession): Promise<void> {
  return writeFile(sessionFile(), JSON.stringify({ session }), {
    mode: "0600",
  });
}

const sessionFile: () => string = () =>
  process.env.OCPI_SESSION_FILE ?? `${process.env.HOME}/.ocpi`;
