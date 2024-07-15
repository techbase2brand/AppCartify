import React from 'react';
import { Modal, View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { blackColor, lightGrayOpacityColor, whiteColor ,blackOpacity5} from '../../constants/Color';
import { spacings, style } from '../../constants/Fonts';
import { BaseStyle } from '../../constants/Style';
import { USER_IMAGE } from '../../assests/images'
import Feather from 'react-native-vector-icons/dist/Feather';
import { useSelector } from 'react-redux';
import { LOGIN, SIGNUP, ABOUT_US, CONTACT_US } from '../../constants/Constants';
import Header from '../Header';
const { positionAbsolute, alignItemsCenter, flexDirectionRow, justifyContentSpaceBetween } = BaseStyle;

const MenuModal = ({ modalVisible, setModalVisible, onPressCart, onPressSearch, navigation,onPressShopByCatagory }) => {
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  const onPressShopByCate = () => {
    onPressShopByCatagory()
    setModalVisible(!modalVisible)
  }
  const onPressSaved = () => {
    navigation.navigate('Saved')
    setModalVisible(!modalVisible)
  }
  const onPressProfile = () => {
    navigation.navigate('Profile')
    setModalVisible(!modalVisible)
  }
  const onPressLogin = () => {
    navigation.navigate('AuthStack')
    setModalVisible(!modalVisible)
  }

  const onPressSignUp = () => {
    navigation.navigate('AuthStack')
    setModalVisible(!modalVisible)
  }
  // const onPressContactUS = () => {
  //   navigation.navigate('ContactUs')
  //   setModalVisible(!modalVisible)
  // }
  // const onPressAboutUS = () => {
  //   navigation.navigate('AboutUs')
  //   setModalVisible(!modalVisible)
  // }
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(!modalVisible);
      }}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Header
            closeIcon={true}
            image={true}
            textinput={true}
            navigation={navigation}
            onClosePress={() => setModalVisible(!modalVisible)}
            shoppingCart={true} />
          {/* <View style={[flexDirectionRow, alignJustifyCenter, justifyContentSpaceBetween, { height: hp(6), width: "98%", backgroundColor: whiteColor }]}>
            <View style={[flexDirectionRow, alignItemsCenter]}>
              <TouchableOpacity style={[alignJustifyCenter, { width: wp(10) }]} onPress={() => setModalVisible(!modalVisible)}>
                <Ionicons name={"close"} size={30} color={blackColor} />
              </TouchableOpacity>
            </View>
            <Image source={LOVE_DRINK_LOGO} style={{ width: wp(20), height: hp(8), resizeMode: "contain", marginLeft: spacings.large }} />
            <View style={[flexDirectionRow, { width: 'auto' }, justifyContentSpaceBetween, alignItemsCenter]}>
              <TouchableOpacity style={[alignJustifyCenter, { width: wp(10) }]} onPress={() => { setModalVisible(!modalVisible), onPressSearch() }}>
                <Ionicons name={"search"} size={27} color={blackColor} />
              </TouchableOpacity>
              <TouchableOpacity style={[alignJustifyCenter, { width: wp(10) }]} onPress={() => [setModalVisible(!modalVisible), onPressCart()]}>
                <Feather name={"shopping-cart"} size={25} color={blackColor} />
              </TouchableOpacity>
            </View>
          </View> */}
          <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressShopByCate}>
            <Text style={styles.menuText}>{"Shop By Categories"}</Text>
            <Feather name={"chevron-right"} size={25} color={blackColor} />
          </Pressable>
          <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressSaved}>
            <Text style={styles.menuText}>{"Saved"}</Text>
            <Feather name={"chevron-right"} size={25} color={blackColor} />
          </Pressable>
          <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressProfile}>
            <Text style={styles.menuText}>{"Profile"}</Text>
            <Feather name={"chevron-right"} size={25} color={blackColor} />
          </Pressable>
          {/* <TouchableOpacity style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressAboutUS}>
            <Text style={styles.menuText}>{ABOUT_US}</Text>
            <Feather name={"chevron-right"} size={25} color={blackColor} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressContactUS}>
            <Text style={styles.menuText}>{CONTACT_US}</Text>
            <Feather name={"chevron-right"} size={25} color={blackColor} />
          </TouchableOpacity> */}
          {!userLoggedIn && <Pressable style={[styles.menuItem, justifyContentSpaceBetween, flexDirectionRow, alignItemsCenter]} onPress={onPressSignUp}>
            <Text style={styles.menuText}>{SIGNUP}</Text>
            <Feather name={"chevron-right"} size={25} color={blackColor} />
          </Pressable>}
          {!userLoggedIn && <View style={[styles.bottomContainer, positionAbsolute]}>
            <Pressable style={[styles.loginItem, flexDirectionRow, alignItemsCenter]} onPress={onPressLogin}>
              {/* <MaterialIcons name={"person-outline"} size={30} color={blackColor} /> */}
              <Image source={USER_IMAGE} style={[{ resizeMode: "contain", width: wp(8), height: hp(3.5) }]} />
              <Text style={[styles.menuText, { paddingLeft: spacings.medium }]}>{LOGIN}</Text>
            </Pressable>
          </View>}
        </View>
      </View>
    </Modal >
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    width: wp(100),
    height: hp(100)
  },
  modalView: {
    width: wp(100),
    height: hp(100),
    backgroundColor: whiteColor
  },
  menuItem: {
    padding: spacings.xxxLarge,
    borderBottomWidth: 1,
    borderBottomColor: lightGrayOpacityColor,
  },
  menuText: {
    fontSize: style.fontSizeMedium.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor,
  },
  bottomContainer: {
    width: wp(100),
    bottom: 0
  },
  loginItem: {
    padding: spacings.large,
    width: '100%',
  },
  loadingBoxBackground: {
    backgroundColor:blackOpacity5,
  },
});

export default MenuModal;
