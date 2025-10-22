import React, { useMemo, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    StatusBar,
    Image,
    SafeAreaView,
    Platform,
    ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';
import { useOrders } from '../context/OrderContext';
import { useUser } from '../context/UserContext'; // Correct path to your UserContext

const Account = ({ navigation }) => {
    const [fontsLoaded] = useFonts({
        'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
        'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
        'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
        'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
    });

    const { orders = [] } = useOrders();
    // Destructure 'user' and 'loading' from useUser
    const { user, loading } = useUser(); // Changed from userProfile, isLoadingUserProfile

    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [isLogoutSuccessVisible, setLogoutSuccessVisible] = useState(false);

    const getOrderCountByStatus = useCallback((status) => {
        return Array.isArray(orders) ? orders.filter(order => order.status === status).length : 0;
    }, [orders]);

    const toPayCount = useMemo(() => getOrderCountByStatus('To Pay'), [getOrderCountByStatus]);
    const toShipCount = useMemo(() => getOrderCountByStatus('To Ship'), [getOrderCountByStatus]);
    const toReceiveCount = useMemo(() => getOrderCountByStatus('To Receive'), [getOrderCountByStatus]);
    const toReviewCount = useMemo(() => getOrderCountByStatus('To Review'), [getOrderCountByStatus]);

    const handleTopay = () => navigation.navigate('ToPay');
    const handleToship = () => navigation.navigate('ToShip');
    const handleToreceive = () => navigation.navigate('ToReceive');
    const handleToreview = () => navigation.navigate('ToReview');
    const handleEditprofile = () => navigation.navigate('EditProfile');
    const handleShippingaddress = () => navigation.navigate('ShippingAddress');
    const handleViewPurchaseHistory = () => navigation.navigate('ViewOrder');

    const handleLogout = () => {
        setConfirmModalVisible(true);
    };

    const confirmLogout = () => {
        setConfirmModalVisible(false);
        setLogoutSuccessVisible(true);

        setTimeout(() => {
            setLogoutSuccessVisible(false);
            navigation.navigate('SignIn_SignUp');
        }, 1500);
    };

    // Check for font loading AND user loading from context
    if (!fontsLoaded || loading) { // Changed isLoadingUserProfile to loading
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#074ec2" />
                <Text style={styles.loadingText}>Loading account details...</Text>
            </View>
        );
    }

    // Default values for 'user' if it's null or undefined
    // Now expecting 'fullName' and 'profileImage' directly on the 'user' object
    const displayUser = user || { fullName: 'Guest User', profileImage: null };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor='#074ec2' />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="chevron-left" size={30} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Account</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView style={styles.scrollViewContent}>
                <View style={styles.profileSection}>
                    {displayUser.profileImage ? ( // Use displayUser.profileImage
                        <Image source={{ uri: displayUser.profileImage }} style={styles.avatar} />
                    ) : (
                        <View style={styles.avatarPlaceholder}>
                             <Icon name="account-circle-outline" size={70} color="#B0B0B0" />
                        </View>
                    )}
                    <Text style={styles.username}>{displayUser.fullName}</Text> {/* Use displayUser.fullName */}
                </View>

                <View style={styles.ordersSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>My Orders</Text>
                        <TouchableOpacity style={styles.ViewButton} onPress={handleViewPurchaseHistory}>
                            <Text style={styles.viewHistoryText}>View Purchase History </Text>
                            <Icon name="chevron-right" size={20} color="#074ec2" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.orderStatusContainer}>
                        <TouchableOpacity style={styles.orderStatusItem} onPress={handleTopay}>
                            {toPayCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{toPayCount}</Text></View>}
                            <Icon name="wallet-outline" size={30} color="#074ec2" />
                            <Text style={styles.orderStatusText}>To Pay</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.orderStatusItem} onPress={handleToship}>
                            {toShipCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{toShipCount}</Text></View>}
                            <Icon name="package-variant-closed" size={30} color="#074ec2" />
                            <Text style={styles.orderStatusText}>To Ship</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.orderStatusItem} onPress={handleToreceive}>
                            {toReceiveCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{toReceiveCount}</Text></View>}
                            <Icon name="truck-delivery-outline" size={30} color="#074ec2" />
                            <Text style={styles.orderStatusText}>To Receive</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.orderStatusItem} onPress={handleToreview}>
                            {toReviewCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{toReviewCount}</Text></View>}
                            <Icon name="message-draw" size={30} color="#074ec2" />
                            <Text style={styles.orderStatusText}>To Review</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.actionsSection}>
                    <TouchableOpacity style={styles.actionButton} onPress={handleEditprofile}>
                         <Icon name="account" size={24} color="#1C1C1C" />
                        <Text style={styles.actionButtonText}>Edit Profile</Text>
                        <Icon name="chevron-right" size={24} color="#1C1C1C" style={styles.arrowIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleShippingaddress}>
                        <Icon name="map-marker" size={24} color="#1C1C1C" />
                        <Text style={styles.actionButtonText}>Shipping Address</Text>
                        <Icon name="chevron-right" size={24} color="#1C1C1C" style={styles.arrowIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" size={24} color="#E31C25" />
                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isConfirmModalVisible}
                onRequestClose={() => setConfirmModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setConfirmModalVisible(false)}>
                    <Pressable style={styles.alertModalContainer}>
                        <Icon name="logout-variant" size={48} color="#074ec2" style={{ marginBottom: 12 }} />
                        <Text style={styles.alertModalTitle}>Confirm Logout</Text>
                        <Text style={styles.alertModalMessage}>Are you sure you want to log out?</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSecondaryButton]}
                                onPress={() => setConfirmModalVisible(false)}
                            >
                                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalPrimaryButton]}
                                onPress={confirmLogout}
                            >
                                <Text style={styles.modalButtonTextPrimary}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isLogoutSuccessVisible}
            >
                <View style={styles.toastOverlay}>
                    <View style={styles.toastContainer}>
                        <Text style={styles.toastText}>Logout Successful</Text>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    scrollViewContent: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 12,
        backgroundColor: '#074ec2',
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: 'Rubik-Medium',
        color: "#FFFFFF",
    },
    profileSection: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,

    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0E0E0',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#074ec2',
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#EAEAEA',
        marginBottom: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#B0B0B0',
    },
    username: {
        fontSize: 18,
        fontFamily: 'Rubik-Medium',
        color: '#1C1C1C',
    },
    ViewButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ordersSection: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Rubik-Medium',
        color: '#1C1C1C',
    },
    viewHistoryText: {
        fontSize: 13,
        fontFamily: 'Rubik-SemiBold',
        color: '#888',
    },
    orderStatusContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    orderStatusItem: {
        alignItems: 'center',
        width: 70,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: 5,
        backgroundColor: '#EE2323',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    orderStatusText: {
        marginTop: 6,
        fontSize: 12,
        color: '#555',
        fontFamily: 'Rubik-Regular',
        textAlign: 'center',
    },
     actionsSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 0,
        borderRadius: 0,
        width: '100%',
        marginBottom: 0,
    },
    actionButtonText: {
        fontSize: 16,
        color: '#1C1C1C',
        marginLeft: 15,
        fontFamily: 'Rubik-Medium',
        flex: 1,
    },
    arrowIcon: {
        marginLeft: 'auto',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 15,
        width: '45%',
        alignSelf: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#EAEAEA',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    logoutButtonText: {
        fontSize: 16,
        color: '#E31C25',
        marginLeft: 15,
        fontFamily: 'Rubik-SemiBold',
    },
    bottomButtonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EAEAEA',
    },

    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertModalContainer: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 15,
        paddingTop: 25,
        paddingBottom: 20,
        paddingHorizontal: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    alertModalTitle: {
        fontSize: 18,
        fontFamily: 'Rubik-Bold',
        color: '#1C1C1C',
        marginBottom: 8,
        textAlign: 'center',
    },
    alertModalMessage: {
        fontSize: 15,
        fontFamily: 'Rubik-Regular',
        color: '#4A4A4A',
        textAlign: 'center',
        marginBottom: 25,
        lineHeight: 22,
    },
    modalActions: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modalPrimaryButton: {
        backgroundColor: '#E31C25',
        marginLeft: 8,
    },
    modalSecondaryButton: {
        backgroundColor: '#F3F4F6',
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#EAEAEA',
    },
    modalButtonTextPrimary: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Rubik-SemiBold',
    },
    modalButtonTextSecondary: {
        color: '#1C1C1C',
        fontSize: 16,
        fontFamily: 'Rubik-SemiBold',
    },

    toastOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    toastContainer: {
        backgroundColor: '#E31C25',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 25,
        alignItems: 'center',
        elevation: 5,
    },
    toastText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontFamily: 'Rubik-Medium',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        fontFamily: 'Rubik-Regular',
        color: '#555',
    }
});

export default Account;