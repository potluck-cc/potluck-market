import { useState, useEffect } from "react";
import { Dimensions as D, PixelRatio } from "react-native";
import { partialApplication } from "@potluckmarket/ella";

const { width, height } = D.get("window");

export interface DimensionsInterface {
  width: number;
  height: number;
}

export const Dimensions: DimensionsInterface = {
  width,
  height
};

function percentageToDP(
  measurement: number,
  percentage: string | number
): number {
  const factor =
    typeof percentage === "number" ? percentage : parseFloat(percentage);

  return PixelRatio.roundToNearestPixel((measurement * factor) / 100);
}

export function useDimensions() {
  const [dimensions, updateDimensions] = useState(D.get("window"));

  useEffect(() => {
    D.addEventListener("change", handleDimensionsChange);

    return () => {
      D.removeEventListener("change", handleDimensionsChange);
    };
  }, []);

  function handleDimensionsChange(dims) {
    updateDimensions(dims.window);
  }

  const widthToDP = partialApplication(percentageToDP, dimensions.width);

  const heightToDP = partialApplication(percentageToDP, dimensions.height);

  return {
    dimensions,
    widthToDP,
    heightToDP
  };
}
