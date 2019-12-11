const rules = {
  NJ: {
    medical: true,
    rec: false
  }
};

export type LocationRules = {
  medical: boolean;
  rec: boolean;
};

export enum SupportedLocations {
  NJ = "NJ"
}

export function getLocationRules(
  state: SupportedLocations
): undefined | LocationRules {
  return rules[state];
}
