
// import React, { useState, useEffect } from 'react';
// import { View, Text, TextInput, Pressable, Modal, StyleSheet, TouchableOpacity, Alert, PanResponder, ScrollView } from 'react-native';
// import { widthPercentageToDP as wp, heightPercentageToDP as hp, } from '.././../utils';
// import { whiteColor, darkgrayColor, redColor, blackColor, goldColor, lightGrayColor, lightBlueColor, grayColor, lightGrayOpacityColor, blackOpacity5, mediumGray } from '../../constants/Color'
// import Ionicons from 'react-native-vector-icons/dist/Ionicons';
// import { spacings, style } from '../../constants/Fonts';
// import { BaseStyle } from '../../constants/Style';
// import { ALL, APPLY, AVAILABILITY, BRAND, CLEAR, FILTER, INSTOCK, OUT_OF_STOCK, PRICE } from '../../constants/Constants';
// import { logEvent } from '@amplitude/analytics-react-native';
// import { useSelector } from 'react-redux';
// import { useThemes } from '../../context/ThemeContext';
// import { lightColors, darkColors } from '../../constants/Color';
// const { alignItemsCenter, resizeModeContain, textAlign, alignJustifyCenter, flex, borderRadius10, overflowHidden, borderWidth1, flexDirectionRow, justifyContentSpaceBetween, alignSelfCenter, positionAbsolute } = BaseStyle;

// const FilterModal = ({ applyFilters, onClose, visible, allProducts, vendor, onSelectVendor }) => {
//   const { isDarkMode } = useThemes();
//   const colors = isDarkMode ? darkColors : lightColors;
//   const selectedItem = useSelector((state) => state.menu.selectedItem);
//   const [minPrice, setMinPrice] = useState('');
//   const [maxPrice, setMaxPrice] = useState('');
//   const [showPriceRange, setShowPriceRange] = useState(false);
//   const [showBrand, setShowBrand] = useState(false);
//   const [showAvailibility, setShowAvailibitlity] = useState(false);
//   const [showInStock, setShowInStock] = useState(false);
//   const [startPrice, setStartPrice] = useState(0);
//   const [endPrice, setEndPrice] = useState();
//   const [priceRange, setPriceRange] = useState();
//   const [startPricePosition, setStartPricePosition] = useState(0);
//   const [endPricePosition, setEndPricePosition] = useState(30);
//   const [selectedVendor, setSelectedVendor] = useState(null);
//   // let range = selectedItem === "Beauty" ? 10000 : 100;

//   useEffect(() => {
//     if (allProducts?.length > 0) {
//       const prices = allProducts.map(product => parseFloat(product.variants.nodes[0]?.price)).filter(price => !isNaN(price));
//       const maxPrice = Math.max(...prices);
//       setEndPrice(maxPrice.toString());
//       setPriceRange(maxPrice.toString())
//     }
//   }, [allProducts]);

//   const handleStartPriceChange = (position) => {
//     const newPos = Math.max(0, Math.min(endPricePosition - 20, position)); // Ensuring the start thumb doesn't cross the end thumb
//     const price = Math.round((newPos / wp(90)) * priceRange); // Adjusting according to the range and position
//     setStartPrice(price);
//     setMinPrice(price.toString());
//     setStartPricePosition(newPos);
//   };

//   const handleEndPriceChange = (position) => {
//     const newPos = Math.max(startPricePosition + 20, Math.min(wp(90), position)); // Ensuring the end thumb doesn't cross the start thumb
//     const price = Math.round((newPos / wp(90)) * priceRange); // Adjusting according to the range and position
//     setEndPrice(price);
//     setMaxPrice(price.toString());
//     setEndPricePosition(newPos);
//   };

//   const handleMinPriceChange = (value) => {
//     const price = parseFloat(value) || 0;
//     const newPos = (price / priceRange) * wp(90);
//     setMinPrice(value);
//     setStartPrice(price);
//     setStartPricePosition(newPos);
//   };

