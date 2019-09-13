import { Dimensions as D } from "react-native";

const { width, height } = D.get("window");

export interface DimensionsInterface {
  width: number;
  height: number;
}

export const Dimensions: DimensionsInterface = {
  width,
  height
};
