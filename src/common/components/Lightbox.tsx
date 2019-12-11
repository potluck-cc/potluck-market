import React, { Dispatch } from "react";
import LightboxNative from "react-native-image-view";

type LightboxProps = {
  isImageModalVisible: boolean;
  close: Dispatch<boolean>;
  images: string[];
};

function Lightbox({ isImageModalVisible, close, images }: LightboxProps) {
  const processedImages = images.map(image => ({
    source: { uri: image ? image : null }
  }));
  return (
    <LightboxNative
      images={processedImages}
      imageIndex={0}
      isVisible={isImageModalVisible}
      onClose={() => close(false)}
    />
  );
}

export default Lightbox;
