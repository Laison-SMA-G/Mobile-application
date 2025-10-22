import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    TextInput,
    Alert,
    Pressable,
    StatusBar,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import Checkbox from 'expo-checkbox';
import { useShipping } from '../context/ShippingContext'; // Import useShipping

const ShippingAddress = ({ navigation }) => {
    const [fontsLoaded] = useFonts({
        'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
        'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
        'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
        'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
    });

    const {
        addresses,
        addAddress,
        updateAddress,
        deleteAddress: deleteAddressContext, // Rename to avoid clash
        setDefaultAddress,
        selectedAddress,
        setSelectedAddress,
    } = useShipping();

    const [isAddressModalVisible, setAddressModalVisible] = useState(false);
    const [currentAddressBeingEdited, setCurrentAddressBeingEdited] = useState(null); // Changed name
    const [addressName, setAddressName] = useState('');
    const [fullName, setFullName] = useState(''); // Added for full name
    const [phoneNumber, setPhoneNumber] = useState(''); // Added for phone number
    const [addressLine1, setAddressLine1] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [isDefault, setIsDefault] = useState(false);

    // When addresses change, ensure selectedAddress is still valid
    useEffect(() => {
        if (selectedAddress && !addresses.some(addr => addr.id === selectedAddress.id)) {
            // If selected address was deleted, try to find a new default or clear
            const defaultAddr = addresses.find(addr => addr.isDefault);
            if (defaultAddr) {
                setSelectedAddress(defaultAddr);
            } else if (addresses.length > 0) {
                setSelectedAddress(addresses[0]);
                setDefaultAddress(addresses[0].id); // Make the first one default
            } else {
                setSelectedAddress(null);
            }
        } else if (!selectedAddress && addresses.length > 0) {
             const defaultAddr = addresses.find(addr => addr.isDefault);
             setSelectedAddress(defaultAddr || addresses[0]);
             if (!defaultAddr && addresses.length > 0) setDefaultAddress(addresses[0].id);
        }
    }, [addresses, selectedAddress, setSelectedAddress, setDefaultAddress]);


    const openAddAddressModal = () => {
        setCurrentAddressBeingEdited(null);
        setAddressName('');
        setFullName('');
        setPhoneNumber('');
        setAddressLine1('');
        setCity('');
        setPostalCode('');
        setCountry('');
        setIsDefault(false);
        setAddressModalVisible(true);
    };

    const openEditAddressModal = (address) => {
        setCurrentAddressBeingEdited(address);
        setAddressName(address.name);
        setFullName(address.fullName);
        setPhoneNumber(address.phoneNumber);
        setAddressLine1(address.addressLine1);
        setCity(address.city);
        setPostalCode(address.postalCode);
        setCountry(address.country);
        setIsDefault(address.isDefault);
        setAddressModalVisible(true);
    };

    const handleSaveAddress = () => {
        if (!addressName || !fullName || !phoneNumber || !addressLine1 || !city || !postalCode || !country) {
            Alert.alert('Error', 'Please fill in all address fields.');
            return;
        }

        const addressData = {
            name: addressName,
            fullName,
            phoneNumber,
            addressLine1,
            city,
            postalCode,
            country,
            isDefault,
        };

        if (currentAddressBeingEdited) {
            updateAddress({ ...currentAddressBeingEdited, ...addressData });
            Alert.alert('Address Updated', 'Your shipping address has been updated!', [{ text: 'OK', onPress: () => setAddressModalVisible(false) }]);
        } else {
            addAddress(addressData);
            Alert.alert('Address Added', 'Your new shipping address has been added!', [{ text: 'OK', onPress: () => setAddressModalVisible(false) }]);
        }
    };

    const handleDeleteAddress = (id) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        deleteAddressContext(id); // Use context's delete
                        Alert.alert('Deleted', 'Address deleted successfully.');
                    },
                },
            ]
        );
    };

    const handleSetDefaultAndSelect = (id) => {
        setDefaultAddress(id);
        const newlySelected = addresses.find(addr => addr.id === id);
        if (newlySelected) {
            setSelectedAddress(newlySelected);
            Alert.alert('Default Address & Selected', 'This address is now your default and selected for checkout.');
        }
    };

    const handleSelectAddress = (address) => {
        setSelectedAddress(address);
        Alert.alert('Address Selected', `${address.name} has been selected for checkout.`, [
            { text: 'OK' } 
        ]);
    };


    if (!fontsLoaded) {
        return null;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor='#FFFFFF' />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-left" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Shipping Address</Text>
                <View style={styles.placeholderRight} />
            </View>

            {/* Scrollable Address List */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.addressList}>
                    {addresses.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Icon name="map-marker-off-outline" size={60} color="#B0B0B0" />
                            <Text style={styles.noAddressText}>No shipping addresses found.</Text>
                            <Text style={styles.noAddressSubText}>Tap 'Add New Address' to get started!</Text>
                        </View>
                    ) : (
                        addresses.map((address) => (
                            <TouchableOpacity
                                key={address.id}
                                style={[
                                    styles.addressCard,
                                    selectedAddress && selectedAddress.id === address.id && styles.selectedAddressCard,
                                ]}
                                onPress={() => handleSelectAddress(address)}
                            >
                                <View style={styles.addressHeader}>
                                    <Text style={styles.addressName}>{address.name}</Text>
                                    {address.isDefault && (
                                        <View style={styles.defaultBadge}>
                                            <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                                        </View>
                                    )}
                                    {selectedAddress && selectedAddress.id === address.id && (
                                         <Icon name="check-circle" size={24} color="#074ec2" style={styles.selectedIcon}/>
                                    )}
                                </View>
                                <Text style={styles.addressDetailText}>{address.fullName}</Text>
                                <Text style={styles.addressDetailText}>{address.phoneNumber}</Text>
                                <Text style={styles.addressDetailText}>{address.addressLine1}</Text>
                                <Text style={styles.addressDetailText}>{`${address.city}, ${address.postalCode}`}</Text>
                                <Text style={styles.addressDetailText}>{address.country}</Text>

                                <View style={styles.addressActions}>
                                    <TouchableOpacity onPress={() => openEditAddressModal(address)} style={styles.actionButton}>
                                        <Icon name="pencil-outline" size={18} color="#074ec2" />
                                        <Text style={styles.actionButtonText}>Edit</Text>
                                    </TouchableOpacity>
                                    {!address.isDefault && (
                                        <>
                                            <View style={styles.actionSeparator} />
                                            <TouchableOpacity onPress={() => handleDeleteAddress(address.id)} style={styles.actionButton}>
                                                <Icon name="trash-can-outline" size={18} color="#FF3B30" />
                                                <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
                                            </TouchableOpacity>
                                            <View style={styles.actionSeparator} />
                                            <TouchableOpacity onPress={() => handleSetDefaultAndSelect(address.id)} style={styles.actionButton}>
                                                <Icon name="star-outline" size={18} color="#FF9500" />
                                                <Text style={[styles.actionButtonText, { color: '#FF9500' }]}>Set Default</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Add New Address Button (Fixed at bottom) */}
            <View style={styles.bottomFixedContainer}>
                <TouchableOpacity style={styles.addAddressButton} onPress={openAddAddressModal}>
                    <Icon name="plus-circle-outline" size={22} color="#FFFFFF" />
                    <Text style={styles.addAddressButtonText}>Add New Address</Text>
                </TouchableOpacity>
            </View>


            {/* Address ADD/EDIT Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isAddressModalVisible}
                onRequestClose={() => setAddressModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setAddressModalVisible(false)}>
                    <Pressable style={styles.addressModalContainer} onPress={(event) => event.stopPropagation()}>
                        <Text style={styles.addressModalTitle}>
                            {currentAddressBeingEdited ? 'Edit Address' : 'Add New Address'}
                        </Text>
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Address Name (e.g., Home, Work)"
                            placeholderTextColor="#888"
                            value={addressName}
                            onChangeText={setAddressName}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Full Name"
                            placeholderTextColor="#888"
                            value={fullName}
                            onChangeText={setFullName}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Phone Number"
                            placeholderTextColor="#888"
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Address Line 1 (Street, Building, etc.)"
                            placeholderTextColor="#888"
                            value={addressLine1}
                            onChangeText={setAddressLine1}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="City"
                            placeholderTextColor="#888"
                            value={city}
                            onChangeText={setCity}
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Postal Code"
                            placeholderTextColor="#888"
                            value={postalCode}
                            onChangeText={setPostalCode}
                            keyboardType="numeric"
                        />
                        <TextInput
                            style={styles.modalInput}
                            placeholder="Country"
                            placeholderTextColor="#888"
                            value={country}
                            onChangeText={setCountry}
                        />
                        <View style={styles.checkboxContainer}>
                            <Checkbox
                                value={isDefault}
                                onValueChange={setIsDefault}
                                color={isDefault ? '#074ec2' : '#888'}
                                style={styles.checkbox}
                            />
                            <Text style={styles.checkboxLabel}>Set as default address</Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSecondaryButton]}
                                onPress={() => setAddressModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalPrimaryButton]}
                                onPress={handleSaveAddress}
                            >
                                <Text style={styles.modalButtonTextPrimary}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF', // Lighter background for the whole screen
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#074ec2',
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Rubik-Medium',
        color: '#FFFFFF',
    },
    placeholderRight: {
        width: 38, // To balance the back button
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 18,
        paddingTop: 15,
        paddingBottom: 20, // Space above the fixed button
    },
    addressList: {
        marginBottom: 10,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 60,
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EFEFEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    noAddressText: {
        textAlign: 'center',
        fontSize: 17,
        fontFamily: 'Rubik-Medium',
        color: '#666',
        marginTop: 20,
    },
    noAddressSubText: {
        textAlign: 'center',
        fontSize: 13,
        fontFamily: 'Rubik-Regular',
        color: '#999',
        marginTop: 5,
    },
    addressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15, // Slightly larger border radius
        padding: 18,
        marginBottom: 15,
        borderWidth: 1.5, // Thicker border
        borderColor: '#EAEAEA',
     
        
    },
    selectedAddressCard: {
        borderColor: '#074ec2', // Highlight selected address
        backgroundColor: '#E6F0FA', // Light blue background for selected
    },
    addressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        justifyContent: 'space-between', // To push check icon to right
    },
    addressName: {
        fontSize: 18, // Slightly larger font
        fontFamily: 'Rubik-SemiBold',
        color: '#1C1C1C',
        marginRight: 10,
    },
    defaultBadge: {
        backgroundColor: '#28CD41',
        borderRadius: 6,
        paddingHorizontal: 9,
        paddingVertical: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5, // Space from name
    },
    defaultBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: 'Rubik-Bold',
    },
    selectedIcon: {
        marginLeft: 'auto', // Push to the right
    },
    addressDetailText: {
        fontSize: 14,
        fontFamily: 'Rubik-Regular',
        color: '#555',
        lineHeight: 22, // Increased line height
    },
    addressActions: {
        flexDirection: 'row',
        marginTop: 18,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
        marginBottom: 8,
    },
    actionButtonText: {
        fontSize: 13,
        fontFamily: 'Rubik-Medium',
        marginLeft: 6,
        color: '#074ec2',
    },
    actionSeparator: {
        width: 1,
        height: 18,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 12,
        marginBottom: 8,
    },
    bottomFixedContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        backgroundColor: 'transparent', // Match safeArea background
        
    },
    addAddressButton: {
        backgroundColor: '#074ec2',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderRadius: 12,
    },
    addAddressButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontFamily: 'Rubik-SemiBold',
        marginLeft: 10,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker overlay for better contrast
    },
    addressModalContainer: {
        width: '88%',
        backgroundColor: 'white',
        borderRadius: 18, // Larger radius for modern feel
        paddingVertical: 25,
        paddingHorizontal: 22,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 10,
    },
    addressModalTitle: {
        fontSize: 22,
        fontFamily: 'Rubik-Bold',
        color: '#1C1C1C',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#DDDDDD',
        borderRadius: 10,
        paddingVertical: 13, // Increased padding
        paddingHorizontal: 16,
        fontSize: 13,
        fontFamily: 'Rubik-Regular',
        color: '#333333',
        backgroundColor: '#FFFFFF', // Light grey background for inputs
        width: '100%',
        marginBottom: 12,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 20,
        paddingHorizontal: 5,
    },
    checkbox: {
        borderRadius: 4,
        width: 18,
        height: 18,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 14,
        fontFamily: 'Rubik-Regular',
        color: '#4A4A4A',
    },
    modalActions: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    modalButton: {
        flex: 1,
        borderRadius: 12, // Larger radius
        paddingVertical: 14, // Increased padding
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalPrimaryButton: {
        backgroundColor: '#074ec2',
        marginLeft: 8,
    },
    modalSecondaryButton: {
        backgroundColor: '#FAFAFA', // Light grey for secondary
        marginRight: 8,
        borderWidth: 1, // Add border to secondary
        borderColor: '#DDDDDD',
    },
    modalButtonTextPrimary: {
        color: 'white',
        fontSize: 16, // Larger font
        fontFamily: 'Rubik-SemiBold',
    },
    modalButtonTextSecondary: {
        color: '#555',
        fontSize: 16, // Larger font
        fontFamily: 'Rubik-SemiBold',
    },
});

export default ShippingAddress;