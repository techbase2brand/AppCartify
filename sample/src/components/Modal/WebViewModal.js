import React from 'react';
import { StyleSheet, View, TouchableOpacity, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';

const WebViewModal = ({ modalVisible, onClose, url }) => {
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={modalVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <WebView source={{ uri: url }} style={styles.webView} />
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Icon name="close" size={30} color="black" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 20,

  },
});

export default WebViewModal;
