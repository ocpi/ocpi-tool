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
  .option(
    "--token <token>",
    "The authentication token for communication with the other platform",
    undefined
  )
  .action((url: string, options) => login(url, options.token));

program
  .command("get <module>")
  .description("Fetch a page of data of a certain OCPI module")
  .action((moduleName: string) => get(moduleName));

program.parse();
