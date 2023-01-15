import {
  energyMixDescriptor,
  privateDisplayTextDescriptor,
  privatePriceDescriptor,
} from "./common";
import { PrivacyDescriptor } from "./filter";

const priceComponentDescriptor: PrivacyDescriptor = {
  type: "pass",
  price: "na",
  vat: "na",
  step_size: "pass",
};

const tariffRestrictionsDescriptor: PrivacyDescriptor = {
  start_time: "na",
  end_time: "na",
  start_date: "na",
  end_date: "na",
  min_kwh: "pass",
  max_kwh: "pass",
  min_current: "pass",
  max_current: "pass",
  min_power: "pass",
  max_power: "pass",
  min_duration: "pass",
  max_duration: "pass",
  day_of_week: "pass",
  reservation: "pass",
};

const tariffElementDescriptor: PrivacyDescriptor = {
  priceComponents: [priceComponentDescriptor],
  restrictions: tariffRestrictionsDescriptor,
};

export const tariffDescriptor: PrivacyDescriptor = {
  country_code: "pass",
  party_id: "pass",
  id: "pass",
  currency: "pass",
  type: "pass",
  tariff_alt_text: [privateDisplayTextDescriptor],
  tariff_alt_url: "na",
  min_price: privatePriceDescriptor,
  max_price: privatePriceDescriptor,
  elements: [tariffElementDescriptor],
  start_date_time: "na",
  end_date_time: "na",
  energy_mix: [energyMixDescriptor],
  last_updated: "na",
};
