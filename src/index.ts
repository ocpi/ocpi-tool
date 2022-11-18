const { program } = require("commander");

const loginTo = (url: string) => {
  console.log("Aye, logging in, howdyhey");
};

const getAPage = (moduleName: string) => {
  console.log("Aye, getting teh module");
};

program
  .command("login <URL>")
  .description("Log in to an OCPI platform")
  .action((url: string) => loginTo(url));
program
  .command("get <module>")
  .description("Fetch a page of data of a certain OCPI module")
  .action((moduleName: string) => getAPage(moduleName));

program.parse();
