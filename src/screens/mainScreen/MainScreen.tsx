import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { styles } from '../../theme/styles';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export const MainScreen = () => {
    const navigation = useNavigation();

    

    return (
        
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header2}>
                <Text style={styles.headerText}>Gobal Travel</Text>
                <Image
                    source={require('../../../assets/img/logo.png')}
                    style={styles.logo}
                />
                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'Login' }))}>
                    <IconButton
                        icon="account-circle"
                        size={30}
                    />
                    <Text style={styles.loginText}>Inicia Sesión</Text>
                </TouchableOpacity>
                
            </View>
            <View style={styles.body}>
            <Card style={styles.card}>
                    <Card.Content style={styles.cardContent}>
                        <Title style={styles.cardTitle}>Bienvenido  Goval Travel</Title>
                        <Paragraph style={styles.cardParagraph}>Proximamente aquí encontraras los mejores paquetes de viaje !</Paragraph>
                    </Card.Content>
                    <Card.Cover source={require('../../../assets/img/logo.png')} style={styles.cardImage} />
                </Card>
                {/* Add more cards here */}
            </View>
        </ScrollView>
        
    );
};
