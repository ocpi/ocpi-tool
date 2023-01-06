import { PrivacyDescriptor } from "./filter";

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

export const locationDescriptor: PrivacyDescriptor = {
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
