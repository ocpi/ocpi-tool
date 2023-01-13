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
