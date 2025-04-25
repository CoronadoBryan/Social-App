import { Alert, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { Button } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { getUserData, user } from "../../services/userService";
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

var limit = 0;

const Home = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const handlePostEvent = async (payload) => {
    console.log("post event", payload);
    if (payload.eventType == "INSERT" && payload?.new?.id) {
      let newPost = { ...payload.new };
      let res = await getUserData(newPost.userId);
      newPost.user = res.success ? res.data : {};
      setPosts((prevPosts) => [newPost, ...prevPosts]);
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

  const getPosts = async () => {
    if (!hasMore) return null;
    limit = limit + 4;
    console.log("got post result", limit);
    let res = await fechPosts(limit);
    if (res.success) {
      // Si ya tienes todos los posts, detén la carga
      if (posts.length == res.data.length) setHasMore(false);

      // Acumula los posts, evitando duplicados
      setPosts((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const nuevos = res.data.filter((p) => !ids.has(p.id));
        return [...prev, ...nuevos];
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    limit = 4; // Reinicia el límite para refrescar desde el inicio
    let res = await fechPosts(limit);
    if (res.success) {
      setPosts(res.data); // Reemplaza los posts por los más recientes
      setHasMore(true);
    }
    setRefreshing(false);
  };

  // console.log('user:' , user);

  // const onLogout = async () => {
  //   setAuth(null);
  //   const { error } = await supabase.auth.signOut();
  //   if (error) {
  //     Alert.alert("cerrar sesion", error.message);
  //   }
  // };
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
                strokeWith={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("newPost")}>
              <Icon
                name="plus"
                size={hp(3.2)}
                strokeWith={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => router.push("profile")}>
              <Avatar
                uri={user?.image}
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
      </View>
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
