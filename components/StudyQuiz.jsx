import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Easing, ScrollView, Modal } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const categoryCards = [
  { key: "history", label: "Historia", icon: "📜", color: "#FFD59E" },
  { key: "science", label: "Ciencia", icon: "🔬", color: "#B6E2D3" },
  { key: "geography", label: "Geografía", icon: "🌎", color: "#B6C7E2" },
  { key: "music", label: "Música", icon: "🎵", color: "#F7B6B6" },
  { key: "sport_and_leisure", label: "Deportes", icon: "⚽", color: "#FFF59D" },
  { key: "film_and_tv", label: "Cine y TV", icon: "🎬", color: "#B39DDB" },
  { key: "food_and_drink", label: "Comida", icon: "🍔", color: "#FFCCBC" },
  { key: "arts_and_literature", label: "Arte y Literatura", icon: "🎨", color: "#AED581" },
  { key: "society_and_culture", label: "Sociedad", icon: "🌐", color: "#80CBC4" },
  { key: "general_knowledge", label: "General", icon: "❓", color: "#E1BEE7" },
];

async function traducir(texto) {
  const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=en|es`);
  const data = await res.json();
  return data.responseData.translatedText;
}

export default function StudyQuiz() {
  const [step, setStep] = useState("select");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // ANIMACIÓN: cada vez que step sea "select", reinicia y anima fadeAnim
  useEffect(() => {
    if (step === "select") {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }
  }, [step]);

  const startQuiz = async (cat) => {
    setLoading(true);
    const res = await fetch(`https://the-trivia-api.com/api/questions?categories=${cat}&limit=10&lang=es`);
    let data = await res.json();

    data = await Promise.all(data.map(async (q) => {
      if (/[a-zA-Z]/.test(q.question) && !/[áéíóúñ]/i.test(q.question)) {
        q.question = await traducir(q.question);
        q.correctAnswer = await traducir(q.correctAnswer);
        q.incorrectAnswers = await Promise.all(q.incorrectAnswers.map(traducir));
      }
      return q;
    }));

    setQuestions(data);
    setCurrent(0);
    setScore(0);
    setStep("quiz");
    setLoading(false);
    setSelected(null);
  };

  // MODAL DE CARGANDO
  const LoadingModal = () => (
    <Modal
      visible={loading}
      transparent
      animationType="fade"
    >
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.18)",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <View style={{
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 32,
          alignItems: "center"
        }}>
          <ActivityIndicator size="large" color="#4a90e2" />
          <Text style={{ marginTop: 16, fontSize: 16, color: "#4a90e2", fontWeight: "bold" }}>Cargando...</Text>
        </View>
      </View>
    </Modal>
  );

  const answer = (selectedOpt) => {
    setSelected(selectedOpt);
    setTimeout(() => {
      if (selectedOpt === questions[current].correctAnswer) setScore(score + 1);
      setSelected(null);
      if (current + 1 < questions.length) setCurrent(current + 1);
      else setStep("result");
    }, 600);
  };

  if (step === "select") {
    return (
      <LinearGradient
        colors={["#f8fafc", "#ffe5c2", "#c2e9fb"]}
        style={{ flex: 1, alignItems: "center" }}
      >
        <View style={{ marginTop: 200, width: "100%", flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexDirection: "row",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "flex-start",
              width: "100%",
              gap: 12,
              paddingBottom: 40,
            }}
            showsVerticalScrollIndicator={false}
          >
            {categoryCards.map((cat, idx) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => startQuiz(cat.key)}
                style={{
                  backgroundColor: cat.color,
                  borderRadius: 28,
                  width: 100,
                  height: 120,
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 8,
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                  transform: [{ translateY: idx % 3 === 1 ? -20 : 0 }]
                }}
              >
                <Text style={{ fontSize: 36, marginBottom: 10 }}>{cat.icon}</Text>
                <Text style={{ fontSize: 15, fontWeight: "bold", color: "#222", textAlign: "center" }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <LoadingModal />
      </LinearGradient>
    );
  }

  if (step === "quiz" && questions.length) {
    const q = questions[current];
    const options = [...q.incorrectAnswers, q.correctAnswer].sort(() => Math.random() - 0.5);

    // Barra de progreso
    const progress = ((current + 1) / questions.length) * 100;

    return (
      <Animated.View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        backgroundColor: "#f7f7fa",
        opacity: fadeAnim,
        transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }]
      }}>
        {/* Barra de progreso */}
        <View style={{
          width: "100%",
          height: 12,
          backgroundColor: "#e0e0e0",
          borderRadius: 8,
          marginBottom: 24,
          overflow: "hidden"
        }}>
          <View style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#4FC3F7",
            borderRadius: 8,
            transition: "width 0.3s"
          }} />
        </View>

        {/* ScrollView para pregunta y opciones */}
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ alignItems: "center", paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tarjeta de pregunta */}
          <View style={{
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 22,
            padding: 28,
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
            marginBottom: 18,
          }}>
            <Text style={{
              fontSize: 22,
              fontWeight: "bold",
              marginBottom: 18,
              color: "#222",
              textAlign: "center",
              letterSpacing: 0.5
            }}>
              {q.question}
            </Text>
            {options.map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => answer(opt)}
                disabled={selected !== null}
                style={{
                  marginVertical: 10,
                  paddingVertical: 18,
                  paddingHorizontal: 18,
                  borderRadius: 14,
                  backgroundColor:
                    selected === null
                      ? "#f0f8ff"
                      : opt === q.correctAnswer
                      ? "#b6e7c9"
                      : selected === opt
                      ? "#f7b6b6"
                      : "#f0f8ff",
                  borderWidth: selected && opt === q.correctAnswer ? 2 : 0,
                  borderColor: "#4caf50",
                  elevation: selected === opt ? 2 : 0,
                  shadowColor: "#4FC3F7",
                  shadowOpacity: selected === opt ? 0.15 : 0,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 2 },
                }}>
                <Text style={{
                  fontSize: 18,
                  color: selected === opt && opt !== q.correctAnswer ? "#c62828" : "#222",
                  fontWeight: selected === opt ? "bold" : "600",
                  textAlign: "center",
                  letterSpacing: 0.5
                }}>
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
            <Text style={{ marginTop: 22, color: "#888", fontSize: 16, textAlign: "right" }}>
              Pregunta {current + 1} de {questions.length}
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    );
  }

  if (step === "result") {
    return (
      <Animated.View style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f7f7fa",
        opacity: fadeAnim,
        transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) }]
      }}>
        <View style={{
          backgroundColor: "#fff",
          borderRadius: 22,
          padding: 36,
          alignItems: "center",
          elevation: 3,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}>
          <Text style={{ fontSize: 28, fontWeight: "bold", color: "#222", marginBottom: 10 }}>¡Terminaste!</Text>
          <Text style={{ fontSize: 22, marginVertical: 18, color: "#4a90e2" }}>
            Tu puntaje: <Text style={{ fontWeight: "bold" }}>{score} / {questions.length}</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setStep("select")}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 32,
              backgroundColor: "#4a90e2",
              borderRadius: 12,
              marginTop: 16,
              elevation: 2
            }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Volver a categorías</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return null;
}