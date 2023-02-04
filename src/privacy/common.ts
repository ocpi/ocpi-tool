import { PrivacyDescriptor } from "./filter";

export const cdrDimensionDescriptor: PrivacyDescriptor = {
  type: "na",
  volume: "na",
};

export const cdrTokenDescriptor: PrivacyDescriptor = {
  country_code: "pass",
  party_id: "pass",
  uid: "na",
  type: "pass",
  contract_id: "na",
};

export const chargingPeriodDescriptor: PrivacyDescriptor = {
  start_date_time: "na",
  dimensions: [cdrDimensionDescriptor],
  tariff_id: "pass",
};

export const energyMixDescriptor: PrivacyDescriptor = {
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

export const geoLocationDescriptor: PrivacyDescriptor = {
  latitude: "na",
  longitude: "na",
  name: "na",
};

export const privateDisplayTextDescriptor: PrivacyDescriptor = {
  language: "na",
  text: "na",
};

export const privatePriceDescriptor: PrivacyDescriptor = {
  excl_vat: "na",
  incl_vat: "na",
};
