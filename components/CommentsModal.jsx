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

  const loadComments = async () => {
    setLoading(true);
    const res = await fetchComments(postId);
    if (res.success) setComments(res.data);
    setLoading(false);
  };

  useEffect(() => {
    if (visible) loadComments();
    else setInput("");
  }, [visible]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setSending(true);
    await createComment({ postId, userId: currentUser.id, text: input.trim() });
    setInput("");
    await loadComments();
    setSending(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
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
            <TouchableWithoutFeedback>
              <View style={{
                backgroundColor: "white",
                borderRadius: 22,
                paddingVertical: 18,
                paddingHorizontal: 10,
                width: "92%",
                // Elimina maxHeight aquí para que el modal no se achique
                shadowColor: "#000",
                shadowOpacity: 0.13,
                shadowRadius: 16,
                elevation: 12,
                position: "relative"
              }}>
                {/* Botón X */}
                <TouchableOpacity
                  onPress={onClose}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 14,
                    zIndex: 10,
                    padding: 6,
                  }}
                  hitSlop={10}
                >
                  <Text style={{ fontSize: 22, color: theme.colors.textLight, fontWeight: "bold" }}>×</Text>
                </TouchableOpacity>
                <Text style={{
                  fontWeight: "bold",
                  fontSize: hp(2.3),
                  marginBottom: 10,
                  color: theme.colors.primaryDark,
                  textAlign: "center",
                  letterSpacing: 0.2
                }}>
                  Comentarios
                </Text>
                <View style={{ maxHeight: 340 }}>
                  <ScrollView
                    contentContainerStyle={{ paddingBottom: 10 }}
                    showsVerticalScrollIndicator={true}
                  >
                    {loading ? (
                      <ActivityIndicator size="large" color={theme.colors.primaryDark} style={{ marginTop: 30 }} />
                    ) : comments.length === 0 ? (
                      <Text style={{ color: theme.colors.textLight, textAlign: "center", marginTop: 20 }}>
                        Sé el primero en comentar.
                      </Text>
                    ) : (
                      comments.map((c) => {
                        const isMine = c.userId === currentUser.id;
                        return (
                          <View
                            key={c.id}
                            style={{
                              flexDirection: "row",
                              alignItems: "flex-end",
                              justifyContent: isMine ? "flex-end" : "flex-start",
                              marginBottom: 14,
                              paddingHorizontal: 2,
                            }}
                          >
                            {!isMine && (
                              <Avatar
                                uri={c.user?.image}
                                size={hp(3.2)}
                                rounded={hp(1.6)}
                                style={{
                                  marginRight: 8,
                                  borderWidth: 1,
                                  borderColor: "#eee",
                                  backgroundColor: "#fff"
                                }}
                              />
                            )}
                            <View
                              style={{
                                maxWidth: "75%",
                                backgroundColor: isMine ? "#E6F7FF" : "#F7F7F7",
                                borderRadius: 16,
                                padding: 10,
                                marginLeft: isMine ? 40 : 0,
                                marginRight: isMine ? 0 : 40,
                                borderWidth: isMine ? 1 : 0,
                                borderColor: isMine ? theme.colors.primaryDark : "#eee",
                                shadowColor: "#000",
                                shadowOpacity: 0.04,
                                shadowRadius: 2,
                                elevation: 1,
                              }}
                            >
                              <View style={{ flexDirection: "row", justifyContent: isMine ? "flex-end" : "flex-start" }}>
                                <Text
                                  style={{
                                    fontWeight: "bold",
                                    color: theme.colors.textDark,
                                    fontSize: hp(1.6),
                                    textAlign: isMine ? "right" : "left",
                                  }}
                                >
                                  {c.user?.name || "Usuario"}
                                </Text>
                                <Text style={{
                                  color: theme.colors.textLight,
                                  fontSize: hp(1.2),
                                  marginLeft: 8,
                                  alignSelf: "center"
                                }}>
                                  · {timeAgo(c.created_at)}
                                </Text>
                              </View>
                              <Text
                                style={{
                                  color: theme.colors.text,
                                  fontSize: hp(1.6),
                                  marginTop: 2,
                                  textAlign: isMine ? "right" : "left",
                                }}
                              >
                                {c.text}
                              </Text>
                            </View>
                            {isMine && (
                              <Avatar
                                uri={c.user?.image}
                                size={hp(3.2)}
                                rounded={hp(1.6)}
                                style={{
                                  marginLeft: 8,
                                  borderWidth: 1,
                                  borderColor: "#eee",
                                  backgroundColor: "#fff"
                                }}
                              />
                            )}
                          </View>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
                <View style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                  borderTopWidth: 0.5,
                  borderTopColor: theme.colors.gray,
                  paddingTop: 8,
                }}>
                  <Avatar
                    uri={currentUser?.image}
                    size={hp(3.2)}
                    rounded={hp(1.6)}
                    style={{ marginRight: 8, backgroundColor: "#fff" }}
                  />
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Escribe un comentario bonito..."
                    style={{
                      flex: 1,
                      backgroundColor: "#F2F2F2",
                      borderRadius: 20,
                      paddingHorizontal: 14,
                      paddingVertical: Platform.OS === "ios" ? 10 : 6,
                      fontSize: hp(1.7),
                      marginRight: 8,
                      borderWidth: 1,
                      borderColor: "#eee"
                    }}
                    editable={!sending}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                  />
                  <TouchableOpacity
                    onPress={handleSend}
                    disabled={sending || !input.trim()}
                    style={{
                      backgroundColor: theme.colors.primaryDark,
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      opacity: sending || !input.trim() ? 0.6 : 1,
                      flexDirection: "row",
                      alignItems: "center"
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold", fontSize: hp(1.7) }}>
                      Enviar
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default CommentsModal;