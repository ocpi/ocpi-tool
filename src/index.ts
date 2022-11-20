import { Command } from "commander";
import { V211Token } from "./ocpimsgs/token.schema";

const aargh: V211Token = {
  uid: "AAAAAAAAAAAAAA",
  type: "OTHER",
};

const use = (platformVersionsUrl: string) => {
  console.log("Aye, logging in, howdyhey");
};

const getAPage = (moduleName: string) => {
  console.log("Aye, getting teh module");
};

const program = new Command();

program
  .command("login <URL>")
  .description("Log in to an OCPI platform")
  .action((url: string) => use(url));
program
  .command("get <module>")
  .description("Fetch a page of data of a certain OCPI module")
  .action((moduleName: string) => getAPage(moduleName));

program.parse();
