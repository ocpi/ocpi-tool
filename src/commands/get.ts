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
import { loadSession } from "../login-session";

export const get = async (moduleName: string, privacyPass?: string) => {
  const module = getModuleByName(moduleName);

  if (module == null) {
    stderr.write(`Unknown OCPI module ${moduleName}\n`);
    exit(1);
  }

  const session = await loadSession();

  const defaultPrivacyDescriptorForModule =
    modulePrivacyDescriptors[module.name as ModuleID][session.version];
  if (defaultPrivacyDescriptorForModule === null) {
    throw new Error(
      `No privacy descriptor defined for module [${module.name}] at version [${session.version}]`
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

  const ocpiObjectStream = fetchDataForModule(session, module);

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
    construct(callback) {
      this.push("[");
      callback();
    },
    transform(chunk, encoding, callback) {
      this.emit("append_item");
      this.push(JSON.stringify(chunk));
      this.once("append_item", () => { this.push(",") });
      callback();
    },
    flush(callback) {
      this.push("]");
      callback();
    }
  });

  try {
    await pipeline(
      ocpiObjectStream.on("error", () => console.debug("aargh!")),
      privacyFilteringStream,
      jsonEncodingStream,
      stdout
    );
  } catch (err) {
    console.log(
      `Error fetching data from OCPI platform: ${(err as Error)?.message}`
    );
  }
};
