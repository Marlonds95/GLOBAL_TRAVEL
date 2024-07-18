import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    root: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10
    },
    inputs: {
        width: "90%"
    },
    text: {
        fontSize: 25,
        fontWeight: 'bold'
    },
    button: {
        width: "90%"
    },
    textRedirect: {
        marginTop: 20,
        fontSize: 17,
        fontWeight: 'bold',
        color: 'black'
    },
    rootHome: {
        flex: 1,
        marginVertical: 55,
        marginHorizontal: 25
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15
    },
    iconEnd: {
        flex: 1,
        alignItems: 'flex-end'
    },
    modal: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginHorizontal: 20,
        borderRadius: 10,
        backgroundColor: "#fff",
        gap: 10
    },
    rootMessage: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 20,
        alignItems: 'center'
    },
    fabMessage: {
        position: 'absolute',
        bottom: 20,
        right: 15
    },
    rootDetail: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#fff',
        gap: 20
    },
    textDetail: {
        fontWeight: 'bold',
        fontSize: 18
    },
    iconSignOut: {
        marginTop: 25,
        alignItems: 'center'
    },
    container: {
        padding: 16,
        paddingTop: 40,
    },
    header2: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      
        marginTop: 40,
        
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    logo: {
        width: 75,
        height: 50,
    },
    body: {
        flex: 1,
    },
    loginText: {
        fontSize: 13,
        color: '#000000',
        marginLeft: 4,
    },
    loginButton: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#F0F0F0', 
        marginBottom: 16,
        borderRadius: 8,
    },
    cardContent: {
       
    },
    cancelButton: {
        marginTop: 10,
    },
    cardTitle: {
        color: '#000000', 
    },
    cardParagraph: {
        color: '#000000', 
    },
    cardImage: {
        marginTop: 16,
        width: '100%',
        height: 200,
        resizeMode: 'contain', 
    },
    input: {
        borderWidth: 1,
        borderColor: '#000',
        padding: 10,
        marginBottom: 12,
        width: '100%',
    },
    imagePreview: {
        width: '100%',
        height: 200,
        marginVertical: 16,
    },
    errorText: {
        color: '#FF0000', 
        textAlign: 'center',
        marginVertical: 10,
    },
    
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
    },
   
    modalContent: {
        padding: 20,
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 10,
    },
    image: {
        width: 100,
        height: 100,
        marginBottom: 15,
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    }

})