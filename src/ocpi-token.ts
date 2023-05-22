import { Console } from "node:console";
import { stderr } from "node:process";
import { Command } from "commander";
import { INPUT_PARTY_ID_REGEX, login } from "./commands/login";
import { get } from "./commands/get";
import {authorize} from "./commands/token/authorize";

// send all console messages to stderr so people can pipe OCPI objects over
// stdout and see the progress messages written to stdout at the same time
console = new Console({ stdout: stderr, stderr });

// don't print debug output, normally speaking
console.debug = () => {};

const program = new Command();
program
  .command("get")
  .description("Fetch a page of Token data")
  .option(
    "--privacy-pass <field list>",
    "List of fields to exclude from privacy filtering"
  )
  .action((moduleName: string, options) => {
    console.log(options)
    get("tokens", options["privacyPass"])
  }
  );

program
  .command("authorize <uid>")
  .description("Retrieve validation status of an uid using real time authorization")
  .action((uid: string, options) =>
      authorize(uid)
  );

program.parse();
