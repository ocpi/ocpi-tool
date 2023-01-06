import { ModuleID } from "./ocpi-request";

export type PrivacyDescriptor =
  | ObjectDescriptor
  | ArrayDescriptor
  | "pass"
  | "na";

type ObjectDescriptor = {
  [k: string]: PrivacyDescriptor;
};

type ArrayDescriptor = [PrivacyDescriptor];

const geoLocationDescriptor: PrivacyDescriptor = {
  latitude: "na",
  longitude: "na",
  name: "na",
};

const imageDescriptor: PrivacyDescriptor = {
  url: "na",
  thumbnail: "na",
  category: "pass",
  type: "pass",
  width: "pass",
  height: "pass",
};

const passedImageDescriptor: PrivacyDescriptor = {
  url: "pass",
  thumbnail: "pass",
  category: "pass",
  type: "pass",
  width: "pass",
  height: "pass",
};

const energyMixDescriptor: PrivacyDescriptor = {
  is_green_energy: "na",
  energy_sources: [
    {
      source: "na",
      percentage: "na",
    },
  ],
  environ_impact: [
    {
      category: "na",
      amount: "na",
    },
  ],
  supplier_name: "na",
  energy_product_name: "na",
};

const displayTextDescriptor: PrivacyDescriptor = {
  language: "na",
  text: "na",
};

const connectorDescriptor: PrivacyDescriptor = {
  id: "pass",
  standard: "pass",
  format: "pass",
  power_type: "pass",
  voltage: "pass",
  amperage: "pass",
  max_voltage: "pass",
  max_amperage: "pass",
  max_electric_power: "pass",
  tariff_ids: ["pass"],
  terms_and_conditions: "pass",
  last_updated: "na",
};

const evseDescriptor: PrivacyDescriptor = {
  uid: "pass",
  evse_id: "na",
  status: "na",
  status_schedule: [
    // writing default descriptors I realise pretty much everything is privacy
    // sensitive.
    // I'm wondering in my head: if one of these charging stations belonged to The
    //  King of The Netherlands, would paparazzi have a foothold to profile which
    // one belongs to the King?
    // If the maintenance profiles align with the King's holidays or foreign visits,
    // that's surely interesting to them. So this is censored as well. Drat.
    {
      period_begin: "na",
      period_end: "na",
      status: "na",
    },
  ],
  capabilities: ["pass"],
  connectors: [connectorDescriptor],
  floor_level: "pass",
  coordinates: geoLocationDescriptor,
  physical_reference: "na",
  directions: [displayTextDescriptor],
  parking_restrictions: ["pass"],
  images: [imageDescriptor],
  last_updated: "na",
};

const locationDescriptor: PrivacyDescriptor = {
  country_code: "pass",
  party_id: "pass",
  id: "pass",
  type: "pass",
  publish: "pass",
  publish_allowed_to: [
    {
      uid: "na",
      type: "na",
      visual_number: "na",
      issuer: "na",
      group_id: "na",
    },
  ],
  name: "na",
  address: "na",
  city: "na",
  postal_code: "na",
  state: "na",
  country: "pass",
  coordinates: geoLocationDescriptor,
  related_locations: geoLocationDescriptor,
  parking_type: "pass",
  evses: [evseDescriptor],
  directions: [displayTextDescriptor],
  operator: {
    name: "pass",
    website: "pass",
    logo: [passedImageDescriptor],
  },
  suboperator: {
    name: "pass",
    website: "pass",
    logo: [passedImageDescriptor],
  },
  owner: {
    name: "na",
    website: "na",
    logo: [imageDescriptor],
  },
  facilities: ["pass"],
  time_zone: "pass",
  opening_times: {
    twentyfourseven: "na",
    regular_hours: [
      {
        weekday: "na",
        period_begin: "na",
        period_end: "na",
      },
    ],
    exceptional_openings: [
      {
        period_begin: "na",
        period_end: "na",
      },
    ],
    exceptional_closings: [
      {
        period_begin: "na",
        period_end: "na",
      },
    ],
  },
  charging_when_closed: "pass",
  images: [imageDescriptor],
  energy_mix: [energyMixDescriptor],
  last_updated: "na",
};

export const modulePrivacyDescriptors: Record<
  ModuleID,
  PrivacyDescriptor | null
> = {
  cdrs: null,
  chargingprofiles: null,
  locations: locationDescriptor,
  sessions: null,
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
