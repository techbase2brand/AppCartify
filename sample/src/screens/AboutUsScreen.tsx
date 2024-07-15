import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native'
import Header from '../components/Header'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { ABOUT_US } from '../constants/Constants'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { whiteColor, blackColor, grayColor, redColor } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import { ABOUT_US_IMAGE } from '../assests/images'


const { textAlign, alignItemsCenter, borderRadius5, alignJustifyCenter, flexDirectionRow, resizeModeContain } = BaseStyle;

const AboutUsScreen = ({ navigation }: { navigation: any }) => {

  return (
    <View style={styles.container}>
      {/* <Header
        navigation={navigation}
        textinput={true}
      /> */}
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: spacings.xxxLarge }}>
        <View style={[{ width: "100%", margin: 10 }, alignItemsCenter, flexDirectionRow]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name={"arrow-back"} size={30} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.text, { marginLeft: spacings.large }]}>{ABOUT_US}</Text>
        </View>
        <View style={{ width: wp(100), padding: spacings.large }}>
          <Image source={ABOUT_US_IMAGE} style={[resizeModeContain, styles.image]} />
        </View>
        <Text style={[styles.descripText, textAlign]}>Reach out for premium beverages </Text>
        <Text style={[styles.descripText, textAlign]}>crafted with excellence and expertise</Text>
      </ScrollView>
    </View>
  )
}

export default AboutUsScreen

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: hp(95),
    backgroundColor: whiteColor
  },
  text: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    color: blackColor,
    fontFamily: 'GeneralSans-Variable'
  },
  image: {
    width: wp(95),
    height: hp(22)
  },
  descripText: {
    fontSize: style.fontSizeNormal1x.fontSize,
    fontWeight: "400",
    // marginTop: spacings.normal,
    // marginBottom: spacings.large,
    marginHorizontal: spacings.normal,
    // lineHeight: 20,
    textAlign: 'left',
    color: grayColor,
  },

})
