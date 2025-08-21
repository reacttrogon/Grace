import React, { useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";
import NursingTestUI from "./pages/NursingTestUI"; 

const App = () => {
  const getParamsFromURL = () => {
    const query = window.location.search; // Get the query string (e.g., ?token=...&language=en)
    const params = new URLSearchParams(query); // Parse the query string

    // Extract the 'token' parameter
    const userId = params.get("user_id")?.replace(/^"|"$/g, ""); // Remove leading and trailing quotes if they exist

    // Extract the 'language' parameter
    const examId = params.get("exam_id");
    
    // Extract the 'question_type' parameter
    const questionType = params.get("question_type");
    return { userId, examId, questionType }; // Return both values as an object
  };
  const { userId, examId, questionType } = getParamsFromURL();
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [lastIntervalTime, setLastIntervalTime] = useState(0);
  const startTimeRef = useRef(0);
  const defRef = useRef(0);

  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setCurrentSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval); // Cleanup on component unmount
  }, [isActive]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const startTimer = () => {
    startTimeRef.current = currentSeconds;
    setIsActive(true);
  };

  const stopTimer = () => {
    setIsActive(false);

    const endTime = currentSeconds;
    const intervalDuration = endTime - startTimeRef.current;

    setLastIntervalTime(intervalDuration); // Now, set `lastIntervalTime` with the duration
    defRef.current = intervalDuration;

    console.log("Timer Stopped");
    console.log("Start Time:", formatTime(startTimeRef.current));
    console.log("Stop Time:", formatTime(endTime));
    console.log("Last Interval Duration:", formatTime(intervalDuration));
  };

  const resetTimer = () => {
    setCurrentSeconds(0);
    setLastIntervalTime(0);
    startTimeRef.current = 0;
    setIsActive(false);
    console.log("Timer Reset");
  };

  const timeDataObj = {
    currentSeconds,
    startMyTimer: startTimer,
    stopMyTimer: stopTimer,
    formatMyTimer: formatTime,
    lastIntervalTime,
    defRef,
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <NursingTestUI
            userId={userId}
            examId={examId}
            questionType={questionType}
            timeDataObje={timeDataObj}
          />
        }
      /> 
    </Routes>
  );
};
//
export default App;
