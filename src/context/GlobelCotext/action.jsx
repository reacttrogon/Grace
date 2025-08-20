import * as actionType from './type'

export const action = (dispatch) => {
    return {
        rieviePopupItem: {
            isOpen: () => {
                dispatch({ type: actionType.REVIEW_OPEN })
            },
            isClose: () => {
                dispatch({ type: actionType.REVIEW_CLOSE })

            }
        }



    }
}