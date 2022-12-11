import { Console } from "node:console";
import { stderr } from "node:process";
import { Command } from "commander";
import { login } from "./commands/login";
import { get } from "./commands/get";

// send all console messages to stderr so people can pipe OCPI objects over
// stdout and see the progress messages written to stdout at the same time
console = new Console({ stdout: stderr, stderr });

const program = new Command();

program
  .command("login")
  .description("Log in to an OCPI platform")
  .argument("url", "The versions URL for the platform to log in to")
  .requiredOption(
    "--token <token>",
    "The authentication token for communication with the other platform"
  )
  .requiredOption(
    "--party <party>",
    "The party ID that the tool is connecting to the platform as, like DE-ABC or FR-XYZ",
    /[A-Z]{2}-[A-Z0-9]{3}/
  )
  .action((url: string, options) => login(url, options.token, options.party));

program
  .command("get <module>")
  .description("Fetch a page of data of a certain OCPI module")
  .action((moduleName: string) => get(moduleName));

program.parse();
