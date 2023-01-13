import { PrivacyDescriptor } from "./filter";

export const cdrDimensionDescriptor: PrivacyDescriptor = {
  type: "na",
  volume: "na",
};

export const chargingPeriodDescriptor: PrivacyDescriptor = {
  start_date_time: "na",
  dimensions: [cdrDimensionDescriptor],
  tariff_id: "pass",
};

export const privateDisplayTextDescriptor: PrivacyDescriptor = {
  language: "na",
  text: "na",
};

export const privatePriceDescriptor: PrivacyDescriptor = {
  excl_vat: "na",
  incl_vat: "na",
};
