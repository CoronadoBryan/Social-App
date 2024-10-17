import { Alert, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { Button  } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { user } from "../../services/userService";
import { supabase } from "../../lib/supabase";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";







const Home = () => {
  const { setAuth } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("cerrar sesion", error.message);
    }
  };
  return (
    <ScreenWrapper bg="white"> 
      <View style={styles.container}>
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.title}>Samara</Text>
          <View style={styles.icons} >
            <Pressable onPress={()=> router.push('notifications')} >
              <Icon name = "heart" size={hp(3.2)} strokeWith={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={()=> router.push('newPost')} >
              <Icon name = "plus" size={hp(3.2)} strokeWith={2} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={()=> router.push('profile')} >
              {/* <Icon name = "user" size={hp(3.2)} strokeWith={2} color={theme.colors.text} /> */}
              <Avatar
                uri={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{borderWidth: 2}}
              />
            </Pressable>
          </View>
        </View>
      </View>
      <Button title="cerrar sesion" onPress={onLogout} />
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginHorizontal: wp(4),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  avatarImage: {
    width: hp(4.3),
    height: hp(4.3),
    borderRadius: theme.radius.sm,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
    borderWidth: 3,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  listStyles:{
    paddingTop: 20,
    paddingHorizontal: wp(4), 
  },
  noPost:{
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text
  },
  pill:{
    position: "absolute",
    right : -10,
    top: -4

  }

});
