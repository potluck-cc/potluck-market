import React, { useState, CSSProperties, ReactChildren } from "react";
import { useDimensions, Colors, isLandscape } from "common";
import { animated, useSpring } from "react-spring";

type SlidingMenuProps = {
  style?: CSSProperties;
  children: ReactChildren | Function;
  controlled?: boolean;
};

export default function({
  children,
  style,
  controlled = false
}: SlidingMenuProps) {
  const { widthToDP, heightToDP, dimensions } = useDimensions();

  const [expanded, setExpanded] = useState(false);

  const original = {
    height: isLandscape(dimensions) ? "15%" : "10%",
    paddingTop: 0
  };

  const expand = [{ height: "100%", paddingTop: 20, flex: 1 }];

  const props = useSpring({
    to: expanded ? expand : original,
    from: original
  });

  return (
    <animated.div
      style={{
        ...{
          position: "absolute",
          alignSelf: "center",
          width: widthToDP("100%"),
          bottom: 0,
          backgroundColor: Colors.medGreen,
          ...style
        },
        ...props
      }}
      // onClick={controlled ? () => {} : () => setExpanded(!expanded)}
    >
      {typeof children === "function"
        ? children({ expanded, setExpanded })
        : children}
    </animated.div>
  );
}