//   const handleMaxPriceChange = (value) => {
//     const price = parseFloat(value) || 0;
//     const newPos = (price / priceRange) * wp(90);
//     setMaxPrice(value);
//     setEndPrice(price);
//     setEndPricePosition(newPos);
//   };

//   const startPricePanResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onMoveShouldSetPanResponder: () => true,
//     onPanResponderMove: (event, gestureState) => {
//       handleStartPriceChange(gestureState.moveX - 10); // Adjusting for slider width
//     },
//   });

//   const endPricePanResponder = PanResponder.create({
//     onStartShouldSetPanResponder: () => true,
//     onMoveShouldSetPanResponder: () => true,
//     onPanResponderMove: (event, gestureState) => {
//       handleEndPriceChange(gestureState.moveX - 10); // Adjusting for slider width
//     },
//   });

//   const handleApplyFilters = () => {
//     const filteredProducts = allProducts.filter(product => {
//       const min = parseFloat(minPrice);
//       const max = parseFloat(maxPrice);
//       const productPrice = parseFloat(product.variants.nodes[0]?.price);
//       if (minPrice && maxPrice) {
//         return productPrice >= min && productPrice <= max;
//       } else if (minPrice) {
//         return productPrice >= min;
//       } else if (maxPrice) {
//         return productPrice <= max;
//       }
//       return true;
//     });
//     applyFilters(filteredProducts);
//     if (filteredProducts.length === 0) {
//       Alert.alert("No products are currently available in this range.");
//       setShowPriceRange(false)
//     }
//     if (filteredProducts.length > 0) {
//       onClose(),
//         setShowPriceRange(false)
//     }
//     logEvent(`Filter_Applied minPrice:${minPrice} maxPrice ${maxPrice}`);
//   };

//   const applyFilterByQuantity = () => {
//     const filteredByQuantity = allProducts.filter(product => {
//       const inventoryQuantities = product.variants.nodes.map(variant => variant.inventoryQuantity);
//       if (showInStock) {
//         // Filter in-stock products (inventory quantity > 0)
//         return inventoryQuantities.some(quantity => quantity > 0);
//       } else {
//         // Filter out-of-stock products (inventory quantity === 0)
//         return inventoryQuantities.every(quantity => quantity === 0);
//       }
//     });
//     if (filteredByQuantity.length === 0) {
//       Alert.alert("No products are currently available.");
//       // onClose();
//       setShowAvailibitlity(false);
//     } else {
//       applyFilters(filteredByQuantity);
//       onClose();
//       setShowAvailibitlity(false);
//     }
//     logEvent(`Availability_Filter_Applied  ${showInStock}`);
//   };

//   const togglePriceRange = () => {
//     setShowPriceRange(!showPriceRange);
//     logEvent('Price_Range_Toggled');
//   };

//   const toggleBrand = () => {
//     setShowBrand(!showBrand);
//     logEvent('Brand_Filter_Toggled');
//   };

//   const toggleAvailability = () => {
//     setShowAvailibitlity(!showAvailibility);
//     logEvent('Availability_Filter_Toggled');
//   };

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       visible={visible}
//       onRequestClose={onClose}
//     >
//       <View style={{ backgroundColor: blackOpacity5, flex: 1 }}>
//         <View style={[positionAbsolute, { backgroundColor: colors.whiteColor, bottom: 0, height: hp(60), borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>

