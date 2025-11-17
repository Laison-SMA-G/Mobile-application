import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFonts } from 'expo-font';

const { width } = Dimensions.get('window');

// THEME - Ensure this is consistent or passed as prop if theme can change
const THEME = {
  primary: '#074ec2',
  background: '#F0F2F5',
  cardBackground: '#FFFFFF',
  text: '#1C1C1C',
  subText: '#666666',
  borderColor: '#E0E0E0',
};

const CustomAlertModal = ({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'OK',
  cancelText = 'Cancel',
 
}) => {
  const [fontsLoaded] = useFonts({
    'Rubik-Regular': require('../assets/fonts/Rubik/static/Rubik-Regular.ttf'),
    'Rubik-Bold': require('../assets/fonts/Rubik/static/Rubik-Bold.ttf'),
    'Rubik-Medium': require('../assets/fonts/Rubik/static/Rubik-Medium.ttf'),
    'Rubik-SemiBold': require('../assets/fonts/Rubik/static/Rubik-SemiBold.ttf'),
  });

  if (!fontsLoaded) return null;

 

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onCancel} // For Android back button
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <View style={modalStyles.modalHeader}>
            
            <Text style={modalStyles.modalTitle}>{title}</Text>
          </View>
          <Text style={modalStyles.modalMessage}>{message}</Text>

          <View style={modalStyles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity
                style={[modalStyles.button, modalStyles.buttonCancel]}
                onPress={onCancel}
              >
                <Text style={modalStyles.textStyleCancel}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[modalStyles.button, modalStyles.buttonConfirm]}
              onPress={onConfirm}
            >
              <Text style={modalStyles.textStyleConfirm}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: THEME.cardBackground,
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: width * 0.85, // 85% of screen width
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    width: '100%',
    justifyContent: 'center',
  },
  modalIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Rubik-Bold',
    color: THEME.text,
    textAlign: 'center',
  },
  modalMessage: {
    marginBottom: 20,
    fontSize: 16,
    fontFamily: 'Rubik-Regular',
    color: THEME.subText,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonConfirm: {
    backgroundColor: THEME.primary,
  },
  buttonCancel: {
    backgroundColor: THEME.borderColor,
  },
  textStyleConfirm: {
    color: 'white',
    fontFamily: 'Rubik-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
  textStyleCancel: {
    color: THEME.text,
    fontFamily: 'Rubik-SemiBold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default CustomAlertModal;