import React, { useState } from 'react';
import { View, Text, TextInput, Image, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';
import { styles } from '../../theme/styles';
import * as ImagePicker from 'expo-image-picker';
import { storage, firestore } from '../../configs/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';

export const AdminScreen = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

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
        if (image == null) return;
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
        await addDoc(collection(firestore, 'travelPackages'), {
            title,
            description,
            imageUrl,
        });
        setTitle('');
        setDescription('');
        setImage(null);
        setUploading(false);
        
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerText}>Admin - Agregar Paquete de Viaje</Text>
            <TextInput
                style={styles.input}
                placeholder="Título"
                value={title}
                onChangeText={setTitle}
            />
            <TextInput
                style={styles.input}
                placeholder="Descripción"
                value={description}
                onChangeText={setDescription}
                multiline
            />
            <Button
                mode="contained"
                onPress={pickImage}
                style={{ backgroundColor: 'black' }}
            >
                Seleccionar Imagen
            </Button>
            {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
            <Button
                mode="contained"
                onPress={handleSubmit}
                disabled={uploading}
                style={{ backgroundColor: 'black' }}
            >
                {uploading ? "Guardando..." : "Guardar Paquete"}
            </Button>
        </ScrollView>
    );
};
