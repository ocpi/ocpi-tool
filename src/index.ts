import axios, { AxiosError } from "axios";
import { Command } from "commander";
import { V211Version as V211ListedVersion } from "./ocpimsgs/version.schema";
import { V211Version } from "./ocpimsgs/versionGetDetailResponse.schema";
import { writeFile } from "node:fs/promises";

interface OcpiResponse<T> {
  data: T;
  status_code: number;
  status_message?: string;
  timestamp: string;
}

const SESSION_FILE =
  process.env.OCPI_SESSION_FILE ?? `${process.env.HOME}/.ocpi`;

const use = async (platformVersionsUrl: string, token?: string) => {
  // OK, we're going to start a session with a certain platform. So we have to:
  //  * fetch versions
  //  * pick the 2.1.1 version
  //  * fetch the endpoints
  //  * store those
  if (!token) {
    throw new Error('A token is required with "ocpi login"');
  }

  let resp;
  try {
    resp = await axios.get(platformVersionsUrl, {
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

  const ocpiResponse = resp.data as OcpiResponse<any>;

  console.log(`ocpiResponse: ${ocpiResponse}`);

  if (Array.isArray(ocpiResponse.data)) {
    const versions = ocpiResponse.data as V211ListedVersion[];
    console.log(`It's a versions endpoint; versions is ${versions}`);
  } else if (
    typeof ocpiResponse.data == "object" &&
    ocpiResponse.data.version
  ) {
    const version = ocpiResponse.data as V211Version;
    console.log(`It's a version endpoint; version is ${version}`);
    await writeFile(SESSION_FILE, JSON.stringify(ocpiResponse.data));
    console.log(`Logged in to ${platformVersionsUrl}`);
  }
};

const getAPage = (moduleName: string) => {
  console.log("Aye, getting teh module");
};

const program = new Command();

program
  .command("login")
  .description("Log in to an OCPI platform")
  .argument("url", "The versions URL for the platform to log in to")
  .option(
    "--token <token>",
    "The authentication token for communication with the other platform",
    undefined
  )
  .action((url: string, options) => use(url, options.token));

program
  .command("get <module>")
  .description("Fetch a page of data of a certain OCPI module")
  .action((moduleName: string) => getAPage(moduleName));

program.parse();
