import { Console } from "node:console";
import { stderr } from "node:process";
import { Command } from "commander";
import { INPUT_PARTY_ID_REGEX, login } from "./commands/login";
import { get } from "./commands/get";
import parseDate from "./coercion/parseDate";

// send all console messages to stderr so people can pipe OCPI objects over
// stdout and see the progress messages written to stdout at the same time
console = new Console({ stdout: stderr, stderr });

// don't print debug output, normally speaking
console.debug = () => {};

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
    INPUT_PARTY_ID_REGEX
  )
  .action((url: string, options) => login(url, options.token, options.party));

program
  .command("get <module>")
  .description("Fetch a page of data of a certain OCPI module")
  .option<Date>(
    "--date-from <ISO 8601 datetime>",
    "Limits objects returned to those that have last_updated after or equal to this value",
    parseDate
  )
  .option(
    "--privacy-pass <field list>",
    "List of fields to exclude from privacy filtering"
  )
  .action((moduleName: string, options) =>
    get(moduleName, options["dateFrom"], options["privacyPass"])
  );

program.parse();
