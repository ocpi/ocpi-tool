import { PrivacyDescriptor } from "./filter";
import { energyMixDescriptor, geoLocationDescriptor } from "./common";

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

const displayTextDescriptor: PrivacyDescriptor = {
  language: "na",
  text: "na",
};

const baseConnectorDescriptor: PrivacyDescriptor = {
  id: "pass",
  standard: "pass",
  format: "pass",
  power_type: "pass",
  terms_and_conditions: "pass",
  last_updated: "na",
};

const connectorDescriptorV211: PrivacyDescriptor = {
  ...baseConnectorDescriptor,
  voltage: "pass",
  amperage: "pass",
  tariff_id: "pass",
};

const connectorDescriptorV221: PrivacyDescriptor = {
  ...baseConnectorDescriptor,
  max_voltage: "pass",
  max_amperage: "pass",
  max_electric_power: "pass",
  tariff_ids: ["pass"],
};

const evseDescriptorV211: PrivacyDescriptor = {
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
  connectors: [connectorDescriptorV211],
  floor_level: "pass",
  coordinates: geoLocationDescriptor,
  physical_reference: "na",
  directions: [displayTextDescriptor],
  parking_restrictions: ["pass"],
  images: [imageDescriptor],
  last_updated: "na",
};

const evseDescriptorV221: PrivacyDescriptor = {
  ...evseDescriptorV211,
  connectors: [connectorDescriptorV221],
};

export const locationDescriptorV211: PrivacyDescriptor = {
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
  evses: [evseDescriptorV211],
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

export const locationDescriptorV221: PrivacyDescriptor = {
  ...locationDescriptorV211,
  evses: [evseDescriptorV221],
};
