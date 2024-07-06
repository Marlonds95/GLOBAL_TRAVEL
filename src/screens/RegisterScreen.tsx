import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { styles } from '../theme/styles';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../configs/firebaseConfig';
import { CommonActions, useNavigation } from '@react-navigation/native';

//Interface - Formulario registro
interface FormRegister {
    email: string;
    password: string;
}

//Interface - Snackbar message
interface MessageSnackBar {
    visible: boolean;
    message: string;
    color: string;
}

export const RegisterScreen = () => {
    //hook useState: cambiar el estado del formulario
    const [formRegister, setFormRegister] = useState<FormRegister>({
        email: '',
        password: ''
    });

    //hook useState: visualizar u ocultar el mensaje
    const [showMessage, setShowMessage] = useState<MessageSnackBar>({
        visible: false,
        message: '',
        color: '#fff'
    });

    //hook useState: visualizar la contraseña
    const [hiddenPassword, setHiddenPassword] = useState<boolean>(true);

    //hooh useNavigation: navegar entres screens
    const navigation = useNavigation();

    //Función para cambiar los datos del formulario
    const handlerSetValues = (key: string, value: string) => {
        //Operador spread: sacar una copia del objeto
        setFormRegister({ ...formRegister, [key]: value })
    }

    //Función para enviar y crear al usuario
    const handlerFormRegister = async () => {
        //Validar que existe datos en el formulario
        if (!formRegister.email || !formRegister.password) {
            setShowMessage({
                visible: true,
                message: 'Completa todos los campos!',
                color: '#8f0e1a'
            });
            return;
        }
        //console.log(formRegister);
        try {
            const response = await createUserWithEmailAndPassword(
                auth,
                formRegister.email,
                formRegister.password
            );
            setShowMessage({
                visible: true,
                message: 'Registro exitoso!',
                color: '#2e7324'
            });
            //console.log(response);
        } catch (ex) {
            console.log(ex);
            setShowMessage({
                visible: true,
                message: 'No se logró registrar, inténtalo más tarde!',
                color: '#8f0e1a'
            });
        }
    }

    return (
        <View style={styles.root}>
            <Text style={styles.text}>Regístrate</Text>
            <TextInput
                mode="outlined"
                label="Correo"
                placeholder="Escribe tu correo"
                style={styles.inputs}
                onChangeText={(value) => handlerSetValues('email', value)}
            />
            <TextInput
                mode="outlined"
                label="Contraseña"
                placeholder="Escribe tu contraseña"
                secureTextEntry={hiddenPassword}
                right={<TextInput.Icon icon="eye" onPress={() => setHiddenPassword(!hiddenPassword)} />}
                style={styles.inputs}
                onChangeText={(value) => handlerSetValues('password', value)}
            />
            <Button style={styles.button} mode="contained" onPress={handlerFormRegister}>
                Registrar
            </Button>
            <Text
                style={styles.textRedirect}
                onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Login' }))}>
                Ya tienes una cuenta? Inicia sesión ahora
            </Text>
            <Snackbar
                visible={showMessage.visible}
                onDismiss={() => setShowMessage({ ...showMessage, visible: false })}
                style={{ backgroundColor: showMessage.color }}>
                {showMessage.message}
            </Snackbar>
        </View>
    )
}
