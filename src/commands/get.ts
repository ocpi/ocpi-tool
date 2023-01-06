import { exit, stderr, stdout } from "node:process";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { fetchDataForModule, getModuleByName, ModuleID } from "../ocpi-request";
import {
  filter,
  modulePrivacyDescriptors,
  PrivacyDescriptor,
} from "../privacy/filter";

export const get = async (moduleName: string) => {
  const module = getModuleByName(moduleName);

  if (module == null) {
    stderr.write(`Unknown OCPI module ${moduleName}\n`);
    exit(1);
  }

  const ocpiObjectStream = fetchDataForModule(module);

  const privacyFilteringStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const privacyDescriptor: PrivacyDescriptor | null =
        modulePrivacyDescriptors[module.name as ModuleID];
      if (privacyDescriptor === null) {
        throw new Error(
          `No privacy descriptor defined for module [${module.name}]`
        );
      }
      const filteredObject = filter(privacyDescriptor, chunk);
      if (filteredObject.errors !== null) {
        console.warn(
          "Failed to privacy-filter object: ",
          filteredObject.errors
        );
      } else {
        this.push(filter(privacyDescriptor, chunk).result);
      }
      callback();
    },
  });

  const jsonEncodingStream = new Transform({
    writableObjectMode: true,
    transform(chunk, encoding, callback) {
      this.push(JSON.stringify(chunk));
      callback();
    },
  });

  pipeline(
    ocpiObjectStream,
    privacyFilteringStream,
    jsonEncodingStream,
    stdout
  );
};
