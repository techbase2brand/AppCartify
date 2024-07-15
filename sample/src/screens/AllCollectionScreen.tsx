import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import Header from '../components/Header'
import useShopify from '../hooks/useShopify';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { CATAGORIES } from '../constants/Constants'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { whiteColor, blackColor, grayColor,blackOpacity5 } from '../constants/Color'
import { logEvent } from '@amplitude/analytics-react-native';

const { flex, resizeModeCover , positionRelative, alignJustifyCenter} = BaseStyle;

const AllCollectionScreen = ({ navigation }: { navigation: any }) => {
  const { queries } = useShopify();
  const [fetchCollections, { data: collectionData }] = queries?.collections;

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections,]);

  useEffect(() => {
    logEvent('All Collections Screen Initialized');
  }, [])

  const onPressCollection = (id: any, heading: any) => {
    logEvent(`Collection Button Pressed from AllCollectionScreen CollectionID: ${id} CollectionName: ${heading}`);
    navigation.navigate('Collections', {
      id: id, headingText: heading
    })
  }

  return (
    <View style={[flex, styles.container]}>
      <Header
        backIcon={true} text={CATAGORIES} navigation={navigation} textinput={true} onPress={() => {logEvent('Back Button Clicked'), navigation.goBack() }}
      />
      <View style={[styles.productDetailBox]}>
        <FlatList
          data={collectionData?.collections?.edges}
          renderItem={({ item }) => (
            <Pressable style={[styles.drinkBannerBox, positionRelative, alignJustifyCenter]} onPress={() => onPressCollection(item?.node?.id, item?.node?.title)}>
              <Image source={{ uri: item?.node?.image?.url }} style={[styles.drinkBannerBox, resizeModeCover]} />
              <View style={[styles.overlay]}>
                <Text style={{ fontSize: style.fontSizeNormal.fontSize, color: whiteColor, marginVertical: spacings.small, fontWeight: style.fontWeightBold.fontWeight, }}>{item?.node?.title}</Text>
              </View>
            </Pressable>
          )}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
        />
      </View>
    </View>
  )
}

export default AllCollectionScreen

const styles = StyleSheet.create({
  container: {
    backgroundColor: whiteColor,
  },
  productDetailBox: {
    width: wp(100),
    height: hp(89),
    paddingTop: spacings.large,
    paddingBottom: spacings.xxxxLarge,
    paddingHorizontal: spacings.xxLarge
  },
  text: {
    fontSize: style.fontSizeLarge.fontSize,
    fontWeight: style.fontWeightThin1x.fontWeight,
    color: blackColor,
  },
  drinkBannerBox: {
    width: wp(40.5),
    height: hp(20),
    margin: spacings.large,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: blackOpacity5
  }
})
