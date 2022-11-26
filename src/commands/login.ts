import { V211Version as V211ListedVersion } from "../ocpimsgs/version.schema";
import { writeFile } from "node:fs/promises";

import { V211Version } from "../ocpimsgs/versionGetDetailResponse.schema";
import { ocpiRequest } from "../ocpi-request";

export interface OcpiResponse<T> {
  data: T;
  status_code: number;
  status_message?: string;
  timestamp: string;
}

export const SESSION_FILE =
  process.env.OCPI_SESSION_FILE ?? `${process.env.HOME}/.ocpi`;

export const login = async (platformVersionsUrl: string, token?: string) => {
  // OK, we're going to start a session with a certain platform. So we have to:
  //  * fetch versions
  //  * pick the 2.1.1 version
  //  * fetch the endpoints
  //  * store those
  if (!token) {
    throw new Error('A token is required with "ocpi login"');
  }

  const ocpiResponse = await ocpiRequest<V211Version>(
    "get",
    platformVersionsUrl,
    token
  );

  console.log(`ocpiResponse: ${ocpiResponse}`);

  if (Array.isArray(ocpiResponse.data)) {
    const versions = ocpiResponse.data as V211ListedVersion[];
    console.log(`It's a versions endpoint; versions is ${versions}`);
    throw new Error(`Sorry, for now I need a version URL, not a versions URL`);
  } else if (
    typeof ocpiResponse.data == "object" &&
    ocpiResponse.data.version
  ) {
    const version = ocpiResponse.data as V211Version;
    console.log(`It's a version endpoint; version is ${version}`);
    await writeFile(
      SESSION_FILE,
      JSON.stringify({ session: { ...ocpiResponse.data, token } })
    );
    console.log(`Logged in to ${platformVersionsUrl}`);
  }
};
