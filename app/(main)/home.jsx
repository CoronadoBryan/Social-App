import { Alert, Linking, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { getUserData, user, updateUser, handleOnPress } from "../../services/userService";
import { supabase } from "../../lib/supabase";
import { theme } from "../../constants/theme";
import { hp, wp } from "../../helpers/common";
import Icon from "../../assets/icons";
import { Pressable } from "react-native";
import { useRouter } from "expo-router";
import Avatar from "../../components/Avatar";
import { useState } from "react";
import { fechPosts } from "../../services/postService";
import { FlatList } from "react-native";
import PostCard from "../../components/PostCard";
import Loading from "../../components/Loading";
import BottomNavbar from "../../components/BottomNavbar";
import MenuModal from "../../components/MenuModal"; // importa tu modal
import * as Notifications from "expo-notifications";

import Constants from 'expo-constants';
import { getMinAppVersion } from "../../services/userService";
import { compareVersions } from "../../utils/compareVersions";

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [limit, setLimit] = useState(4);
  const [menuVisible, setMenuVisible] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(false);
  const [minVersion, setMinVersion] = useState(null);
  const [current, setCurrent] = useState('');

  const handlePostEvent = async (payload) => {
    if (payload.eventType == "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => {
        // Evita duplicados por id
        if (prevPosts.some(post => post.id === newPost.id)) {
          return prevPosts;
        }
        return [newPost, ...prevPosts];
      });
    }
  };

  useEffect(() => {
    const postChannel = supabase
      .channel("posts") // Nombre del canal
      .on(
        "postgres_changes", // Tipo de evento
        { event: "*", schema: "public", table: "posts" }, // Filtro específico
        (payload) => handlePostEvent(payload) // Función de callback
      )
      .subscribe();

    getPosts(); // Llama a la función de carga inicial de posts

    return () => {
      supabase.removeChannel(postChannel); // Elimina el canal al desmontar el componente
    };
  }, []);

  useEffect(() => {
    getMinAppVersion().then(min => {
      setMinVersion(min);
      const version = Constants.manifest?.version || Constants.expoConfig?.version || 'undefined';
      setCurrent(version); // <-- Guarda la versión actual
      if (compareVersions(version, min) < 0) {
        setForceUpdate(true);
      }
    });
  }, []);

  const getPosts = async (reset = false) => {
    let newLimit = reset ? 4 : limit + 4;
    let res = await fechPosts(newLimit);
    if (res.success) {
      if (reset) {
        setPosts(res.data);
        setHasMore(true);
        setLimit(4);
      } else {
        // Si ya tienes todos los posts, detén la carga
        if (posts.length === res.data.length) setHasMore(false);
        setPosts(res.data);
        setLimit(newLimit);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getPosts(true); // true para resetear
    setRefreshing(false);
  };

  const handleMenuAction = (action) => {
    if (action === "perfil") {
      // Abrir WhatsApp con mensaje
      const phone = "51901064562"; // Código de país + número (sin +)
      const text = "Hola quisiera colaborar en la App de Catwise";
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      Linking.openURL(url);
    } else if (action === "favoritos") {
      router.push("/DonarYapeScreen"); // Ajusta la ruta según tu estructura
    }
    // ...otros casos
    setMenuVisible(false);
  };

  if (forceUpdate) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 24,
      }}>
        <Icon name="heart" size={60} color="#e74c3c" style={{ marginBottom: 18 }} />
        <Text style={{
          fontSize: 22,
          color: '#e74c3c',
          fontWeight: 'bold',
          marginBottom: 10,
          textAlign: 'center'
        }}>
          ¡Actualización requerida!
        </Text>
        <Text style={{
          color: '#444',
          fontSize: 16,
          marginBottom: 24,
          textAlign: 'center'
        }}>
          Para seguir usando Catwise, debes actualizar a la versión más reciente.
          {"\n\n"}
          <Text style={{ color: '#888', fontSize: 15 }}>
            Versión instalada: {current}{"\n"}
            Versión requerida: {minVersion}
          </Text>
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#27ae60',
            paddingVertical: 14,
            paddingHorizontal: 32,
            borderRadius: 10,
            marginTop: 10,
          }}
          onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.bryancito.catwise')}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 17 }}>
            Descargar última versión
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* header */}
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
        {/* posts */}
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listStyles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PostCard item={item} currentUser={user} router={router} />
          )}
          onEndReached={() => {
            getPosts();
            console.log("end reached");
          }}
          onEndReachedThreshold={0.1}
          ListFooterComponent={
            hasMore ? (
              <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginVertical: 30 }}>
                <Text style={styles.noPost}>ya no hay mas publicaciones</Text>
              </View>
            )
          }
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
        {console.log("user.expo_push_token:", user?.expo_push_token)}
        {!user?.expo_push_token && (
          <TouchableOpacity
            style={{
              backgroundColor: "#27ae60",
              padding: 12,
              borderRadius: 8,
              alignItems: "center",
              margin: 16,
            }}
            onPress={() => handleOnPress(user, setAuth)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Forzar guardado de token
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <BottomNavbar current="home" onMenuPress={() => setMenuVisible(true)} />

      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onAction={handleMenuAction}
      />
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
  appName: {
    color: theme.colors.primaryDark,
    fontSize: hp(3.6),
    fontWeight: "700", // Semi-bold, similar a Facebook
    letterSpacing: 1,
    fontFamily: "System", // Usa la fuente del sistema, similar a Facebook
    textTransform: "uppercase",
    fontStyle: "italic", // Hace el texto un poco inclinado
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
  listStyles: {
    paddingTop: 20,
    paddingHorizontal: wp(4),
  },
  noPost: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
  },
});
