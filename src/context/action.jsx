import * as actionType from "./type";

export const action = (dispatch) => {
  return {
    menuItem: {
      isOpen: () => {
        dispatch({ type: actionType.OPEN_SIDEBAR });
      },
      isClose: () => {
        dispatch({ type: actionType.CLOSE_SIDEBAR });
      },
    },
    searchMenu: {
      isOpen: () => {
        dispatch({ type: actionType.SEARCH_OPEN });
      },
      isClose: () => {
        dispatch({ type: actionType.SEARCH_CLOSE });
      },
    },
    filterPage: {
      isOpen: () => {
        dispatch({ type: actionType.FILTERPAGE_OPEN });
      },
      isClose: () => {
        dispatch({ type: actionType.FILTERPAGE_CLOSE });
      },
    },
    verifyPopup: {
      isOpen: () => {
        dispatch({ type: actionType.VERIFYPOPUP_OPEN });
      },
      isClose: () => {
        dispatch({ type: actionType.VERIFYPOPUP_CLOSE });
      },
    },
    reviewPopupHandel: {
      isOpen: () => {
        dispatch({ type: actionType.REVIEWPOPUP_OPEN });
      },
      isClose: () => {
        dispatch({ type: actionType.VERIFYPOPUP_CLOSE });
      },
    },
  };
};
