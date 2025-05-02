import * as React from "react";
import Svg, { G, Path } from "react-native-svg";

export default function MenuIcon({ size = 32, color = "#000", accent = "#19a92a", ...props }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="-2.4 -2.4 28.80 28.80"
      fill="none"
      {...props}
    >
      <G>
        <Path
          d="M11,14v7a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1V14a1,1,0,0,1,1-1h7A1,1,0,0,1,11,14ZM21,2H14a1,1,0,0,0-1,1v7a1,1,0,0,0,1,1h7a1,1,0,0,0,1-1V3A1,1,0,0,0,21,2Z"
          fill={accent}
        />
        <Path
          d="M11,3v7a1,1,0,0,1-1,1H3a1,1,0,0,1-1-1V3A1,1,0,0,1,3,2h7A1,1,0,0,1,11,3ZM21,13H14a1,1,0,0,0-1,1v7a1,1,0,0,0,1,1h7a1,1,0,0,0,1-1V14A1,1,0,0,0,21,13Z"
          fill={color}
        />
      </G>
    </Svg>
  );
}