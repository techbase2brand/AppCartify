import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Text, KeyboardAvoidingView, FlatList, Keyboard, TouchableOpacity, Image, Pressable, ImageBackground, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from './../utils';
import { blackColor, grayColor, whiteColor, lightGrayOpacityColor, mediumGray } from '../constants/Color'
import {
  POPULAR, BEST_DEALS_OF_THE_WEEK, POPULAR_LIQUOR, BEER, CAN, NON_LOW_ALCOHOL, SEARCH_FOR_DRINK, getAdminAccessToken, getStoreDomain, getBestDealOfWeek
  , STOREFRONT_DOMAIN, ADMINAPI_ACCESS_TOKEN, BEST_DEALS_OF_THE_WEEK_COLLECTION_ID, DRINK_BEST_DEALS_OF_THE_WEEK_COLLECTION_ID, POPULAR_PRODUCT_COLLECTION_ID,
  DRINK_POPULAR_PRODUCT_COLLECTION_ID, CLOTHING_BEST_DEALS_OF_THE_WEEK_COLLECTION_ID, CLOTHING_POPULAR_PRODUCT_COLLECTION_ID, BEAUTY_POPULAR_PRODUCT_COLLECTION_ID,
  BEAUTY_BEST_DEALS_OF_THE_WEEK_COLLECTION_ID, AUTOMOTIVE_BEST_DEALS_OF_THE_WEEK_COLLECTION_ID, AUTOMOTIVE_POPULAR_PRODUCT_COLLECTION_ID
} from '../constants/Constants'
import type { ShopifyProduct } from '../../@types';
import { BaseStyle } from '../constants/Style';
import { spacings, style } from '../constants/Fonts';
import { logEvent } from '@amplitude/analytics-react-native';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import Feather from 'react-native-vector-icons/dist/Feather';
import Header from '../components/Header'
import { BACKGROUND_IMAGE } from '../assests/images';
import { useSelector } from 'react-redux';

