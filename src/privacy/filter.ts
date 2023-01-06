import { ModuleID } from "../ocpi-request";

import { locationDescriptor } from "./location";
import { sessionDescriptor } from "./session";

export type PrivacyDescriptor =
  | ObjectDescriptor
  | ArrayDescriptor
  | "pass"
  | "na";

type ObjectDescriptor = {
  [k: string]: PrivacyDescriptor;
};

type ArrayDescriptor = [PrivacyDescriptor];

export const modulePrivacyDescriptors: Record<
  ModuleID,
  PrivacyDescriptor | null
> = {
  cdrs: null,
  chargingprofiles: null,
  locations: locationDescriptor,
  sessions: sessionDescriptor,
  tariffs: null,
  tokens: null,
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
  if (descriptor === "pass") {
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
