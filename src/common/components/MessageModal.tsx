import React from "react";
import { StyleSheet, Platform, View, TouchableOpacity } from "react-native";
import Modal from "./Modal";
import { Icon } from "react-native-elements";
import { isBrowser } from "react-device-detect";
import GenericButton from "./GenericButton";
import { Text } from "@ui-kitten/components";

type MessageModalProps = {
  isVisible?: boolean;
  hide?: Function;
  message: string;
  btnText?: string;
  onPress?: Function;
};

export default function({
  isVisible = false,
  hide = () => {},
  message,
  btnText = "OK",
  onPress
}: MessageModalProps) {
  return (
    <Modal isVisible={isVisible}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => hide()}>
            <Icon
              color="black"
              size={30}
              name="close"
              type="material-community"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.text}>{message}</Text>
        </View>

        <View style={styles.btnContainer}>
          <GenericButton
            onPress={onPress ? () => onPress() : () => hide()}
            buttonText={btnText}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    width: isBrowser ? "50%" : "100%",
    backgroundColor: "white",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "center",
    padding: 10,
    zIndex: 999
  },
  header: {
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "flex-end"
  },
  textContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    textAlign: "center"
  },
  btnContainer: {
    alignItems: "center",
    justifyContent: "center"
  }
});
