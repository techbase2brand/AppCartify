import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, TextInput } from 'react-native'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { RATING_AND_REVIEWS } from '../constants/Constants'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { whiteColor, blackColor, grayColor, redColor, goldColor, lightBlueColor } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome';
import { LADY_DONALD_RICE } from '../assests/images';

const { textAlign, alignItemsCenter, borderRadius5, alignJustifyCenter, flexDirectionRow, justifyContentSpaceBetween, resizeModeContain, textDecorationUnderline } = BaseStyle;

const AllReviewScreen = ({ navigation }: { navigation: any }) => {
  const [review, SetReview] = useState('')
  const [isEditing, setIsEditing] = useState(false);
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: spacings.xxxLarge }}>
        <View style={[{ width: "100%", margin: spacings.large }, alignItemsCenter, flexDirectionRow]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name={"arrow-back"} size={30} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.userName, { marginLeft: spacings.large, color: blackColor }]}>{RATING_AND_REVIEWS}</Text>
        </View>
        <Text style={[styles.reviewDescrip, textAlign]}>Summary</Text>
        <View style={[{ width: "95%", margin: spacings.large, height: hp(20) }, alignItemsCenter, flexDirectionRow]}>
          <View style={[{ width: "70%", height: "100%" }]}>
            <View style={[{ width: "100%", height: "15%", marginTop: spacings.large }, flexDirectionRow, alignJustifyCenter]}>
              <View style={{ width: wp(5), marginRight: spacings.small }}>
                <Text style={[styles.reviewDescrip]}>5</Text>
              </View>
              <View style={{ width: wp(60), height: "25%", backgroundColor: redColor, borderRadius: 10 }}>
              </View>
            </View>
            <View style={[{ width: "100%", height: "15%", marginTop: spacings.large }, flexDirectionRow, alignItemsCenter]}>
              <View style={{ width: wp(5), marginRight: spacings.small }}>
                <Text style={[styles.reviewDescrip]}>4</Text>
              </View>
              <View style={{ width: wp(50), height: "25%", backgroundColor: redColor, borderRadius: 10 }}>
              </View>
            </View>
            <View style={[{ width: "100%", height: "15%", marginTop: spacings.large }, flexDirectionRow, alignItemsCenter]}>
              <View style={{ width: wp(5), marginRight: spacings.small }}>
                <Text style={[styles.reviewDescrip]}>3</Text>
              </View>
              <View style={{ width: wp(40), height: "25%", backgroundColor: redColor, borderRadius: 10 }}>
              </View>
            </View>
            <View style={[{ width: "100%", height: "15%", marginTop: spacings.large }, flexDirectionRow, alignItemsCenter]}>
              <View style={{ width: wp(5), marginRight: spacings.small }}>
                <Text style={[styles.reviewDescrip]}>2</Text>
              </View>
              <View style={{ width: wp(28), height: "25%", backgroundColor: redColor, borderRadius: 10 }}>
              </View>
            </View>
            <View style={[{ width: "100%", height: "15%", marginTop: spacings.large }, flexDirectionRow, alignItemsCenter]}>
              <View style={{ width: wp(5), marginRight: spacings.small }}>
                <Text style={[styles.reviewDescrip]}>1</Text>
              </View>
              <View style={{ width: wp(14), height: "25%", backgroundColor: redColor, borderRadius: 10 }}>
              </View>
            </View>
          </View>
          <View style={[{ width: "32%", height: "100%" }]}>
            <View style={[{ justifyContent: 'center', height: "50%" }]}>
              <View style={[flexDirectionRow, alignItemsCenter]}>
                <Text style={[styles.reviewDescrip, { fontSize: style.fontSizeLarge.fontSize, color: blackColor }]}>4.5</Text>
                <FontAwesome name="star" size={20} color={goldColor} />
              </View>
              <Text style={[styles.reviewDescrip]}>273 Review</Text>
            </View>
            <View style={[{ justifyContent: 'center', height: "50%" }]}>
              <Text style={[styles.reviewDescrip, { fontSize: style.fontSizeLarge.fontSize, color: blackColor }]}>88%</Text>
              <Text style={[styles.reviewDescrip]}>Recommended</Text>
            </View>
          </View>
        </View>
        <View style={{ margin: spacings.large }}>
          <View style={[styles.input, flexDirectionRow, alignItemsCenter, { height: 'auto' }]}>
            {isEditing ? (<TextInput
              placeholder={"Write a Review"}
              placeholderTextColor={grayColor}
              onChangeText={SetReview}
              value={review}
              style={{ color: blackColor, textAlignVertical: 'center' }}
              multiline={true}
            />
            ) :
              (
                <TouchableOpacity onPress={() => setIsEditing(true)} style={[alignJustifyCenter, { width: "100%", height: hp(6) }]}>
                  <Text style={{ color: blackColor, fontSize: style.fontSizeNormal1x.fontSize, fontWeight: style.fontWeightThin.fontWeight }}>Write a Review</Text>
                </TouchableOpacity>
              )}
          </View>
          <Text style={[styles.reviewDescrip]}>Product reviews are managed by a third party to verify authenticity and compliance with our
            <Text style={[styles.reviewDescrip, { color: lightBlueColor }, textDecorationUnderline]}> Ratings & Reviews Guidelines</Text>
          </Text>
        </View>
        <View style={[alignItemsCenter, { marginVertical: spacings.medium, height: hp(13) }]}>
          <View style={[flexDirectionRow, { height: hp(7.5) }]}>
            <View style={[{ width: wp(20), height: hp(10) }, alignItemsCenter]}>
              <Image source={LADY_DONALD_RICE} style={[resizeModeContain, { width: wp(13), height: wp(13) }]} />
            </View>
            <View style={{ width: "76%", height: hp(4) }}>
              <Text style={[styles.userName]}>Donald Rice</Text>
              <View style={[justifyContentSpaceBetween, flexDirectionRow]}>
                <View style={[{ width: wp(35), height: hp(3), paddingLeft: spacings.large }, justifyContentSpaceBetween, flexDirectionRow]}>
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star-o" size={17} color={goldColor} />
                  <Text> (5.4)</Text>
                </View>
                <View style={[{ width: wp(30), height: hp(3), alignItems: "flex-end" }]}>
                  <Text style={{ color: blackColor }}>5 mint ago</Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={[styles.reviewDescrip]}>The item is very good, my son likes it very much and plays every day.</Text>
        </View>
        <View style={[alignItemsCenter, { marginVertical: spacings.medium, height: hp(13) }]}>
          <View style={[flexDirectionRow, { height: hp(7.5) }]}>
            <View style={[{ width: wp(20), height: hp(10) }, alignItemsCenter]}>
              <Image source={LADY_DONALD_RICE} style={[resizeModeContain, { width: wp(13), height: wp(13) }]} />
            </View>
            <View style={{ width: "76%", height: hp(4) }}>
              <Text style={[styles.userName]}>Elmer Roberts</Text>
              <View style={[justifyContentSpaceBetween, flexDirectionRow]}>
                <View style={[{ width: wp(35), height: hp(3), paddingLeft: spacings.large }, justifyContentSpaceBetween, flexDirectionRow]}>
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star-o" size={17} color={goldColor} />
                  <Text> (5.4)</Text>
                </View>
                <View style={[{ width: wp(30), height: hp(3), alignItems: "flex-end" }]}>
                  <Text style={{ color: blackColor }}>15 mint ago</Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={[styles.reviewDescrip]}>The item is very good, my son likes it very much and plays every day.</Text>
        </View>
        <View style={[alignItemsCenter, { marginVertical: spacings.medium, height: hp(13) }]}>
          <View style={[flexDirectionRow, { height: hp(7.5) }]}>
            <View style={[{ width: wp(20), height: hp(10) }, alignItemsCenter]}>
              <Image source={LADY_DONALD_RICE} style={[resizeModeContain, { width: wp(13), height: wp(13) }]} />
            </View>
            <View style={{ width: "76%", height: hp(4) }}>
              <Text style={[styles.userName]}>Donald Rice</Text>
              <View style={[justifyContentSpaceBetween, flexDirectionRow]}>
                <View style={[{ width: wp(35), height: hp(3), paddingLeft: spacings.large }, justifyContentSpaceBetween, flexDirectionRow]}>
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star" size={17} color={goldColor} />
                  <FontAwesome name="star-o" size={17} color={goldColor} />
                  <Text> (5.4)</Text>
                </View>
                <View style={[{ width: wp(30), height: hp(3), alignItems: "flex-end" }]}>
                  <Text style={{ color: blackColor }}>15 mint ago</Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={[styles.reviewDescrip]}>The item is very good, my son likes it very much and plays every day.</Text>
        </View>
      </ScrollView>
    </View>
  )
}

export default AllReviewScreen


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
  reviewDescrip: {
    fontSize: style.fontSizeNormal.fontSize,
    fontWeight: "400",
    // marginTop: spacings.normal,
    // marginBottom: spacings.large,
    marginHorizontal: spacings.normal,
    // lineHeight: 20,
    textAlign: 'left',
    color: grayColor,
  },
  userName: {
    fontSize: style.fontSizeLarge.fontSize,
    color: redColor,
    fontWeight: style.fontWeightThin1x.fontWeight,
    marginLeft: spacings.small,
    fontFamily: 'GeneralSans-Variable',
    padding: spacings.small
  },
  input: {
    width: '100%',
    height: 'auto',
    borderColor: grayColor,
    borderWidth: .4,
    paddingHorizontal: spacings.xLarge,
    marginVertical: spacings.xxxLarge,
  },

})
