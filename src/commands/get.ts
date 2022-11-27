import { stdout } from "process";
import { pullData } from "../ocpi-request";

export const get = async (moduleName: string) => {
  const data = await pullData(moduleName);
  if (data === "no such endpoint") {
    console.log(`No such endpoint: [${moduleName}]`);
  } else {
    stdout.write(JSON.stringify(data, null, 2));
  }
};