//           <View style={[styles.modalHeader, flexDirectionRow, alignJustifyCenter]}>
//             <View style={[{ width: "80%" }]}>
//               <Text style={[styles.headertext, { color: colors.blackColor }]}>Apply Filter</Text>
//             </View>
//             <TouchableOpacity style={styles.backIconBox} onPress={onClose}>
//               <Ionicons name={"close"} size={30} color={colors.blackColor} />
//             </TouchableOpacity>
//           </View>
//           <ScrollView>
//             <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={toggleBrand}>
//               <Text style={[styles.text, { color: colors.blackColor }]}>{BRAND}</Text>
//               <View style={[styles.backIconBox]} >
//                 <Text style={[styles.graytext, { color: colors.blackColor }]}>{ALL}</Text>
//               </View>
//             </TouchableOpacity>
//             {showBrand && <View>
//               {vendor.map(vendor => (
//                 <TouchableOpacity
//                   key={vendor}
//                   style={[styles.vendorButton, flexDirectionRow, { backgroundColor: isDarkMode ? grayColor : whiteColor }]}
//                   onPress={() => { setSelectedVendor(vendor), onSelectVendor(vendor), onClose(), setShowBrand(false), logEvent(`Vendor_Selected ${vendor}`); }}
//                 >
//                   <Text style={[styles.graytext, { color: colors.blackColor }]}>{vendor}</Text>
//                   {selectedVendor === vendor && <Ionicons name="checkmark" size={20} color={colors.blackColor} style={{ marginLeft: "auto", marginRight: spacings.xxxxLarge }} />}
//                 </TouchableOpacity>
//               ))}
//             </View>}
//             <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={togglePriceRange}>
//               <Text style={[styles.text, { color: colors.blackColor }]}>{PRICE}</Text>
//               <View style={[styles.backIconBox]} >
//                 <Text style={[styles.graytext, { color: colors.blackColor }]}>{ALL}</Text>
//               </View>
//             </TouchableOpacity>
//             {showPriceRange && (
//               <View style={[styles.container]}>
//                 <View style={[flexDirectionRow, alignItemsCenter]}>
//                   <TextInput
//                     placeholder="Min Price"
//                     placeholderTextColor={colors.grayColor}
//                     value={minPrice}
//                     onChangeText={handleMinPriceChange}
//                     keyboardType="numeric"
//                     style={[styles.input, borderRadius10, borderWidth1,{ color: colors.blackColor }]}
//                   />
//                   <TextInput
//                     placeholder="Max Price"
//                     placeholderTextColor={colors.grayColor}
//                     value={maxPrice}
//                     onChangeText={handleMaxPriceChange}
//                     keyboardType="numeric"
//                     style={[styles.input, borderRadius10, borderWidth1,{ color: colors.blackColor }]}
//                   />
//                 </View>
//                 <View style={styles.releaseBox}>
//                   <Text style={[styles.graytext, { color: colors.blackColor }]}>Min Price:{startPrice}</Text>
//                   <Text style={[styles.graytext, { color: colors.blackColor }]}>Max Price:{endPrice}</Text>
//                 </View>
//                 <View style={styles.mainRangeSection}>
//                   <View style={[styles.slider, { left: startPricePosition }]} {...startPricePanResponder.panHandlers} />
//                   <View style={[styles.slider, { left: endPricePosition }]} {...endPricePanResponder.panHandlers} />
//                 </View>
//                 <View style={[flexDirectionRow, alignJustifyCenter, flexDirectionRow, { marginTop: spacings.xxxxLarge }]}>
//                   <Pressable style={[styles.applyButton, alignJustifyCenter, borderRadius10]} onPress={handleApplyFilters}>
//                     <Text style={styles.applyButtonText}>{APPLY}</Text>
//                   </Pressable>
//                 </View>
//               </View>)}
//             <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={toggleAvailability}>
//               <Text style={styles.text}>{AVAILABILITY}</Text>
//               <View style={[styles.backIconBox]} >
//                 <Text style={[styles.graytext]}>{ALL}</Text>
//               </View>
//             </TouchableOpacity>
//             {showAvailibility &&
//               <View style={[styles.container]}>
//                 <View style={[flexDirectionRow, justifyContentSpaceBetween]}>
//                   <TouchableOpacity style={[styles.availabilityButton, alignJustifyCenter, borderRadius10]} onPress={() => setShowInStock(true)}>
//                     <Text style={styles.availabilityButtonText}>{INSTOCK}</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity style={[styles.availabilityButton, alignJustifyCenter, borderRadius10]} onPress={() => setShowInStock(false)}>
//                     <Text style={styles.availabilityButtonText}>{OUT_OF_STOCK}</Text>
//                   </TouchableOpacity>
//                 </View>
//                 <View style={[flexDirectionRow, alignJustifyCenter, flexDirectionRow, { marginTop: spacings.xxxxLarge }]}>
//                   <Pressable style={[styles.applyButton, alignJustifyCenter, borderRadius10]} onPress={applyFilterByQuantity}>
//                     <Text style={styles.applyButtonText}>{APPLY}</Text>
//                   </Pressable>
//                 </View>
//               </View>
//             }
//             {/* <TouchableOpacity style={[styles.modalHeader, flexDirectionRow, justifyContentSpaceBetween]} onPress={toggleBrand}>
//         <Text style={styles.text}>Body</Text>
//         <View style={[styles.backIconBox, alignJustifyCenter]} >
//           <Text style={[styles.graytext]}>All</Text>
//         </View>
//       </TouchableOpacity> */}
//             {/* <TouchableOpacity style={[styles.button, borderRadius10, alignJustifyCenter, alignSelfCenter, positionAbsolute]} onPress={onClose}>
//         <Text style={[styles.text, { color: whiteColor }]}>View Items</Text>
//       </TouchableOpacity> */}
//           </ScrollView>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalHeader: {
//     width: '100%',
//     padding: spacings.large,
//     borderBottomWidth: 1,
//     borderBottomColor: lightGrayOpacityColor,
//     height: hp(7)
//   },
//   Box: {
//     width: '100%',
//     padding: spacings.xxLarge,
//     // borderBottomWidth: 1,
//     // borderBottomColor: lightGrayOpacityColor,
//     // height: hp(8)
//   },
//   headertext: {
//     fontSize: style.fontSizeLargeXX.fontSize,
//     fontWeight: style.fontWeightThin1x.fontWeight,
//     color: blackColor,
//   },
//   text: {
//     fontSize: style.fontSizeLarge.fontSize,
//     fontWeight: style.fontWeightThin.fontWeight,
//     color: blackColor,
//   },
//   graytext: {
//     fontSize: style.fontSizeNormal1x.fontSize,
//     fontWeight: style.fontWeightThin.fontWeight,
//     color: grayColor,
//   },
//   backIconBox: {
//     width: "20%",
//     alignItems: "flex-end"
//   },
//   container: {
//     width: wp(100),
//     padding: spacings.large,
//   },
//   input: {
//     width: wp(46),
//     height: 40,
//     borderColor: lightGrayOpacityColor,
//     paddingHorizontal: spacings.large,
//     marginRight: spacings.large,
//     color: blackColor
//   },
//   applyButton: {
//     backgroundColor: redColor,
//     width: wp(35),
//     height: hp(5),
//   },
//   applyButtonText: {
//     color: whiteColor,
//     fontSize: style.fontSizeNormal1x.fontSize,
//     fontWeight: style.fontWeightThin1x.fontWeight,
//   },

