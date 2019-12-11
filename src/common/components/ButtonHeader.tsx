import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Platform
} from "react-native";
import { Icon } from "react-native-elements";
import { isIphoneXorAbove } from "../isIphoneXorAbove";

type HeaderProps = {
  navigation?: import("react-navigation").NavigationScreenProp<
    import("react-navigation").NavigationState,
    import("react-navigation").NavigationParams
  >;
  onBackBtnPress?: () => void;
  renderCustomIconComponent?: () => JSX.Element;
  modal?: boolean;
  containerStyle?: ViewStyle;
};

export default function Header({
  onBackBtnPress = () => {},
  renderCustomIconComponent,
  modal,
  navigation,
  containerStyle
}: HeaderProps) {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: "transparent",
      padding: 15,
      paddingTop: Platform.select({
        ios: isIphoneXorAbove() ? 40 : null
      }),
      position: "absolute",
      top: 0,
      zIndex: 999,
      ...containerStyle
    },
    wrapper: {
      alignSelf: "flex-start",
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%"
    },
    btn: {
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.2)",
      alignItems: "center",
      justifyContent: "center",
      width: 40,
      height: 40,
      backgroundColor: "white",
      borderRadius: 100
    }
  });

  function goBack() {
    if (modal) {
      const previousScreenKey: string | null = navigation.getParam(
        "returnKey",
        null
      );

      if (previousScreenKey) {
        navigation.navigate(previousScreenKey);
      }
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.wrapper}>
        <TouchableOpacity
          onPress={modal ? () => goBack() : () => onBackBtnPress()}
          style={styles.btn}
        >
          {renderCustomIconComponent ? (
            renderCustomIconComponent()
          ) : (
            <Icon
              name="keyboard-backspace"
              type="material-community"
              color="black"
              size={25}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
