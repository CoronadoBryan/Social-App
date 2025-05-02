import * as Linking from "expo-linking";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Avatar from "../../../components/Avatar";
import { hp } from "../../../helpers/common";
import { theme } from "../../../constants/theme";
import LocationIcon from "../../../assets/icons/Location";
import { useEffect, useState } from "react";
import PostCard from "../../../components/PostCard";
import { getUserData } from "../../../services/userService";
import { fetchPostsByUser } from "../../../services/postService";
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from "../../../lib/supabase";
import { fetchInterests } from "../../../services/interestService";
import { useAuth } from "../../../contexts/AuthContext";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [liked, setLiked] = useState(false);
  const { user: currentUser } = useAuth(); // <--- usuario autenticado

  useEffect(() => {
    const fetchUser = async () => {
      const res = await getUserData(id);
      if (res.success) {
        let interests = res.data.interests;
        // Si es string, conviértelo en array
        if (typeof interests === "string") {
          interests = interests.split(",").map(i => i.trim()).filter(Boolean);
        }
        setUser({ ...res.data, interests: interests || [] });
      }
    };
    fetchUser();
  }, [id]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetchPostsByUser(id);
      if (res.success) setPosts(res.data);
    };
    fetchPosts();
  }, [id]);

  useEffect(() => {
    const loadUserInterests = async () => {
      const { data: userInterestRows } = await supabase
        .from("userInterests")
        .select("interestsId")
        .eq("userId", id);

      const interestIds = userInterestRows?.map(i => Number(i.interestsId)) || [];
      const allInterests = await fetchInterests();
      const filtered = allInterests.filter(i => interestIds.includes(Number(i.id)));
      setUserInterests(filtered);
    };
    if (id) loadUserInterests();
  }, [id]);

  if (!user) return null;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f7f7f7" }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Botón retroceder */}
      <Pressable
        onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace("/home");
          }
        }}
        style={{ position: "absolute", left: 18, top: 44, zIndex: 10, backgroundColor: "#f0f2f5", borderRadius: 100, padding: 6 }}
        hitSlop={10}
      >
        <Ionicons name="arrow-back" size={24} color="#16a085" />
      </Pressable>

      {/* Avatar y nombre */}
      <View style={[styles.avatarSection, { marginTop: 60 }]}>
        <View style={styles.avatarRect}>
          <Avatar
            uri={user.image}
            size={hp(13)}
            rounded={18}
            style={styles.avatarShadow}
          />
        </View>
        <Text style={styles.userName}>{user.name}</Text>

        {/* Contadores minimalistas y botón like */}
        <View style={styles.countersRow}>
          <Pressable
            style={styles.counterBox}
            onPress={() => setLiked(!liked)}
          >
            <Ionicons
              name={liked ? "heart" : "heart-outline"}
              size={28}
              color={liked ? "#e74c3c" : "#e74c3c"}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.counterText}>{user.likesCount ?? 0} Likes</Text>
          </Pressable>
          <View style={styles.counterBox}>
            <Ionicons name="people" size={28} color="#16a085" style={{ marginRight: 8 }} />
            <Text style={styles.counterText}>{user.connectionsCount ?? 0} Conexiones</Text>
          </View>
        </View>

        {/* Botón Conectar */}
        <Pressable
          style={styles.connectButton}
          onPress={() => {/* lógica de conectar aquí */}}
        >
          <Ionicons name="person-add" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.connectButtonText}>
            Conectar
          </Text>
        </Pressable>

        {/* Intereses */}
        <View style={styles.interestsCard}>
          <Text style={styles.interestsTitle}>Intereses</Text>
          <View style={styles.interestsRow}>
            {userInterests.length > 0 ? (
              userInterests.map((item) => (
                <View key={item.id} style={styles.chip}>
                  <Ionicons name="pricetag" size={16} color="#16a085" style={{ marginRight: 4 }} />
                  <Text style={styles.chipText}>{item.name}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "#aaa", fontSize: hp(1.7), textAlign: "center" }}>Sin intereses</Text>
            )}
          </View>
        </View>
      </View>

      {/* Email */}
      {user.email ? (
        <Text style={styles.infoText}>{user.email}</Text>
      ) : null}

      {/* Teléfono */}
      {user.phoneNumber ? (
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 8,
            backgroundColor: "#25D366",
            borderRadius: 18,
            paddingVertical: 8,
            paddingHorizontal: 18,
            alignSelf: "center"
          }}
          onPress={() => {
            const phone = user.phoneNumber.replace(/[^0-9]/g, "");
            Linking.openURL(`https://wa.me/${phone}`);
          }}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: hp(1.8) }}>
            Contactar por WhatsApp
          </Text>
        </Pressable>
      ) : null}

      {/* Dirección */}
      {user.address ? (
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 4 }}>
          <LocationIcon width={18} height={18} color="#16a085" strokeWidth={2} style={{ marginRight: 6 }} />
          <Text style={[styles.infoText, { color: "#16a085" }]}>{user.address}</Text>
        </View>
      ) : null}

      {/* Bio */}
      {user.bio ? (
        <View style={styles.bioCard}>
          <Text style={styles.bioTitle}>Presentación</Text>
          <Text style={styles.bioText}>{user.bio}</Text>
        </View>
      ) : null}

      {/* Redes Sociales */}
      <View style={styles.socialRowContainer}>
        <View style={styles.socialRow}>
          <Pressable
            style={[styles.socialIcon, { backgroundColor: "#FDECEF" }]}
            disabled={!user.instagram}
            onPress={() => user.instagram && Linking.openURL(user.instagram)}
          >
            <Ionicons name="logo-instagram" size={30} color={user.instagram ? "#C13584" : "#ccc"} />
          </Pressable>
          <Pressable
            style={[styles.socialIcon, { backgroundColor: "#E7F0FD" }]}
            disabled={!user.facebook}
            onPress={() => user.facebook && Linking.openURL(user.facebook)}
          >
            <Ionicons name="logo-facebook" size={30} color={user.facebook ? "#1877F3" : "#ccc"} />
          </Pressable>
          <Pressable
            style={[styles.socialIcon, { backgroundColor: "#F3F3F3" }]}
            disabled={!user.github}
            onPress={() => user.github && Linking.openURL(user.github)}
          >
            <Ionicons name="logo-github" size={30} color={user.github ? "#222" : "#ccc"} />
          </Pressable>
          <Pressable
            style={[styles.socialIcon, { backgroundColor: "#FDE7F3" }]}
            disabled={!user.dribbble}
            onPress={() => user.dribbble && Linking.openURL(user.dribbble)}
          >
            <Ionicons name="logo-dribbble" size={30} color={user.dribbble ? "#EA4C89" : "#ccc"} />
          </Pressable>
        </View>
      </View>

      {/* Publicaciones */}
      <View style={styles.postsSection}>
        <Text style={styles.postsTitle}>Publicaciones</Text>
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} item={post} currentUser={currentUser} router={router} />
          ))
        ) : (
          <Text style={{ color: "#aaa", textAlign: "center", marginTop: 10 }}>No hay publicaciones públicas.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarSection: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 8,
  },
  avatarRect: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#16a085",
    width: hp(13),
    height: hp(13),
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  avatarShadow: {
    shadowColor: "#16a085",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  userName: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "#222",
    marginTop: 10,
    textAlign: "center",
  },
  infoText: {
    fontSize: hp(1.8),
    color: "#444",
    textAlign: "center",
    marginTop: 2,
  },
  bioCard: {
    backgroundColor: "#e6f7f3",
    borderRadius: 16,
    marginHorizontal: 24,
    marginTop: 18,
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
  postsSection: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  postsTitle: {
    fontWeight: "bold",
    fontSize: hp(2.1),
    color: "#16a085",
    marginBottom: 10,
    textAlign: "center",
  },
  interestsCard: {
    width: "90%", // antes era 100%
    alignSelf: "center", // centra la tarjeta
    marginTop: 18,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18, // más padding lateral
    shadowColor: "#16a085",
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  interestsTitle: {
    fontWeight: "bold",
    fontSize: hp(1.9),
    color: "#16a085",
    marginBottom: 8,
  },
  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center", // centra los chips
    alignItems: "center",
    marginTop: 4,
  },
  chip: {
    backgroundColor: "#e6f7f3",
    borderRadius: 14,
    paddingVertical: 8, // más alto
    paddingHorizontal: 18, // más ancho
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#16a08533",
  },
  chipText: {
    color: "#16a085",
    fontWeight: "500",
    fontSize: hp(1.7),
  },
  connectButton: {
    marginTop: 12,
    backgroundColor: "#16a085",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 32,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#16a085",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  connectButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(1.8),
    letterSpacing: 0.5,
  },
  countersRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 2,
    gap: 24,
  },
  counterBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    shadowColor: "#16a085",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  counterText: {
    color: "#16a085",
    fontWeight: "600",
    fontSize: hp(1.9),
  },
  socialRowContainer: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  socialIcon: {
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 16,
    shadowColor: "#222",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
});