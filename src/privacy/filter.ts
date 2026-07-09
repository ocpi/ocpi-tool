import { ModuleID, OcpiVersion } from "../ocpi-request";

import { locationDescriptorV211, locationDescriptorV221 } from "./location";
import { sessionDescriptorV211, sessionDescriptorV221 } from "./session";
import { cdrDescriptorV211, cdrDescriptorV221 } from "./cdr";
import { tariffDescriptor } from "./tariff";
import { tokenDescriptor } from "./token";

export type PrivacyDescriptor =
  | ObjectDescriptor
  | ArrayDescriptor
  | "deep-pass"
  | "pass"
  | "na";

type ObjectDescriptor = {
  [k: string]: PrivacyDescriptor;
};

type ArrayDescriptor = [PrivacyDescriptor];

export const modulePrivacyDescriptors: Record<
  ModuleID,
  Record<OcpiVersion, PrivacyDescriptor>
> = {
  cdrs: { "2.1.1": cdrDescriptorV211, "2.2.1": cdrDescriptorV221 },
  locations: { "2.1.1": locationDescriptorV211, "2.2.1": locationDescriptorV221 },
  sessions: { "2.1.1": sessionDescriptorV211, "2.2.1": sessionDescriptorV221 },
  tariffs: { "2.1.1": tariffDescriptor, "2.2.1": tariffDescriptor },
  tokens: { "2.1.1": tokenDescriptor, "2.2.1": tokenDescriptor },
};

interface UnrecognizedPropertyError extends Error {
  name: "Unrecognized property";
  propertyName: string;
}

interface UnsupportedInputTypeError extends Error {
  name: "Unsupported input type";
  unsupportedInputTypeName: string;
  unsupportedValue: any;
}

type PrivacyError = UnrecognizedPropertyError | UnsupportedInputTypeError;

type OcpiPrimitive = string | boolean | number | null;

type FilterFailure = {
  errors: PrivacyError[];
  result: null;
};

type FilterSuccess = {
  errors: null;
  result: any;
};

type FilterResult = FilterFailure | FilterSuccess;

export const filter: (
  descriptor: PrivacyDescriptor,
  input: any
) => FilterResult = (descriptor, input) => {
  if (descriptor === "deep-pass") {
    return { result: input, errors: null };
  } else if (descriptor === "pass") {
    if (isOcpiPrimitive(input)) {
      return { result: input, errors: null };
    } else {
      return unsupportedInputException(descriptor, input);
    }
  } else if (descriptor === "na") {
    if (isOcpiPrimitive(input)) {
      return { result: "#NA", errors: null };
    } else {
      return unsupportedInputException(descriptor, input);
    }
  } else if (Array.isArray(descriptor)) {
    if (Array.isArray(input)) {
      const resultArray = input.map((elem) => filter(descriptor[0], elem));
      const errors: PrivacyError[] = resultArray.flatMap(
        (result) => result?.errors ?? []
      );
      if (errors.length > 0) {
        return { errors, result: null };
      } else {
        return {
          errors: null,
          result: resultArray.map((result) => result.result),
        };
      }
    } else {
      return unsupportedInputException(descriptor, input);
    }
  } else {
    // descriptor must be an object descriptor now
    if (input === null) {
      return { result: null, errors: null };
    } else if (typeof input === "object" && !Array.isArray(input)) {
      const result: Record<string, any> = {};
      const errors: PrivacyError[] = [];

      for (const k in input) {
        if (!(k in descriptor)) {
          return unrecognizedPropertyError(descriptor, k, input);
        } else {
          const fieldResult = filter(descriptor[k], input[k]);
          if (fieldResult.errors) {
            fieldResult.errors.forEach((err) => errors.push(err));
          } else {
            result[k] = fieldResult.result;
          }
        }
      }

      if (errors.length > 0) {
        return { errors, result: null };
      } else {
        return { errors: null, result };
      }
    } else {
      return unsupportedInputException(descriptor, input);
    }
  }
};

function isOcpiPrimitive(value: any): value is OcpiPrimitive {
  return (
    ["string", "boolean", "number"].includes(typeof value) || value === null
  );
}

const unsupportedInputException: (
  descriptor: PrivacyDescriptor,
  unsupportedValue: any
) => FilterFailure = (descriptor, unsupportedValue) => ({
  errors: [
    {
      name: "Unsupported input type",
      unsupportedInputTypeName: typeof unsupportedValue,
      unsupportedValue: unsupportedValue,
      message: `Cannot handle value [${unsupportedValue}] with descriptor ${JSON.stringify(
        descriptor
      )}`,
    },
  ],
  result: null,
});

const unrecognizedPropertyError: (
  descriptor: PrivacyDescriptor,
  unrecognizedKey: string,
  input: any
) => FilterFailure = (descriptor, unrecognizedKey, input) => ({
  errors: [
    {
      name: "Unrecognized property",
      message: `Found property [${unrecognizedKey}] where it was not expected; was expecting value of form ${JSON.stringify(
        descriptor
      )}; input is ${JSON.stringify(input)}`,
      propertyName: unrecognizedKey,
    },
  ],
  result: null,
});

export interface DescriptorModificationError extends Error {
  descriptor: PrivacyDescriptor;
  modifier: string;
}

export function isDescriptorModificationError(
  v: DescriptorModificationError | PrivacyDescriptor
): v is DescriptorModificationError {
  const keys = Object.keys(v);

  return (
    keys.includes("name") &&
    keys.includes("message") &&
    keys.includes("descriptor") &&
    keys.includes("modifier")
  );
}

export const modifyDescriptorToPass: (
  modifier: string,
  descriptor: PrivacyDescriptor
) => PrivacyDescriptor | DescriptorModificationError = (
  modifier,
  descriptor
) => {
  if (modifier === "." || modifier === "") return "deep-pass";

  if (Array.isArray(descriptor)) {
    const intermediateResult = modifyDescriptorToPass(modifier, descriptor[0]);
    if (isDescriptorModificationError(intermediateResult)) {
      return intermediateResult;
    } else {
      return [intermediateResult];
    }
  } else if (
    descriptor === "pass" ||
    descriptor === "na" ||
    descriptor === "deep-pass"
  ) {
    return {
      descriptor,
      modifier,
      message:
        "Attempt to modify privacy filtering of non-existent nested field",
      name: "DescriptorModificationError",
    };
  } else {
    const modifierElements = modifier.split(".");
    const key = modifierElements[0];
    const modifierUnderKey = modifierElements.slice(1).join(".");
    const intermediateResult = modifyDescriptorToPass(
      modifierUnderKey,
      descriptor[key]
    );

    if (isDescriptorModificationError(intermediateResult)) {
      return intermediateResult;
    }

    return { ...descriptor, [key]: intermediateResult };
  }
};
