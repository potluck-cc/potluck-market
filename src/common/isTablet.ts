import { scale } from "react-native-size-matters";

export function isTablet() {
  return scale(10) >= 21.94;
}
