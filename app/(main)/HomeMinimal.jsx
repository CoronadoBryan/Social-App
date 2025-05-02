import React, { useEffect, useState, useRef } from 'react'
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput, Dimensions, Animated, Modal, FlatList, BackHandler } from 'react-native'
import { fetchResources } from '../../utils/fetchResources'
import Icon from '../../assets/icons'
import { useRouter } from 'expo-router';
import HomeHeader from '../../components/HomeHeader';
import ScreenWrapper from "../../components/ScreenWrapper";
import Loading from '../../components/Loading';
import { useAuth } from '../../contexts/AuthContext';

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
    title: 'Recursos únicos',
    desc: 'Inspiración moderna'
  },
  {
    url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
    title: 'Diseño limpio',
    desc: 'Minimalismo puro'
  },
  {
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    title: 'Hermosos recursos',
    desc: 'Naturaleza y creatividad'
  }
]

const { width } = Dimensions.get('window')

const isNewResource = (dateString) => {
  const resourceDate = new Date(dateString);
  const now = new Date();
  const diffDays = (now - resourceDate) / (1000 * 60 * 60 * 24);
  return diffDays <= 7; // 7 días
};


const HomeMinimal = () => {
  const { user } = useAuth(); // <--- agrega esto
  const router = useRouter();
  const [resources, setResources] = useState([])
  const [search, setSearch] = useState('')
  const [filtered, setFiltered] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalImage, setModalImage] = useState(null)
  const [confirmModal, setConfirmModal] = useState({ visible: false, url: null });

  const scrollX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    fetchResources().then(setResources)
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(resources)
    } else {
      setFiltered(
        resources.filter(r =>
          r.tags?.join(' ').toLowerCase().includes(search.toLowerCase())
        )
      )
    }
  }, [search, resources])

  // Ordena los recursos por fecha descendente antes de agrupar
  const filteredSorted = [...filtered].sort((a, b) => new Date(b._createdAt) - new Date(a._createdAt));

  // Agrupa recursos por etiqueta
  const tagsMap = {};
  filteredSorted.forEach(resource => {
    resource.tags?.forEach(tag => {
      if (!tagsMap[tag]) tagsMap[tag] = [];
      tagsMap[tag].push(resource);
    });
  });

  const openImageModal = (imgUrl, desc) => {
    setModalImage({ url: imgUrl, desc });
    setModalVisible(true);
  }

  // Obtiene las 5 categorías más recientes
  const categoriesSorted = Object.keys(tagsMap)
    .sort((a, b) => {
      const lastA = tagsMap[a][0]?._createdAt || '';
      const lastB = tagsMap[b][0]?._createdAt || '';
      return new Date(lastB) - new Date(lastA);
    })
    .slice(0, 5);

  // Prepara los datos para FlatList principal
  const sections = [
    { type: 'carousel' },
    { type: 'categories', data: categoriesSorted },
    { type: 'search' },
    ...Object.keys(tagsMap).map(tag => ({
      type: 'tag',
      tag,
      data: tagsMap[tag].slice(0, 3) // sigue mostrando solo 3 recursos por categoría
    }))
  ];

  const renderItem = ({ item }) => {
    if (item.type === 'carousel') {
      return (
        <View>
          {/* Carrusel minimalista */}
          <View>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.carouselContainer}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: false }
              )}
              scrollEventThrottle={16}
            >
              {carouselImages.map((item, idx) => (
                <View key={idx} style={[styles.carouselCard, { width: width * 0.9 }]}>

                  <Image source={{ uri: item.url }} style={styles.carouselImg} />
                  <View style={styles.carouselOverlay}>
                    <Text style={styles.carouselTitle}>{item.title}</Text>
                    <Text style={styles.carouselDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </Animated.ScrollView>
            {/* Indicador de página */}
            <View style={styles.dotsRow}>
              {carouselImages.map((_, i) => {
                const inputRange = [width * 0.9 * (i - 1), width * 0.9 * i, width * 0.9 * (i + 1)]
                const dotWidth = scrollX.interpolate({
                  inputRange,
                  outputRange: [8, 18, 8],
                  extrapolate: 'clamp'
                })
                const opacity = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: 'clamp'
                })
                return (
                  <Animated.View
                    key={i}
                    style={[styles.dot, { width: dotWidth, opacity }]}
                  />
                )
              })}
            </View>
          </View>
        </View>
      );
    }
    if (item.type === 'categories') {
      // Colores suaves para los cuadrados (puedes agregar más si tienes más categorías)
      const pastelColors = [
        '#FDEBD0', '#D6EAF8', '#D5F5E3', '#F9E79F', '#FADBD8', '#E8DAEF', '#FCF3CF'
      ];
      return (
        <View style={{ marginBottom: 18 }}>
          <Text style={styles.sectionTitle}>Categorías recientes</Text>
          <View style={styles.categoriesGridMinimal}>
            {item.data.map((cat, idx) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categorySquareMinimal,
                  { backgroundColor: pastelColors[idx % pastelColors.length] }
                ]}
              >
                <Text style={styles.categorySquareTextMinimal}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    if (item.type === 'search') {
      return (
        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#aaa" style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder="Buscar por etiqueta..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#aaa"
          />
        </View>
      );
    }
    if (item.type === 'tag') {
      return (
        <View style={{ margin: 10  }}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>{item.tag}</Text>
            <TouchableOpacity
              onPress={() => router.push(`/categoria/${item.tag}`)}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {/* Usa FlatList para los recursos */}
          <FlatList
            data={item.data}
            keyExtractor={resource => resource._id}
            renderItem={({ item: resource }) => {
              console.log('RECURSO:', resource.title, resource._createdAt, isNewResource(resource._createdAt));
              return (
                <View style={styles.resourceCard}>
                  <TouchableOpacity onPress={() => openImageModal(resource.coverImageUrl, resource.description)} style={{ position: 'relative' }}>
                    <Image
                      source={
                        resource.coverImageUrl
                          ? { uri: resource.coverImageUrl }
                          : require('../../assets/images/icono.png')
                      }
                      style={styles.resourceImg}
                    />
                    {isNewResource(resource._createdAt) && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>Nuevo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={styles.resourceTitle}>{resource.title}</Text>
                    {resource.fileUrl && (
                      <TouchableOpacity
                        style={styles.downloadBtnModern}
                        onPress={() => setConfirmModal({ visible: true, url: resource.fileUrl })}
                        activeOpacity={0.85}
                      >
                        <Icon name="share" size={18} color="#fff" style={styles.downloadIcon} />
                        <Text style={styles.downloadBtnModernText}>Descargar</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            }}
            scrollEnabled={false} // Para que no haya scroll dentro del recurso
          />
        </View>
      );
    }
    return null;
  };

  // Si aún no hay recursos, muestra el loading
  if (!resources.length) {
    return (
      <ScreenWrapper bg="white">
        <HomeHeader
          user={null}
          router={router}
          title="Recursos Donador"
          subtitle="Recursos en masa que son de paga"
          showBack
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Loading />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <HomeHeader
        user={user} // <--- pásalo aquí
        router={router}
        title="Recursos Donador"
        subtitle="Recursos en masa que son de paga"
        showBack
      />


      {/* Botón regresar visual */}
      <View style={{ marginTop: 10, marginBottom: 2 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: '#f2f2f2',
            marginLeft: 2,
            marginBottom: 6,
          }}
          activeOpacity={0.7}
        >
          <Icon name="arrowLeft" size={20} color="#27ae60" style={{ marginRight: 6 }} />
          <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 15 }}>Regresar</Text>
        </TouchableOpacity>
      </View>

      {/* El resto del contenido es scrolleable */}
      <FlatList
        data={sections}
        renderItem={renderItem}
        keyExtractor={(item, idx) => item.type + (item.tag || '') + idx}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<View style={{ height: 30 }} />}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.92)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 40, right: 30, zIndex: 2 }}
            onPress={() => setModalVisible(false)}
          >
            <Icon name="plus" size={32} color="#fff" />
          </TouchableOpacity>
          <View style={{
            backgroundColor: 'rgba(30,30,30,0.98)',
            borderRadius: 18,
            padding: 0,
            maxWidth: width * 0.95,
            maxHeight: width * 1.1,
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            <ScrollView
              style={{ maxHeight: width * 1, width: width * 0.9 }}
              contentContainerStyle={{ alignItems: 'center', padding: 18 }}
              showsVerticalScrollIndicator={true}
            >
              <Image
                source={modalImage?.url ? { uri: modalImage.url } : require('../../assets/images/icono.png')}
                style={{
                  width: width * 0.8,
                  height: width * 0.6,
                  borderRadius: 14,
                  resizeMode: 'contain',
                  marginBottom: 18,
                  backgroundColor: '#222'
                }}
              />
              {modalImage?.desc ? (
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.07)',
                  borderRadius: 10,
                  padding: 14,
                  width: '100%',
                  marginBottom: 8
                }}>
                  <Text style={{
                    color: '#fff',
                    fontSize: 16,
                    fontWeight: 'bold',
                    marginBottom: 8,
                    textAlign: 'left'
                  }}>
                    Descripción
                  </Text>
                  <Text
                    style={{
                      color: '#eaeaea',
                      fontSize: 15,
                      textAlign: 'left'
                    }}
                    selectable
                  >
                    {modalImage.desc}
                  </Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={confirmModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmModal({ visible: false, url: null })}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 28,
            alignItems: 'center',
            maxWidth: 320,
            shadowColor: '#27ae60',
            shadowOpacity: 0.18,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }
          }}>
            <Icon name="share" size={38} color="#27ae60" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#27ae60', marginBottom: 8 }}>
              ¿Descargar recurso?
            </Text>
            <Text style={{ color: '#444', fontSize: 15, textAlign: 'center', marginBottom: 18 }}>
              ¿Quieres descargar este recurso ahora?
            </Text>
            <View style={{ flexDirection: 'row', gap: 18 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#27ae60',
                  borderRadius: 14,
                  paddingVertical: 8,
                  paddingHorizontal: 24,
                  marginRight: 8
                }}
                onPress={() => {
                  setConfirmModal({ visible: false, url: null });
                  if (confirmModal.url) Linking.openURL(confirmModal.url);
                }}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Descargar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: '#f2f2f2',
                  borderRadius: 14,
                  paddingVertical: 8,
                  paddingHorizontal: 24,
                }}
                onPress={() => setConfirmModal({ visible: false, url: null })}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 16 }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafe',
    flex: 1,
    paddingHorizontal: 24, // antes 20, ahora más aire
    paddingTop: 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 24 // Ajusta este valor según lo que necesites
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 16 },
  hello: { fontSize: 22, color: '#222', marginBottom: 2, fontFamily: 'System' },
  bold: { fontWeight: 'bold' },
  sub: { color: '#888', fontSize: 14, fontFamily: 'System' },
  carouselContainer: { marginBottom: 18 },
  carouselCard: {
    borderRadius: 18,
    overflow: 'hidden',
    marginHorizontal: 6,
    backgroundColor: '#eee',
    height: 170,
    justifyContent: 'flex-end'
  },
  carouselImg: {
    width: '100%',
    height: 170,
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  carouselTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  carouselDesc: {
    color: '#f3f3f3',
    fontSize: 13,
    letterSpacing: 0.1,
  },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 18, marginTop: 2 },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27ae60', // Verde principal para el carrusel
    marginHorizontal: 4,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#27ae60' , marginLeft: 10 }, // Verde para títulos de sección
  seeAll: { color: '#27ae60', fontSize: 14 }, // Verde para enlaces
  categoriesGridMinimal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    margin : 10,
  },
  categorySquareMinimal: {
    width: 88,
    height: 88,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categorySquareTextMinimal: {
    color: '#222',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    marginTop: 4,
  },
  searchIcon: { width: 18, height: 18, marginRight: 8, tintColor: '#aaa' },
  search: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 10,
  },
  resourceCard: {
    flexDirection: 'row',
    backgroundColor: '#fafbfc',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ececec',
    marginHorizontal: 0, // quita el margen lateral extra
    shadowColor: 'transparent',
  },
  resourceImg: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#eaeaea',
  },
  resourceTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
    color: '#222',
  },
  resourceDesc: { color: '#666', fontSize: 14, marginBottom: 6 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  tag: {
    backgroundColor: '#e0e7ef',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4
  },
  tagText: { color: '#3b5998', fontSize: 13, fontWeight: '500' },
  downloadBtnModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60', // Verde principal
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
    shadowColor: '#27ae60',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 }
  },
  downloadBtnModernText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    zIndex: 10,
  },
  newBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    letterSpacing: 0.5,
  },
})

export default HomeMinimal