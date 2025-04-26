import React from "react";
import Svg, { G, Path, Circle } from "react-native-svg";

const DonarYape = (props) => (
  <Svg
    viewBox="0 0 14 14"
    width={props.width || 32}
    height={props.height || 32}
    {...props}
  >
    <G transform="translate(-.14079811 .14285704) scale(.28571)">
      <Path fill="#e69329" d="M15.9 15.7l-4.2 5.9 5.1 9.9 9.5-3.9 4.4-12.7z"/>
      <Circle cx="15" cy="36" r="7.8000002" fill="#546e7a"/>
      <G fill="#90a4ae">
        <Path d="M15 27c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9zm0 16c-3.9 0-7-3.1-7-7s3.1-7 7-7 7 3.1 7 7-3.1 7-7 7z"/>
        <Path d="M14 33h2v8h-2z"/>
      </G>
      <G fill="#ffb74d">
        <Path d="M12.9 36c1 1.9 3.2 2.7 5.1 1.7l16.5-8.5c1-.5 1.7-1.2 2.2-1.9 1.7-3.2 5.6-10.7 8.2-17.2l-18.2 8.7-4.8 7.2-6.8 3.6c-2.6 1.3-3.4 4.2-2.2 6.4z"/>
        <Path d="M30.2 3L13.7 9.3c-.7.2-1.5 1-2.2 1.7l-5.6 7.5c-1 1.5-1.2 3.4-.5 5.1.4 1 1.7 3.4 3.1 6.1C10.1 28 12.4 27 15 27c.4 0 .9 0 1.3.1l-2.1-4.2 4.6-4.1h8s15.5-2.2 18.2-8.7L30.2 3z"/>
      </G>
      <Path fill="#ffcdd2" d="M18.2 36c-1.3.6-2.8 0-3.3-1.3-.6-1.3 0-2.8 1.3-3.3 1.2-.6 3.2 4 2 4.6z"/>
    </G>
  </Svg>
);

export default DonarYape;