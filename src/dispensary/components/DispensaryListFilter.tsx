import React from "react";
import { StyleSheet, Platform, SafeAreaView, StatusBar } from "react-native";
import { Select, Layout, CheckBox } from "@ui-kitten/components";
import { isMobile } from "react-device-detect";

export default function DispensaryListFilter({
  filterState,
  updateFilterState,
  distances
}: {
  filterState: {
    delivery: boolean;
    pickup: boolean;
    distance: { text: string };
  };
  updateFilterState: React.Dispatch<
    React.SetStateAction<{
      pickup: boolean;
      delivery: boolean;
      distance: {
        text: string;
      };
    }>
  >;
  distances: { text: string }[];
}) {
  return (
    <Layout style={styles.container}>
      <CheckBox
        text="Pickup"
        checked={filterState.pickup}
        onChange={() =>
          updateFilterState(currState => ({
            ...currState,
            pickup: !filterState.pickup
          }))
        }
      />

      <CheckBox
        text="Delivery"
        checked={filterState.delivery}
        onChange={() =>
          updateFilterState(currState => ({
            ...currState,
            delivery: !filterState.delivery
          }))
        }
      />

      <Select
        data={distances}
        selectedOption={filterState.distance}
        onSelect={option =>
          updateFilterState(currState => ({ ...currState, distance: option }))
        }
        style={styles.selectContainer}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    minWidth: Platform.select({
      default: "100%",
      web: "100vw"
    }),
    paddingVertical: 15,
    zIndex: 9999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Platform.select({
      android: StatusBar.currentHeight
    })
  },
  selectContainer: {
    width: Platform.select({
      default: "30%",
      web: isMobile ? "30%" : "12%"
    })
  }
});
