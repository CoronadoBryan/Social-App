import { StyleSheet, View } from 'react-native';
import React from 'react';
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import { Image } from 'expo-image';
import { getUserImageSrc } from '../services/imageService';

const Avatar = ({ uri, size = hp(4.5), rounded = theme.radius.md, style = {} }) => {
  return (
    <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: rounded }]}>
      <Image
        source={getUserImageSrc(uri)}
        transition={100}
        style={[styles.avatar, { width: size, height: size, borderRadius: rounded }, style]}
      />
    </View>
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.darkLight,
  },
  avatar: {
    resizeMode: 'cover',
  },
});
