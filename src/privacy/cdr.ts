import { locationDescriptorV211 } from "./location";
import {
  chargingPeriodDescriptor,
  cdrTokenDescriptor,
  geoLocationDescriptor,
  privatePriceDescriptor,
} from "./common";
import { PrivacyDescriptor } from "./filter";
import { tariffDescriptor } from "./tariff";

const cdrLocationDescriptor: PrivacyDescriptor = {
  id: "pass",
  name: "na",
  address: "na",
  city: "na",
  postal_code: "na",
  state: "na",
  country: "pass",
  coordinates: geoLocationDescriptor,
  evse_uid: "pass",
  evse_id: "na",
  connector_id: "pass",
  connector_standard: "pass",
  connector_format: "pass",
  connector_power_type: "pass",
};

const signedDataDescriptor: PrivacyDescriptor = {
  encoding_method: "pass",
  encoding_method_version: "pass",
  public_key: "pass",
  signed_values: {
    nature: "na",
    plain_data: "na",
    signed_data: "na",
  },
  url: "na",
};

const baseCdrDescriptor: PrivacyDescriptor = {
  id: "pass",
  start_date_time: "na",
  auth_method: "na",
  meter_id: "na",
  currency: "pass",
  tariffs: [tariffDescriptor],
  charging_periods: [chargingPeriodDescriptor],
  total_energy: "na",
  total_time: "na",
  total_parking_time: "na",
  remark: "na",
  last_updated: "na",
};

export const cdrDescriptorV211: PrivacyDescriptor = {
  ...baseCdrDescriptor,
  stop_date_time: "na",
  auth_id: "na",
  location: locationDescriptorV211,
  total_cost: "na",
};

export const cdrDescriptorV221: PrivacyDescriptor = {
  ...baseCdrDescriptor,
  country_code: "pass",
  party_id: "pass",
  end_date_time: "na",
  session_id: "pass",
  cdr_token: cdrTokenDescriptor,
  authorization_reference: "pass",
  cdr_location: cdrLocationDescriptor,
  signed_data: signedDataDescriptor,
  total_cost: privatePriceDescriptor,
  total_fixed_cost: privatePriceDescriptor,
  total_energy_cost: privatePriceDescriptor,
  total_time_cost: privatePriceDescriptor,
  total_parking_cost: privatePriceDescriptor,
  total_reservation_cost: privatePriceDescriptor,
  invoice_reference_id: "na",
  credit: "pass",
  credit_reference_id: "pass",
  home_charging_compensation: "na",
};