const { alignItemsCenter, alignJustifyCenter, flexDirectionRow, flex, positionRelative, positionAbsolute, resizeModeContain, borderRadius5, justifyContentSpaceBetween } = BaseStyle;
const SearchScreen = ({ navigation }: { navigation: any }) => {
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  // const STOREFRONT_DOMAIN = getStoreDomain(selectedItem)
  // const ADMINAPI_ACCESS_TOKEN = getAdminAccessToken(selectedItem)
  // const BEST_DEALS_OF_THE_WEEK_COLLECTION_ID = getBestDealOfWeek(selectedItem)
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [suggestionClicked, setSuggestionClicked] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [inventoryQuantities, setInventoryQuantities] = useState('');
  const [tags, setTags] = useState<string[][]>([]);
  const [options, setOptions] = useState([]);
  const [productVariantsIDS, setProductVariantsIDS] = useState([]);

  useEffect(() => {
    logEvent('Search Screen Initialized');
  }, [])

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  const handleSearch = async () => {
    console.log(searchQuery)
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("X-Shopify-Access-Token", ADMINAPI_ACCESS_TOKEN);
    const graphql = JSON.stringify({
      query: `
        query SearchProducts($query: String!) {
          products(query: $query, first: 20) {
            edges {
              node {
                id
                title
                title
                tags
                options(first:20){
                  id
                  name
                  values
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      price
                      inventoryQuantity
                      title
                      image {
                        originalSrc
                      }
                    }
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      id
                      src
                    }
                  }
                }
              }
            }
          }
        }`,
      variables: {
        query: searchQuery
      }
    });
    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: graphql,
      redirect: "follow"
    };
    try {
      const response = await fetch(`https://${STOREFRONT_DOMAIN}/admin/api/2024-04/graphql.json`, requestOptions);
      const result = await response.json();
      // console.log("result.data.products.edges",result.data.products.edges)
      const suggestions = result?.data?.products?.edges?.map(({ node }) => {
        return {
          title: node?.title,
          imageSrc: node?.images?.edges[0]?.node?.src || null,
          price: node?.variants?.edges[0]?.node?.price
        };
      });
      setSearchSuggestions(suggestions);
      setSearchResults(result?.data?.products?.edges);
      const inventoryQuantities = result?.data?.products?.edges.map((productEdge) => {
        const variantEdges = productEdge?.node?.variants?.edges;
        const inventoryQuantitiesForProduct = variantEdges.map((edge) => edge?.node?.inventoryQuantity);
        return inventoryQuantitiesForProduct;
      });
      setInventoryQuantities(inventoryQuantities);
      const tags = result?.data?.products?.edges.map((productEdge) => productEdge?.node?.tags);
      setTags(tags);

      const options = result?.data?.products?.edges.map((productEdge) => productEdge?.node?.options);
      setOptions(options);

      const productVariantData = result?.data?.products?.edges.map((productEdge) =>
        productEdge?.node?.variants?.edges.map((variant) => ({
          id: variant?.node?.id,
          title: variant?.node?.title,
          inventoryQty: variant?.node?.inventoryQuantity,
          image: variant?.node?.image,
          price: variant?.node?.price
        }))
      );
      console.log(productVariantData)
      setProductVariantsIDS(productVariantData)
    } catch (error) {
      console.log(error);
    }
  };

  function getVariant(node: ShopifyProduct) {
    return node?.variants?.edges[0]?.node;
  }

  const fillTextInputWithHint = (hint: string, id?: string) => {
    logEvent(`Selected Popular Hint ${hint}`);
    setSearchQuery(hint);
    setShowSuggestions(false);
    setSuggestionClicked(true);
    navigation.navigate('SearchResultScreen', {
      title: hint,
      id: id
    })
    setSearchQuery('')
  };

  return (
    <KeyboardAvoidingView
      style={[flex, { height: hp(100) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ImageBackground style={[styles.Container, flex]} source={BACKGROUND_IMAGE}>
        <Header backIcon={true} text={"Search"} navigation={navigation} />
        <View style={{ paddingHorizontal: spacings.large }}>
          <View style={[positionRelative]}>
            <View style={[styles.input, flexDirectionRow, alignItemsCenter]}>
              <Ionicons name="search" size={25} color={grayColor} />
              <View style={[flex]}>
                <TextInput
                  placeholder={SEARCH_FOR_DRINK}
                  placeholderTextColor={grayColor}
                  style={{ color: blackColor }}
                  value={searchQuery}
                  onChangeText={async (text) => {
                    setSearchQuery(text);
                    if (text === '') {
                      setShowSuggestions(false);
                      if (!suggestionClicked) {
                        dismissKeyboard();
                      }
                    } else {
                      setShowSuggestions(searchSuggestions.length > 0);
                      if (searchSuggestions.length > 0) {
                        if (!suggestionClicked) {
                          dismissKeyboard();
                        }
                      }
                      await handleSearch();
                    }
                  }}
                />
              </View>
            </View>
            {showSuggestions && (
              <View style={[positionAbsolute, styles.suggestionBox]}>
                {searchSuggestions.length != 0 ? (<FlatList
                  data={searchSuggestions}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity
                        onPress={async () => {
                          setSearchQuery(item?.title);
                          await handleSearch();
                          setShowSuggestions(false);
                          setSuggestionClicked(true);
                          const selectedItemFromResults = searchResults.find(items =>
                            items?.node?.title === item?.title && items?.node?.images?.edges[0]?.node?.src === item?.imageSrc
                          );
                          navigation.navigate('ProductDetails', {
                            product: selectedItemFromResults?.node,
                            variant: getVariant(selectedItemFromResults?.node),
                            inventoryQuantity: inventoryQuantities[index],
                            tags: tags[index],
                            option: options[index],
                            ids: productVariantsIDS[index]
                          });
                          setSearchQuery('');
                          logEvent(`Search Prodcut ${item.title}`);
                        }}
                        style={[styles.suggestionItem, flexDirectionRow, alignItemsCenter]}
                      >
                        <Image source={{ uri: item?.imageSrc }} style={[{ width: wp(13), height: hp(10), marginRight: spacings.large }, resizeModeContain]} />
                        <View style={{ width: wp(55) }}>
                          <Text style={{ color: blackColor }}>{item?.title}</Text>
                          <Text style={{ color: mediumGray }}>{item?.price}</Text>
                        </View>
                        <View style={[{ width: "25%" }, alignJustifyCenter]}>
                          <Feather name="arrow-up-right" size={25} color={blackColor} />
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  keyExtractor={(item, index) => index.toString()}
                />) : (
                  <View style={[alignJustifyCenter, { width: wp(80), height: hp(79), alignSelf: "center" }]}>
                    <View>
                      <Ionicons name="search" size={50} color={grayColor} />
                    </View>
                    <Text style={{ color: blackColor, fontSize: style.fontSizeLarge.fontSize }}>No Results Found!</Text>
                    <Text style={{ color: mediumGray, textAlign: "center" }}>Try a similar word or something more general.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <Text style={[styles.text, { padding: 10 }]}>{POPULAR}</Text>
          <Pressable style={[borderRadius5, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { backgroundColor: lightGrayOpacityColor, paddingRight: spacings.large, marginTop: spacings.large }]}
            onPress={() => { fillTextInputWithHint(POPULAR_LIQUOR, selectedItem === "Food" ? POPULAR_PRODUCT_COLLECTION_ID : selectedItem === "Drinks" ? DRINK_POPULAR_PRODUCT_COLLECTION_ID : selectedItem === "Clothing" ? CLOTHING_POPULAR_PRODUCT_COLLECTION_ID : selectedItem === "Beauty" ? BEAUTY_POPULAR_PRODUCT_COLLECTION_ID : selectedItem === "Automotive" ? AUTOMOTIVE_POPULAR_PRODUCT_COLLECTION_ID : POPULAR_PRODUCT_COLLECTION_ID) }}>
            <Text style={[styles.hintText, borderRadius5]} >{POPULAR_LIQUOR}</Text>
            <Ionicons name="add" size={25} color={grayColor} />
          </Pressable>
          <Pressable style={[borderRadius5, flexDirectionRow, justifyContentSpaceBetween, alignItemsCenter, { backgroundColor: lightGrayOpacityColor, paddingRight: spacings.large, marginTop: spacings.large }]}
            onPress={() => { fillTextInputWithHint(BEST_DEALS_OF_THE_WEEK, selectedItem === "Food" ? BEST_DEALS_OF_THE_WEEK_COLLECTION_ID : selectedItem === "Drinks" ? DRINK_BEST_DEALS_OF_THE_WEEK_COLLECTION_ID : selectedItem === "Clothing" ? CLOTHING_BEST_DEALS_OF_THE_WEEK_COLLECTION_ID : selectedItem === "Beauty" ? BEAUTY_BEST_DEALS_OF_THE_WEEK_COLLECTION_ID : selectedItem === "Automotive" ? AUTOMOTIVE_BEST_DEALS_OF_THE_WEEK_COLLECTION_ID : BEST_DEALS_OF_THE_WEEK_COLLECTION_ID) }}>
            <Text style={[styles.hintText, borderRadius5]} >{BEST_DEALS_OF_THE_WEEK}</Text>
            <Ionicons name="add" size={25} color={grayColor} />
          </Pressable>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  Container: {
    // padding: spacings.large,
    // backgroundColor: whiteColor
    height: hp(100)
  },
  text: {
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
  },
  hintText: {
    padding: spacings.large,
    color: grayColor,
    fontSize: style.fontSizeNormal2x.fontSize,

  },
  input: {
    width: "100%",
    height: hp(6),
    borderColor: 'transparent',
    backgroundColor: whiteColor,
    borderWidth: .1,
    borderRadius: 10,
    paddingHorizontal: spacings.large,
    marginTop: spacings.large,
    shadowColor: grayColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 1.5,
  },
  suggestionBox: {
    top: hp(7.5),
    left: 0,
    right: 0,
    backgroundColor: whiteColor,
    zIndex: 1,
    width: wp(95),
    height: hp(83),
    borderRadius: 2
  },
  itembox: {
    width: wp(100),
    height: hp(14),
    top: hp(8),
    left: 0,
    right: 0,
    backgroundColor: whiteColor,
    zIndex: 1,
    padding: spacings.large,
  },
  suggestionItem: {
    padding: spacings.large,
    width: wp(100),
    height: hp(10),
    zIndex: 1,
  },
});

export default SearchScreen;
