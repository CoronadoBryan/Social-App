import { StyleSheet, Text, View, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import { theme } from '../constants/theme';
import { hp , wp } from '../helpers/common';
import { stripHtmlTags } from '../helpers/common';
import Avatar from '../components/Avatar';
import moment from 'moment';
import 'moment/locale/es';  // Importar español para moment
import Icon from "../assets/icons";
import RenderHTML from 'react-native-render-html';
import { downloadFile, getSupabaseFileUrl } from '../services/imageService';
import { Image } from 'expo-image';
import { Video } from 'expo-av'; 
import { createPostLike, removePostLike } from '../services/postService';
import { Share } from 'react-native';
 
/// Configurar moment para usar español
moment.locale('es');


const textStyles = {
    div:{
        color: theme.colors.dark,
        fontSize: hp(1.7),
    }

};

const tagsStyles = {
    div: textStyles,
    p: textStyles,
    ol: textStyles,
    h1: {
        color: theme.colors.dark,
        
    },
    h4: {
        color: theme.colors.dark,
        
    }

}
// El item viene de la data que se le pasa al componente 
const PostCard = ({
    item,
    currentUser,
    router,
    hasShadow = true,
}) => {
    const shadowStyles = {
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1,
    };

    const [likes, setLikes]= useState([]);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {

        setLikes(item?.postLikes);

    },[]);

    const openPostDetails = () => {

    }

    const onLike = async () => {
        if(liked){
            let updatedlikes = likes.filter(like=> like.userId!= currentUser?.id); 
            setLikes([...updatedlikes]);
            let res= await removePostLike(item?.id, currentUser?.id);
            console.log('se quito el like', res);
            if(!res.success){
                Alert.alert("post", 'something went wrong'); 
            }
        }else{
            let data ={
                userId: currentUser?.id,
                postId: item?.id,
            }
            setLikes([...likes,  data]);
            let res= await createPostLike(data);
            console.log('agrego el like', res);
            if(!res.success){
                Alert.alert("post", 'something went wrong'); 
            }

        }
        
    }

    const onShare = async () => {
        let content = { message: stripHtmlTags(item?.body) };
    
        if (item?.file) {
            // Descarga el archivo y luego comparte la URI local
            let url = await downloadFile(getSupabaseFileUrl(item?.file).uri);
            content.url = url;
        }
    
        Share.share(content);
    };
    

    // Formatear la fecha en español
    const created_at = moment(item?.created_at).format('dddd, D [de] MMMM [de] YYYY, h:mm a');
    const liked=likes.filter(like=> like.userId == currentUser?.id)[0]? true: false;
    const MAX_VISIBLE_LIKES = 5;
    const visibleLikes = item.postLikes.filter(like => like.user).slice(0, MAX_VISIBLE_LIKES);
    const extraLikes = item.postLikes.length - visibleLikes.length;

    return (
        <View style={[styles.container, hasShadow && shadowStyles]}>
            <View style={styles.header}>
                <View style={styles.userDetails}>
                    <Avatar 
                        size={hp(4.5)}
                        uri={item?.user?.image}
                        rounded={theme.radius.md}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.username}>{item?.user?.name}</Text>
                        <Text style={styles.postTime}>{created_at}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={openPostDetails} >
                    <Icon name="threeDotsHorizontal" size={hp(3.4)} strokeWidth={3} color={theme.colors.text} />
                </TouchableOpacity>
            </View>

            {/* post body t media */}
            <View style={styles.content} >
                <View style={styles.postBody} >
                    {
                        item?.body &&(
                            <RenderHTML
                                source={{ html: item.body }}
                                contentWidth={wp(100) }
                                tagsStyles={tagsStyles}
                                contentFit="cover"
                                style={styles.postMedia}
                            />
                        )
                    }
                </View>
            </View>
            {/* media */}
            {
                item?.file && item?.file?.includes('postImages') && (
                    <TouchableOpacity onPress={() => setShowImageModal(true)}>
                        <Image
                            source={getSupabaseFileUrl(item?.file)}
                            style={styles.postMedia}
                            resizeMode="cover" // Esto asegura que la imagen cubra el área sin deformarse
                        />
                    </TouchableOpacity>
                )
            }
            {/* post del video */}

            {
                item?.file && item?.file?.includes('postVideos') && (
                    <Video
                        style={{ width: '100%', height: hp(30), borderRadius: theme.radius.xxl, marginTop: 8, marginBottom: 8 }}
                        source={getSupabaseFileUrl(item?.file)}
                        useNativeControls
                        resizeMode="cover"
                        isLooping
                    />
                )
            }

            {/* me gusta , like compartir */}

            <View style={styles.footer}>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onLike} >
                        <Icon name="heart" fill={liked? theme.colors.rose: "transparent"} size={hp(3.2)} strokeWidth={2} color={liked? theme.colors.rose: theme.colors.textLight} />
                    </TouchableOpacity>
                    <Text>
                        {
                            likes?.length 
                        }
                    </Text>
                </View>
                <View style={styles.footerButton}>
                    <TouchableOpacity>
                        <Icon name="comment" size={hp(3.2)} strokeWidth={2} color={theme.colors.rose} />
                    </TouchableOpacity>
                    <Text>
                        {
                            0
                        }
                    </Text>
                </View>
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onShare}>
                        <Icon name="share" size={hp(3.2)} strokeWidth={2} color={liked? theme.colors.rose: theme.colors.textLight} />
                    </TouchableOpacity>
                   
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 8 }}>
                {visibleLikes.map(like => (
                    <View key={like.id || like.userId} style={{ alignItems: 'center', marginRight: 8 }}>
                        <Avatar
                        uri={like.user.image}
                        size={hp(2.5)}
                        rounded={theme.radius.sm}
                        style={{ marginRight: 2, borderWidth: 1, borderColor: theme.colors.gray }}
                        />
                    </View>
                ))}
                {extraLikes > 0 && (
                    <TouchableOpacity onPress={() => setShowLikesModal(true)} style={{ marginRight: 8 }}>
                        <View style={{
                        width: hp(2.5), height: hp(2.5), borderRadius: theme.radius.sm,
                        backgroundColor: theme.colors.gray, alignItems: 'center', justifyContent: 'center'
                        }}>
                        <Icon name="threeDotsHorizontal" size={hp(2)} color={theme.colors.textDark} />
                        </View>
                    </TouchableOpacity>
                )}
                {item.postLikes.length > 0 && (
                    <Text style={{ fontSize: hp(1.5), color: theme.colors.textDark, marginLeft: 4 }}>
                        {item.postLikes.length} {item.postLikes.length === 1 ? 'like' : 'likes'}
                    </Text>
                )}

                {/* Modal para mostrar la lista completa */}
                <Modal
                visible={showLikesModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowLikesModal(false)}
                >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                    backgroundColor: 'white',
                    borderRadius: 28,
                    paddingVertical: 30,
                    paddingHorizontal: 24,
                    width: '85%',
                    maxHeight: '65%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.18,
                    shadowRadius: 12,
                    elevation: 8,
                    alignItems: 'center'
                    }}>
                    <Text style={{
                        fontWeight: 'bold',
                        fontSize: hp(2.4),
                        marginBottom: 18,
                        color: theme.colors.primaryDark,
                        letterSpacing: 0.5
                    }}>
                        Usuarios que dieron like
                    </Text>
                    <ScrollView style={{ width: '100%' }} contentContainerStyle={{ paddingBottom: 10 }}>
                        {item.postLikes.filter(like => like.user).map(like => (
                        <View
                            key={like.id || like.userId}
                            style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginBottom: 14,
                            backgroundColor: '#F7F7F7',
                            borderRadius: 50,
                            paddingVertical: 10,
                            paddingHorizontal: 16,
                            width: '100%',
                            shadowColor: '#000',
                            shadowOpacity: 0.04,
                            shadowRadius: 2,
                            elevation: 1,
                            }}
                        >
                            <View style={{
                            borderWidth: 2,
                            borderColor: theme.colors.primaryDark,
                            borderRadius: 50,
                            padding: 2,
                            marginRight: 14,
                            backgroundColor: 'white',
                            }}>
                            <Avatar
                            uri={like.user.image}
                            size={hp(5.5)}
                            rounded={50}
                            style={{}}
                            />
                            </View>
                            <Text style={{
                            fontSize: hp(2),
                            color: theme.colors.textDark,
                            fontWeight: 'bold',
                            letterSpacing: 0.2,
                            }}>
                            {like.user.name}
                            </Text>
                        </View>
                        ))}
                        {item.postLikes.filter(like => like.user).length === 0 && (
                        <Text style={{ color: theme.colors.textLight, textAlign: 'center', marginTop: 20 }}>
                            Nadie ha dado like todavía.
                        </Text>
                        )}
                    </ScrollView>
                    <TouchableOpacity
                        onPress={() => setShowLikesModal(false)}
                        style={{
                        marginTop: 10,
                        backgroundColor: theme.colors.primaryDark,
                        borderRadius: 100,
                        paddingVertical: 10,
                        paddingHorizontal: 38,
                        alignSelf: 'center',
                        shadowColor: theme.colors.primaryDark,
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 2
                        }}
                    >
                        <Text style={{
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: hp(2),
                        letterSpacing: 0.5
                        }}>
                        Cerrar
                        </Text>
                    </TouchableOpacity>
                    </View>
                </View>
                </Modal>
            </View>

            <Modal
                visible={showImageModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowImageModal(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: 'rgba(0,0,0,0.95)',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <TouchableOpacity style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }} onPress={() => setShowImageModal(false)}>
                        <Image
                            source={getSupabaseFileUrl(item?.file)}
                            style={{ width: '95%', height: '80%', borderRadius: 16, resizeMode: 'contain' }}
                        />
                    </TouchableOpacity>
                </View>
            </Modal>

        </View>
    );
};

