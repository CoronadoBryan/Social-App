import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/common";
import Icon from "../assets/icons";
import Avatar from "./Avatar";

const HomeHeader = ({ user, router }) => (
  <View style={styles.header}>
    <Text style={styles.appName}>CATWISE</Text>
    <View style={styles.icons}>
      <Pressable onPress={() => router.push("notifications")}>
        <Icon
          name="heart"
          size={hp(3.2)}
          strokeWidth={2}
          color={theme.colors.text}
        />
      </Pressable>
      <Pressable onPress={() => router.push("newPost")}>
        <Icon
          name="plus"
          size={hp(3.2)}
          strokeWidth={2}
          color={theme.colors.text}
        />
      </Pressable>
      <Pressable onPress={() => router.push("profile")}>
        <Avatar
          uri={user?.image || ""}
          size={hp(4.3)}
          rounded={theme.radius.sm}
          style={{ borderWidth: 2 }}
        />
      </Pressable>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  appName: {
    color: theme.colors.primaryDark,
    fontSize: hp(3.6),
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "System",
    textTransform: "uppercase",
    fontStyle: "italic",
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
});

export default HomeHeader;