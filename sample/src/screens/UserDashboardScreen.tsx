import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ImageBackground, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor,mediumGray } from '../constants/Color';
import { SHIPPING_ADDRESS, MY_WISHLIST, ORDERS } from '../constants/Constants';
import Header from '../components/Header'
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import Fontisto from 'react-native-vector-icons/dist/Fontisto';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import AddAddressModal from '../components/Modal/AddAddressModal';
import { removeFromWishlist } from '../redux/actions/wishListActions';
import { useDispatch, useSelector } from 'react-redux';
import { logEvent } from '@amplitude/analytics-react-native';
import { BACKGROUND_IMAGE } from '../assests/images';
import Product from '../components/ProductVertical';
import { getAdminAccessToken, getStoreDomain, STOREFRONT_ACCESS_TOKEN ,STOREFRONT_DOMAIN,ADMINAPI_ACCESS_TOKEN} from '../constants/Constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/Cart';
import Toast from 'react-native-simple-toast';

const { alignJustifyCenter, textAlign, positionAbsolute, resizeModeContain, flexDirectionRow, flex, borderRadius10, justifyContentSpaceBetween, alignItemsCenter } = BaseStyle;

const UserDashboardScreen = () => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  // const STOREFRONT_DOMAIN = getStoreDomain(selectedItem)
  // const ADMINAPI_ACCESS_TOKEN = getAdminAccessToken(selectedItem)
  const { addToCart, addingToCart } = useCart();
  const navigation = useNavigation()
  const route = useRoute();
  const ordersList = route.params?.orderList;
  const customerAddresses = route.params?.address;
  const wishlistObject = useSelector(state => state.wishlist);
  const wishList = wishlistObject?.wishlist;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [defaultAddressId, setDefaultAddressId] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null)
  const dispatch = useDispatch();

  useEffect(() => {
    logEvent('UserDashboardScreen Initialized');
  }, [])

  useEffect(() => {
    if (customerAddresses?.length === 1) {
      setDefaultAddressId(customerAddresses[0].id);
      setSelectedAddressId(customerAddresses[0].id);
    }
  }, [customerAddresses]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await AsyncStorage.getItem('userDetails')
      const userAddress = await AsyncStorage.getItem('isDefaultAddress')
      if (userAddress) {
        setDefaultAddressId(JSON.parse(userAddress));
      }
      if (userDetails) {
        const userDetailsObject = JSON.parse(userDetails);
        const userId = userDetailsObject?.customer ? userDetailsObject?.customer.id : userDetailsObject?.id;
        setCustomerId(userId)
      }
    };
    fetchUserDetails();
  }, [customerId, defaultAddressId]);

  const handlePress = (item) => {
    logEvent(`removed from WishList ${item}`);
    dispatch(removeFromWishlist(item));
  };

  const onPressContinueShopping = (title: string) => {
    logEvent(`Press Continue Shopping Button in ${title} Screen`);
    navigation.navigate('HomeScreen')
  }

  const onPressAddAddress = () => {
    logEvent(`Press Add Address Modal`);
    setModalVisible(true)
  }

  const setDefaultAddress = async (addressId) => {
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2023-01/customers/${customerId}/addresses/${addressId}.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          address: {
            id: addressId,
            default: true,
          }
        }),
      });
      await AsyncStorage.removeItem('isDefaultAddress');
      const data = await response.json();
      await AsyncStorage.setItem('isDefaultAddress', JSON.stringify(addressId));
      setDefaultAddressId(addressId);
      console.log('Set default address response:', data);
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  }

  const addToCartProduct = async (item: any, quantity: any) => {
    const variantId = item?.variants?.edges ? item?.variants?.edges[0]?.node?.id : item?.variants?.nodes ? item?.variants?.nodes[0].id : item?.variants[0]?.admin_graphql_api_id;
    console.log(variantId)
    setLoadingProductId(variantId);
    await addToCart(variantId, quantity);
    Toast.show(`${quantity} item${quantity !== 1 ? 's' : ''} added to cart`);
    setLoadingProductId(null);
  };

  return (
    <KeyboardAvoidingView
      style={[flex]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground style={[styles.container]} source={BACKGROUND_IMAGE}>
        <Header backIcon={true} text={route.params?.from} navigation={navigation} />
        {
          route.params?.from === ORDERS &&
          (ordersList && ordersList.length > 0 ?
            <View style={[styles.detailsBox]}>
              <FlatList
                data={ordersList}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  console.log("response.data.orders", ordersList);
                  return (
                    <View style={{ padding: spacings.large }}>
                      {/* <Text style={styles.itemText}>Order ID: {item.id}</Text>
                    <Text style={styles.itemText}>Order Total: {item.total ? item.total : item.total_price}</Text> */}
                      {item?.line_items?.map((Item, index) => {
                        return (
                          <View key={index} style={{ marginVertical: 10, padding: spacings.large, borderWidth: 1, width: "100%", borderRadius: 10 }}>
                            <View style={[flexDirectionRow]}>
                              <View style={{ width: "25%" }}>
                                <Text style={styles.itemText}>Order ID</Text>
                              </View>
                              <View style={{ width: "10%" }}>
                                <Text style={styles.itemText}>:</Text>
                              </View>
                              <View style={{ width: "75%" }}>
                                <Text style={styles.itemText}>{item.id}</Text>
                              </View>
                            </View>
                            <View style={[flexDirectionRow]}>
                              <View style={{ width: "25%" }}>
                                <Text style={styles.itemText}>Name</Text>
                              </View>
                              <View style={{ width: "10%" }}>
                                <Text style={styles.itemText}>:</Text>
                              </View>
                              <View style={{ width: "71%" }}>
                                <Text style={styles.itemText}>{Item.title}</Text>
                              </View>
                            </View>
                            <View style={[flexDirectionRow]}>
                              <View style={{ width: "25%" }}>
                                <Text style={styles.itemText}>Variant</Text>
                              </View>
                              <View style={{ width: "10%" }}>
                                <Text style={styles.itemText}>:</Text>
                              </View>
                              <View style={{ width: "75%" }}>
                                <Text style={styles.itemText}>{Item?.variant_title}</Text>
                              </View>
                            </View>
                            <View style={[flexDirectionRow]}>
                              <View style={{ width: "25%" }}>
                                <Text style={styles.itemText}>Quantity</Text>
                              </View>
                              <View style={{ width: "10%" }}>
                                <Text style={styles.itemText}>:</Text>
                              </View>
                              <View style={{ width: "75%" }}>
                                <Text style={styles.itemText}>{Item.quantity}</Text>
                              </View>
                            </View>
                            <View style={[flexDirectionRow]}>
                              <View style={{ width: "25%" }}>
                                <Text style={styles.itemText}>Price</Text>
                              </View>
                              <View style={{ width: "10%" }}>
                                <Text style={styles.itemText}>:</Text>
                              </View>
                              <View style={{ width: "75%" }}>
                                <Text style={styles.itemText}>{Item.price}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>)
                }}
              />
            </View> :
            <View style={[styles.centeredContainer, alignJustifyCenter]}>
              <Text style={{ color: blackColor }}>No orders placed.</Text>
              <Text style={[textAlign, { color: blackColor, margin: spacings.large }]}>Your all ordered will appear here. Currently its Empty</Text>
              <Pressable style={styles.button} onPress={() => onPressContinueShopping(ORDERS)}>
                <Text style={[styles.buttonText, textAlign]}>Continue Shopping</Text>
              </Pressable>
            </View>)
        }
        {
          route.params?.from === "Saved" &&
          (wishList && wishList.length > 0 ?
            <View style={[styles.detailsBox]}>
              <FlatList
                data={wishList}
                keyExtractor={(item) => item?.id?.toString()}
                numColumns={2}
                renderItem={({ item, index }) => {
                  const imageUrl = item?.images?.edges?.[0]?.node?.url ?? item?.images?.nodes?.[0]?.url ?? item?.images?.[0]?.src;
                  const itemPrice = item?.variants?.edges?.[0]?.node?.price?.amount ?? item?.variants?.nodes?.[0]?.price ?? item?.variants?.[0]?.price;
                  const itemCurrencyCode = item?.variants?.edges?.[0]?.node?.price?.currencyCode ?? null;
                  const inventoryQuantity = item?.variants?.nodes ? item?.variants?.nodes[0]?.inventoryQuantity : (item?.variants?.[0]?.inventory_quantity ? item?.variants?.[0]?.inventory_quantity : (Array.isArray(item?.inventoryQuantity) ? item?.inventoryQuantity[0] : item?.inventoryQuantity));
                  const variantId = item?.variants?.edges ? item?.variants.edges[0]?.node.id : item.variants.nodes ? item.variants.nodes[0].id : item.variants[0].admin_graphql_api_id;
                  console.log(item)
                  return (
                    <View style={[styles.itemContainer]}>
                      <Pressable style={[positionAbsolute, alignJustifyCenter, styles.favButton]} onPress={() => handlePress(item)}>
                        <AntDesign
                          name={"heart"}
                          size={20}
                          color={redColor}
                        />
                      </Pressable>
                      <Image
                        source={{ uri: imageUrl }}
                        style={[styles.productImage, resizeModeContain]}
                      />
                      <View style={{ width: "100%", height: hp(7),alignItems:"center",justifyContent:"center"}}>
                        <Text style={[styles.wishListItemName,textAlign]}>{item?.title}</Text>
                        {itemPrice && <Text style={[styles.wishListItemPrice,textAlign]}>{itemPrice} <Text style={[styles.wishListItemPrice]}>{itemCurrencyCode}</Text></Text>}
                      </View>
                      <View style={[{ width: "100%", flexDirection: "row", paddingTop:spacings.large }, alignJustifyCenter]}>
                        {inventoryQuantity <= 0 ? <Pressable
                          style={[styles.addtocartButton, borderRadius10, alignJustifyCenter]}
                        >
                          <Text style={styles.addToCartButtonText}>Out of stock</Text>
                        </Pressable>
                          : <Pressable
                            style={[styles.addtocartButton, borderRadius10, alignJustifyCenter]}
                            onPress={() => addToCartProduct(item, 1)}
                          >
                            {loadingProductId === variantId ? <ActivityIndicator size="small" color={whiteColor} /> :
                              <Text style={styles.addToCartButtonText}>Add To Cart</Text>}
                          </Pressable>}
                      </View>
                    </View>
                  );
                }}
              />
            </View> :
            <View style={[styles.centeredContainer, alignJustifyCenter, { width: wp(80), alignSelf: "center" }]}>
              <View>
                <AntDesign
                  name={"hearto"}
                  size={50}
                  color={mediumGray}
                />
              </View>
              <Text style={{ color: blackColor, fontSize: style.fontSizeLarge.fontSize }}>No Saved found.</Text>
              <Text style={{ color: mediumGray, textAlign: "center" }}>You don’t have any saved items. Go to home and add some.</Text>
            </View>)
        }
        {
          route.params?.from === SHIPPING_ADDRESS &&
          (customerAddresses && customerAddresses.length > 0 ? <View style={[styles.centeredContainer]}>
            <Text style={[styles.itemText, { marginVertical: spacings.normal }]}>Saved Address</Text>
            <FlatList
              data={customerAddresses}
              keyExtractor={(item) => item?.id.toString()}
              renderItem={({ item }) => {
                const isSelected = defaultAddressId === item?.id;
                return (
                  <Pressable style={[{ padding: spacings.large, borderWidth: 1, width: "100%", borderRadius: 10, marginVertical: 5 }, flexDirectionRow]}
                    onPress={() => [setSelectedAddressId(item.id), setDefaultAddress(item?.id)]}>
                    <View style={[{ width: "15%" }, alignJustifyCenter]}>
                      <Ionicons
                        name={"location"}
                        size={30}
                        color={redColor}
                      />
                    </View>
                    <View style={{ width: "75%" }}>
                      {item.name && <View style={[flexDirectionRow]}>
                        <View style={{ width: "25%" }}>
                          <Text style={styles.additemText}>Name</Text>
                        </View>
                        <View style={{ width: "10%" }}>
                          <Text style={styles.additemText}>:</Text>
                        </View>
                        <View style={{ width: "50%" }}>
                          <Text style={styles.additemText}>{item.name}</Text>
                        </View>
                      </View>}
                      {item.phone && <View style={[flexDirectionRow]}>
                        <View style={{ width: "25%" }}>
                          <Text style={styles.additemText}>Phone</Text>
                        </View>
                        <View style={{ width: "10%" }}>
                          <Text style={styles.additemText}>:</Text>
                        </View>
                        <View style={{ width: "50%" }}>
                          <Text style={styles.additemText}>{item.phone}</Text>
                        </View>
                      </View>}
                      <View style={[flexDirectionRow]}>
                        <View style={{ width: "25%" }}>
                          <Text style={styles.additemText}>Address</Text>
                        </View>
                        <View style={{ width: "10%" }}>
                          <Text style={styles.additemText}>:</Text>
                        </View>
                        <View style={{ width: "65%" }}>
                          <Text style={styles.additemText}>{`${item.address1}, ${item.city}, ${item.province}, ${item.country}-${item.zip}`}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={[{ width: "10%" }, alignJustifyCenter]}>
                      <Fontisto
                        name={isSelected ? "radio-btn-active" : "radio-btn-passive"}
                        size={20}
                        color={redColor}
                      />
                    </View>
                  </Pressable>
                );
              }}
            />
            <Pressable style={[styles.addAddressButtonRounded, positionAbsolute, alignJustifyCenter]} onPress={onPressAddAddress}>
              <AntDesign name={"plus"} size={28} color={whiteColor} />
            </Pressable>
          </View> :
            <View style={[styles.centeredContainer, alignJustifyCenter]}>
              <Text style={{ color: blackColor }}>No address found.</Text>
              <Pressable style={styles.button} onPress={() => onPressContinueShopping(SHIPPING_ADDRESS)}>
                <Text style={[styles.buttonText, textAlign]}>Continue Shopping</Text>
              </Pressable>
              <Pressable style={[styles.addAddressButtonRounded, positionAbsolute, alignJustifyCenter]} onPress={onPressAddAddress}>
                <AntDesign name={"plus"} size={28} color={whiteColor} />
              </Pressable>
            </View>)
        }
        {modalVisible && <AddAddressModal visible={modalVisible} onClose={() => setModalVisible(false)} />}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
    width: wp(100),
    height: hp(100)
  },
  centeredContainer: {
    width: wp(100),
    height: hp(90),
    padding: spacings.large,
  },
  itemContainer: {
    padding: spacings.large,
    margin: spacings.large,
    width: wp(43),
    borderColor: 'transparent',
    backgroundColor: whiteColor,
    borderWidth: .1,
    borderRadius: 10,
    shadowColor: grayColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,

    elevation: 1.5,
  },
  itemText: {
    fontSize: style.fontSizeMedium.fontSize,
    color: blackColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },
  wishListItemName: {
    color: blackColor,
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },
  wishListItemPrice: {
    fontSize: style.fontSizeSmall1x.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    // fontWeight: style.fontWeightMedium1x.fontWeight,
    color: blackColor,
    fontFamily: 'GeneralSans-Variable'
  },
  button: {
    marginTop: spacings.medium,
    padding: spacings.medium,
    backgroundColor: redColor,
    borderRadius: 5,
  },
  buttonText: {
    color: whiteColor,
  },
  addAddressButtonRounded: {
    bottom: 50,
    right: 20,
    width: wp(15),
    height: hp(7.5),
    backgroundColor: redColor,
    borderRadius: 50
  },
  addAddressButton: {
    bottom: 50,
    // right: 20,
    width: "100%",
    height: hp(6),
    // backgroundColor: redColor,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: "center"
  },
  detailsBox: {
    width: wp(100),
    height: hp(87),
    padding: spacings.large
  },
  productImage: {
    width: "70%",
    height: hp(12),
    borderRadius: 10,
    alignSelf: "center",
    marginVertical: spacings.large
  },
  favButton: {
    width: wp(10),
    height: wp(10),
    right: 2,
    top: 2,
    zIndex: 10,
  },
  additemText: {
    fontSize: style.fontSizeNormal.fontSize,
    color: blackColor,
    // fontWeight: style.fontWeightThin1x.fontWeight,
  },
  addToCartButtonText: {
    fontSize: style.fontSizeNormal.fontSize,
    lineHeight: 20,
    color: whiteColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
  },
  addtocartButton: {
    fontSize: style.fontSizeExtraExtraSmall.fontSize,
    // marginVertical: spacings.large,
    width: "68%",
    backgroundColor: redColor,
    padding: spacings.normal,
    // paddingHorizontal: spacings.large

  },
});

export default UserDashboardScreen;