export default PostCard;

const styles = StyleSheet.create({
    container: {
        gap: 10,
        marginBottom: 15,
        padding: 10,
        borderRadius: theme.radius.xxl * 1.1,
        borderCurve: "continuous",
        paddingVertical: 12,
        backgroundColor: 'white',
        borderWidth: 0.5,
        borderColor: theme.colors.gray,
        shadowColor: '#000',
    },
    postMedia: {
        width: '100%',
        aspectRatio: 1, // Cuadrada por defecto, pero puedes ajustar esto
        borderRadius: theme.radius.xxl,
        borderCurve: "continuous",
        backgroundColor: '#eee', // Fondo gris claro para carga
        marginTop: 8,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',  // Alinear elementos en fila
        alignItems: 'center',
        justifyContent: 'space-between',  // Distribuir espacio entre contenido e icono
        marginBottom: 8,
    },
    userDetails: {
        flexDirection: 'row',  // Para que el avatar y la info de usuario estén en la misma fila
        alignItems: 'center',
    },
    userInfo: {
        marginLeft: 10,  // Espaciado entre el avatar y el texto
    },
    username: {
        fontSize: hp(1.7),
        color: theme.colors.textDark,
        fontWeight: theme.fonts.medium,
    },
    postTime: {
        fontSize: hp(1.4),
        color: theme.colors.textLight,
        fontWeight: theme.fonts.medium,
    },
    footer: {
        flexDirection: 'row',  // Alinear los botones en fila
        justifyContent: 'flex-start',  // Alinear hacia la izquierda
        paddingVertical: 8,  // Espaciado vertical
        borderTopWidth: 0.5,
        borderTopColor: theme.colors.gray,  // Añadir una línea divisoria superior
    },
    footerButton: {
        flexDirection: 'row',  // Para que el icono y el número estén en la misma fila
        alignItems: 'center',
        marginRight: wp(4),  // Añadir espacio entre cada botón
    },
    footerText: {
        fontSize: hp(1.6),
        color: theme.colors.textDark,
    },
});


