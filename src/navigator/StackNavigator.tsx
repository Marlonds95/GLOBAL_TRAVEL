import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen/HomeScreen';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firestore } from '../configs/firebaseConfig';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { styles } from '../theme/styles';
import { MainScreen } from '../screens/mainScreen/MainScreen';
import { AdminScreen } from '../screens/AdminScreen/AdminScreen';
import { doc, getDoc } from 'firebase/firestore';

const Stack = createStackNavigator();

export const StackNavigator = () => {
    const [isAuth, setIsAuth] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(firestore, 'users', user.uid));
                const adminStatus = userDoc.exists() && userDoc.data().role === 'admin';
                setIsAdmin(adminStatus);
                setIsAuth(true);
                // console.log('isAuth:', true, 'isAdmin:', adminStatus);
            } else {
                setIsAuth(false);
                setIsAdmin(false);
                // console.log('isAuth:', false, 'isAdmin:', false);
            }
            setIsLoading(false);
        });
    
        return () => unsubscribe();
    }, []);

    return (
        <>
            {isLoading ? (
                <View style={styles.root}>
                    <ActivityIndicator size={40} />
                </View>
            ) :
             (
                <>
                 {/* {console.log('Navigating to:', isAuth ? (isAdmin ? 'Admin' : 'Home') : 'Main')}  */}
                <Stack.Navigator initialRouteName={isAuth ? (isAdmin ? 'Admin' : 'Main') : 'Main'}>
                    <Stack.Screen name="Main" component={MainScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Admin" component={AdminScreen} options={{ headerShown: false }} />
                </Stack.Navigator>
            </>
            )}
        </>
    );
};


