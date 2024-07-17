import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { styles } from '../../theme/styles';
import { CommonActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../configs/firebaseConfig';

export const MainScreen = () => {
    const navigation = useNavigation();
    const [packages, setPackages] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    const fetchPackages = async () => {
        try {
            const querySnapshot = await getDocs(collection(firestore, 'travelPackages'));
            const packagesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPackages(packagesData);
        } catch (err) {
            console.error('Error fetching packages:', err);
            setError('Error fetching packages.');
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchPackages();
        }, [])
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header2}>
                <Text style={styles.headerText}>Gobal Travel</Text>
                <Image
                    source={require('../../../assets/img/logo.png')}
                    style={styles.logo}
                />
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Login' }))}>
                    <IconButton icon="account-circle" size={30} />
                    <Text style={styles.loginText}>Inicia Sesión</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.body}>
                {error && <Text style={styles.errorText}>{error}</Text>}
                {packages.map((pkg) => (
                    <Card key={pkg.id} style={styles.card}>
                        <Card.Content style={styles.cardContent}>
                            <Title style={styles.cardTitle}>{pkg.title}</Title>
                            <Paragraph style={styles.cardParagraph}>{pkg.description}</Paragraph>
                        </Card.Content>
                        <Card.Cover 
                            source={pkg.imageUrl ? { uri: pkg.imageUrl } : require('../../../assets/img/logo.png')} 
                            style={styles.cardImage} 
                        />
                    </Card>
                ))}
            </View>
        </ScrollView>
    );
};
