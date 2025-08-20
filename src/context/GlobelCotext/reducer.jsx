import * as actionType from './type'


export const initialState = {
    reviewPopup: false
}

export const reducer = (state, action) => {
    switch (action.type) {
        case actionType.REVIEW_OPEN:
            return {
                ...state, reviewPopup: true
            };
        case actionType.REVIEW_CLOSE:
            return {
                ...state, reviewPopup: false
            };
        default:
            return state
    }
}