import React, { useState } from 'react';
import { View } from 'react-native';
import { Button, Snackbar, Text, TextInput, RadioButton } from 'react-native-paper';
import { styles } from '../theme/styles';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../configs/firebaseConfig';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';

interface FormRegister {
    email: string;
    password: string;
    role: 'user' | 'admin';
}

export const RegisterScreen = () => {
    const [formRegister, setFormRegister] = useState<FormRegister>({ email: '', password: '', role: 'user' });
    const [showMessage, setShowMessage] = useState({ visible: false, message: '', color: '#fff' });
    const [hiddenPassword, setHiddenPassword] = useState(true);
    const navigation = useNavigation();

    const handlerSetValues = (key: keyof FormRegister, value: string | 'user' | 'admin') => {
        setFormRegister({ ...formRegister, [key]: value });
    };

    const handlerFormRegister = async () => {
        if (!formRegister.email || !formRegister.password) {
            setShowMessage({ visible: true, message: 'Completa todos los campos!', color: '#8f0e1a' });
            return;
        }
        try {
            const response = await createUserWithEmailAndPassword(auth, formRegister.email, formRegister.password);
            await setDoc(doc(firestore, 'users', response.user.uid), { email: formRegister.email, role: formRegister.role });
            setShowMessage({ visible: true, message: 'Registro exitoso!', color: '#2e7324' });
        } catch (ex) {
            console.log(ex);
            setShowMessage({ visible: true, message: 'No se logró registrar, inténtalo más tarde!', color: '#8f0e1a' });
        }
    };

    return (
        <View style={styles.root}>
            <Text style={styles.text}>Regístrate</Text>
            <TextInput mode="outlined" label="Correo" placeholder="Escribe tu correo" style={styles.inputs} onChangeText={(value) => handlerSetValues('email', value)} />
            <TextInput mode="outlined" label="Contraseña" placeholder="Escribe tu contraseña" secureTextEntry={hiddenPassword} right={<TextInput.Icon icon="eye" onPress={() => setHiddenPassword(!hiddenPassword)} />} style={styles.inputs} onChangeText={(value) => handlerSetValues('password', value)} />
            <RadioButton.Group onValueChange={(value) => handlerSetValues('role', value)} value={formRegister.role}>
                <View>
                    <Text>Usuario</Text>
                    <RadioButton value="user" />
                </View>
                {/* <View>
                    <Text>Admin</Text>
                    <RadioButton value="admin" />
                </View> */}
            </RadioButton.Group>
            <Button style={styles.button} mode="contained" onPress={handlerFormRegister}>Registrar</Button>
            <Text style={styles.textRedirect} onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Login' }))}>Ya tienes una cuenta? Inicia sesión ahora</Text>
            <Snackbar visible={showMessage.visible} onDismiss={() => setShowMessage({ ...showMessage, visible: false })} style={{ backgroundColor: showMessage.color }}>{showMessage.message}</Snackbar>
        </View>
    );
};


