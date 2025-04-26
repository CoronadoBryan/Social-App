import React, { useRef } from "react";
import { View, Pressable, StyleSheet, Animated, Text } from "react-native";
import { useRouter } from "expo-router";
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import Icon from "../assets/icons";

const AnimatedButton = ({ label, color, onPress, iconName, iconSize }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 8,
    }).start();
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.iconButton}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: "center", justifyContent: "center" }}>
        {iconName && (
          <Icon
            name={iconName}
            size={iconSize || hp(2.3)}
            color={color}
            style={{ marginBottom: label ? 2 : 0 }}
          />
        )}
        {label && (
          <Text style={{ color, fontWeight: "bold", fontSize: hp(1.8) }}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
};

const BottomNavbar = ({ current, onMenuPress }) => {
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      <AnimatedButton
        iconName="home"
        iconSize={hp(3.2)}
        color={current === "home" ? theme.colors.primary : "#b0b0b0"}
        onPress={() => router.push("/home")}
      />
      <AnimatedButton
        iconName="search"
        iconSize={hp(3.2)}
        color={current === "search" ? theme.colors.primary : "#b0b0b0"}
        onPress={() => router.push("/search")}
      />
      {/* Botón central destacado */}
      <View style={styles.menuButtonWrapper}>
        <AnimatedButton
          iconName="plus" // Usa el icono que prefieras, por ejemplo "plus"
          iconSize={hp(4.5)} // Más grande
          color={theme.colors.primary}
          onPress={onMenuPress}
        />
      </View>
      <AnimatedButton
        iconName="mail"
        iconSize={hp(3.2)}
        color={current === "notifications" ? theme.colors.primary : "#b0b0b0"}
        onPress={() => router.push("/notifications")}
      />
      <AnimatedButton
        iconName="comunidad"
        iconSize={hp(3.2)}
        color={current === "comunidad" ? theme.colors.primary : "#b0b0b0"}
        onPress={() => router.push("/comunidad")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 54,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#ececec",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: -1 },
  },
  iconButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  menuButtonWrapper: {
    marginTop: -18,
    width: hp(6.5),
    height: hp(6.5),
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BottomNavbar;