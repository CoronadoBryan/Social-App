import { Alert, Pressable, StyleSheet, Text, View , Image, BackHandler } from "react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, FlatList } from "react-native";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";
import UserIcon from "../../assets/icons/User";
import MailIcon from "../../assets/icons/Mail";

import Description from "../../assets/icons/Description";
import LocationIcon from "../../assets/icons/Location";
import EditIcon from "../../assets/icons/Edit";
import LockIcon from "../../assets/icons/Lock";
import ArrowLeftIcon from "../../assets/icons/ArrowLeft";
import LogoutIcon from "../../assets/icons/logout";
import LanguageIcon from "../../assets/icons/ThreeDotsCircle"; // Usa el que prefieras
import { fechPosts } from "../../services/postService";
import PostCard from "../../components/PostCard"; // Asegúrate de importar esto
import { fetchInterests } from "../../services/interestService";

const Profile = () => {
  const { user, setAuth } = useAuth();
  if (!user) return null;

  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInterests, setUserInterests] = useState([]);
  const params = useLocalSearchParams();



  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      const res = await fechPosts(20); // Puedes ajustar el límite
      if (res.success) {
        // Filtra solo los posts del usuario actual
        setPosts(res.data.filter(p => p.userId === user.id));
      }
      setLoading(false);
    };
    loadPosts();
  }, [user.id]);


  useEffect(() => {
    // Esto se ejecuta cada vez que cambian los params (incluido refresh)
    if (user?.id) {
      const loadUserInterests = async () => {
        const { data: userInterestRows } = await supabase
          .from("userInterests")
          .select("interestsId")
          .eq("userId", user.id);

        const interestIds = userInterestRows?.map(i => Number(i.interestsId)) || [];
        const allInterests = await fetchInterests();

        const filtered = allInterests.filter(i => interestIds.includes(Number(i.id)));
        setUserInterests(filtered);
      };
      loadUserInterests();
    }
  }, [user?.id, params.refresh]);

  const onLogout = async () => {
    setAuth(null);
    // Si usas AsyncStorage o SecureStore para guardar datos, bórralos aquí:
    // await AsyncStorage.clear();
    // await SecureStore.deleteItemAsync('token');
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Cerrar sesión", error.message);
    } else {
      BackHandler.exitApp(); // Cierra la app después de cerrar sesión
    }
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", onPress: async () => onLogout(), style: "destructive" },
    ]);
  };



  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenWrapper bg="#f7f7f7" noPaddingTop>
        <UserHeader
          user={user}
          router={router}
          handleLogout={handleLogout}
          loading={loading}
          posts={posts}
          userInterests={userInterests} // <-- agrega esto
        />
      </ScreenWrapper>
    </GestureHandlerRootView>
  );
};

const UserHeader = ({ user, router, handleLogout, loading, posts, userInterests }) => (
  <ScrollView style={{ flex: 1, backgroundColor: "#f7f7f7" }} contentContainerStyle={{ paddingBottom: 32 }}>
    {/* Header minimalista */}
    <View style={styles.headerMinimal}>
      <Pressable
        onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace("/home");
          }
        }}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.iconButtonPressed
        ]}
        android_ripple={{ color: "#16a08522", borderless: true }}
      >
        <ArrowLeftIcon width={26} height={26} color="#16a085" strokeWidth={2.5} />
      </Pressable>
      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.iconButton,
          pressed && styles.iconButtonPressed
        ]}
        android_ripple={{ color: "#f8717122", borderless: true }}
      >
        <LogoutIcon width={24} height={24} color="#f87171" strokeWidth={2.2} />
      </Pressable>
    </View>

    {/* Avatar */}
    <View style={styles.avatarSection}>
      <View style={{ position: "relative", alignItems: "center" }}>
        <Avatar
          uri={user?.image}
          size={hp(13)}
          rounded={theme.radius.xxl}
          style={styles.avatarShadow}
        />
        <Pressable
          style={styles.editIconOnAvatar}
          onPress={() => router.push("editProfile")}
        >
          <EditIcon width={20} height={20} color="#16a085" strokeWidth={2} />
        </Pressable>
      </View>
      <Text style={styles.userName}>{user?.name}</Text>
    </View>

    {/* Intereses como etiquetas */}
    <View style={styles.interestsSection}>
      <View style={styles.interestsRow}>
        {userInterests.length > 0 ? (
          userInterests.map((item) => (
            <View key={item.id} style={styles.chip}>
              <Text style={styles.chipText}>{item.name}</Text>
            </View>
          ))
        ) : (
          <Text style={{ color: "#aaa", fontSize: hp(1.7) }}>Sin intereses</Text>
        )}
      </View>
    </View>

    {/* Bio llamativa */}
    <View style={styles.bioCard}>
      <Text style={styles.bioTitle}>Presentación</Text>
      <Text style={styles.bioText}>
        {user?.bio || "Hola, Soy un nuevo usuario. ¡Bienvenido!"}
      </Text>
      {user?.address && (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
          <LocationIcon width={18} height={18} color="#16a085" strokeWidth={2} style={{ marginRight: 6 }} />
          <Text style={{ color: "#16a085", fontSize: hp(1.7) }}>{user.address}</Text>
        </View>
      )}
    </View>

    {/* Estadísticas */}
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>0</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>0</Text>
        <Text style={styles.statLabel}>Seguidores</Text>
      </View>
      <View style={styles.statCard}>
        <Text style={styles.statNumber}>0</Text>
        <Text style={styles.statLabel}>Siguiendo</Text>
      </View>
    </View>

    {/* Opciones rápidas */}
    <View style={styles.optionsCard}>
      <Text style={styles.sectionTitle}>Opciones rápidas</Text>
      <OptionItem IconComponent={UserIcon} label="Mi Perfil" onPress={() => router.push("editProfile")} />
      <OptionItem IconComponent={MailIcon} label={user?.email} disabled />
      {user?.address && <OptionItem IconComponent={LocationIcon} label={user.address} disabled />}
      {user?.bio && <OptionItem IconComponent={Description} label={user.bio} disabled />}
      <OptionItem IconComponent={LockIcon} label="Cambiar contraseña" onPress={() => {}} />
      <OptionItem IconComponent={LanguageIcon} label="Idioma" onPress={() => {}} />
    </View>

    {/* Botón crear publicación */}
    <View style={{ alignItems: "center", marginTop: 24 }}>
      <Pressable style={styles.ctaButton} onPress={() => router.push("newPost")}>
        <Text style={styles.ctaText}>+ Crear publicación</Text>
      </Pressable>
    </View>

    {/* Publicaciones */}
    <View style={styles.postsSection}>
      <Text style={styles.postsTitle}>Mis publicaciones</Text>
      {loading ? (
        <Text style={{ textAlign: "center", color: "#aaa" }}>Cargando...</Text>
      ) : posts.filter(post => post.userId === user.id).length === 0 ? (
        <Text style={{ textAlign: "center", color: "#aaa" }}>No tienes publicaciones aún.</Text>
      ) : (
        posts.filter(post => post.userId === user.id).map(post => (
          <PostCard key={post.id} item={post} currentUser={user} router={router} />
        ))
      )}
    </View>
  </ScrollView>
);

