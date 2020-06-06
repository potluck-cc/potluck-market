import { Platform } from "react-native";

import {
  getCurrentPositionAsync,
  reverseGeocodeAsync,
  setApiKey
} from "expo-location";

import { askAsync, LOCATION } from "expo-permissions";

export const rules = {
  AK: {
    rec: true,
    medical: true
  },
  AZ: {
    medical: true,
    rec: false
  },
  AR: {
    medical: true,
    rec: false
  },
  CA: {
    rec: true,
    medical: true
  },
  CO: {
    rec: true,
    medical: true
  },
  CT: {
    medical: true,
    rec: false
  },
  DE: {
    medical: true,
    rec: false
  },
  DC: {
    rec: true,
    medical: true
  },
  FL: {
    medical: true,
    rec: false
  },
  HI: {
    medical: true,
    rec: false
  },
  IL: {
    medical: true,
    rec: true
  },
  LA: {
    medical: true,
    rec: false
  },
  ME: {
    medical: true,
    rec: true
  },
  MD: {
    medical: true,
    rec: false
  },
  MA: {
    medical: true,
    rec: true
  },
  MI: {
    medical: true,
    rec: true
  },
  MO: {
    medical: true,
    rec: false
  },
  MT: {
    medical: true,
    rec: false
  },
  NV: {
    medical: true,
    rec: true
  },
  NH: {
    medical: true,
    rec: false
  },
  NJ: {
    medical: true,
    rec: false
  },
  NM: {
    medical: true,
    rec: false
  },
  NY: {
    medical: true,
    rec: false
  },
  ND: {
    medical: true,
    rec: false
  },
  OH: {
    medical: true,
    rec: false
  },
  OK: {
    medical: true,
    rec: false
  },
  OR: {
    medical: true,
    rec: true
  },
  PA: {
    medical: true,
    rec: false
  },
  RI: {
    medical: true,
    rec: false
  },
  UT: {
    medical: true,
    rec: false
  },
  VT: {
    medical: true,
    rec: true
  },
  WA: {
    medical: true,
    rec: true
  },
  WV: {
    medical: true,
    rec: false
  }
};

export type LocationRules = {
  medical: boolean;
  rec: boolean;
};

export enum SupportedLocations {
  ak = "AK",
  alaska = "AK",
  az = "AZ",
  arizona = "AZ",
  AR = "AR",
  arkansas = "AR",
  CA = "CA",
  california = "CA",
  CO = "CO",
  colorado = "CO",
  CT = "CT",
  connecticut = "CT",
  DE = "DE",
  delaware = "DE",
  DC = "DC",
  district_of_colombia = "DC",
  FL = "FL",
  florida = "FL",
  HI = "HI",
  hawaii = "HI",
  IL = "IL",
  illinois = "IL",
  LA = "LA",
  typesiana = "LA",
  ME = "ME",
  maine = "ME",
  MD = "MD",
  maryland = "MD",
  MA = "MA",
  massachusetts = "MA",
  MI = "MI",
  michigan = "MI",
  MO = "MO",
  missouri = "MO",
  MT = "MT",
  montana = "MT",
  NV = "NV",
  nevada = "NV",
  NH = "NH",
  new_hampshire = "NH",
  nj = "NJ",
  new_jersey = "NJ",
  NM = "NM",
  new_mexico = "NM",
  NY = "NY",
  new_york = "NY",
  ND = "ND",
  north_dakota = "ND",
  OH = "OH",
  ohio = "OH",
  OK = "OK",
  oklahoma = "OK",
  OR = "OR",
  oregon = "OR",
  PA = "PA",
  pennsylvania = "PA",
  RI = "RI",
  rhode_island = "RI",
  UT = "UT",
  utah = "UT",
  VT = "VT",
  vermont = "VT",
  WA = "WA",
  washington = "WA",
  WV = "WV",
  west_virginia = "WV"
}

export function getLocationRules(
  state: SupportedLocations
): undefined | LocationRules {
  return rules[state];
}

export async function getLocationPermissions({
  onSuccess = () => {},
  onFail = () =>
    alert(
      "We need permission to access your location in order to proceed with the verification process."
    )
}: {
  onSuccess?: (
    status: import("expo-permissions").PermissionStatus,
    permissions: import("expo-permissions").PermissionMap
  ) => void;
  onFail?: () => void;
}) {
  let { status, permissions } = await askAsync(LOCATION);

  if (status !== "granted") {
    onFail();
  } else {
    onSuccess(status, permissions);
  }

  return status;
}

export async function getLocationAsync({
  onSuccess = () => {},
  onFail = () =>
    alert("Something went wrong while locating you. Please try again later."),
  coordsOnly = false
}: {
  onSuccess?: (
    location:
      | import("expo-location").Address[]
      | import("expo-location").GeocodedLocation
  ) => void;
  onFail?: () => void;
  coordsOnly?: boolean;
}) {
  if (Platform.OS === "web") {
    setApiKey("AIzaSyB30Evgnn_D16ZtL5qCRFzUJrj5sGY2dUo");
  }

  try {
    let location = await getCurrentPositionAsync({});

    if (location) {
      const {
        coords: { latitude, longitude }
      } = location;

      if (coordsOnly) {
        return onSuccess({ latitude, longitude });
      }

      const info = await reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (info.length) {
        onSuccess(info);
      } else {
        onFail();
      }
    } else {
      onFail();
    }
  } catch {
    onFail();
  }
}
