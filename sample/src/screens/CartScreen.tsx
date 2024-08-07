import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, View, StyleSheet, Text, Image, ActivityIndicator, Pressable, RefreshControl, TouchableOpacity, ImageBackground, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Entypo';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import useShopify from '../hooks/useShopify';
import type { CartItem, CartLineItem } from '../../@types';
import { Colors, useTheme } from '../context/Theme';
import { useCart } from '../context/Cart';
import Toast from 'react-native-simple-toast';
import { blackColor, redColor, whiteColor, lightShadeBlue, mediumGray, grayColor } from '../constants/Color'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import {
  SUBTOTAL, YOUR_CART_IS_EMPTY, AN_ERROR_OCCURED, LOADING_CART, TOTAL, TAXES, QUNATITY, CHECKOUT, STOREFRONT_DOMAIN, STOREFRONT_ACCESS_TOKEN,
  ADMINAPI_ACCESS_TOKEN, YOU_MIGHT_LIKE, LOADER_NAME
} from '../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
import { useDispatch, useSelector } from 'react-redux';
import { removeProductFromCart, removeProductInCart } from '../redux/actions/cartActions';
import { BACKGROUND_IMAGE } from '../assests/images'
import AntDesign from 'react-native-vector-icons/dist/AntDesign';
import Header from '../components/Header';
import { useThemes } from '../context/ThemeContext';
import { lightColors, darkColors } from '../constants/Color';
import axios from 'axios';
import LoaderKit from 'react-native-loader-kit'
import { addToWishlist, removeFromWishlist } from '../redux/actions/wishListActions';
const { flex, alignJustifyCenter, flexDirectionRow, resizeModeCover, justifyContentSpaceBetween, borderRadius10, alignItemsCenter, borderRadius5, textAlign, alignItemsFlexEnd, resizeModeContain } = BaseStyle;

