import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Button, Card, Title, Paragraph, Modal, Portal, TextInput, IconButton, Snackbar } from 'react-native-paper';
import { styles } from '../../theme/styles';
import * as ImagePicker from 'expo-image-picker';
import { storage, firestore, auth } from '../../configs/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { CommonActions, useNavigation } from '@react-navigation/native';

interface TravelPackage {
    id: string;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
}

interface Purchase {
    id: string;
    userId: string;
    packageId: string;
    email: string;
    packageTitle: string;
    price: string;
}

interface Reservation {
    id: string;
    userId: string;
    packageId: string;
    email: string;
    packageTitle: string;
    price: string;
    status: string;
}

export const AdminScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [packages, setPackages] = useState<TravelPackage[]>([]);
    const [currentPackage, setCurrentPackage] = useState<TravelPackage | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [paymentSnackbarVisible, setPaymentSnackbarVisible] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        fetchPackages();
        fetchPurchases();
        fetchReservations();
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
        const querySnapshot = await getDocs(collection(firestore, 'purchases'));
        const purchasesData: Purchase[] = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
                const purchaseData = docSnap.data();
                const userDoc = await getDoc(doc(firestore, 'users', purchaseData.userId));
                const packageDoc = await getDoc(doc(firestore, 'travelPackages', purchaseData.packageId));

                return {
                    id: docSnap.id,
                    userId: purchaseData.userId,
                    packageId: purchaseData.packageId,
                    email: userDoc.data()?.email,
                    packageTitle: packageDoc.data()?.title,
                    price: purchaseData.price,
                } as Purchase;
            })
        );
        setPurchases(purchasesData);
    };

    const fetchReservations = async () => {
        const querySnapshot = await getDocs(collection(firestore, 'reservations'));
        const reservationsData: Reservation[] = await Promise.all(
            querySnapshot.docs.map(async (docSnap) => {
                const reservationData = docSnap.data();
                const userDoc = await getDoc(doc(firestore, 'users', reservationData.userId));
                const packageDoc = await getDoc(doc(firestore, 'travelPackages', reservationData.packageId));

                return {
                    id: docSnap.id,
                    userId: reservationData.userId,
                    packageId: reservationData.packageId,
                    email: userDoc.data()?.email,
                    packageTitle: packageDoc.data()?.title,
                    price: reservationData.price,
                    status: reservationData.status,
                } as Reservation;
            })
        );
        setReservations(reservationsData);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const uploadImage = async () => {
        if (image == null) return null;
        setUploading(true);
        const response = await fetch(image);
        const blob = await response.blob();
        const storageRef = ref(storage, `images/${Date.now()}`);
        await uploadBytes(storageRef, blob);
        const url = await getDownloadURL(storageRef);
        return url;
    };

    const handleSubmit = async () => {
        const imageUrl = await uploadImage();
        if (currentPackage) {
            await updateDoc(doc(firestore, 'travelPackages', currentPackage.id), {
                title,
                description,
                price,
                imageUrl,
            });
        } else {
            await addDoc(collection(firestore, 'travelPackages'), {
                title,
                description,
                price,
                imageUrl,
            });
        }
        clearForm();
        setShowModal(false);
        fetchPackages();
    };

    const handleEdit = (pkg: TravelPackage) => {
        setTitle(pkg.title);
        setDescription(pkg.description);
        setPrice(pkg.price);
        setImage(pkg.imageUrl);
        setCurrentPackage(pkg);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        await deleteDoc(doc(firestore, 'travelPackages', id));
        fetchPackages();
    };

    const handlePayment = async (reservation: Reservation) => {
        try {
            const reservationDoc = await getDoc(doc(firestore, 'reservations', reservation.id));
            const currentReservation = reservationDoc.data() as Reservation;
            
            if (currentReservation.status === 'Pagado') {
                setPaymentSnackbarVisible(true); 
                return;
            }

            
            await addDoc(collection(firestore, 'purchases'), {
                userId: reservation.userId,
                packageId: reservation.packageId,
                email: reservation.email,
                packageTitle: reservation.packageTitle,
                price: reservation.price,
            });

            
            await updateDoc(doc(firestore, 'reservations', reservation.id), {
                status: 'Pagado'
            });

            fetchReservations();
            fetchPurchases();
            setSnackbarVisible(true);
        } catch (error) {
            console.error("Error marcando como pagado: ", error);
        }
    };

    const handleDeleteReservation = async (id: string) => {
        try {
            await deleteDoc(doc(firestore, 'reservations', id));
            fetchReservations();
            setSnackbarVisible(true); 
        } catch (error) {
            console.error("Error borrando la reserva: ", error);
        }
    };

    const handlerSignOut = async () => {
        await signOut(auth);
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
    };

    const clearForm = () => {
        setTitle('');
        setDescription('');
        setPrice('');
        setImage(null);
        setCurrentPackage(null);
    };

    return (
        <ScrollView style={styles.rootHome}>
            <Text style={styles.title}>Gestionar Paquetes de Viaje</Text>
            <Button mode="contained" onPress={() => setShowModal(true)}>Agregar Paquete</Button>
            <Portal>
                <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
                    <View style={styles.modalContent}>
                        <TextInput label="Título" value={title} onChangeText={setTitle} style={styles.inputs} />
                        <TextInput label="Descripción" value={description} onChangeText={setDescription} style={styles.inputs} />
                        <TextInput label="Precio" value={price} onChangeText={setPrice} style={styles.inputs} keyboardType="numeric" />
                        <Button onPress={pickImage} style={styles.button}>Seleccionar Imagen</Button>
                        {image && <Image source={{ uri: image }} style={styles.image} />}
                        <Button onPress={handleSubmit} mode="contained" loading={uploading} disabled={uploading}>
                            {uploading ? 'Cargando...' : 'Guardar'}
                        </Button>
                        <Button onPress={() => { clearForm(); setShowModal(false); }} mode="outlined" style={styles.cancelButton}>
                            Cancelar
                        </Button>
                    </View>
                </Modal>
            </Portal>
            {packages.map((pkg) => (
                <Card key={pkg.id} style={styles.card}>
                    <Card.Content>
                        <Title>{pkg.title}</Title>
                        <Paragraph>{pkg.description}</Paragraph>
                        <Paragraph>Precio: {pkg.price}</Paragraph>
                    </Card.Content>
                    <Card.Cover source={{ uri: pkg.imageUrl }} />
                    <Card.Actions>
                        <Button onPress={() => handleEdit(pkg)}>Editar</Button>
                        <Button onPress={() => handleDelete(pkg.id)}>Eliminar</Button>
                    </Card.Actions>
                </Card>
            ))}

            <Text style={styles.title}>Compras Realizadas</Text>
            {purchases.map((purchase) => (
                <View key={purchase.id} style={styles.card}>
                    <Text>Usuario: {purchase.email}</Text>
                    <Text>Título del Paquete: {purchase.packageTitle}</Text>
                    <Text>Precio: {purchase.price}</Text>
                </View>
            ))}

            <Text style={styles.title}>Reservas</Text>
            {reservations.map((reservation) => (
                <View key={reservation.id} style={styles.card}>
                    <Text>Usuario: {reservation.email}</Text>
                    <Text>Título del Paquete: {reservation.packageTitle}</Text>
                    <Text>Precio: {reservation.price}</Text>
                    <Text>Estado: {reservation.status}</Text>
                    <Button onPress={() => handlePayment(reservation)}>Marcar como Pagado</Button>
                    <Button onPress={() => handleDeleteReservation(reservation.id)}>Eliminar</Button>
                </View>
            ))}

            <View style={styles.iconSignOut}>
                <IconButton
                    icon="logout"
                    size={35}
                    mode='contained'
                    onPress={handlerSignOut}
                />
            </View>

            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
            >
                Acción realizada con éxito.
            </Snackbar>

            <Snackbar
                visible={paymentSnackbarVisible}
                onDismiss={() => setPaymentSnackbarVisible(false)}
                duration={3000}
            >
                Esta reserva ya está marcada como pagada.
            </Snackbar>
        </ScrollView>
    );
};

