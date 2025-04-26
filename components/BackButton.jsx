import React, { useRef } from "react";
import { Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { theme } from "../constants/theme";

const BackButton = ({ router }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handleBack = () => {
    if (router.canGoBack?.()) {
      router.back();
    } else {
      router.replace("/home");
    }
  };

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      onPress={handleBack}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: 0.85 }
      ]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name="arrow-back" size={22} color={theme.colors.primaryDark} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#f4f6fa",
    borderRadius: 18,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BackButton;
