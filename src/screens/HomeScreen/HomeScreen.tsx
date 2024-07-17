import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { Avatar, Button, Divider, IconButton, Modal, Portal, Snackbar, Card, Title, Paragraph, Text, TextInput } from 'react-native-paper';
import { styles } from '../../theme/styles';
import { collection, getDocs, setDoc, doc, getDoc } from 'firebase/firestore';
import { firestore, auth, dbRealTime } from '../../configs/firebaseConfig';
import { onValue, ref } from 'firebase/database';
import { CommonActions, useNavigation } from '@react-navigation/native';
import * as Crypto from 'expo-crypto';
import firebase, { signOut, updateProfile } from 'firebase/auth';

interface TravelPackage {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
}

interface FormUser {
    name: string;
}

interface Purchase {
    id: string;
    userId: string;
    packageId: string;
    email: string;
    packageTitle: string;
    price: string;
}

export const HomeScreen = () => {
    const [packages, setPackages] = useState<TravelPackage[]>([]);
    const [cart, setCart] = useState<TravelPackage[]>([]);
    const [showCartModal, setShowCartModal] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState({ visible: false, message: '', color: '#fff' });
    const [formUser, setFormUser] = useState<FormUser>({ name: '' });
    const [userAuth, setUserAuth] = useState<firebase.User | null>(null);
    const [showModalProfile, setShowModalProfile] = useState<boolean>(false);
    const [cardNumber, setCardNumber] = useState('');
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const navigation = useNavigation();

    useEffect(() => {
        fetchPackages();
        setUserAuth(auth.currentUser);
        setFormUser({ name: auth.currentUser?.displayName ?? "" });
        fetchPurchases();
    }, []);

    const fetchPackages = async () => {
        const querySnapshot = await getDocs(collection(firestore, 'travelPackages'));
        const packagesData: TravelPackage[] = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as TravelPackage));
        setPackages(packagesData);
    };

    const fetchPurchases = async () => {
        const userId = auth.currentUser?.uid;
        const querySnapshot = await getDocs(collection(firestore, 'purchases'));
        const purchasesData: Purchase[] = [];
    
        await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
                const purchaseData = docSnap.data();
                if (purchaseData.userId !== userId) return;
    
                const userDoc = await getDoc(doc(firestore, 'users', purchaseData.userId));
                const packageDoc = await getDoc(doc(firestore, 'travelPackages', purchaseData.packageId));
    
                purchasesData.push({
                    id: docSnap.id,
                    userId: purchaseData.userId,
                    packageId: purchaseData.packageId,
                    email: userDoc.data()?.email,
                    packageTitle: packageDoc.data()?.title,
                    price: packageDoc.data()?.price,
                } as Purchase);
            })
        );
    
        setPurchases(purchasesData);
    };
    const [showCardErrorSnackbar, setShowCardErrorSnackbar] = useState({
        visible: false,
        message: '',
        color: '#ff0000'
    });

    const addToCart = (pkg: TravelPackage) => {
        setCart([...cart, pkg]);
        setShowSnackbar({ visible: true, message: 'Paquete agregado al carrito!', color: '#2e7324' });
    };

    const validateCardNumber = (number: string) => {
        const cleaned = number.replace(/\D/g, '');
        const sum = cleaned.split('').reverse().reduce((acc, digit, index) => {
            const n = parseInt(digit);
            if (index % 2 === 1) {
                return acc + (n * 2 > 9 ? n * 2 - 9 : n * 2);
            }
            return acc + n;
        }, 0);
        return sum % 10 === 0;
    };

    const simulatePayment = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
    
        if (!validateCardNumber(cardNumber)) {
            setShowCardErrorSnackbar({
                visible: true,
                message: 'Número de tarjeta inválido!',
                color: '#ff0000'
            });
            return;
        }
    
        const cartItems = await Promise.all(cart.map(async (pkg) => ({
            packageId: pkg.id,
            userId,
            email: userAuth?.email!,
            price: pkg.price,
            encryptedCardDetails: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, cardNumber),
        })));
    
        await Promise.all(cartItems.map(item => setDoc(doc(firestore, 'purchases', `${item.userId}_${item.packageId}`), item)));
        setCart([]);
        setShowCartModal(false);
        setShowSnackbar({ visible: true, message: 'Pago realizado con éxito!', color: '#2e7324' });
        fetchPurchases();
    };

    const getAllMessages = () => {
        const dbRef = ref(dbRealTime, 'messages/' + auth.currentUser?.uid);
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) return;
            const getKeys = Object.keys(data);
        });
    };

    const handlerSetValues = (key: string, value: string) => {
        setFormUser({ ...formUser, [key]: value });
    };

    const handlerUpdateUser = async () => {
        await updateProfile(userAuth!, { displayName: formUser.name });
        setShowModalProfile(false);
    };

    const handlerSignOut = async () => {
        await signOut(auth);
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
    };

    return (
        <ScrollView style={styles.rootHome}>
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

            <Text style={styles.title}>Explorar Paquetes de Viaje</Text>
            {packages.map((pkg) => (
                <Card key={pkg.id} style={styles.card}>
                    <Card.Content>
                        <Title>{pkg.title}</Title>
                        <Paragraph>{pkg.description}</Paragraph>
                        <Paragraph>Precio: {pkg.price}</Paragraph>
                    </Card.Content>
                    <Card.Cover source={{ uri: pkg.imageUrl }} />
                    <Card.Actions>
                        <Button onPress={() => addToCart(pkg)}>Agregar al Carrito</Button>
                    </Card.Actions>
                </Card>
            ))}
            <Button mode="contained" onPress={() => setShowCartModal(true)} disabled={!cart.length}>Ver Carrito ({cart.length})</Button>
            
            <Portal>
                <Modal visible={showCartModal} onDismiss={() => setShowCartModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.title}>Carrito de Compras</Text>
                        {cart.map((pkg, index) => (
                            <View key={index} style={styles.cartItem}>
                                <Text>{pkg.title}</Text>
                                <Text>Precio: {pkg.price}</Text>
                            </View>
                        ))}
                        <TextInput
                            mode="outlined"
                            label="Número de tarjeta"
                            value={cardNumber}
                            onChangeText={setCardNumber}
                            keyboardType="numeric"
                        />
                        <Button onPress={simulatePayment} mode="contained">Pagar</Button>
                    </View>
                    
                </Modal>
                <Snackbar
                    visible={showCardErrorSnackbar.visible}
                    onDismiss={() => setShowCardErrorSnackbar({ ...showCardErrorSnackbar, visible: false })}
                    style={{ backgroundColor: showCardErrorSnackbar.color, position: 'absolute', bottom: 50, left: 0, right: 0 }}duration={2000}>
                    {showCardErrorSnackbar.message}
                </Snackbar>
            </Portal>

            
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

            <Text style={styles.title}>Historial de Compras</Text>
            {purchases.map((purchase) => (
                <View key={purchase.id} style={styles.card}>
                    <Text>Usuario: {purchase.email}</Text>
                    <Text>Título del Paquete: {purchase.packageTitle}</Text>
                    <Text>Precio: {purchase.price}</Text>
                </View>
            ))}
            <Snackbar visible={showSnackbar.visible} onDismiss={() => setShowSnackbar({ ...showSnackbar, visible: false })} style={{ backgroundColor: showSnackbar.color }}>
                {showSnackbar.message}
            </Snackbar>
 
        </ScrollView>
    );
};
