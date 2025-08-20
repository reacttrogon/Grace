import * as actionType from './type'


export const initialState = {
    sideBarOpen: false,
    searchOpen: false,
    filterOpen: false,
    verifyPopupOpen: false,
    reviewPopup: false
}

export const reducer = (state, action) => {
    switch (action.type) {
        case actionType.OPEN_SIDEBAR:
            return {
                ...state, sideBarOpen: true
            };
        case actionType.CLOSE_SIDEBAR:
            return {
                ...state, sideBarOpen: false
            };
        case actionType.SEARCH_OPEN:
            return {
                ...state, searchOpen: true
            };
        case actionType.SEARCH_CLOSE:
            return {
                ...state, searchOpen: false
            };
        case actionType.FILTERPAGE_OPEN:
            return {
                ...state, filterOpen: true
            };
        case actionType.FILTERPAGE_CLOSE:
            return {
                ...state, filterOpen: false
            };
        case actionType.VERIFYPOPUP_OPEN:
            return {
                ...state, verifyPopupOpen: true
            };
        case actionType.VERIFYPOPUP_CLOSE:
            return {
                ...state, verifyPopupOpen: false
            };
        case actionType.REVIEWPOPUP_OPEN:
            return {
                ...state, reviewPopup: true
            };
        case actionType.VERIFYPOPUP_CLOSE:
            return {
                ...state, reviewPopup: false
            }
        default:
            return state
    }
}