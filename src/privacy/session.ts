import { PrivacyDescriptor } from "./filter";
import { chargingPeriodDescriptor, privatePriceDescriptor } from "./common";

export const cdrTokenDescriptor: PrivacyDescriptor = {
  country_code: "pass",
  party_id: "pass",
  uid: "na",
  type: "pass",
  contract_id: "na",
};

export const sessionDescriptorV211: PrivacyDescriptor = {
  country_code: "pass",
  party_id: "pass",
  id: "pass",
  start_date_time: "na",
  start_datetime: "na",
  end_date_time: "na",
  end_datetime: "na",
  kwh: "na",
  cdr_token: cdrTokenDescriptor,
  auth_id: "na",
  auth_method: "pass",
  authorization_reference: "na",
  location_id: "na",
  evse_uid: "na",
  connector_id: "na",
  meter_id: "na",
  currency: "pass",
  charging_periods: [chargingPeriodDescriptor],
  total_cost: "na",
  status: "na",
  last_updated: "na",
};

export const sessionDescriptorV221: PrivacyDescriptor = {
  ...sessionDescriptorV211,
  total_cost: privatePriceDescriptor,
};
