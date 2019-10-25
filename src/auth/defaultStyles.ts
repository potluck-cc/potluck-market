import { StyleSheet, Platform } from "react-native";
import { Colors, isIphoneXorAbove, isTablet } from "../common";
import { isBrowser } from "react-device-detect";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
    backgroundColor: "white",
    paddingTop: Platform.select({
      ios: isIphoneXorAbove() ? 50 : null,
      web: 50
    })
  },
  input: {
    marginTop: 5,
    marginBottom: 5,
    width: Platform.select({
      android: isTablet() ? "50%" : "100%",
      ios: isTablet() ? "50%" : "100%",
      web: isBrowser ? null : "100%"
    })
  },
  btn: {
    backgroundColor: Colors.green,
    borderColor: Colors.green,
    width: 300,
    marginTop: 10
  },
  errorText: {
    color: "red",
    marginTop: 10,
    marginBottom: 8
  },
  loader: {
    paddingTop: 10
  },
  center: {
    alignSelf: "center"
  }
});
