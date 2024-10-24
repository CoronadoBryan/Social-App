import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme';
import { hp , wp } from '../helpers/common';
import Avatar from '../components/Avatar';
import moment from 'moment';
import 'moment/locale/es';  // Importar español para moment
import Icon from "../assets/icons";
import RenderHTML from 'react-native-render-html';
import { getSupabaseFileUrl } from '../services/imageService';
import { Image } from 'expo-image';
import { Video } from 'expo-av';  // Corregido
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

    const openPostDetails = () => {

    }

    // Formatear la fecha en español
    const created_at = moment(item?.created_at).format('dddd, D [de] MMMM [de] YYYY, h:mm a');
    const likes=[

    ]
    const liked=false;
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
                        <Image
                            source={getSupabaseFileUrl(item?.file)}
                            transition={100}
                            style={styles.postMedia}
                            constentFit="cover"
                        />
                )
            }
            {/* post del video */}

            {
                item?.file && item?.file?.includes('postVideos') &&(
                    <Video
                    style={[styles.postMedia, {height: hp(30)}]}
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
                    <TouchableOpacity>
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
                    <TouchableOpacity>
                        <Icon name="share" size={hp(3.2)} strokeWidth={2} color={liked? theme.colors.rose: theme.colors.textLight} />
                    </TouchableOpacity>
                   
                </View>
            </View>


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
        height: hp(20),
        width: '100%',
        borderRadius: theme.radius.xxl,
        borderCurve: "continuous",
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


