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

export function isPortrait({ width, height }: DimensionsInterface) {
  if (width < height) {
    return true;
  } else {
    return false;
  }
}

export function isLandscape({ width, height }: DimensionsInterface) {
  if (width > height) {
    return true;
  } else {
    return false;
  }
}

export function useDimensions() {
  const [dimensions, updateDimensions] = useState(D.get("window"));

  const [landscape, setIsOrientationLandscape] = useState(
    isLandscape(dimensions)
  );

  const [portrait, setIsOrientationPortrait] = useState(isPortrait(dimensions));

  useEffect(() => {
    D.addEventListener("change", handleDimensionsChange);

    return () => {
      D.removeEventListener("change", handleDimensionsChange);
    };
  }, []);

  function handleDimensionsChange(dims) {
    updateDimensions(dims.window);
    setIsOrientationLandscape(dims.window);
    setIsOrientationPortrait(dims.window);
  }

  const widthToDP = partialApplication(percentageToDP, dimensions.width);

  const heightToDP = partialApplication(percentageToDP, dimensions.height);

  return {
    dimensions,
    widthToDP,
    heightToDP,
    isLandscape: landscape,
    isPortrait: portrait
  };
}
