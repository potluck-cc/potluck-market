import React from "react";
import { useDimensions } from "common";
import { LinearGradient } from "expo-linear-gradient";

type ProductActionsProps = {
  children: Function;
};

export default function({ children }: ProductActionsProps) {
  const { heightToDP, widthToDP } = useDimensions();

  return (
    <LinearGradient
      colors={["rgba(225, 225, 225, .1)", "rgba(225, 225, 225, .6)"]}
      style={{
        flex: 1,
        width: widthToDP("100%"),
        height: heightToDP("20%"),
        position: "absolute",
        bottom: 0,
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      {children()}
    </LinearGradient>
  );
}
