import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor ,mediumGray} from '../constants/Color';
import ConfirmationModal from '../components/Modal/ConfirmationModal'
import { getAdminAccessToken, getStoreDomain, SIGN_OUT, DELETE, SHIPPING_ADDRESS, MY_WISHLIST, ORDERS, ARE_YOU_SURE_DELETE_ACCOUNT, ARE_YOU_SURE_SIGNOUT,STOREFRONT_DOMAIN,ADMINAPI_ACCESS_TOKEN } from '../constants/Constants';
import { PROFILE_IMAGE, BACKGROUND_IMAGE } from '../assests/images';
import SimpleLineIcons from 'react-native-vector-icons/dist/SimpleLineIcons';
import Feather from 'react-native-vector-icons/dist/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header'
import axios from 'axios';
import { AuthContext } from '../context/AuthProvider';
import { useFocusEffect } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/actions/authActions';
import { logEvent } from '@amplitude/analytics-react-native';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import LoadingModal from '../components/Modal/LoadingModal';
import { CONTACT_US_IMAGE, MYADDRESS_IMAGE, MYORDER_IMAGE, MYACCOUNT_IMAGE, LOGOUT_IMAGE, DELETE_IMAGE } from '../assests/images'

const { flex, alignItemsCenter, resizeModeContain, flexDirectionRow, justifyContentSpaceBetween } = BaseStyle;

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const dispatch = useDispatch();
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  // const STOREFRONT_DOMAIN = getStoreDomain(selectedItem)
  // const ADMINAPI_ACCESS_TOKEN = getAdminAccessToken(selectedItem)
  const { setIsLoggedIn } = useContext(AuthContext)
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
  const [customerId, setCustomerId] = useState("")
  const [customerAddresses, setCustomerAddresses] = useState([]);
  const [userName, setUserName] = useState("");
  const [image, setImage] = useState();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserDetails()
    logEvent('ProfileScreen Initialized');
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      fetchUserDetails()
      fetchImage();
    }, [])
  );

  useFocusEffect(
    React.useCallback(() => {
      getCustomerAddress(customerId);
      fetchUserProfile(customerId);
      fetchOrders(customerId);
    }, [customerId])
  );

  useEffect(() => {
    getCustomerAddress(customerId);
    fetchUserProfile(customerId);
    fetchOrders(customerId);
  }, [customerId])

  //for get customer ID
  const fetchUserDetails = async () => {
    const userDetails = await AsyncStorage.getItem('userDetails')
    if (userDetails) {
      const userDetailsObject = JSON.parse(userDetails);
      console.log(userDetailsObject)
      const userId = userDetailsObject?.customer ? userDetailsObject?.customer.id : userDetailsObject?.id;
      console.log("userDetailsObject", userId)
      setCustomerId(userId)
    }
  };

  //for get customer Profile
  const fetchUserProfile = async (id) => {
    console.log("fetchUserProfile", id)
    try {
      const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/customers/${id}.json`, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      console.log('Response fetchUserProfileDatar:', response.data);
      const customer = response?.data?.customer;
      setUserName(`${customer.first_name} ${customer.last_name}`);
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    }
  };

  //for get customer profile Image
  const fetchImage = async () => {
    const profileImage = await AsyncStorage.getItem('userImage')
    setImage(profileImage)
  };

  //for get customer orders
  const fetchOrders = async (id) => {
    try {
      console.log
      const response = await axios.get(
        `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/orders.json?customer_id=${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN
          },
        }
      );
      console.log("response.data.orders", response?.data?.orders);
      setOrders(response?.data?.orders)
    } catch (error) {
      console.log('Error fetching orders:', error);
    }
  };

  //for get customer Address
  const getCustomerAddress = async (id) => {
    // console.log("getCustomerAddress", id)
    try {
      const response = await axios.get(
        `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/customers/${id}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          },
        }
      );
      const customer = response?.data?.customer;
      const addresses = customer?.addresses;
      // console.log("customer.addresses", addresses)
      setCustomerAddresses(addresses)
      return addresses;
    } catch (error) {
      console.log('Error fetching customer address:', error);
    }
  };

  //for toggle Modal
  const toggleModal = (message: string, action: () => void) => {
    setModalMessage(message);
    setConfirmAction(() => action);
    setShowModal(true);
  };

  //for SignOutAccount
  const handleSignOut = async () => {
    setLoading(true)
    logEvent('SignOut Button Clicked');
    dispatch(logout());
    const signout = await AsyncStorage.removeItem('isUserLoggedIn');
    await AsyncStorage.removeItem('userImage')
    console.log("removed url", signout);
    setShowModal(false);
    setIsLoggedIn(false)
    navigation.navigate('AuthStack');
    logEvent('SignOut Seccess');
    setLoading(false)
    // navigation.dispatch(
    //   CommonActions.reset({
    //     index: 0,
    //     routes: [{ name: 'AppWithNavigation' }],
    //   })
    // );
  };

  //for deleteAccount
  const handleDelete = async () => {
    logEvent('Delete Button Clicked');
    try {
      // const currentUser = auth().currentUser;
      // if (currentUser) {
      //   await currentUser.delete();
      //   await AsyncStorage.removeItem('isUserLoggedIn');
      //   dispatch(logout());
      //   console.log('Firebase user deleted successfully.');
      //   logEvent(`Firebase user deleted successfully.`);
      // } else {
      //   console.log('No user is currently signed in to Firebase.');
      //   logEvent(`No user is currently signed in to Firebase.`);
      // }
      await axios.delete(
        `https://${STOREFRONT_DOMAIN}/admin/api/2024-04/customers/${customerId}.json`,
        {
          headers: {
            'Content-Type': 'application/json',
            "X-Shopify-Access-Token": ADMINAPI_ACCESS_TOKEN,
          },
        }
      );
      setLoading(true)
      console.log(`Customer  deleted successfully.`);
      await AsyncStorage.removeItem('isUserLoggedIn');
      await AsyncStorage.removeItem('userImage')
      await AsyncStorage.removeItem('userDetails')
      setShowModal(false);
      setIsLoggedIn(false)
      dispatch(logout());
      navigation.navigate('AuthStack');
      logEvent('Delete Seccess');
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(`Error deleting customer :`, error);
      logEvent(`Error deleting customer :${error}`);
    }
  };


  const capitalizeFirstLetter = (str) => {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <ImageBackground style={[styles.container, flex]} source={BACKGROUND_IMAGE}>
      {/* <Header backIcon={true} text={"Account"} navigation={navigation} /> */}
      <View style={[{ width: "100%", height: hp(7) }, flexDirectionRow, alignItemsCenter]}>
        <TouchableOpacity style={[styles.backIcon, alignItemsCenter]} onPress={() => { logEvent(`Back Button Pressed from Profile`), navigation.goBack() }}>
          <Ionicons name={"arrow-back"} size={33} color={blackColor} />
        </TouchableOpacity>
        <Text style={styles.text}>{"Account"}</Text>
      </View>
      <View style={[styles.header, alignItemsCenter]}>
        {image ? <Image source={{ uri: image }} style={[styles.profileImage, resizeModeContain]} /> :
          <Image source={PROFILE_IMAGE} style={[styles.profileImage, resizeModeContain]} />}
        <Text style={styles.username}>{capitalizeFirstLetter(userName)}</Text>
      </View>
      {/* <View style={styles.section}>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => {
            logEvent(`Orders Clicked userId: ${customerId}`);
            navigation.navigate("UserDashboardScreen", {
              from: ORDERS,
              orderList: orders
            })
          }}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <SimpleLineIcons name={"social-dropbox"} size={18} color={grayColor} />
            <Text style={styles.optionText}>{ORDERS}</Text>
          </View>
          <SimpleLineIcons name={"arrow-right"} size={16} color={grayColor} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => {
            logEvent(`My WishList Clicked userId: ${customerId}`);
            navigation.navigate("UserDashboardScreen", {
              from: MY_WISHLIST,
            })
          }}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <SimpleLineIcons name={"heart"} size={18} color={grayColor} />
            <Text style={styles.optionText}>{MY_WISHLIST}</Text>
          </View>
          <SimpleLineIcons name={"arrow-right"} size={16} color={grayColor} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => {
            logEvent(`Shipping Address Clicked userId: ${customerId}`);
            navigation.navigate("UserDashboardScreen", {
              from: SHIPPING_ADDRESS,
              address: customerAddresses
            })
          }}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <SimpleLineIcons name={"home"} size={18} color={grayColor} />
            <Text style={styles.optionText}>{SHIPPING_ADDRESS}</Text>
          </View>
          <SimpleLineIcons name={"arrow-right"} size={16} color={grayColor} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => toggleModal(ARE_YOU_SURE_DELETE_ACCOUNT, handleDelete)}>
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <AntDesign name={"delete"} size={18} color={grayColor} />
            <Text style={styles.optionText}>{DELETE}</Text>
          </View>
          <SimpleLineIcons name={"arrow-right"} size={16} color={grayColor} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => toggleModal(ARE_YOU_SURE_SIGNOUT, handleSignOut)}>
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <SimpleLineIcons name={"logout"} size={18} color={grayColor} />
            <Text style={styles.optionText}>{SIGN_OUT}</Text>
          </View>
          <SimpleLineIcons name={"arrow-right"} size={16} color={grayColor} />
        </TouchableOpacity>

        {showModal && <ConfirmationModal
          visible={showModal}
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          message={modalMessage}
        />}
      </View> */}
      <View style={styles.section}>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { paddingRight: spacings.large }]}
          onPress={() => {
            logEvent(`AccountDetails Clicked userId: ${customerId}`);
            navigation.navigate("AccountDetails")
          }}>
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={MYACCOUNT_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: blackColor }]}>{"My Details"}</Text>
          </View>
          <Feather name={"chevron-right"} size={30} color={blackColor} />
        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: mediumGray }}></View>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { paddingRight: spacings.large }]}
          onPress={() => {
            logEvent(`Orders Clicked userId: ${customerId}`);
            navigation.navigate("UserDashboardScreen", {
              from: ORDERS,
              orderList: orders
            })
          }}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={MYORDER_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: blackColor }]}>{"My Orders"}</Text>
          </View>
          <Feather name={"chevron-right"} size={30} color={blackColor} />
        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: mediumGray }}></View>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { paddingRight: spacings.large }]}
          onPress={() => {
            logEvent(`Shipping Address Clicked userId: ${customerId}`);
            navigation.navigate("UserDashboardScreen", {
              from: SHIPPING_ADDRESS,
              address: customerAddresses
            })
          }}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={MYADDRESS_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: blackColor }]}>{"Address Book"}</Text>
          </View>
          <Feather name={"chevron-right"} size={30} color={blackColor} />
        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: mediumGray }}></View>
        {/* <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { paddingRight: spacings.large }]}
          onPress={() => {
            navigation.navigate('Contact_Us')
          }}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={CONTACT_US_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: blackColor }]}>{"Contact US"}</Text>
          </View>
          <Feather name={"chevron-right"} size={30} color={blackColor} />
        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: "#E6E6E6" }}></View> */}
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => toggleModal(ARE_YOU_SURE_DELETE_ACCOUNT, handleDelete)}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={DELETE_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: blackColor }]}>{DELETE}</Text>
          </View>

        </TouchableOpacity>
        <View style={{ width: "99%", height: 1, backgroundColor: mediumGray }}></View>
        <TouchableOpacity style={[styles.option, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter]}
          onPress={() => toggleModal(ARE_YOU_SURE_SIGNOUT, handleSignOut)}
        >
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <Image source={LOGOUT_IMAGE} style={[resizeModeContain, { width: wp(6), height: wp(6) }]} />
            <Text style={[styles.optionText, { color: redColor }]}>{"Logout"}</Text>
          </View>

        </TouchableOpacity>
        {showModal && <ConfirmationModal
          visible={showModal}
          onConfirm={confirmAction}
          onCancel={() => setShowModal(false)}
          message={modalMessage}
        />}
         {loading &&
        <LoadingModal visible={loading} />
      }
      </View>
    </ImageBackground >
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
  },
  header: {
    paddingVertical: spacings.large,
  },
  text: {
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    color: blackColor,
    marginLeft: spacings.normalx
  },
  profileImage: {
    width: wp(30),
    height: wp(30),
    borderRadius: 100,
    borderWidth: 4,
    borderColor: grayColor
  },
  username: {
    marginTop: spacings.large,
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    color: blackColor
  },
  section: {
    marginTop: spacings.Large2x,
    // paddingHorizontal: spacings.Large1x,
  },
  option: {
    paddingVertical: spacings.xxLarge,
    paddingRight: spacings.small,
    paddingHorizontal: spacings.xxxLarge,
    height: hp(7.5)
    // borderBottomWidth: 5,
    // borderBottomColor: "#E6E6E6",
  },
  optionText: {
    fontSize: style.fontSizeMedium.fontSize,
    paddingLeft: spacings.xLarge,
    color: grayColor
  },
  backIcon: {
    width: wp(10),
    height: hp(5)
  },
});

export default ProfileScreen;