//   button: {
//     bottom: 20,
//     left: '5%',
//     width: '90%',
//     height: hp(7),
//     backgroundColor: redColor,
//   },
//   vendorButton: {
//     backgroundColor: whiteColor,
//     paddingVertical: 5,
//     paddingHorizontal: 10,
//     borderRadius: 5,
//     // borderBottomWidth: 1,
//     // borderBottomColor: lightGrayOpacityColor,
//     // marginRight: 10,
//   },
//   availabilityButton: {
//     backgroundColor: lightBlueColor,
//     width: wp(45),
//     height: hp(5),
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginVertical: 5,
//   },
//   availabilityButtonText: {
//     color: whiteColor,
//     fontSize: style.fontSizeNormal1x.fontSize,
//     fontWeight: style.fontWeightThin1x.fontWeight,
//   },
//   releaseBox: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 10,
//   },
//   mainRangeSection: {
//     position: 'relative',
//     height: 20,
//     backgroundColor: mediumGray,
//     // marginHorizontal: 20,
//     borderRadius: 10,
//   },
//   slider: {
//     position: 'absolute',
//     top: 0,
//     width: 20,
//     height: 20,
//     backgroundColor: redColor,
//     borderRadius: 10,
//   },
// });

// export default FilterModal;


import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Modal, StyleSheet, TouchableOpacity, Alert, PanResponder, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from '.././../utils';
import { whiteColor, darkgrayColor, redColor, blackColor, goldColor, lightGrayColor, lightBlueColor, grayColor, lightGrayOpacityColor, blackOpacity5, mediumGray } from '../../constants/Color';
import Ionicons from 'react-native-vector-icons/dist/Ionicons';
import { spacings, style } from '../../constants/Fonts';
import { BaseStyle } from '../../constants/Style';
import { ALL, APPLY, AVAILABILITY, BRAND, CLEAR, FILTER, INSTOCK, OUT_OF_STOCK, PRICE } from '../../constants/Constants';
import { logEvent } from '@amplitude/analytics-react-native';
import { useSelector } from 'react-redux';
import { useThemes } from '../../context/ThemeContext';
import { lightColors, darkColors } from '../../constants/Color';

