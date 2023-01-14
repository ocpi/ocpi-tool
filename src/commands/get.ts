import { exit, stderr, stdout } from "node:process";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { fetchDataForModule, getModuleByName, ModuleID } from "../ocpi-request";
import {
  DescriptorModificationError,
  filter,
  isDescriptorModificationError,
  modifyDescriptorToPass,
  modulePrivacyDescriptors,
  PrivacyDescriptor,
} from "../privacy/filter";

export const get = async (moduleName: string, privacyPass?: string) => {
  const module = getModuleByName(moduleName);

  if (module == null) {
    stderr.write(`Unknown OCPI module ${moduleName}\n`);
    exit(1);
  }

  const defaultPrivacyDescriptorForModule =
    modulePrivacyDescriptors[module.name as ModuleID];
  if (defaultPrivacyDescriptorForModule === null) {
    throw new Error(
      `No privacy descriptor defined for module [${module.name}]`
    );
  }
  const privacyDescriptorModifiersToPass = privacyPass?.split(",");
  const effectivePrivacyDescriptor:
    | PrivacyDescriptor
    | DescriptorModificationError = privacyDescriptorModifiersToPass
    ? privacyDescriptorModifiersToPass.reduce<
        PrivacyDescriptor | DescriptorModificationError
      >(
        (a, v) =>
          isDescriptorModificationError(a) ? a : modifyDescriptorToPass(v, a),
        defaultPrivacyDescriptorForModule
      )
    : defaultPrivacyDescriptorForModule;

  if (isDescriptorModificationError(effectivePrivacyDescriptor)) {
    throw new Error(
      `Could not apply privacy modifier [${effectivePrivacyDescriptor.modifier}] to privacy descriptor [${effectivePrivacyDescriptor.descriptor}]: ${effectivePrivacyDescriptor.message}`
    );
  }

  const ocpiObjectStream = fetchDataForModule(module);

  const privacyFilteringStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      const filteredObject = filter(effectivePrivacyDescriptor, chunk);
      if (filteredObject.errors !== null) {
        console.warn(
          "Failed to privacy-filter object: ",
          filteredObject.errors
        );
      } else {
        this.push(filteredObject.result);
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
