import axios from "axios";
import { Command } from "commander";
import { V211Version as V211ListedVersion } from "./ocpimsgs/version.schema";
import { V211Version } from "./ocpimsgs/versionGetDetailResponse.schema";

interface OcpiResponse<T> {
  data: T;
  status_code: number;
  status_message?: string;
  timestamp: string;
}

const use = async (platformVersionsUrl: string, token?: string) => {
  // OK, we're going to start a session with a certain platform. So we have to:
  //  * fetch versions
  //  * pick the 2.1.1 version
  //  * fetch the endpoints
  //  * store those
  if (!token) {
    throw new Error('A token is required with "ocpi login"');
  }

  console.log("Aye, logging in, howdyhey");
  await axios
    .get(platformVersionsUrl, {
      headers: { Authorization: `Token ${token}` },
    })
    .then((resp) => {
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
      }
    })
    .catch((error) => {
      if (error.response) {
        throw new Error(
          `Failed to make OCPI request to platform: HTTP status is [${error.response.status}]; body is [${error.response.data}]`
        );
      }
    });
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
