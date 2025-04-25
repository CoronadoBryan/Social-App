import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback
} from "react-native";
import { fetchComments, createComment } from "../services/commentService";
import Avatar from "./Avatar";
import { hp } from "../helpers/common";
import { theme } from "../constants/theme";

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return date.toLocaleDateString();
};

const CommentsModal = ({ visible, onClose, postId, currentUser }) => {
  if (!currentUser) return null;

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = React.useRef(null);

  const loadComments = async () => {
    setLoading(true);
    const res = await fetchComments(postId);
    if (res.success) setComments(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      loadComments();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 350);
    } else setInput("");
  }, [visible]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    await createComment({ postId, userId: currentUser.id, text: input.trim() });
    setInput("");
    await loadComments();
    setSending(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <KeyboardAvoidingView
          style={{ width: "100%", alignItems: "center" }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            paddingVertical: 0,
            paddingHorizontal: 0,
            width: "96%",
            // Altura dinámica según comentarios, mínimo 320, máximo 600
            minHeight: 500,
            maxHeight: Math.max(180, Math.min(80 + comments.length * 68, 600)),
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 6,
            position: "relative"
          }}>
            {/* Botón X minimalista */}
            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={{
                position: "absolute",
                top: 14,
                width: 36,
                right: 18,
                zIndex: 10,
                backgroundColor: "#f0f2f5",
                borderRadius: 100,
              }}
              hitSlop={10}
            >
              <Text style={{
                fontSize: 26,
                color: "#888",
                fontWeight: "400",
                lineHeight: 26,
                textAlign: "center",
              }}>
                ×
              </Text>
            </TouchableOpacity>
            <Text style={{
              fontWeight: "600",
              fontSize: hp(2.1),
              marginTop: 20,
              marginBottom: 6,
              color: theme.colors.primaryDark,
              textAlign: "center",
              letterSpacing: 0.1
            }}>
              Comentarios
            </Text>
            <View style={{ flex: 1 }}>
              <ScrollView
                contentContainerStyle={{ paddingBottom: 8, paddingHorizontal: 0 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.colors.primaryDark} style={{ marginTop: 20 }} />
                ) : comments.length === 0 ? (
                  <Text style={{ color: theme.colors.textLight, textAlign: "center", marginTop: 16, fontSize: hp(1.6) }}>
                    Sé el primero en comentar.
                  </Text>
                ) : (
                  comments.map((c) => (
                    <View
                      key={c.id}
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        paddingHorizontal: 12,
                        marginBottom: 10,
                      }}
                    >
                      <Avatar
                        uri={c.user?.image}
                        size={hp(2.7)}
                        rounded={hp(1.35)}
                        style={{
                          marginRight: 8,
                          borderWidth: 0,
                          backgroundColor: "#eee"
                        }}
                      />
                      <View
                        style={{
                          flex: 1,
                          backgroundColor: "#f0f2f5",
                          borderRadius: 12,
                          paddingVertical: 7,
                          paddingHorizontal: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "500",
                            color: theme.colors.textDark,
                            fontSize: hp(1.5),
                            marginBottom: 2,
                          }}
                        >
                          {c.user?.name || "Usuario"}
                        </Text>
                        <Text
                          style={{
                            color: theme.colors.text,
                            fontSize: hp(1.6),
                          }}
                        >
                          {c.text}
                        </Text>
                        <Text style={{
                          color: theme.colors.textLight,
                          fontSize: hp(1.1),
                          marginTop: 2,
                        }}>
                          {timeAgo(c.created_at)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              borderTopWidth: 0.5,
              borderTopColor: theme.colors.gray,
              paddingTop: 6,
              paddingBottom: 8,
              paddingHorizontal: 10,
              backgroundColor: "#fff"
            }}>
              <Avatar
                uri={currentUser?.image}
                size={hp(2.7)}
                rounded={hp(1.35)}
                style={{ marginRight: 8, backgroundColor: "#eee" }}
              />
              <TextInput
                ref={inputRef}
                value={input}
                onChangeText={setInput}
                placeholder="Escribe un comentario..."
                style={{
                  flex: 1,
                  backgroundColor: "#f0f2f5",
                  borderRadius: 16,
                  paddingHorizontal: 14,
                  paddingVertical: Platform.OS === "ios" ? 8 : 4,
                  fontSize: hp(1.6),
                  marginRight: 8,
                  borderWidth: 0,
                }}
                editable={!sending}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
              <TouchableOpacity
                onPress={handleSend}
                disabled={sending || !input.trim()}
                style={{
                  backgroundColor: theme.colors.primaryDark,
                  borderRadius: 16,
                  paddingVertical: 6,
                  paddingHorizontal: 14,
                  opacity: sending || !input.trim() ? 0.6 : 1,
                  flexDirection: "row",
                  alignItems: "center"
                }}
              >
                <Text style={{ color: "white", fontWeight: "bold", fontSize: hp(1.5) }}>
                  Enviar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default CommentsModal;