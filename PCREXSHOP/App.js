import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';


// Contexts
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { UserProvider } from './context/UserContext';
import { ShippingProvider } from './context/ShippingContext';

// Screens
import MessagesScreen from './Screen/MessagesScreen';
import ChatScreen from './Screen/ChatScreen';
import HomeScreen from './Screen/HomeScreen';
import Cart from "./Screen/Cart";
import CategoryProducts from "./Screen/CategoryProducts";
import ProductDetails from "./Screen/ProductDetails";
import Checkout from "./Screen/Checkout";
import OrderSuccess from "./Screen/OrderSuccess";
import OrderDetails from "./Screen/OrderDetails";
import SearchProduct from "./Components/SearchProduct";
import Products from "./Screen/Products";
import Builder from "./Screen/Builder";
import Account from "./Screen/Account";
import SignIn_SignUp from "./Screen/SignIn_SignUp";
import ResetPassword from "./Screen/ResetPassword";
import EditProfile from "./Screen/EditProfile";
import ShippingAddress from "./Screen/ShippingAddress";
import ViewOrder from "./Screen/ViewOrder";
import ToPay from "./Screen/ToPay";
import ToShip from "./Screen/ToShip";
import ToReceive from "./Screen/ToReceive";
import ToReview from "./Screen/ToReview";


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
SplashScreen.preventAutoHideAsync();


const ShippingSetup = ({ children }) => {
  const { user, token } = useUser();

  return (
   <AuthProvider>
  <ShippingProvider userId={user?._id} token={token}>
    <AppNavigation />
  </ShippingProvider>
</AuthProvider>

  );
};


// ✅ Bottom Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        position: 'absolute',
        marginLeft: 16,
        marginRight: 16,
        height: 65,
        borderRadius: 20,
        bottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 15,
        overflow: 'hidden',
        borderTopWidth: 0,
      },
      tabBarIconStyle: { marginTop: 5 },
      tabBarLabelStyle: {
        fontSize: 11,
        marginBottom: 8,
        fontWeight: '600',
      },
      tabBarActiveTintColor: '#074ec2',
      tabBarInactiveTintColor: '#7c7c7c',
      tabBarShowLabel: true,
      tabBarLabelPosition: 'below-icon',
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Icon name={focused ? "home" : "home-outline"} size={focused ? size + 4 : size + 2} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Products"
      component={Products}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Icon name={focused ? "storefront" : "storefront-outline"} size={focused ? size + 4 : size + 2} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Build A PC"
      component={Builder}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Icon name="desktop-mac" size={focused ? size + 4 : size + 2} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Account"
      component={Account}
      options={{
        tabBarIcon: ({ focused, color, size }) => (
          <Icon name={focused ? "account-circle" : "account-circle-outline"} size={focused ? size + 4 : size + 2} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// ✅ Main App
const App = () => {
  const [initialRoute, setInitialRoute] = useState("SignIn_SignUp");

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#074ec2" }}>
        <UserProvider>
          <CartProvider>
            <OrderProvider>
              <ShippingProvider>
                <NavigationContainer>
                  <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="SignIn_SignUp" component={SignIn_SignUp} />
                    <Stack.Screen name="ResetPassword" component={ResetPassword} />
                    <Stack.Screen name="HomeScreen" component={TabNavigator} />
                    <Stack.Screen name="Cart" component={Cart} />
                    <Stack.Screen name="CategoryProducts" component={CategoryProducts} />
                    <Stack.Screen name="Checkout" component={Checkout} />
                    <Stack.Screen name="OrderSuccess" component={OrderSuccess} />
                    <Stack.Screen name="SearchProduct" component={SearchProduct} />
                    <Stack.Screen name="ProductDetails" component={ProductDetails} />
                    <Stack.Screen name="OrderDetails" component={OrderDetails} />
                    <Stack.Screen name="EditProfile" component={EditProfile} />
                    <Stack.Screen name="ShippingAddress" component={ShippingAddress} />
                    <Stack.Screen name="ViewOrder" component={ViewOrder} />
                    <Stack.Screen name="ToPay" component={ToPay} />
                    <Stack.Screen name="ToShip" component={ToShip} />
                    <Stack.Screen name="ToReceive" component={ToReceive} />
                    <Stack.Screen name="ToReview" component={ToReview} />
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="Messages" component={MessagesScreen} />
                    <Stack.Screen name="Chat" component={ChatScreen} />
                  </Stack.Navigator>
                </NavigationContainer>
              </ShippingProvider>
            </OrderProvider>
          </CartProvider>
        </UserProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;
