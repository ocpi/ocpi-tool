import { Command } from "commander";
import { login } from "./login";

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
  .action((url: string, options) => login(url, options.token));

program
  .command("get <module>")
  .description("Fetch a page of data of a certain OCPI module")
  .action((moduleName: string) => getAPage(moduleName));

program.parse();
