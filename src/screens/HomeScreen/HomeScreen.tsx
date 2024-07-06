import React, { useEffect, useState } from 'react'
import { FlatList, View } from 'react-native'
import { Avatar, Button, Divider, FAB, IconButton, Modal, Portal, Text, TextInput } from 'react-native-paper'
import { styles } from '../../theme/styles'
import firebase, { signOut, updateProfile } from 'firebase/auth';
import { auth, dbRealTime } from '../../configs/firebaseConfig';
import { onValue, ref } from 'firebase/database';
import { CommonActions, useNavigation } from '@react-navigation/native';

//Interface - formulario perfil
interface FormUser {
    name: string;
}

//Interface - Message
export interface Message {
    id: string;
    to: string;
    subject: string;
    message: string;
}

export const HomeScreen = () => {

    //hook useState: manipular el formulario del perfil de usuario
    const [formUser, setFormUser] = useState<FormUser>({
        name: ''
    });

    //hook useState: capturar la data del usuario logueado
    const [userAuth, setUserAuth] = useState<firebase.User | null>(null);

    //hook useState: lista de mensajes
    const [messages, setMessages] = useState<Message[]>([]);

    //useEffect: capturar la data del usuario autenticado
    useEffect(() => {
        //Obtener la data del usuario autenticado
        setUserAuth(auth.currentUser);
        //console.log(auth.currentUser);
        setFormUser({ name: auth.currentUser?.displayName ?? "" })
        //Función para listar mensajes
        getAllMessages();
    }, []);

    //hook useState: mostrar u ocultar el modal del perfil
    const [showModalProfile, setShowModalProfile] = useState<boolean>(false);

    //hook useState: mostrar u ocultar el modal del message
    const [showModalMessage, setShowModalMessage] = useState<boolean>(false);

    //hook navegación
    const navigation = useNavigation();

    //Función para cambiar los datos del formulario
    const handlerSetValues = (key: string, value: string) => {
        setFormUser({ ...formUser, [key]: value })
    }

    //Función actualizar la data del usuario autenticado
    const handlerUpdateUser = async () => {
        await updateProfile(userAuth!, {
            displayName: formUser.name
        });
        setShowModalProfile(false);
    }

    //Función para acceder a la data
    const getAllMessages = () => {
        //1. Refrencia a la BDD - tabla
        const dbRef = ref(dbRealTime, 'messages/' + auth.currentUser?.uid);
        //2. Consultamos a la BDD
        onValue(dbRef, (snapshot) => {
            //3. Capturar la data
            const data = snapshot.val(); // formato esperado
            //CONTROLAR QUE LA DATA TENGA INFORMACIÓN
            if (!data) return;
            //4. Obtener keys de los mensajes
            const getKeys = Object.keys(data);
            //5. Crear un arreglo para almacenar los mensajes de la BDD
            const listMessages: Message[] = [];
            getKeys.forEach((key) => {
                const value = { ...data[key], id: key }
                listMessages.push(value);
            })
            //6. Almacenar en el arreglo del hook
            setMessages(listMessages);
        })
    }

    //Función para cerrar sesión
    const handlerSignOut = async () => {
        await signOut(auth);
        //resetear las rutas
        //navigation.dispatch(CommonActions.navigate({ name: 'Login' }));
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }))
    }

    return (
        <>
            <View style={styles.rootHome}>
                <View style={styles.header}>
                    <Avatar.Text size={55} label="MI" />
                    <View>
                        <Text variant='bodySmall'>Bienvenida</Text>
                        <Text variant='labelLarge'>{userAuth?.displayName}</Text>
                    </View>
                    <View style={styles.iconEnd}>
                        <IconButton
                            icon="account-edit"
                            size={30}
                            mode='contained'
                            onPress={() => setShowModalProfile(true)}
                        />
                    </View>
                </View>
                
                <View>
                <View style={styles.container}>
                <Text variant='bodyLarge'>Aún Estamos Trabajando en el sitio</Text>
                </View>
                </View>
            </View>
            <Portal>
                <Modal visible={showModalProfile} contentContainerStyle={styles.modal}>
                    <View style={styles.header}>
                        <Text variant='headlineMedium'>Mi Perfil</Text>
                        <View style={styles.iconEnd}>
                            <IconButton
                                icon='close-circle-outline'
                                size={30}
                                onPress={() => setShowModalProfile(false)} />
                        </View>
                    </View>
                    <Divider />
                    <TextInput
                        mode='outlined'
                        label='Nombre'
                        value={formUser.name}
                        onChangeText={(value) => handlerSetValues('name', value)} />
                    <TextInput
                        mode='outlined'
                        label='Correo'
                        value={userAuth?.email!}
                        disabled />
                    <Button mode='contained' onPress={handlerUpdateUser}>Actualizar</Button>
                    <View style={styles.iconSignOut}>
                        <IconButton
                            icon="logout"
                            size={35}
                            mode='contained'
                            onPress={handlerSignOut}
                        />
                    </View>
                </Modal>
            </Portal>
            
           
        </>
    )
}
