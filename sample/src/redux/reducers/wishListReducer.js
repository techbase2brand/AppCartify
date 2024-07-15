import { ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST } from '../actions/types';

const initialState = {
  wishlist: [],
};

const wishlistReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_WISHLIST:
      return {
        ...state,
        wishlist: [...state.wishlist, action.payload.productId],
      };
    case REMOVE_FROM_WISHLIST:
      return {
        ...state,
        wishlist: state.wishlist.filter(id => id !== action.payload.productId),
      };

    default:
      return state;
  }
};

export default wishlistReducer;

