import {
  ENQUEUE_SNACKBAR,
  CLOSE_FIXED_SNACKBAR,
  REMOVE_SNACKBAR,
} from "../actions/snackBars";

export const initialState = {
  notifications: [],
};

export const reducer = (state = initialState, action = {}) => {
  switch (action.type) {
    case ENQUEUE_SNACKBAR:
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            ...action.notification,
          },
        ],
      };

    case CLOSE_FIXED_SNACKBAR:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) =>
            notification.options.persist &&
            (!notification.messageKey ||
              notification.messageKey !== action.key),
        ),
      };

    case REMOVE_SNACKBAR:
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.key !== action.key,
        ),
      };

    default:
      return state;
  }
};
export default reducer;
