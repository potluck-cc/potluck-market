import { StyleSheet, Platform } from "react-native";
import { Colors, isIphoneXorAbove } from "../common";

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 25,
    paddingRight: 25,
    backgroundColor: "white",
    paddingTop: Platform.select({
      ios: isIphoneXorAbove() ? 50 : null
    })
  },
  input: {
    marginTop: 5,
    marginBottom: 5
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
    marginBottom: 10
  },
  loader: {
    paddingTop: 10
  },
  center: {
    alignSelf: "center"
  }
});
