import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react"
import { initialState, reducer } from "./reducer"
import { action } from "./action"
import axios from "axios"


const GlobelContext = createContext()
const GlobelContextProvider = ({ children }) => {


  const [stateItem, dispatch] = useReducer(reducer, initialState)

  const stateItems = useMemo(() => [stateItem, dispatch], [stateItem])



  return (
    <GlobelContext.Provider value={{ stateItems }}>
      {children}
    </GlobelContext.Provider>
  )
}

const useGlobelContext = () => {
  const { stateItems } = useContext(GlobelContext)

  if (!stateItems) {
    throw new Error('Somthing wrong')
  }
  const [stateItme, dispatch] = stateItems

  const GlobelActions = action(dispatch)

  return {
    stateItme, GlobelActions,
  }

}

export { GlobelContextProvider, useGlobelContext }
