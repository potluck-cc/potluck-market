import React, { Dispatch, useState } from "react";
import LightboxWeb from "react-image-lightbox";

type LightboxProps = {
  isImageModalVisible: boolean;
  close: Dispatch<boolean>;
  images: [];
};

function Lightbox({ isImageModalVisible, close, images }: LightboxProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    isImageModalVisible && (
      <LightboxWeb
        mainSrc={images[activeIndex]}
        nextSrc={images[(activeIndex + 1) % images.length]}
        prevSrc={images[(activeIndex + images.length - 1) % images.length]}
        onCloseRequest={() => close(false)}
        onMovePrevRequest={() =>
          setActiveIndex((activeIndex + images.length - 1) % images.length)
        }
        onMoveNextRequest={() =>
          setActiveIndex((activeIndex + 1) % images.length)
        }
      />
    )
  );
}

export default Lightbox;
