import React, { useEffect, useRef, useState } from "react";
import { Button, message, Radio } from "antd";
import MultipleChoiceQuestion from "../components/exam/MultipleChoiceQuestion";
import MatrixMultipleChoiceQuestion from "../components/exam/MatrixMultipleChoiceQuestion";
import MultipleResponseSelectQuestion from "../components/exam/MultipleResponseSelectQuestion";
import MultipleResponseSelectApplyQuestion from "../components/exam/MultipleResponseSelectApplyQuestion";
import FillingTheBlankQuestion from "../components/exam/FillingTheBlankQuestion";
import NextGenQuestionSection from "../components/NextGenQuestion/NextGenQuestionSection";
// import { examData } from "../service/exams";
import { getQuestions, submitEachAnswer } from "../api";
import Header from "../components/header/Header";
import { Modal, Input } from "antd";
import ModalCompo from "../components/Modal/ModalCompo";
import DOMPurify from "dompurify";
import axios from "axios";

import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import { json, useNavigate } from "react-router-dom";
import CalculatorModal from "../components/CalculatorModal/CalculatorModal";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import SuspendPopup from "../components/PopupsEnd/SuspendPopup";
import EndExamModal from "../components/PopupsEnd/EndExamModal";
import TimeOut from "../components/PopupsEnd/TimeOut";
import { useAppContext } from "../context";

