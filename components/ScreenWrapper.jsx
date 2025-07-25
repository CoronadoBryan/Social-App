import { View, Text } from 'react-native'
import React from 'react'

import { useSafeAreaInsets } from 'react-native-safe-area-context'


//sirve para envolver las pantallas y agregar un padding top
const ScreenWrapper = ({ children, bg, noPaddingTop }) => {
  const { top } = useSafeAreaInsets();
  const paddingTop = noPaddingTop ? 0 : (top > 0 ? top + 5 : 30);

  return (
    <View style={{ flex: 1, paddingTop, backgroundColor: bg }}>
      {children}
    </View>
  );
};

export default ScreenWrapper;