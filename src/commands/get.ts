import { stdout } from "process";
import { fetchDataForModule, locations } from "../ocpi-request";

export const get = async (moduleName: string) => {
  /*
  const data = await pullData(moduleName);
  if (data === "no such endpoint") {
    console.log(`No such endpoint: [${moduleName}]`);
  } else {
    stdout.write(JSON.stringify(data, null, 2));
  }
  */

  const data = await fetchDataForModule(locations).on("data", (aargh) => {
    console.log("aargh", aargh);
  });
};
