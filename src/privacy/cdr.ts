import { locationDescriptor } from "./location";
import { chargingPeriodDescriptor } from "./common";
import { PrivacyDescriptor } from "./filter";

const tariffDescriptor: PrivacyDescriptor = {};

export const cdrDescriptor: PrivacyDescriptor = {
  id: "pass",
  start_date_time: "na",
  stop_date_time: "na",
  auth_id: "na",
  auth_method: "na",
  location: locationDescriptor,
  meter_id: "na",
  currency: "pass",
  tariffs: [tariffDescriptor],
  charging_periods: [chargingPeriodDescriptor],
  total_cost: "na",
  total_energy: "na",
  total_time: "na",
  total_parking_time: "na",
  remark: "na",
  last_updated: "na",
};
