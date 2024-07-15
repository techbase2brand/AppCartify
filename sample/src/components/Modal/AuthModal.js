import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { blackColor, lightGrayOpacityColor, whiteColor ,blackOpacity5} from '../../constants/Color';
import { spacings, style } from '../../constants/Fonts';
import { BaseStyle } from '../../constants/Style';
import { FACEBOOK_LOGO_IMAGE, APPLE_LOGO_IMAGE, EMAIL_LOGO_IMAGE } from '../../assests/images'
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
const { alignJustifyCenter, positionAbsolute, alignItemsCenter, flexDirectionRow, justifyContentSpaceBetween, resizeModeContain } = BaseStyle;

const AuthModal = ({ modalVisible, setModalVisible, onPressFacebook,onPressEmail, navigation }) => {
  const onPressFacebookButton = () => {
    setModalVisible(!modalVisible)
    onPressFacebook()
  }
  const onPressEmailButton = () => {
    setModalVisible(!modalVisible)
    onPressEmail()
  }
  const onPressAppleButton = () => {
    setModalVisible(!modalVisible)

  }
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <TouchableOpacity style={styles.modalContainer} onPress={() => { setModalVisible(!modalVisible) }}>
        <View style={styles.modalBox}>
          <TouchableOpacity style={[{ width: "100%", marginBottom: spacings.large }, alignJustifyCenter]} onPress={() => { setModalVisible(!modalVisible) }}>
            <AntDesign name="closecircle" size={30} color={blackColor} />
          </TouchableOpacity>
          <View style={styles.modalView}>
            <TouchableOpacity style={[styles.box, alignJustifyCenter, flexDirectionRow]} onPress={onPressFacebookButton}>
              <View style={[{ width: "20%", padding: spacings.large }]}>
                <Image source={FACEBOOK_LOGO_IMAGE} style={[{ width: wp(8), height: hp(4), alignSelf: "flex-end" }, resizeModeContain]} />
              </View>
              <View style={[{ width: "60%", padding: spacings.large }]}>
                <Text style={[styles.text]}>Continue with Facebook</Text>
              </View >
            </TouchableOpacity>
            <TouchableOpacity style={[styles.box, alignJustifyCenter, flexDirectionRow]} onPress={onPressEmailButton}>
              <View style={[{ width: "20%", padding: spacings.large }]}>
                <Image source={EMAIL_LOGO_IMAGE} style={[{ width: wp(8), height: hp(4), alignSelf: "flex-end" }, resizeModeContain]} />
              </View>
              <View style={[{ width: "60%", padding: spacings.large }]}>
                <Text style={[styles.text]}>Continue with Mail</Text>
              </View >

            </TouchableOpacity>
            {Platform.OS === 'ios' && <TouchableOpacity style={[styles.box, alignJustifyCenter, flexDirectionRow]} onPress={onPressAppleButton}>
              <View style={[{ width: "20%", padding: spacings.large }]}>
                <Image source={APPLE_LOGO_IMAGE} style={[{ width: wp(8), height: hp(4), alignSelf: "flex-end" }, resizeModeContain]} />
              </View>
              <View style={[{ width: "60%", padding: spacings.large }]}>
                <Text style={[styles.text]}>Continue with Apple</Text>
              </View >
            </TouchableOpacity>}
          </View>
        </View>
      </TouchableOpacity>
    </Modal >
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: wp(100),
    height: hp(100),
    backgroundColor:blackOpacity5,
  },
  modalView: {
    width: wp(100),
    // height: hp(23),

    backgroundColor: whiteColor,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    padding: spacings.xxLarge
  },
  modalBox: {
    position: "absolute",
    bottom: 0,
  },
  box: {
    width: "100%",
    height: hp(6),
    borderColor: lightGrayOpacityColor,
    borderWidth: .5,
    borderRadius: 10,
    marginBottom: 10
  },
  text: {
    fontSize: style.fontSizeNormal1x.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
    fontFamily: 'GeneralSans-Variable'
  },


});

export default AuthModal;
