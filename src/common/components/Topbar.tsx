import React, { Fragment } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar
} from "react-native";
import { TopNavigation } from "react-native-ui-kitten";
import { Icon } from "react-native-elements";
import { Colors, isIphoneXorAbove } from "common";

type Props = {
  navigation: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
  title: string;
};

export default function Topbar({
  navigation,
  title = "Potluck Market"
}: Props) {
  function renderLeftControl() {
    return (
      <TouchableOpacity onPress={() => navigation()}>
        <Icon
          name="keyboard-backspace"
          type="material-community"
          color="black"
          size={25}
        />
      </TouchableOpacity>
    );
  }

  return (
    <Fragment>
      <TopNavigation
        title={title}
        alignment="center"
        titleStyle={styles.title}
        style={styles.container}
        leftControl={renderLeftControl()}
      />
    </Fragment>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    paddingTop: Platform.select({
      android: StatusBar.currentHeight,
      ios: isIphoneXorAbove() ? 35 : 30
    })
  },
  title: {
    paddingTop: Platform.select({
      android: StatusBar.currentHeight / 2,
      ios: isIphoneXorAbove() ? 30 : 20
    })
  },
  popoverContent: {
    position: "absolute",
    right: -25,
    top: 100,
    backgroundColor: "white"
  }
});
