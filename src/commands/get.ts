import { exit, stderr, stdout } from "process";
import { fetchDataForModule, getModuleByName } from "../ocpi-request";

export const get = async (moduleName: string) => {
  /*
  const data = await pullData(moduleName);
  if (data === "no such endpoint") {
    console.log(`No such endpoint: [${moduleName}]`);
  } else {
    stdout.write(JSON.stringify(data, null, 2));
  }
  */

  const module = getModuleByName(moduleName);

  if (module == null) {
    stderr.write(`Unknown OCPI module ${moduleName}\n`);
    exit(1);
  }

  const data = await fetchDataForModule(module).on("data", (aargh) => {
    console.log("aargh", aargh);
  });
};
