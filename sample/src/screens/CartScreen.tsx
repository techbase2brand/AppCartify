import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Text, Image, ActivityIndicator, Pressable, RefreshControl, TouchableOpacity, ImageBackground } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import useShopify from '../hooks/useShopify';
import type { CartItem, CartLineItem } from '../../@types';
import { Colors, useTheme } from '../context/Theme';
import { useCart } from '../context/Cart';
import Toast from 'react-native-simple-toast';
import { blackColor, redColor, whiteColor, lightShadeBlue, mediumGray } from '../constants/Color'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { SUBTOTAL, YOUR_CART_IS_EMPTY, AN_ERROR_OCCURED, LOADING_CART, TOTAL, TAXES, QUNATITY, CHECKOUT } from '../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeProductFromCart, removeProductInCart } from '../redux/actions/cartActions';
import { BACKGROUND_IMAGE } from '../assests/images'
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import Header from '../components/Header'
const { flex, alignJustifyCenter, flexDirectionRow, resizeModeCover, justifyContentSpaceBetween, borderRadius10, borderWidth1, borderRadius5, textAlign, alignItemsFlexEnd } = BaseStyle;

function CartScreen({ navigation }: { navigation: any }): React.JSX.Element {
  const ShopifyCheckout = useShopifyCheckoutSheet();
  const [refreshing, setRefreshing] = React.useState(false);
  const { cartId, checkoutURL, totalQuantity, removeFromCart, addingToCart, addToCart, removeOneFromCart } = useCart();
  const { queries } = useShopify();
  const [fetchCart, { data, loading, error }] = queries.cart;
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const dispatch = useDispatch();
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    if (cartId) {
      fetchCart({
        variables: {
          cartId,
        },
      });
      console.log("inside if Cart ID:", cartId);
    }
    console.log("Cart ID:", cartId);
  }, [fetchCart, cartId]);

  useEffect(() => {
    logEvent('CartScreen');
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCart({
      variables: {
        cartId,
      },
    }).then(() => setRefreshing(false));
  }, [cartId, fetchCart]);

  // const presentCheckout = async () => {
  //   logEvent('Click CheckOut ');
  //   if (checkoutURL) {
  //     ShopifyCheckout.present(checkoutURL);
  //     logEvent('Open CheckOut ');
  //   }
  // };

  const presentCheckout = async () => {
    logEvent('Click CheckOut ');

    // Check if the user is logged in
    if (!userLoggedIn) {
      // Navigate to the AuthStack if the user is not logged in
      navigation.navigate("AuthStack");
      Toast.show("Please First complete the registration process")
    } else {
      // Check if the checkout URL exists
      if (checkoutURL) {
        // Present the checkout using ShopifyCheckout
        ShopifyCheckout.present(checkoutURL);
        logEvent('Open CheckOut ');
      } else {
        // Log or handle the case where the checkout URL is not available
        console.log('Checkout URL is not available');
      }
    }
  };

  const onPressContinueShopping = () => {
    logEvent(`Press Continue Shopping Button in Cart Screen`);
    navigation.navigate('HomeScreen')
  }

  if (error) {
    console.error("Error fetching cart:", error);
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex]}>
        <Text style={styles.loadingText}>
          {AN_ERROR_OCCURED}
        </Text>
        <Text style={styles.loadingText}>
          {error?.name} {error?.message}
        </Text>
      </ImageBackground>
    );
  }

  if (loading) {
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex]}>
        <Header
          backIcon={true}
          navigation={navigation}
          text={"Cart"} />
        <View style={[flex, alignJustifyCenter]}>
          <ActivityIndicator size="small" />
          <Text style={styles.loadingText}>{LOADING_CART}</Text>
        </View>
      </ImageBackground>
    );
  }

  if (!data || !data.cart || data?.cart?.lines?.edges?.length === 0 || !cartId) {
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex]}>
        <Header
          backIcon={true}
          navigation={navigation}
          text={"Cart"} />
        <View style={[flex, alignJustifyCenter]}>
          <Icon name="shopping-bag" size={60} color={lightShadeBlue} />
          <Text style={styles.loadingText}>{YOUR_CART_IS_EMPTY}</Text>
          <TouchableOpacity style={[styles.addToCartButton, borderRadius10]} onPress={onPressContinueShopping}>
            <Text style={[styles.costBlockTextStrong, textAlign, { color: whiteColor }]}>
              Go to Shopping
            </Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    );
  }

  const handleRemoveToCart = (variantId: string,) => {
    removeFromCart(variantId);
    dispatch(removeProductFromCart(variantId));
    // dispatch(removeProductInCart(variantId));
    Toast.show('Item removed from cart')
    logEvent(`Item removed from cart variantId:${variantId} `);
  };
  const handleadddToCart = async (id: string, quantity: number) => {

    await addToCart(id, quantity);
    Toast.show('Item added to cart')
  };

  const handleRemoveOneFromCart = async (variantId: string, quantity: number) => {
    console.log(variantId,quantity)
    await removeOneFromCart(variantId,quantity);
    dispatch(removeProductFromCart(variantId, quantity));
    // dispatch(removeProductInCart(variantId));
    Toast.show('Item removed from cart')

  };

  const getTotalAmount = () => {
    let totalAmount = 0;
    let currencyCode = '';
    if (data?.cart?.lines?.edges && data?.cart?.lines?.edges?.length > 0) {
      currencyCode = data?.cart?.lines?.edges[0]?.node?.merchandise?.price?.currencyCode;
      data?.cart?.lines?.edges.forEach(({ node }) => {
        const itemPrice = parseFloat(node?.merchandise?.price?.amount);
        const itemQuantity = node?.quantity;
        const itemTotal = itemPrice * itemQuantity;
        totalAmount += itemTotal;
      });
    }
    return { totalAmount: totalAmount?.toFixed(2), currencyCode };
  };

  const addValues = (value1: any, value2: any) => {
    if (isNaN(value1) || isNaN(value2)) {
      return '--';
    }
    return value1 + value2;
  }

  const totalAmount = parseFloat(getTotalAmount()?.totalAmount);
  const taxAmount = data?.cart?.cost?.totalTaxAmount ? parseFloat(price(data?.cart?.cost?.totalTaxAmount)) : 0;
  const sum = addValues(totalAmount, taxAmount);
  return (
    <ImageBackground style={[flex]} source={BACKGROUND_IMAGE}>
      <SafeAreaView>
        <Header
          backIcon={true}
          navigation={navigation}
          text={"Cart"} />
        <View style={{ height: hp(80) }}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={styles.productList}>
              {data?.cart?.lines?.edges.map(({ node }) => (
                <CartItem
                  key={node?.merchandise?.id}
                  item={node}
                  quantity={node?.quantity}
                  loading={addingToCart?.has(node?.id)}
                  onRemove={(variantId) => handleRemoveToCart(variantId)}
                  onAddCartItem={(variantId, qty) => handleadddToCart(variantId, qty)}
                  onHandleRemoveOneFromCart={(variantId, qty) => handleRemoveOneFromCart(variantId, qty)}
                />
              ))}
              {/*
            {((data?.cart?.lines) ? (data?.cart?.lines?.edges) : cartItemsFromRedux).map((item) => {
              const node = data?.cart?.lines ? item.node : item;
              return (
                <CartItem
                  key={node?.merchandise?.id}
                  item={node}
                  quantity={node?.quantity}
                  loading={addingToCart?.has(node?.id)}
                  onRemove={(variantId) => handleRemoveToCart(variantId)}
                />
              );
            })} */}
            </View>
            <View style={styles.costContainer}>
              <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow]}>
                <Text style={styles.costBlockText}>{SUBTOTAL}</Text>
                <Text style={[styles.costBlockText, { color: blackColor }]}>
                  {/* {price(data.cart.cost.subtotalAmount)} */}
                  {getTotalAmount().totalAmount} {getTotalAmount().currencyCode}
                </Text>
              </View>

              <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow]}>
                <Text style={styles.costBlockText}>{TAXES}</Text>
                <Text style={[styles.costBlockText, { color: blackColor }]}>
                  {price(data?.cart?.cost?.totalTaxAmount)}
                </Text>
              </View>

              <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacings.large }]}>
                <Text style={styles.costBlockTextStrong}>{TOTAL}</Text>
                <Text style={styles.costBlockTextStrong}>
                  {/* {price(data.cart.cost.totalAmount)} */}
                  {sum.toFixed(2)} {getTotalAmount().currencyCode}
                </Text>
              </View>
              <Text style={{
                fontSize: style.fontSizeNormal1x.fontSize,
                marginVertical: spacings.Large2x,
                fontWeight: style.fontWeightThin1x.fontWeight,
                lineHeight: 20,
                color: blackColor,
              }}>Note : Shipping will be calculated at checkout.</Text>

            </View>
          </ScrollView>
        </View>
        {totalQuantity > 0 && (
          <Pressable
            style={[styles.cartButton, borderRadius10, alignJustifyCenter]}
            disabled={totalQuantity === 0}
            onPress={presentCheckout}>
            <Text style={[styles.cartButtonText, textAlign]}>{CHECKOUT}</Text>
            {/* <Text style={[styles.cartButtonTextSubtitle, textAlign]}>
                {totalQuantity} {totalQuantity === 1 ? 'item' : 'items'} -{' '}
                {sum} {getTotalAmount().currencyCode}
              </Text> */}
          </Pressable>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

function price(value: { amount: string; currencyCode: string }) {
  if (!value) {
    return '-';
  }

  const { amount, currencyCode } = value;
  // return currency(amount, currencyCode);
  return `${amount} ${currencyCode}`;
}

function CartItem({
  item,
  quantity,
  onRemove,
  loading,
  onAddCartItem,
  onHandleRemoveOneFromCart
}: {
  item: CartLineItem;
  quantity: number;
  loading?: boolean;
  onRemove: (variantId: string, quantityToRemove: number) => void;
  onAddCartItem: (variantId: string, qty: number) => void;
  onHandleRemoveOneFromCart: (variantId: string, quantityToRemove: number) => void;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [productquantity, setProductQuantity] = useState(quantity);
  const handleRemoveItem = () => {
    onRemove(item.id);
  };
  const incrementQuantity = () => {
    logEvent('Increase Product Quantity');
    setProductQuantity(productquantity + 1);
    onAddCartItem(item.merchandise.id, 1);
  };

  const decrementQuantity = () => {
    logEvent('Decrease Product Quantity');
    if (productquantity > 1) {
      setProductQuantity(productquantity - 1);
      onHandleRemoveOneFromCart(item.merchandise.id, productquantity - 1);
    } else {
      handleRemoveItem();
    }
  };
  // console.log(item)
  return (
    <View
      key={item?.id}
      style={{
        ...styles.productItem,
        ...(loading ? styles.productItemLoading : {}),
        borderWidth: 1, borderColor: mediumGray,
      }}>
      <Image
        resizeMethod="resize"
        style={[styles.productImage, resizeModeCover, borderRadius5]}
        alt={item?.merchandise?.image?.altText}
        source={{ uri: item?.merchandise?.image?.url }}
      />
      <View style={[styles.productText, flex, alignJustifyCenter, flexDirectionRow]}>
        <View style={[flex]}>
          <Text style={styles.productTitle}>
            {item?.merchandise?.product?.title}
          </Text>
          <Text style={[styles.productPrice]}>
            {/* {price(item.cost?.totalAmount)} */}
            {price(item?.merchandise?.price)}
            {/* {itemPrice} */}
          </Text>
          {/* <Text style={styles.productDescription}>{QUNATITY}: {quantity}</Text> */}
        </View>
        <View>
          <Pressable style={[styles.removeButton, alignItemsFlexEnd]} onPress={handleRemoveItem}>
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (
              // <Text style={styles.removeButtonText}>{REMOVE}</Text>
              <AntDesign
                name={"delete"}
                size={18}
                color={redColor}
              />
            )}
          </Pressable>
          <Text style={styles.productDescription}>{QUNATITY}: {quantity}</Text>
          <View style={[styles.quantityContainer, borderWidth1]}>
            <TouchableOpacity onPress={decrementQuantity}>
              <Text style={styles.quantityButton}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{productquantity}</Text>
            <TouchableOpacity onPress={incrementQuantity}>
              <Text style={styles.quantityButton}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: Colors) {
  return StyleSheet.create({
    loading: {
      padding: 2,
    },
    loadingText: {
      marginVertical: spacings.Large2x,
      color: colors.text,
    },
    scrollView: {
      paddingBottom: spacings.xLarge,
      // backgroundColor: whiteColor,
    },
    cartButton: {
      width: 'auto',
      // bottom: spacings.large,
      height: hp(6),
      left: 0,
      right: 0,
      marginHorizontal: spacings.large,
      padding: spacings.large,
      backgroundColor: redColor,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    cartButtonText: {
      fontSize: style.fontSizeMedium.fontSize,
      lineHeight: 20,
      color: colors.secondaryText,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    cartButtonTextSubtitle: {
      fontSize: style.fontSizeSmall2x.fontSize,
      color: colors.textSubdued,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    productList: {
      marginVertical: spacings.xLarge,
      paddingHorizontal: spacings.xLarge,
    },
    productItem: {
      display: 'flex',
      flexDirection: 'row',
      marginBottom: spacings.large,
      padding: spacings.large,
      backgroundColor: whiteColor,
      borderRadius: 5,
    },
    productItemLoading: {
      opacity: 0.6,
    },
    productText: {
      paddingLeft: 10,
      display: 'flex',
      color: colors.textSubdued
    },
    productTitle: {
      fontSize: style.fontSizeNormal1x.fontSize,
      marginBottom: spacings.small2x,
      fontWeight: style.fontWeightThin1x.fontWeight,
      lineHeight: 20,
      color: blackColor,
    },
    productDescription: {
      fontSize: style.fontSizeNormal.fontSize,
      color: colors.textSubdued,
      padding: spacings.xLarge
    },
    productPrice: {
      fontSize: style.fontSizeNormal.fontSize,
      // padding: spacings.xLarge,
      fontWeight: style.fontWeightThin1x.fontWeight,
      color: blackColor,
    },
    removeButton: {
      marginRight: spacings.xLarge,
      marginTop: spacings.xSmall,
      padding: spacings.large,
    },
    removeButtonText: {
      color: colors.textSubdued,
    },
    productImage: {
      width: wp(13),
      height: hp(10),
    },
    costContainer: {
      marginBottom: spacings.xLarge,
      marginHorizontal: spacings.Large1x,
      paddingTop: spacings.xLarge,
      paddingBottom: hp(10),
      paddingHorizontal: spacings.xsmall,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    costBlock: {
      display: 'flex',
      padding: spacings.small2x,
    },
    costBlockText: {
      fontSize: style.fontSizeNormal.fontSize,
      color: colors.textSubdued,
    },
    costBlockTextStrong: {
      fontSize: style.fontSizeNormal2x.fontSize,
      color: colors.text,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    addToCartButton: {
      fontSize: style.fontSizeExtraExtraSmall.fontSize,
      backgroundColor: redColor,
      paddingVertical: spacings.large,
      paddingHorizontal: spacings.xxxxLarge
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: wp(20),
      backgroundColor: whiteColor,
      paddingHorizontal: 9,
      paddingVertical: 2,
      justifyContent: "center",
      borderRadius: 10,
      borderColor: redColor,
    },
    quantityButton: {
      paddingHorizontal: 8,
      // paddingVertical: 5,
      borderRadius: 5,
      color: redColor,
      fontSize: 16,
      fontWeight: 'bold',
    },
    quantity: {
      paddingHorizontal: 12,
      paddingVertical: 2,
      fontSize: 16,
      fontWeight: 'bold',
      color: redColor,
    },
  });
}

export default CartScreen;