const NursingTestUI = ({ userId, examId, timeDataObje }) => {
  const [next, setNext] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(
    localStorage.getItem("currentIndex") || 0
  ); // Track the current question index
  const [currentSubIndex, setCurrentSubIndex] = useState(0);
  // const [responses, setResponses] = useState({}); // Store user responses
  const [exams, setExam] = useState({});
  // console.log("this is exams from response ",exams);

  const { exam } = exams;
  // console.log("exam", exam);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [textModal, setTextModal] = useState(false);
  const [FeedbackModal, setFeedBackModal] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [suspendModal, setSuspentModal] = useState(false);
  const [endExameModal, setEndExamModal] = useState(false);
  const [timeIsUpModal, setTimeIsUpModal] = useState(false);
  const [innerQuestionIndex, setInnerQuestionIndex] = useState(0);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [noQuestions, setNoQuestions] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  const [pressNextButton, setPressButton] = useState(false);

  const {
    questionCount,
    questionNo,
    setCurrentQuestionId,
    responses,
    setResponses,
  } = useAppContext();
  // console.log("responses", responses);

  const objRef = useRef();
  const navigate = useNavigate();

  let user_id = userId && userId !== "undefined" ? JSON.parse(userId) : null;
  let exam_id = examId && examId !== "undefined" ? JSON.parse(examId) : null;

  const resizeHandeler = () => {
    setIsMobile(window.innerWidth <= 800);
  };
  useEffect(() => {
    window.addEventListener("resize", resizeHandeler);

    return () => window.removeEventListener("resize", resizeHandeler);
  }, []);

  const getAllQuestion = async () => {
    try {
      setIsLoadingQuestions(true);
      const response = await getQuestions(user_id, exam_id);
      console.log("response", response.status);
      
      // Validate response structure before setting state
      if (response?.data) {
        setExam(response.data);
        
        // Check if questions array exists and is empty
        const questions = response.data?.exam?.questions;
        if (Array.isArray(questions) && questions.length === 0) {
          setNoQuestions(true);
        } else if (!questions) {
          // Handle case where questions property doesn't exist
          console.warn("Questions property not found in response");
          setNoQuestions(true);
        }
      } else {
        // Handle empty or malformed response
        console.error("Invalid response structure:", response);
        setNoQuestions(true);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      setNoQuestions(true);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  useEffect(() => {
    getAllQuestion();
    console.log("currentIndex at starting........", currentIndex);

    const startIndex = 0; // Calculate the next index
    setCurrentIndex(startIndex);
    localStorage.setItem("currentIndex", startIndex);
  }, []);

  // console.log("exam",exam);

  useEffect(() => {
    const itemNumber = localStorage.getItem("currentIndex");
    if (itemNumber !== null) {
      setCurrentIndex(parseInt(itemNumber, 10));
    }
  }, []);

  // time calculation start
  const [timeLeft, setTimeLeft] = useState(0); // Time left
  const [timerRunning, setTimerRunning] = useState(false); // Timer state
  const [initialTime, setInitialTime] = useState(0); // Store the initial time in seconds

  useEffect(() => {
    // Check if exam.is_timed is "1" (string) and total_time exists
    if (exam?.is_timed === "1" && exam?.total_time) {
      const [minutes, seconds] = exam?.total_time.split(":").map(Number);
      const totalSeconds = minutes * 60 + (seconds || 0); // Convert to seconds
      setTimeLeft(totalSeconds); // Set time left initially
      setInitialTime(totalSeconds); // Store the initial time in seconds
      setTimerRunning(true); // Start the timer immediately
    }
  }, [exam?.is_timed, exam?.total_time]);

  useEffect(() => {
    let timer;

    if (timerRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1); // Decrement time when counting down
      }, 1000);
    }

    if (timeLeft === 0 && timerRunning && exam?.is_timed === "1") {
      setTimerRunning(false); // Stop the timer when time reaches 0
      console.log("Time is up!"); // Log when time is up
      // You can show a modal or other actions here
      if (exam?.is_timed === "1") {
        setTimeIsUpModal(true);
      }
    }

    return () => clearInterval(timer); // Cleanup interval when component unmounts or dependencies change
  }, [timerRunning, timeLeft]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600); // Calculate hours
    const minutes = Math.floor((timeInSeconds % 3600) / 60); // Calculate minutes
    const seconds = timeInSeconds % 60; // Calculate seconds

    return `${hours > 0 ? `${hours < 10 ? "0" : ""}${hours}:` : ""}${
      minutes < 10 ? "0" : ""
    }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handleButtonClick = () => {
    setTimerRunning(false); // Stop the timer
    // console.log(`Timer stopped at: ${formatTime(timeLeft)}`);
  };

  const handleReset = () => {
    setTimeLeft(initialTime); // Reset timeLeft to the initial time value
    setTimerRunning(true); // Restart the timer
    // console.log("Timer reset.");
  };

  const stopTimer = () => {
    setTimerRunning(false); // Stop the timer
    // console.log("Timer stopped at:", formatTime(timeLeft));
  };

  const handleStartTimer = () => {
    setTimerRunning(true); // Restart the timer
    // console.log("Timer restarted at:", formatTime(timeLeft));
  };

  // time calculation end

  // not timed
  const [elapsedTime, setElapsedTime] = useState(0); // Time spent on the current question
  const [isTimerActive, setIsTimerActive] = useState(false); // Timer state
  const [questionStartTimestamp, setQuestionStartTimestamp] = useState(0); // Store the start time of each question

  useEffect(() => {
    // Automatically start the timer when the component mounts
    startQuestionTimer();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  useEffect(() => {
    let questionTimerInterval;

    // If timer is active, increment the elapsed time every second
    if (isTimerActive) {
      questionTimerInterval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1); // Increment elapsed time for each question
      }, 1000);
    }

    return () => clearInterval(questionTimerInterval); // Cleanup interval when timer stops
  }, [isTimerActive]);

  // Format time in 00:00 (minutes:seconds)
  const formatElapsedTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60); // Calculate minutes
    const seconds = timeInSeconds % 60; // Calculate seconds
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`; // Format as 00:00
  };

  const startQuestionTimer = () => {
    setIsTimerActive(true); // Start the timer for the question
    setQuestionStartTimestamp(Date.now()); // Track start timestamp for the question
    // console.log("Question timer started.");
  };

  const stopQuestionTimer = () => {
    setIsTimerActive(false); // Stop the timer for the question
    // console.log(`Question timer stopped at: ${formatElapsedTime(elapsedTime)}`);
  };

  const resetQuestionTimer = () => {
    setElapsedTime(0); // Reset elapsed time
    setIsTimerActive(true); // Restart the timer
    // console.log("Question timer reset.");
  };

  // Track the time spent on the current question
  const submitQuestion = () => {
    // console.log(
    //   `Time spent on this question: ${formatElapsedTime(elapsedTime)}`
    // );
    // You can send the time spent on this question to the API
  };

  const handleAnswerChange = (questionId, value, type) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        answer: value, // Store the selected answer
        type: type, // Store the question type
      },
    }));
  };

  const handelNextFunction = async (dataitem) => {
    try {
      setIsSubmittingAnswer(true);
      const response = await submitEachAnswer(dataitem);

      if (response?.data?.status) {
        stopTimer();
        getAllQuestion();

        return response; // Return the response after success
      }
      return null; // Return null if the response is not successful
    } catch (error) {
      console.log(error);
      return null; // Handle error and return null
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // console.log("exam?.questions?.[currentIndex]?.question_parts?.[0]?.is_nextgen",exam?.questions);
  // console.log("",exam?.questions?.[currentIndex]);

  // console.log("exam?.questions?.[currentIndex]?.question_parts?.[0]?.is_nextgen",exam?.questions?.[currentIndex]?.question_parts?.[0]?.is_nextgen);

  let currentQuestion;
  
  // Safely check if we have valid exam data and current index
  if (!exam?.questions || !Array.isArray(exam.questions) || currentIndex >= exam.questions.length) {
    console.log("Invalid exam data or index out of bounds");
    currentQuestion = null;
  } else {
    const questionAtIndex = exam.questions[currentIndex];
    
    if (questionAtIndex?.question_parts?.[0]?.is_nextgen === "1") {
      // NextGen question
      currentQuestion = questionAtIndex;
    } else if (questionAtIndex?.question || questionAtIndex?.questions) {
      // Standard question with either 'question' or 'questions' property
      currentQuestion = questionAtIndex;
    } else {
      console.log("Question at index has unexpected structure:", questionAtIndex);
      currentQuestion = null;
    }
  }

  const handleNext = async (data, key) => {
    // console.log("ths is from next function ");

    const currentQuestion = exam?.questions[currentIndex];

    if (
      (Array.isArray(currentQuestion?.questions) &&
        currentQuestion.questions.length > 0) ||
      currentQuestion?.question
    ) {
      // console.log("this is from inside condition");

      if (
        Array.isArray(currentQuestion.questions) &&
        currentSubIndex < currentQuestion.questions.length - 1
      ) {
        // console.log("  currentSubIndex", currentSubIndex);
        setCurrentSubIndex(currentSubIndex + 1);
        return;
      }

      setCurrentSubIndex(0);
      setCurrentIndex(currentIndex + 1);
    }

    // console.log("current below handle next function ", currentIndex);

    // if (questionNo < questionCount) {
    //   // console.log("questionNo", questionNo);

    //   setQuestionNo((prev) => prev + 1);
    // }

    // nextQuestion();

    const answerData = responses;

    let slectedItem = responses[exam?.questions[currentIndex]?.id]?.answer;

    const timeDifference = initialTime - timeLeft;
    const dataitem = {
      user_id: user_id,
      exam_id: exam_id,
      question_id: currentQuestion?.id,
      selected_answer: slectedItem === null ? [] : slectedItem, // Could be an array for multiple responses
      question_type: currentQuestion?.type,
      time_taken:
        exam?.is_timed === "1"
          ? formatTime(timeDifference)
          : formatTime(timeLeft),
    };

    if (dataitem?.selected_answer !== undefined) {
      // console.log("next data", dataitem);
      // Here api call check
    }

    // if (currentIndex < exam?.questions?.length - 1) {
    //   const nextIndex = currentIndex + 1; // Calculate the next index
    //   setCurrentIndex(nextIndex);

    //   // Save the updated index to localStorage
    //   localStorage.setItem("currentIndex", nextIndex);
    // }
  };

  const handlePrevious = () => {
    if (currentSubIndex > 0) {
      const nextInnerQuestionIndex = currentSubIndex - 1;
      setCurrentSubIndex(nextInnerQuestionIndex);
      localStorage.setItem("innerQuestionIndex", nextInnerQuestionIndex);
    } else {
      const nextIndex = currentIndex - 1; // Calculate the next index
      setCurrentIndex(nextIndex);
      localStorage.setItem("currentIndex", nextIndex);
    }

    // if (currentIndex > 0) {

    // }
  };

  // Request full-screen mode
  const enterFullScreen = () => {
    const doc = document.documentElement;
    if (doc.requestFullscreen) {
      doc.requestFullscreen();
    } else if (doc.webkitRequestFullscreen) {
      // Safari
      doc.webkitRequestFullscreen();
    } else if (doc.mozRequestFullScreen) {
      // Firefox
      doc.mozRequestFullScreen();
    } else if (doc.msRequestFullscreen) {
      // IE/Edge
      doc.msRequestFullscreen();
    }
    setIsFullScreen(true);
  };

  // Exit full-screen mode
  const exitFullScreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      // Safari
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      // Firefox
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      // IE/Edge
      document.msExitFullscreen();
    }
    setIsFullScreen(false);
  };

  const config = {
    setTextModal,
    setFeedBackModal,
    setNext,
    next,
    setIsModalVisible,
    exam,
    currentIndex,
    setCurrentIndex,
    suspendModal,
    currentSubIndex,
    setSuspentModal,
    endExameModal,
    setEndExamModal,
    selectedAnswers,
    setSelectedAnswers,
    enterFullScreen,
    exitFullScreen,
    isFullScreen,
    getAllQuestion,
    user_id,
    exam_id,
    innerQuestionIndex,
    setInnerQuestionIndex,
    handelNextFunction,
    handleNext,

    // time
    timeLeft,
    initialTime,
    timerRunning,
    formatTime,
    handleButtonClick,
    handleReset,
    timeIsUpModal,
    setTimeIsUpModal,
    stopTimer,
    handleStartTimer,
    pressNextButton,
    setPressButton,
    objRef,

    // loading states
    isLoadingQuestions,
    isSubmittingAnswer,
    isSubmittingExam,

    // not timed
    notTime: formatElapsedTime(elapsedTime),
    timeDataObje,
  };

  const handleNoteChange = () => {};

  const handleClose = (type) => {
    if (type === "note") {
      setTextModal(false);
    } else {
      setFeedBackModal(false);
    }
  };

  const handelSubmit = (type) => {
    if (type === "note") {
      message.success("Submited");
      setTextModal(false);
    } else {
      message.success("Submited");
      setFeedBackModal(false);
    }
  };

  const onFinsh = async () => {
    // console.log("this is from onfinsh");

    const transformAnswers = (responses) => {
      return Object.keys(responses)
        .map((key) => {
          const { answer, type } = responses[key];

          let formattedAnswer;

          if (type === "fill_in_the_blank" && typeof answer === "object") {
            // Convert to array of { blank_number, option }
            formattedAnswer = Object.entries(answer).map(
              ([blankNumber, option]) => ({
                blank_number: parseInt(blankNumber, 10),
                option,
              })
            );
          } else if (
            type === "matrix_multiple_choice" &&
            typeof answer === "object"
          ) {
            // Convert to array of { row_id, column_id }
            formattedAnswer = Object.entries(answer)
              .map(([key, value]) => {
                const match = key.match(/row_(\d+)_col_(\d+)/);
                return match
                  ? {
                      row_id: parseInt(match[1], 10),
                      column_id: parseInt(match[2], 10),
                    }
                  : null;
              })
              .filter(Boolean);
          } else if (Array.isArray(answer)) {
            formattedAnswer = answer
              .map((a) =>
                typeof a === "object"
                  ? { question: a.question, option: a.option }
                  : a
              )
              .filter((a) => a !== null && a !== undefined && a !== "");
          } else {
            formattedAnswer = answer;
          }

          return {
            question_id: parseInt(key, 10),
            selected_answer: formattedAnswer,
            question_type: type,
          };
        })
        .filter(
          (item) =>
            item.selected_answer !== null &&
            item.selected_answer !== undefined &&
            item.selected_answer !== "" &&
            (!Array.isArray(item.selected_answer) ||
              item.selected_answer.length > 0)
        );
    };

    // console.log("responsessssssssss", responses);

    const postData = transformAnswers(responses);

    // console.log("ON FINSH", postData);

    try {
      setIsSubmittingExam(true);
      const response = await axios.post(
        `https://co-tutorlearning.com/api/Nclex_exam/submit_exam_answers`,
        { user_id, exam_id, answers: postData }
      );
      if (response?.data?.status) {
        message.success(response?.data?.message);
        localStorage.removeItem("currentIndex");
        navigate("/result");
        window.location.replace(
          `https://co-tutorlearning.com/app/result/get_exam_result_get/?user_id=${user_id}&exam_id=${exam_id}`
        );
      }
      setResponses({});
    } catch (error) {
      console.error("Something went wrong");
    } finally {
      setIsSubmittingExam(false);
    }
  };

  const renderQuestion = (question) => {
    if (!question) {
      console.log("question is null or undefined");
      return (
        <div className="p-4 text-center text-gray-500">
          <p>No question data available</p>
        </div>
      );
    }

    const { id = "", type = "" } = question || {};

    if (!id || !type) {
      console.log("Question missing required properties:", { id, type });
      return (
        <div className="p-4 text-center text-gray-500">
          <p>Question data is incomplete</p>
        </div>
      );
    }

    setCurrentQuestionId(id);

    const commonProps = {
      question,
      selectedValue: responses[id]?.answer || null,
      onChange: (value) => handleAnswerChange(id, value, type),
    };

    switch (type) {
      case "multiple_choice":
        return (
          <MultipleChoiceQuestion
            {...commonProps}
            config={config}
            handelNextFunction={handelNextFunction}
          />
        );

      case "multiple_response_select":
        return (
          <MultipleResponseSelectQuestion
            {...commonProps}
            config={config}
            handelNextFunction={handelNextFunction}
          />
        );
      case "multiple_response_select_apply":
        return (
          <MultipleResponseSelectApplyQuestion
            {...commonProps}
            config={config}
            handelNextFunction={handelNextFunction}
          />
        );

      case "matrix_multiple_choice":
        return (
          <MatrixMultipleChoiceQuestion
            {...commonProps}
            config={config}
            handelNextFunction={handelNextFunction}
          />
        );

      case "fill_in_the_blank":
        return (
          <FillingTheBlankQuestion
            {...commonProps}
            config={config}
            handelNextFunction={handelNextFunction}
          />
        );

      default:
        console.log("Unsupported question type:", type);
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Unsupported question type: {type}</p>
          </div>
        );
    }
  };
  // };

  const sanitizedHtml = DOMPurify.sanitize(currentQuestion?.explanation || "");
  let QuestionCount = exam?.questions?.length || 0;
  // console.log("this is thsi si oi",exam);

  // console.log("currentIndex", currentIndex);
  // console.log("currentSubIndex", currentSubIndex);

  // Check if required parameters are missing
  if (!user_id || !exam_id) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">Unable to load the exam.</p>
        </div>
      </div>
    );
  }

  // Check if loading questions
  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Loading Questions
          </h2>
          <p className="text-gray-600">
            Please wait while we load your exam questions...
          </p>
        </div>
      </div>
    );
  }

  // Check if there are no questions
  if (noQuestions) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Questions Available
          </h2>
          <p className="text-gray-600 mb-6">
            This exam does not contain any questions.
          </p>
          <button
            onClick={() => {
              // Direct redirect to the test creation page
              window.location.replace(
                "https://co-tutorlearning.com/app/create_test/index"
              );
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-screen overflow-hidden text-white exam-section">
        {/* Header Section */}
        <Header config={config} currentQuestion={currentQuestion} />

        {/* Main Content */}
        <div
          className={`flex flex-1 overflow-hidden ${
            currentQuestion?.explanation && currentQuestion.explanation.trim() !== ""
              ? "flex-col lg:flex-row"
              : "flex-col"
          } text-black rounded-lg`}
        >
          {currentQuestion?.type ? (
            <>
              {/* Responsive container: Column on mobile, Row on lg+ */}
              <div className="flex flex-col w-full h-full lg:flex-row">
                {/* Mobile: Single scrollable container for both explanation and question */}
                <div className="flex flex-col w-full h-full overflow-y-auto lg:hidden"
                  style={{
                    maxHeight: "calc(100vh - 160px)"
                  }}
                >
                  {/* Mobile Explanation - integrated into the page flow */}
                  {currentQuestion?.explanation && currentQuestion.explanation.trim() !== "" && (
                    <div className="p-3">
                      <h2 className="mb-2 font-bold">Explanation</h2>

                      {currentQuestion?.explanation_image?.trim() !== "" && (
                        <div className="mt-3 mb-3">
                          <img
                            src={currentQuestion?.explanation_image}
                            className="w-64 md:w-96"
                            alt="Explanation"
                          />
                        </div>
                      )}

                      <div
                        className="custom-content mb-6"
                        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                      />
                    </div>
                  )}

                  {/* Mobile Question - flows naturally after explanation */}
                  <div className="p-3">
                    {renderQuestion(currentQuestion)}
                  </div>
                </div>

                {/* Desktop: Explanation shows on LEFT with scrolling (unchanged) */}
                {currentQuestion?.explanation && currentQuestion.explanation.trim() !== "" && (
                  <div
                    className="hidden w-1/2 p-6 overflow-y-auto border-r lg:block"
                    style={{ 
                      maxHeight: "calc(100vh - 160px)",
                      height: "calc(100vh - 160px)"
                    }}
                  >
                    <h2 className="mb-2 font-bold  bg-white  pb-2">Explanation</h2>

                    {currentQuestion?.explanation_image?.trim() !== "" && (
                      <div className="mt-3 mb-3">
                        <img
                          src={currentQuestion?.explanation_image}
                          className="w-64 md:w-96"
                          alt="Explanation"
                        />
                      </div>
                    )}

                    <div
                      className="custom-content"
                      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                    />
                  </div>
                )}

                {/* Desktop Question section - RIGHT side (unchanged) */}
                <div
                  className={`hidden lg:block ${
                    currentQuestion?.explanation && currentQuestion.explanation.trim() !== "" ? "w-1/2" : "w-full"
                  } p-6 overflow-y-auto`}
                  style={{
                    maxHeight: "calc(100vh - 160px)",
                    height: "100%"
                  }}
                >
                  {renderQuestion(currentQuestion)}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-auto ">
              <NextGenQuestionSection config={config} prop={currentQuestion} />
            </div>
          )}

          {/* Question Section */}
        </div>

        {/* Footer Navigation */}

        <div className="flex flex-wrap justify-between items-center p-4 mt-auto bg-[#0067a9] text-white">
          {/* Left Section */}
          <div className="flex items-center justify-start gap-2">
            {isMobile ? (
              <div onClick={() => setEndExamModal(true)}>
                <ReplyAllIcon />
              </div>
            ) : (
              <Button
                onClick={() => setEndExamModal(true)}
                className="flex items-center w-full gap-2 text-white bg-blue-700 sm:w-auto"
              >
                <span>
                  <ReplyAllIcon />
                </span>
                End
              </Button>
            )}

            {isMobile ? (
              <div onClick={() => setSuspentModal(true)}>
                <PauseCircleIcon />
              </div>
            ) : (
              <Button
                onClick={() => setSuspentModal(true)}
                className="flex items-center w-full gap-2 text-white bg-blue-700 sm:w-auto"
              >
                <span>
                  {" "}
                  <PauseCircleIcon />
                </span>
                Suspend
              </Button>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center justify-start gap-2">
            {isMobile ? (
              <div onClick={handlePrevious}>
                <NavigateBeforeIcon />
              </div>
            ) : (
              <Button
                className="flex items-center w-full gap-2 text-white bg-blue-700 sm:w-auto"
                onClick={handlePrevious}
                disabled={currentSubIndex === 0 && currentIndex === 0}
              >
                <span>
                  <NavigateBeforeIcon />
                </span>{" "}
                Previous
              </Button>
            )}

            {/* {!isMobile && (
              <Button
                className="flex items-center w-full gap-2 text-white bg-blue-700 sm:w-auto"
                onClick={() => setNext(true)}
                disabled={currentIndex === 0}
              >
                Navigator
              </Button>
            )} */}

            {/* {console.log("questionNo",questionNo)} */}
            {/* {console.log("questionCount",questionCount)} */}
            {/* {console.log("questionCount - 1 ",questionCount - 1 )}  */}

            {questionNo === questionCount ? (
              ""
            ) : (
              <>
                <Button
                  className="flex items-center justify-center w-full gap-2 text-white bg-blue-700 sm:w-auto"
                  onClick={handleNext}
                  disabled={
                    currentIndex === questionCount - 1 || isSubmittingAnswer
                  }
                  loading={isSubmittingAnswer}
                >
                  {isSubmittingAnswer ? "Submitting..." : "Next"}{" "}
                  {!isSubmittingAnswer && (
                    <span>
                      <NavigateNextIcon />
                    </span>
                  )}
                </Button>
              </>
            )}

            {/*     
            {console.log("currentIndex",currentIndex)}
            {console.log("questionCount",questionCount-1)} */}

            {questionNo === questionCount && (
              <div className="w-full sm:w-auto">
                <Button
                  className="flex items-center w-full gap-2 text-white bg-blue-700 sm:w-auto"
                  onClick={() => onFinsh()}
                  disabled={isSubmittingExam}
                  loading={isSubmittingExam}
                >
                  {!isSubmittingExam && <CheckCircleIcon />}
                  {isSubmittingExam ? "Submitting Exam..." : "Submit"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal/Dialog */}
      {textModal && (
        <ModalCompo
          state={textModal}
          handleClose={handleClose}
          type={"note"}
          heading={"Note"}
          handelSubmit={handelSubmit}
        />
      )}
      {/* Feedback/Dialog */}
      {FeedbackModal && (
        <ModalCompo
          state={FeedbackModal}
          handleClose={handleClose}
          type={"feedback"}
          heading={"Feedback"}
          handelSubmit={handelSubmit}
        />
      )}

      <CalculatorModal
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />

      <SuspendPopup config={config} />
      <EndExamModal config={config} onFinsh={onFinsh} />
      <TimeOut config={config} onFinsh={onFinsh} />
    </>
  );
};

export default NursingTestUI;