function CartScreen({ navigation }: { navigation: any }): React.JSX.Element {
  const { isDarkMode } = useThemes();
  const themecolors = isDarkMode ? darkColors : lightColors;
  const ShopifyCheckout = useShopifyCheckoutSheet();
  const [refreshing, setRefreshing] = React.useState(false);
  const { cartId, checkoutURL, totalQuantity, removeFromCart, addingToCart, addToCart, removeOneFromCart } = useCart();
  const { queries } = useShopify();
  const [fetchCart, { data, loading, error }] = queries.cart;
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const dispatch = useDispatch();
  const userLoggedIn = useSelector(state => state.auth.isAuthenticated);
  const [upSellingproducts, setUpSellingProducts] = useState([]);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const wishList = useSelector(state => state.wishlist.wishlist);

  useEffect(() => {
    if (cartId) {
      fetchCart({
        variables: {
          cartId,
        },
      });
    }
  }, [fetchCart, cartId]);

  const fetchCartDetail = async () => {
    // console.log("cartId", cartId);
    try {
      const response = await axios.post(`https://${STOREFRONT_DOMAIN}/api/2024-01/graphql.json`, {
        query: `
          {
            cart(id: "${cartId}") {
              id
              lines(first: 10) {
                edges {
                  node {
                    id
                    merchandise {
                      ... on ProductVariant {
                        product {
                          id
                        }
                      }
                    }
                    quantity
                  }
                }
              }
            }
          }
        `
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
        }
      });

      const productIds = response.data?.data?.cart?.lines?.edges.map(edge => {
        const fullId = edge.node.merchandise?.product?.id || '';
        // Extract numeric part from the Shopify ID
        return fullId.split('/').pop();
      }) || [];
      // console.log("Product IDs:", productIds);
      if (productIds) {
        fetchProductMetafields(productIds)
      }
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  const fetchProductMetafields = async (productID: any) => {
    axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-07/products/${productID}/metafields.json`, {
      headers: {
        'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    })
      .then(async response => {
        // console.log("Response:", response.data.metafields[0].value);
        const metafieldValues = response.data.metafields[0]?.value ? JSON.parse(response.data.metafields[0].value) : [];
        const products = await fetchProductsFromStore();
        // Filter products based on metafield values
        const matchingProducts = products.filter(product =>
          metafieldValues.includes(product.id)
        );

        // Set the state with matching products
        console.log("matchingProducts", matchingProducts)
        setUpSellingProducts(matchingProducts)
      })
      .catch(error => {
        console.error('Error fetching metafields:', error);
      });
  };

  // const fetchProductsFromStore = async () => {
  //   const myHeaders = new Headers();
  //   myHeaders.append("Content-Type", "application/json");
  //   myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);

  //   const graphql = JSON.stringify({
  //     query: `query getProducts {
  //       products(first: 250) {
  //         edges {
  //           node {
  //             id
  //             title
  //             tags
  //             options(first:250) {
  //               id
  //               name
  //               values
  //             }
  //             images(first: 250) {
  //              edges {
  //                node {
  //                  id
  //                  src
  //                 }
  //               }
  //             }
  //             variants(first: 250) {
  //               nodes {
  //                 id
  //                 title
  //                 inventoryQuantity
  //                 price
  //               }
  //             }
  //           }
  //         }
  //       }
  //     }`,
  //     variables: {}
  //   });

  //   const requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: graphql,
  //     redirect: "follow"
  //   };

  //   try {
  //     const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions);
  //     const result = await response.json();

  //     // Extract products from the result
  //     console.log(result)
  //     const products = result?.data?.products?.edges.map(edge => {
  //       const product = edge.node;
  //       // Extract inventory quantities
  //       const inventoryQuantities = product.variants.nodes.map(variant => variant.inventoryQuantity);
  //       const imageUrls = product.images.edges.map(imageEdge => imageEdge.node.src);
  //       const price = product.variants.nodes.map(variant => variant.price);
  //       const variantId = product.variants.nodes.map(variant => variant.id);
  //       return {
  //         id: product.id,
  //         title: product.title,
  //         inventoryQuantities,
  //         imageUrls,
  //         price,
  //         variantId
  //       };
  //     });
  //     // console.log(products)
  //     return products;

  //   } catch (error) {
  //     console.error('Error fetching products:', error);
  //     return [];
  //   }
  // };

  const fetchProductsFromStore = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);

    const graphqlQuery = (cursor = '') => JSON.stringify({
      query: `query getProducts($cursor: String) {
        products(first: 250, after: $cursor) {
          edges {
            node {
              id
              title
              tags
              options(first: 250) {
                id
                name
                values
              }
              images(first: 250) {
                edges {
                  node {
                    id
                    src
                  }
                }
              }
              variants(first: 250) {
                nodes {
                  id
                  title
                  inventoryQuantity
                  price
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      variables: {
        cursor
      }
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      redirect: "follow"
    };

    try {
      let hasNextPage = true;
      let endCursor = null;
      const allProducts = [];

      while (hasNextPage) {
        const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, {
          ...requestOptions,
          body: graphqlQuery(endCursor)
        });

        const result = await response.json();

        // Check if there's an error in the response
        if (result.errors) {
          console.error('GraphQL errors:', result.errors);
          return [];
        }

        // Extract products from the result
        const products = result?.data?.products?.edges.map(edge => {
          const product = edge.node;
          // Extract inventory quantities
          const inventoryQuantities = product.variants.nodes.map(variant => variant.inventoryQuantity);
          const imageUrls = product.images.edges.map(imageEdge => imageEdge.node.src);
          const price = product.variants.nodes.map(variant => variant.price);
          const variantId = product.variants.nodes.map(variant => variant.id);
          return {
            id: product.id,
            title: product.title,
            inventoryQuantities,
            imageUrls,
            price,
            variantId
          };
        });

        allProducts.push(...products);

        // Update pagination info
        hasNextPage = result?.data?.products?.pageInfo?.hasNextPage;
        endCursor = result?.data?.products?.pageInfo?.endCursor;
      }

      return allProducts;

    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  useEffect(() => {
    logEvent('CartScreen');
    fetchCartDetail();
  }, [])

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCart({
      variables: {
        cartId,
      },
    }).then(() => setRefreshing(false));
  }, [cartId, fetchCart]);

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
      <ImageBackground source={isDarkMode ? "" : BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
        <Text style={[styles.loadingText, { color: themecolors.blackColor }]}>
          {AN_ERROR_OCCURED}
        </Text>
        <Text style={[styles.loadingText, { color: themecolors.blackColor }]}>
          {error?.name} {error?.message}
        </Text>
      </ImageBackground>
    );
  }

  if (loading) {
    return (
      <ImageBackground source={isDarkMode ? "" : BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
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
      <ImageBackground source={isDarkMode ? "" : BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
        <Header
          backIcon={true}
          navigation={navigation}
          text={"Cart"} />
        <View style={[flex, alignJustifyCenter]}>
          <Icon name="shopping-bag" size={60} color={themecolors.lightShadeBlue} />
          <Text style={[styles.loadingText, { color: themecolors.blackColor }]}>{YOUR_CART_IS_EMPTY}</Text>
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

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 4) {
      return words.slice(0, 4).join(' ') + '...';
    }
    return text;
  };

  const totalAmount = parseFloat(getTotalAmount()?.totalAmount);
  const taxAmount = data?.cart?.cost?.totalTaxAmount ? parseFloat(price(data?.cart?.cost?.totalTaxAmount)) : 0;
  const sum = addValues(totalAmount, taxAmount);

  const onAddToCartRelatedProduct = async (variantId, quantity) => {
    console.log("variantid", variantId, quantity)
    setLoadingProductId(variantId);
    await addToCart(variantId, quantity)
    setLoadingProductId(null);
  };

  const getIsFavSelected = (productId) => {
    const isFav = wishList.some(item => item?.id === productId);
    return isFav;
  }

  const handlePress = (item) => {
    // console.log("handelePress", item)
    if (!getIsFavSelected(item?.id)) {
      dispatch(addToWishlist(item));
    } else {
      dispatch(removeFromWishlist(item?.id));
    }
  };
  return (
    <ImageBackground source={isDarkMode ? "" : BACKGROUND_IMAGE} style={[styles.loading, alignJustifyCenter, flex, { backgroundColor: themecolors.whiteColor }]}>
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
                />
              ))}

            </View>
            {upSellingproducts?.length != 0  && <View style={styles.relatedProductsContainer}>
              <Text style={[styles.relatedProductsTitle, { color: themecolors.blackColor }]}>{YOU_MIGHT_LIKE}</Text>
              <FlatList
                data={upSellingproducts}
                renderItem={({ item }) => {
                  const inventoryQuantity = item?.inventoryQuantities[0] || 0;
                  const isFavSelected = getIsFavSelected(item?.id);
                  return (
                    <View
                      style={[styles.relatedProductItem, alignJustifyCenter, { backgroundColor: isDarkMode ? grayColor : "transparnet" }]}
                    >
                      <View style={{ width: "100%", borderWidth: .5, borderColor: themecolors.lightGrayOpacityColor, marginBottom: spacings.small, borderRadius: 10, alignItems: "center" }}>
                        <Image
                          source={{ uri: item?.imageUrls[0] }}
                          style={[styles.relatedProductImage, borderRadius10, resizeModeContain]}
                        />
                      </View>
                      <View style={[{ width: "100%", height: hp(9) }]}>
                        <Text style={[styles.relatedproductName, { color: themecolors.blackColor }]}>{trimcateText(item?.title)}</Text>
                        <Text
                          style={[
                            styles.relatedproductPrice,
                            { paddingHorizontal: spacings.small, color: themecolors.blackColor },
                          ]}
                        >
                          ${item?.price[0]} {/* Assuming the price is the first element in the price array */}
                        </Text>
                      </View>
                      <View style={[{ width: "100%", flexDirection: "row" }, justifyContentSpaceBetween, alignItemsCenter]}>
                        {inventoryQuantity === 0 ? (
                          <Pressable
                            style={[styles.relatedAddtocartButton, borderRadius10, alignJustifyCenter]}
                          >
                            <Text style={styles.addToCartButtonText}>Out of stock</Text>
                          </Pressable>
                        ) : (
                          <Pressable
                            style={[styles.relatedAddtocartButton, borderRadius10, alignJustifyCenter]}
                            onPress={() => onAddToCartRelatedProduct(item?.variantId[0], 1)}
                            disabled={loadingProductId === item?.variantId[0]}
                          >
                            {loadingProductId === item?.variantId[0] ? (
                              <ActivityIndicator color={whiteColor} />
                            ) : (
                              <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                            )}
                          </Pressable>
                        )}
                        <TouchableOpacity style={[alignJustifyCenter, styles.relatedProductfavButton, { backgroundColor: whiteColor, borderColor: themecolors.redColor }]} onPress={() => handlePress(item)}>
                          <AntDesign
                            name={isFavSelected ? "heart" : "hearto"}
                            size={18}
                            color={redColor}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )
                }}
                horizontal
                // numColumns={2}
                keyExtractor={(index) => index?.toString()}
                showsHorizontalScrollIndicator={false}
              />
            </View> }
            {/* // :
            //   <View style={{ width: wp(100), alignItems: "center", justifyContent: "center" ,height:hp(15)}}>
            //     <LoaderKit
            //       style={{ width: 50, height: 50 }}
            //       name={LOADER_NAME}
            //       color={themecolors.blackColor}
            //     />
            //     <Text>Loading Upselling Products...</Text>
            //   </View>} */}
            <View style={styles.costContainer}>
              <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow]}>
                <Text style={styles.costBlockText}>{SUBTOTAL}</Text>
                <Text style={[styles.costBlockText, { color: themecolors.blackColor }]}>
                  {/* {price(data.cart.cost.subtotalAmount)} */}
                  {getTotalAmount().totalAmount} {getTotalAmount().currencyCode}
                </Text>
              </View>

              <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow]}>
                <Text style={styles.costBlockText}>{TAXES}</Text>
                <Text style={[styles.costBlockText, { color: themecolors.blackColor }]}>
                  {price(data?.cart?.cost?.totalTaxAmount)}
                </Text>
              </View>

              <View style={[styles.costBlock, justifyContentSpaceBetween, flexDirectionRow, { borderTopColor: colors.border, borderTopWidth: 1, marginTop: spacings.large }]}>
                <Text style={[styles.costBlockTextStrong, { color: themecolors.blackColor }]}>{TOTAL}</Text>
                <Text style={[styles.costBlockTextStrong, { color: themecolors.blackColor }]}>
                  {/* {price(data.cart.cost.totalAmount)} */}
                  {sum.toFixed(2)} {getTotalAmount().currencyCode}
                </Text>
              </View>
              <Text style={{
                fontSize: style.fontSizeNormal1x.fontSize,
                marginVertical: spacings.Large2x,
                fontWeight: style.fontWeightThin1x.fontWeight,
                lineHeight: 20,
                color: themecolors.blackColor,
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
}: {
  item: CartLineItem;
  quantity: number;
  loading?: boolean;
  onRemove: (variantId: string, quantityToRemove: number) => void;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { isDarkMode } = useThemes();
  const themecolors = isDarkMode ? darkColors : lightColors;
  const [productquantity, setProductQuantity] = useState(quantity);
  const handleRemoveItem = () => {
    onRemove(item.id);
  };

  const trimcateText = (text) => {
    const words = text.split(' ');
    if (words.length > 4) {
      return words.slice(0, 4).join(' ') + '...';
    }
    return text;
  };
  return (
    <View
      key={item?.id}
      style={{
        ...styles.productItem,
        ...(loading ? styles.productItemLoading : {}),
        borderWidth: 1, borderColor: themecolors.mediumGray, backgroundColor: isDarkMode ? grayColor : whiteColor
      }}>
      <Image
        resizeMethod="resize"
        style={[styles.productImage, resizeModeCover, borderRadius5]}
        alt={item?.merchandise?.image?.altText}
        source={{ uri: item?.merchandise?.image?.url }}
      />
      <View style={[styles.productText, flex, alignJustifyCenter, flexDirectionRow]}>
        <View style={[flex]}>
          <Text style={[styles.productTitle, { color: themecolors.blackColor }]}>
            {trimcateText(item?.merchandise?.product?.title)}
          </Text>
          <Text style={[styles.productPrice, { color: themecolors.blackColor }]}>
            {/* {price(item.cost?.totalAmount)} */}
            {price(item?.merchandise?.price)}
            {/* {itemPrice} */}
          </Text>

        </View>
        <View>
          <Pressable style={[styles.removeButton, alignItemsFlexEnd]} onPress={handleRemoveItem}>
            {loading ? (
              <ActivityIndicator size="small" />
            ) : (

              <AntDesign
                name={"delete"}
                size={18}
                color={redColor}
              />
            )}
          </Pressable>
          <Text style={[styles.productDescription, { color: themecolors.blackColor }]}>{QUNATITY}: {quantity}</Text>

        </View>
      </View>
    </View >
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
      width: wp(22),
      backgroundColor: whiteColor,
      paddingHorizontal: 9,
      paddingVertical: 2,
      justifyContent: "center",
      borderRadius: 5,
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
    relatedProductsContainer: {
      width: "100%",
      marginTop: spacings.xLarge,
    },
    relatedProductsTitle: {
      fontSize: style.fontSizeLarge.fontSize,
      fontWeight: style.fontWeightMedium.fontWeight,
      color: blackColor,
      paddingHorizontal: spacings.large
    },
    relatedProductItem: {
      width: wp(40),
      margin: spacings.small,
      padding: spacings.large,
      borderRadius: 5
    },
    relatedProductImage: {
      width: wp(30),
      height: wp(30),
      marginVertical: spacings.large,
    },
    relatedproductName: {
      fontSize: style.fontSizeSmall2x.fontSize, fontWeight: style.fontWeightThin1x.fontWeight,
    },
    relatedproductPrice: {
      fontSize: style.fontSizeSmall1x.fontSize,
      fontWeight: style.fontWeightThin1x.fontWeight,
      fontFamily: 'GeneralSans-Variable'
    },
    relatedAddtocartButton: {
      fontSize: style.fontSizeExtraExtraSmall.fontSize,
      width: "68%",
      backgroundColor: redColor,
      padding: spacings.normal,
    },
    addToCartButtonText: {
      fontSize: style.fontSizeNormal.fontSize,
      lineHeight: 20,
      color: whiteColor,
      fontWeight: style.fontWeightThin1x.fontWeight,
    },
    relatedProductfavButton: {
      width: wp(10),
      height: hp(3.8),
      right: 0,
      zIndex: 10,
      borderWidth: 1,
      borderRadius: 10,
    },
  });
}

export default CartScreen;
