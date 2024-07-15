import React, { useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, ImageBackground, Pressable } from 'react-native'
import Header from '../components/Header'
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { CONTACT_US, SEND_US_A_MESSAGE, FIRST_NAME, EMAIL, MESSAGE, SUBMIT, We_ARE_OPEN_FRON_ANY } from '../constants/Constants'
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { whiteColor, blackColor, grayColor, redColor } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import FontAwesome from 'react-native-vector-icons/dist/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons';
import { PROFILE_IMAGE, BACKGROUND_IMAGE } from '../assests/images';

const { textAlign, alignItemsCenter, borderRadius5, alignJustifyCenter, flexDirectionRow,flex } = BaseStyle;

const ContactUsScreen = ({ navigation }: { navigation: any }) => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  return (
    <ImageBackground style={[styles.container, flex]} source={BACKGROUND_IMAGE}>
      {/* <Header
        navigation={navigation}
        textinput={true}
      /> */}
       <View style={[{ width: "100%", margin: 10 }, alignItemsCenter, flexDirectionRow]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name={"arrow-back"} size={30} color={blackColor} />
          </TouchableOpacity>
          <Text style={[styles.hedingText, { marginLeft: spacings.large }]}>{CONTACT_US}</Text>
        </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{paddingBottom: spacings.xxxLarge }}>
        <Text style={[styles.hedingText, textAlign,{marginVertical:spacings.large}]}>{SEND_US_A_MESSAGE}</Text>
        <View style={{ padding: spacings.large,marginTop:spacings.xxxxLarge }}>
          <Text style={styles.textInputHeading}>{FIRST_NAME}</Text>
          <View style={[styles.input, borderRadius5, flexDirectionRow, alignItemsCenter]}>
            <TextInput
              placeholder={FIRST_NAME}
              placeholderTextColor={grayColor}
              onChangeText={setFirstName}
              value={firstName}
              style={{ color: blackColor,width:wp(90) }}
            />
          </View>
          <Text style={styles.textInputHeading}>{EMAIL}</Text>
          <View style={[styles.input, borderRadius5, flexDirectionRow, alignItemsCenter]}>
            <TextInput
              placeholder={EMAIL}
              placeholderTextColor={grayColor}
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{ color: blackColor,width:wp(90) }}
            />
          </View>
          <Text style={styles.textInputHeading}>{MESSAGE}</Text>
          <View style={[styles.input, borderRadius5, flexDirectionRow, { height: hp(20) }]}>
            <TextInput
              placeholder={MESSAGE}
              placeholderTextColor={grayColor}
              onChangeText={setMessage}
              value={message}
              style={{ color: blackColor, textAlignVertical: 'top',width:wp(90) }}
              multiline={true}
            />
          </View>
          <Pressable style={[styles.button, alignItemsCenter, borderRadius5]} >
            <Text style={styles.buttonText}>{SUBMIT}</Text>
          </Pressable>
        </View>
        <View style={{ padding: spacings.large }}>
          <Text style={[styles.hedingText, textAlign, { marginVertical: spacings.large }]}>{CONTACT_US}</Text>
          <Text style={[{ color: grayColor, marginBottom: spacings.large }, textAlign]}>{We_ARE_OPEN_FRON_ANY}</Text>
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <View style={[{ width: wp(30), height: hp(10) }, alignJustifyCenter]}>
              <View style={[{ width: wp(16), height: hp(8), borderRadius: 50, borderWidth: .5, borderColor: redColor }, alignJustifyCenter]}>
                <Ionicons name={"location"} size={30} color={redColor} />
              </View>
            </View>
            <View style={[{ width: "75%" }]}>
              <Text style={[styles.textInputHeading]}>lorem ipsum, 123 , lorem Ipsum</Text>
            </View>
          </View>
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <View style={[{ width: wp(30), height: hp(10) }, alignJustifyCenter]}>
              <View style={[{ width: wp(16), height: hp(8), borderRadius: 50, borderWidth: .5, borderColor: redColor }, alignJustifyCenter]}>
                <FontAwesome name={"phone"} size={30} color={redColor} />
              </View>
            </View>
            <View style={[{ width: "75%" }]}>
              <Text style={[styles.textInputHeading]}>+1 123 1234 1245</Text>
            </View>
          </View>
          <View style={[flexDirectionRow, alignItemsCenter]}>
            <View style={[{ width: wp(30), height: hp(10) }, alignJustifyCenter]}>
              <View style={[{ width: wp(16), height: hp(8), borderRadius: 50, borderWidth: .5, borderColor: redColor }, alignJustifyCenter]}>
                <MaterialIcons name={"email"} size={30} color={redColor} />
              </View>
            </View>
            <View style={[{ width: "75%" }]}>
              <Text style={[styles.textInputHeading]}>loremipsum@gmail.com</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

export default ContactUsScreen

const styles = StyleSheet.create({
  container: {
    width: wp(100),
    height: hp(95),
    backgroundColor: whiteColor
  },
  hedingText:{
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightMedium1x.fontWeight,
    color: blackColor,
    marginLeft: spacings.normalx
  },
  text: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    color: blackColor,
    // fontFamily: 'GeneralSans-Variable'

  },
  input: {
    width: '100%',
    height: hp(6),
    borderColor: grayColor,
    borderWidth: .4,
    paddingHorizontal: spacings.xLarge,
    marginVertical: spacings.xxxLarge,
  },
  textInputHeading: {
    fontSize: style.fontSizeNormal1x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor,
    // fontFamily: 'GeneralSans-Variable'
  },
  button: {
    width: '100%',
    backgroundColor: redColor,
    paddingVertical: spacings.large,
    marginTop: spacings.large
  },
  buttonText: {
    color: whiteColor,
    fontSize: style.fontSizeMedium.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
  }
})