const { alignItemsCenter, resizeModeContain, textAlign, alignJustifyCenter, flex, borderRadius10, overflowHidden, borderWidth1, flexDirectionRow, justifyContentSpaceBetween, alignSelfCenter, positionAbsolute } = BaseStyle;

const FilterModal = ({ applyFilters, onClose, visible, allProducts, vendor, onSelectVendor }) => {
  const { isDarkMode } = useThemes();
  const colors = isDarkMode ? darkColors : lightColors;
  const selectedItem = useSelector((state) => state.menu.selectedItem);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showPriceRange, setShowPriceRange] = useState(false);
  const [showBrand, setShowBrand] = useState(false);
  const [showAvailibility, setShowAvailibitlity] = useState(false);
  const [showInStock, setShowInStock] = useState(false);
  const [startPrice, setStartPrice] = useState(0);
  const [endPrice, setEndPrice] = useState();
  const [priceRange, setPriceRange] = useState();
  const [startPricePosition, setStartPricePosition] = useState(0);
  const [endPricePosition, setEndPricePosition] = useState(30);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    if (allProducts?.length > 0) {
      const prices = allProducts.map(product => parseFloat(product.variants.nodes[0]?.price)).filter(price => !isNaN(price));
      const maxPrice = Math.max(...prices);
      setEndPrice(maxPrice.toString());
      setPriceRange(maxPrice.toString());
    }
  }, [allProducts]);

  const handleStartPriceChange = (position) => {
    const newPos = Math.max(0, Math.min(endPricePosition - 20, position));
    const price = Math.round((newPos / wp(90)) * priceRange);
    setStartPrice(price);
    setMinPrice(price.toString());
    setStartPricePosition(newPos);
  };

  const handleEndPriceChange = (position) => {
    const newPos = Math.max(startPricePosition + 20, Math.min(wp(90), position));
    const price = Math.round((newPos / wp(90)) * priceRange);
    setEndPrice(price);
    setMaxPrice(price.toString());
    setEndPricePosition(newPos);
  };

  const handleMinPriceChange = (value) => {
    const price = parseFloat(value) || 0;
    const newPos = (price / priceRange) * wp(90);
    setMinPrice(value);
    setStartPrice(price);
    setStartPricePosition(newPos);
  };

  const handleMaxPriceChange = (value) => {
    const price = parseFloat(value) || 0;
    const newPos = (price / priceRange) * wp(90);
    setMaxPrice(value);
    setEndPrice(price);
    setEndPricePosition(newPos);
  };

  const startPricePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      handleStartPriceChange(gestureState.moveX - 10);
    },
  });

  const endPricePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event, gestureState) => {
      handleEndPriceChange(gestureState.moveX - 10);
    },
  });

  const applyFiltersCombined = () => {
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    const filteredProducts = allProducts.filter(product => {
      const productPrice = parseFloat(product.variants.nodes[0]?.price);
      const inventoryQuantities = product.variants.nodes.map(variant => variant.inventoryQuantity);
      const matchesPriceRange = (isNaN(min) || productPrice >= min) && (isNaN(max) || productPrice <= max);
      const matchesAvailability = showAvailibility ? (showInStock ? inventoryQuantities.some(quantity => quantity > 0) : inventoryQuantities.every(quantity => quantity === 0)) : true;
      return matchesPriceRange && matchesAvailability;
    });

    if (filteredProducts.length === 0) {
      Alert.alert("No products are currently available with the applied filters.");
    } else {
      applyFilters(filteredProducts);
      onClose();
    }
    logEvent(`Filters_Applied minPrice:${minPrice} maxPrice ${maxPrice} inStock:${showInStock}`);
  };

  const togglePriceRange = () => {
    setShowPriceRange(!showPriceRange);
    logEvent('Price_Range_Toggled');
  };

  const toggleBrand = () => {
    setShowBrand(!showBrand);
    logEvent('Brand_Filter_Toggled');
  };

  const toggleAvailability = () => {
    setShowAvailibitlity(!showAvailibility);
    logEvent('Availability_Filter_Toggled');
  };

  const resetFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setStartPrice(0);
    setEndPrice(0);
    setStartPricePosition(0);
    setEndPricePosition(30);
    setShowPriceRange(false);
    setShowBrand(false);
    setShowAvailibitlity(false);
    setShowInStock(false);
    setSelectedVendor(null);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ backgroundColor: blackOpacity5, height: hp(100) }}>
          <View style={[positionAbsolute, { backgroundColor: colors.whiteColor, bottom: 0, height: hp(85), borderTopLeftRadius: 10, borderTopRightRadius: 10, width: "100%" }]}>
            <View style={[styles.modalHeader, flexDirectionRow, alignJustifyCenter]}>
              <View style={{ width: "80%" }}>
                <Text style={[styles.headertext, { color: colors.blackColor }]}>Apply Filter</Text>
              </View>
              <TouchableOpacity style={styles.backIconBox} onPress={onClose}>
                <Ionicons name={"close"} size={30} color={colors.blackColor} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={toggleBrand}>
                <Text style={[styles.text, { color: colors.blackColor }]}>{BRAND}</Text>
                <View style={styles.backIconBox}>
                  <Text style={[styles.graytext, { color: colors.blackColor }]}>{ALL}</Text>
                </View>
              </TouchableOpacity>
              {showBrand && (
                <View>
                  {vendor.map(vendor => (
                    <TouchableOpacity
                      key={vendor}
                      style={[styles.vendorButton, flexDirectionRow, { backgroundColor: isDarkMode ? grayColor : whiteColor }]}
                      onPress={() => { setSelectedVendor(vendor), onSelectVendor(vendor), setShowBrand(false), logEvent(`Vendor_Selected ${vendor}`); }}
                    >
                      <Text style={[styles.graytext, { color: colors.blackColor }]}>{vendor}</Text>
                      {selectedVendor === vendor && <Ionicons name="checkmark" size={20} color={colors.blackColor} style={{ marginLeft: "auto", marginRight: spacings.xxxxLarge }} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={togglePriceRange}>
                <Text style={[styles.text, { color: colors.blackColor }]}>{PRICE}</Text>
                <View style={styles.backIconBox}>
                  <Text style={[styles.graytext, { color: colors.blackColor }]}>
                    {minPrice && maxPrice ? `${minPrice} - ${maxPrice}` : 'Min - Max'}
                  </Text>
                </View>
              </TouchableOpacity>
              {showPriceRange && (
                <View style={{
                  borderBottomWidth: 0.5,
                  borderBottomColor: lightGrayColor, paddingVertical: spacings.large
                }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", padding: spacings.large }}>
                    <TextInput
                      style={[styles.input, { color: colors.blackColor }]}
                      placeholder='Min Price'
                      value={minPrice}
                      onChangeText={handleMinPriceChange}
                      keyboardType="numeric"
                      placeholderTextColor={colors.blackColor}
                    />
                    <TextInput
                      style={[styles.input, { color: colors.blackColor }]}
                      placeholder='Max Price'
                      placeholderTextColor={colors.blackColor}
                      value={maxPrice}
                      onChangeText={handleMaxPriceChange}
                      keyboardType="numeric"
                    />

                  </View>
                  <View style={[styles.sliderContainer, flexDirectionRow]}>
                    <View {...startPricePanResponder.panHandlers} style={[styles.sliderHandle, { left: startPricePosition }]} />
                    <View {...endPricePanResponder.panHandlers} style={[styles.sliderHandle, { left: endPricePosition }]} />
                  </View>
                </View>
              )}
              <TouchableOpacity style={[styles.Box, flexDirectionRow, justifyContentSpaceBetween]} onPress={toggleAvailability}>
                <Text style={[styles.text, { color: colors.blackColor }]}>{AVAILABILITY}</Text>
                <View style={styles.backIconBox}>
                  <Text style={[styles.graytext, { color: colors.blackColor }]}>{showInStock ? INSTOCK : OUT_OF_STOCK}</Text>
                </View>
              </TouchableOpacity>
              {showAvailibility && (
                <View>
                  <TouchableOpacity style={[styles.Box, flexDirectionRow]} onPress={() => setShowInStock(!showInStock)}>
                    <Text style={[styles.optionText, { color: colors.blackColor }]}>{INSTOCK}</Text>
                    {showInStock && <Ionicons name="checkmark" size={20} color={colors.blackColor} style={{ marginLeft: "auto", marginRight: spacings.xxxxLarge }} />}
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.Box, flexDirectionRow]} onPress={() => setShowInStock(false)}>
                    <Text style={[styles.optionText, { color: colors.blackColor }]}>{OUT_OF_STOCK}</Text>
                    {!showInStock && <Ionicons name="checkmark" size={20} color={colors.blackColor} style={{ marginLeft: "auto", marginRight: spacings.xxxxLarge }} />}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
            <View style={styles.footer}>
              <Pressable style={styles.resetButton} onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset Filters</Text>
              </Pressable>
              <Pressable style={styles.applyButton} onPress={applyFiltersCombined}>
                <Text style={styles.applyButtonText}>{APPLY}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalHeader: {
    height: hp(8),
    borderBottomWidth: 0.5,
    borderBottomColor: grayColor,
    // paddingHorizontal: wp(5),
    // paddingVertical: hp(2),
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: lightGrayColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  headertext: {
    fontSize: 18,
    fontWeight: '600',
    color: blackColor
  },
  backIconBox: {
    paddingHorizontal: 4
  },
  Box: {
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
    borderBottomWidth: 0.5,
    borderBottomColor: lightGrayColor
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: blackColor
  },
  graytext: {
    fontSize: 16,
    color: mediumGray
  },
  vendorButton: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: lightGrayColor,
    backgroundColor: whiteColor,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  input: {
    borderWidth: 1,
    borderColor: grayColor,
    padding: spacings.large,
    marginHorizontal: wp(5),
    marginVertical: hp(2),
    fontSize: 16,
    color: blackColor,
    width: "40%",
    borderRadius: 10,
    height: 40
  },
  sliderContainer: {
    height: 20,
    backgroundColor: lightGrayColor,
    marginHorizontal: wp(2),
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: grayColor,
  },
  sliderHandle: {
    width: 20,
    height: 20,
    backgroundColor: redColor,
    position: 'absolute',
    top: 0,
    borderRadius: 100
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    // paddingBottom: hp(3),
    // backgroundColor: lightGrayColor,
    // borderTopWidth: 0.5,
    borderTopColor: grayColor
  },
  resetButton: {
    backgroundColor: grayColor,
    borderRadius: 10,
    padding: 12,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  resetButtonText: {
    color: whiteColor,
    fontWeight: '600'
  },
  applyButton: {
    backgroundColor: redColor,
    borderRadius: 10,
    padding: 12,
    width: '45%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3
  },
  applyButtonText: {
    color: whiteColor,
    fontWeight: '600'
  },
  optionButton: {
    padding: spacings[3],
    borderBottomWidth: 1,
    borderBottomColor: grayColor,
    borderRadius: 5,
    backgroundColor: whiteColor,
  },

});


export default FilterModal;



