import { exit, stderr, stdout } from "node:process";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { fetchDataForModule, getModuleByName } from "../ocpi-request";

export const get = async (moduleName: string) => {
  const module = getModuleByName(moduleName);

  if (module == null) {
    stderr.write(`Unknown OCPI module ${moduleName}\n`);
    exit(1);
  }

  const ocpiObjectStream = fetchDataForModule(module);
  const jsonEncodingStream = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      this.push(JSON.stringify(chunk));
      callback();
    },
  });

  pipeline(ocpiObjectStream, jsonEncodingStream, stdout);
};
