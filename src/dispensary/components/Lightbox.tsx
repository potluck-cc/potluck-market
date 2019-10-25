import React, { Dispatch } from "react";
import LightboxNative from "react-native-image-view";

type LightboxProps = {
  isImageModalVisible: boolean;
  close: Dispatch<boolean>;
  images: [];
};

function Lightbox({ isImageModalVisible, close, images }: LightboxProps) {
  return (
    <LightboxNative
      images={images}
      imageIndex={0}
      isVisible={isImageModalVisible}
      onClose={() => close(false)}
    />
  );
}

export default Lightbox;