const OptionItem = ({ IconComponent, label, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.optionRow, disabled && { opacity: 0.7 }]}
  >
    <IconComponent width={24} height={24} color="#16a085" strokeWidth={2} style={{ marginRight: 10 }} />
    <Text style={styles.optionLabel}>{label}</Text>
    {!disabled && <Text style={{ color: theme.colors.textLight, fontSize: 18 }}>›</Text>}
  </TouchableOpacity>
);

// Cambia los estilos:
const styles = StyleSheet.create({
  headerMinimal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 16,
    shadowRadius: 8,
    // Elimina el borde feo:
    // borderBottomWidth: 0.5,
    // borderBottomColor: "#e5e7eb",
  },
  editIconOnAvatar: {
    position: "absolute",
    bottom: 8,
    right: hp(2),
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 6,
    shadowColor: "#16a085",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 2,
  },
  avatarSection: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  avatarShadow: {
    borderWidth: 2,
    borderColor: "#16a085",
    backgroundColor: "#fff",
  },
  userName: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "#222",
    marginTop: 10,
    textAlign: "center",
  },
  userBio: {
    color: "#6b7280",
    fontSize: hp(1.8),
    textAlign: "center",
    marginTop: 4,
    marginBottom: 2,
    marginHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
    marginBottom: 2,
    width: "100%",
    paddingHorizontal: 30,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginHorizontal: 6,
    minWidth: 80,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statNumber: {
    fontWeight: "bold",
    fontSize: hp(2.2),
    color: "#16a085",
  },
  statLabel: {
    fontSize: hp(1.5),
    color: "#6b7280",
  },
  optionsCard: {
    backgroundColor: "#fff",
    borderRadius: 22,
    marginTop: 18,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: "#16a085",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: hp(2.1),
    color: "#16a085",
    marginBottom: 10,
    marginLeft: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 2,
  },
  optionLabel: {
    flex: 1,
    fontSize: hp(2),
    color: "#222",
  },
  footerMsg: {
    marginTop: 28,
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButton: {
    backgroundColor: "#16a085",
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 38,
    marginBottom: 8,
    shadowColor: "#16a085",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  ctaText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(2),
    letterSpacing: 0.5,
  },
  bioCard: {
    backgroundColor: "#e6f7f3",
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 12,
    padding: 16,
    alignItems: "center",
  },
  bioTitle: {
    fontWeight: "bold",
    fontSize: hp(2.1),
    color: "#16a085",
    marginBottom: 6,
  },
  bioText: {
    fontSize: hp(1.9),
    color: "#222",
    textAlign: "center",
  },
  interestsSection: {
    marginTop: 40,
    marginBottom: 4,
    marginHorizontal: 24,
    alignItems: "flex-start", 
  },
  interestsTitle: {
    fontWeight: "bold",
    fontSize: hp(2),
    color: "#16a085",
    marginBottom: 4,
    marginLeft: 2,
  },
  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
  },
  chip: {
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#16a08533",
  },
  chipText: {
    color: "#16a085",
    fontWeight: "500",
    fontSize: hp(1.7),
  },
  postsSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  postsTitle: {
    fontWeight: "bold",
    fontSize: hp(2.1),
    color: "#16a085",
    marginBottom: 10,
  },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  postText: {
    color: "#6b7280",
    fontSize: hp(1.8),
  },
});

export default Profile;