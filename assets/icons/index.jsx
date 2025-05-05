import { View, Text } from 'react-native'
import React from 'react'
import Home from './Home';
import Mail from './Mail';
import Lock from './Lock';
import User from './User';
import Heart from './Heart';
import Plus from './Plus';
import Search from './Search';
import Location from './Location';
import Call from './Call';
import { theme } from '../../constants/theme';
import Camera from './Camera';
import Edit from './Edit';
import ArrowLeft from './ArrowLeft';
import ThreeDotsCircle from './ThreeDotsCircle';
import ThreeDotsHorizontal from './ThreeDotsHorizontal';
import Comment from './Comment';
import Comunidad from './Comunidad';
import Share from './Share';
import Send from './Send';
import Delete from './Delete';
import Explorar from './Explorar';
import Logout from './logout';
import Image from './Image';
import Video from './Video';
import Github from './Github';
import Menu from './Menu';
import DonarYape from './DonarYape';
import Games from './Games';
import Premium from './Premium';
import DetallesPuntos from './DetallesPuntos';
import CatPoint from './CatPoint';
import Arriba from './Arriba';
import Abajo from './Abajo';



const icons = {
    home: Home,
    mail: Mail,
    lock: Lock,
    user: User,
    heart: Heart,
    plus: Plus,
    search: Search,
    location: Location,
    call: Call,
    camera: Camera,
    edit: Edit,
    arrowLeft: ArrowLeft,
    threeDotsCircle: ThreeDotsCircle,
    threeDotsHorizontal: ThreeDotsHorizontal,
    comment: Comment,
    share: Share,
    send: Send,
    delete: Delete,
    logout: Logout,
    image: Image,
    video: Video,
    github:Github,
    comunidad: Comunidad,
    explorar: Explorar,
    donarYape: DonarYape,
    menu: Menu,
    games: Games,
    premium: Premium,
    detallesPuntos: DetallesPuntos,
    catPoint: CatPoint,
    arriba: Arriba,
    abajo: Abajo,

}

const Icon = ({name, style, ...props}) => {
    const IconComponent = icons[name];
    return (
        <IconComponent
            height={props.size || 24}
            width={props.size || 24}
            strokeWidth={props.strokeWidth || 1.9}
            color={props.color || theme.colors.textLight}
            {...props}
        />
    )
}

export default Icon;
