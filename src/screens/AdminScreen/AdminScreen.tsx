import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Button, Card, Title, Paragraph, Modal, Portal, TextInput, IconButton } from 'react-native-paper';
import { styles } from '../../theme/styles';
import * as ImagePicker from 'expo-image-picker';
import { storage, firestore, auth } from '../../configs/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, getDoc } from 'firebase/firestore';
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
    price: string; // Añadido para mostrar el precio
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
    const navigation = useNavigation();

    useEffect(() => {
        fetchPackages();
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
                    price: purchaseData.price, // Agregar el precio del paquete comprado
                } as Purchase;
            })
        );
        setPurchases(purchasesData);
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
        setTitle('');
        setDescription('');
        setPrice('');
        setImage(null);
        setUploading(false);
        setCurrentPackage(null);
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

    const handlerSignOut = async () => {
        await signOut(auth);
        navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Main' }] }));
    };

    return (
        <ScrollView style={styles.rootHome}>
            <Text style={styles.title}>Admin - Gestionar Paquetes de Viaje</Text>
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
            <View style={styles.iconSignOut}>
                <IconButton
                    icon="logout"
                    size={35}
                    mode='contained'
                    onPress={handlerSignOut}
                />
            </View>
        </ScrollView>
    );
};
