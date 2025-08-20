import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { initialState, reducer } from "./reducer";
import { action } from "./action";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [globelSelecte, setGlobelSelecte] = useState({});
  const [state, dispatch] = useReducer(reducer, initialState);
  const [questionCount, setQuestionCount] = useState(0); // New state for QuestionCount
  const [questionNo, setQuestionNo] = useState(0); // New state for QuestionCount
  const [currentQuestionId, setCurrentQuestionId] = useState(0); // New state for QuestionCount
  const [indexNo, setIndexNo] = useState(0); // New state for QuestionCount
  const [responses, setResponses] = useState({}); // New state for QuestionCount

  // useEffect(() => {
  //   if (state?.exam?.questions) {
  //     let count = state.exam.questions.length;
  //     console.log(count, "Initial QuestionCount");

  //     if (state.innerQuestions) {
  //       console.log("Setting question count for nextgen");
  //       count = count + 2 - 1;
  //       console.log("Updated QuestionCount", count);
  //     }

  //     setQuestionCount(count);
  //   }
  // }, [state.exam?.questions, state.innerQuestions]); // Update when questions change

  const stateItems = useMemo(() => [state, dispatch], [state]);

  return (
    <AppContext.Provider
      value={{
        stateItems,
        globelSelecte,
        setGlobelSelecte,
        questionCount, // Provide QuestionCount
        setQuestionCount,
        questionNo,
        setQuestionNo,
        indexNo,
        setIndexNo, //   New state for QuestionCount
        currentQuestionId,
        setCurrentQuestionId, 
        responses,
        setResponses,

      }}
    >
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = () => {
  const {
    stateItems,
    globelSelecte,
    setGlobelSelecte,
    questionCount,
    setQuestionCount,
    indexNo,
    setIndexNo,
    questionNo,
    setQuestionNo,
    currentQuestionId,
    setCurrentQuestionId,
    responses,
    setResponses,
  } = useContext(AppContext);

  if (!stateItems) {
    throw new Error("Something wrong");
  }

  const [state, dispatch] = stateItems;
  const Actions = action(dispatch);

  return {
    state,
    Actions,
    globelSelecte,
    setGlobelSelecte,
    questionCount,
    setQuestionCount, // Expose QuestionCount
    indexNo,
    setIndexNo,
      questionNo,
    setQuestionNo,
    currentQuestionId,
    setCurrentQuestionId,
    responses,
    setResponses,
  };
};

export { AppContextProvider, useAppContext };
