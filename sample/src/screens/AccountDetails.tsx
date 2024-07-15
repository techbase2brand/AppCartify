import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Pressable } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '../utils';
import { spacings, style } from '../constants/Fonts';
import { BaseStyle } from '../constants/Style';
import { whiteColor, blackColor, grayColor, redColor } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { logEvent } from '@amplitude/analytics-react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ADMINAPI_ACCESS_TOKEN, STOREFRONT_DOMAIN, STOREFRONT_ACCESS_TOKEN, API_KEY, API_SECRET_PASSWORD ,getStoreDomain,getAdminAccessToken} from '../constants/Constants';
import { PROFILE_IMAGE, BACKGROUND_IMAGE } from '../assests/images';
import Header from '../components/Header'
import { useSelector } from 'react-redux';

const { flex, alignItemsCenter, resizeModeContain, flexDirectionRow, alignJustifyCenter, positionAbsolute, borderRadius5, borderWidth1, justifyContentSpaceBetween } = BaseStyle;


const AccountDetails = ({ navigation }: { navigation: any }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const today = new Date();
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  // const STOREFRONT_DOMAIN = getStoreDomain(selectedItem)
  // const ADMINAPI_ACCESS_TOKEN = getAdminAccessToken(selectedItem)
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(false);
    setDateOfBirth(currentDate);
  };

  //Fetch Customer Id
  useEffect(() => {
    const fetchUserDetails = async () => {
      const userDetails = await AsyncStorage.getItem('userDetails')
      if (userDetails) {
        const userDetailsObject = JSON.parse(userDetails);

        const userId = userDetailsObject.customer ? userDetailsObject.customer.id : userDetailsObject.id;
        console.log("userDetailsObject", userId)
        setCustomerId(userId)
      }
    };
    fetchUserDetails();
  }, []);

  //Fetch userProfile Details
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/customers/${customerId}.json`, {
          headers: {
            'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
            'Content-Type': 'application/json',
          },
        });
        console.log('Response data:', response.data);
        const customer = response.data.customer;
        setFullName(`${customer.first_name} ${customer.last_name}`);
        setEmail(customer.email);
        if (customer.date_of_birth) {
          setDateOfBirth(new Date(customer.date_of_birth));
        }

        if (customer.gender) {
          setGender(customer.gender);
        }

        // if (customer.phone) {
        //   setPhoneNumber(customer.phone);
        // }
        if (customer.phone) {
          // Remove the '+91' country code
          const phoneWithoutCountryCode = customer.phone.replace(/^\+91\s*/, '');
          setPhoneNumber(phoneWithoutCountryCode);
        }
      } catch (error) {
        console.error('Error fetching customer profile:', error);
      }
    };
    if (customerId) {
      fetchUserProfile();
    }
  }, [customerId]);

  // const handleSubmit = async (id) => {
  //   console.log("customerId", id)
  //   try {
  //     const [firstName, lastName] = fullName.split(' ');
  //     const data = {
  //       customer: {
  //         id: id,
  //         email: email,
  //         first_name: firstName,
  //         last_name: lastName,
  //         phone: phoneNumber,
  //         // date_of_birth: dateOfBirth.toISOString().split('T')[0],
  //         // gender: gender,
  //         metafields: [
  //           {
  //             key: 'new',
  //             value: 'newvalue',
  //             type: 'single_line_text_field',
  //             namespace: 'global'
  //           }
  //         ]
  //       }
  //     };
  //     console.log(data);
  //     const response = await axios.put(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/customers/${id}.json`, data, {
  //       headers: {
  //         'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //     console.log('Customer updated successfully:', response.data);
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error('Error updating customer profile:', error);
  //   }
  // };

  //onUpdate Profile
  const handleSubmit = async (id) => {
    console.log("customerId", id);
    try {
      const [firstName, lastName] = fullName.split(' ');
      const data = {
        customer: {
          id: id,
          email: email,
          first_name: firstName,
          last_name: lastName,
          phone: phoneNumber,
          date_of_birth: dateOfBirth.toISOString().split('T')[0],
          gender: gender,
        }
      };

      // Check AsyncStorage for metafield status
      const metafieldStatusKey = `customerMetafieldStatus_${id}`;
      const isFirstUpdate = !(await AsyncStorage.getItem(metafieldStatusKey));

      if (isFirstUpdate) {
        data.customer.metafields = [
          {
            key: 'new',
            value: 'newvalue',
            type: 'single_line_text_field',
            namespace: 'global'
          }
        ];

        // Mark metafield as sent for this customer
        await AsyncStorage.setItem(metafieldStatusKey, 'true');
      }

      console.log(data);
      const response = await axios.put(`https://${STOREFRONT_DOMAIN}/admin/api/2024-01/customers/${id}.json`, data, {
        headers: {
          'X-Shopify-Access-Token': ADMINAPI_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      });
      console.log('Customer updated successfully:', response.data);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating customer profile:', error);
    }
  };

  return (
    <ImageBackground style={[styles.container, flex]} source={BACKGROUND_IMAGE}>
      <Header
        backIcon={true}
        text={"AccountDetails"}
        navigation={navigation} />
      {/* <View style={[{ width: "100%", height: hp(7) }, flexDirectionRow, alignItemsCenter]}>
        <TouchableOpacity style={[styles.backIcon, alignItemsCenter]} onPress={() => { logEvent(`Back Button Pressed from Account Details`), navigation.goBack() }}>
          <Ionicons name={"arrow-back"} size={33} color={blackColor} />
        </TouchableOpacity>
        <Text style={styles.text}>{"AccountDetails"}</Text>S
      </View> */}
      <View style={{ width: "100%", padding: spacings.large, height: hp(87.5) }}>
        <Text style={[styles.textInputHeading]}>{"Full Name"}</Text>
        <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter]}>
          <View style={{ flex: 1 }}>
            <TextInput
              placeholder={"Full Name"}
              placeholderTextColor={grayColor}
              onChangeText={(text) => {
                setFullName(text);
              }}
              value={fullName}
              style={{ color: blackColor }}
            />
          </View>
        </View>
        <Text style={styles.textInputHeading}>Email Address</Text>
        <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter]}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email Address"
              keyboardType="email-address"
              editable={false}
            />
          </View>
        </View>

        <Text style={styles.textInputHeading}>Date of Birth</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateInput, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter, justifyContentSpaceBetween]}>
          <Text style={{ color: blackColor }}>{dateOfBirth.toLocaleDateString()}</Text>
          <Ionicons name="calendar" size={20} />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="default"
            onChange={onChangeDate}
            maximumDate={today}
          />
        )}
        <Text style={styles.textInputHeading}>Gender</Text>
        <View style={[styles.pickerContainer, borderRadius5, borderWidth1]}>
          <Picker
            selectedValue={gender}
            onValueChange={(itemValue) => setGender(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
        <Text style={styles.textInputHeading}>Phone Number</Text>
        <View style={[styles.input, borderRadius5, borderWidth1, flexDirectionRow, alignItemsCenter]}>
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Phone Number"
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>
        </View>
        <Pressable style={[styles.submitButton, positionAbsolute, alignJustifyCenter]} onPress={() => handleSubmit(customerId)}>
          <Text style={[styles.submitButtonText, { color: whiteColor }]}>Submit</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding: spacings.large
  },
  backIcon: {
    // width: wp(10),
    // height: hp(5)
  },
  text: {
    fontSize: style.fontSizeMedium1x.fontSize,
    fontWeight: style.fontWeightMedium.fontWeight,
    paddingLeft: spacings.large,
    color: blackColor
  },
  input: {
    width: '100%',
    height: hp(6),
    borderColor: grayColor,
    paddingHorizontal: spacings.normal,
    // marginVertical: spacings.large,
  },
  dateInput: {
    width: '100%',
    height: hp(6),
    borderColor: grayColor,
    paddingHorizontal: spacings.large,
    // marginVertical: spacings.large
  },
  pickerContainer: {
    width: '100%',
    height: hp(7),
    borderColor: grayColor,
    paddingHorizontal: spacings.large,
    // marginVertical: spacings.large
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: redColor,
    padding: spacings.xLarge,
    borderRadius: 10,
    bottom: 5,
    width: "100%",
    alignSelf: 'center'
  },
  submitButtonText: {
    fontSize: style.fontSizeNormal2x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight
  },
  textInputHeading: {
    fontSize: style.fontSizeNormal1x.fontSize,
    fontWeight: style.fontWeightThin.fontWeight,
    color: blackColor,
    marginTop: spacings.xxxxLarge,
    marginBottom: spacings.normal
  },

});

export default AccountDetails;
