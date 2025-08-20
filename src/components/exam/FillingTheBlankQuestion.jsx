import React, { useState, useEffect, useRef } from "react";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import { submitEachAnswer } from "../../api";
import {cleanOptionText} from "../../utils/textSanitizer"


const FillingTheBlankQuestion = ({
  question,
  config,
  selectedValue,
  onChange,
}) => {
  const {
    next,
    setNext,
    selectedAnswers,
    setSelectedAnswers,
    updateReviewList,
    user_id,
    exam_id,
    exam,
    getAllQuestion,
    timeLeft,
    initialTime,
    handleButtonClick: handeltimeStop,
    formatTime,
    timeDataObje,
    isSubmittingAnswer,
  } = config;

  const parseBlankText = (text) => {
    return text.split(/[\[\(]\s*blank\s*[\]\)]/i);
  };

  const blanks = question?.fill_in_text
    ? parseBlankText(question.fill_in_text)
    : [];

  // Store selected answers as an array of objects as required by the API
  const [answers, setAnswers] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const startTimeRef = React.useRef(null);
  const [timeTaken, setTimeTaken] = useState("00:00");

  const isAttended = question?.is_attended;
  const selectedAnswer = question?.selected_answer;
  const correctedAnswer = question?.options;
  // Initialize the answers structure based on available blanks
  useEffect(() => {
    if (Array.isArray(question?.options) && question.options.length > 0) {
      // Initialize empty answers based on the options structure
      const initialAnswers = question.options.map((option) => ({
        blank_number: option.blank_number,
        option: "",
      }));
      setAnswers(initialAnswers);
    }
  }, [question]);

  // Start timer when component mounts
  useEffect(() => {
    if (exam?.is_timed === "1") {
      if (question?.is_attended !== 1) {
        handleStartTimer();
        // Also start tracking time for this specific question
        startTimeRef.current = new Date();
        const interval = setInterval(() => {
          const now = new Date();
          const diff = now - startTime;
          if (startTimeRef.current) {
            const now = new Date();
            const diff = now - startTimeRef.current;
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeTaken(
              `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`
            );
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        timeDataObje.stopMyTimer();
      }
    } else {
      if (question?.is_attended !== 1) {
        timeDataObje.startMyTimer();
        // Also start tracking time for this specific question
        startTimeRef.current = new Date();
        const interval = setInterval(() => {
          const now = new Date();
          const diff = now - startTime;
          if (startTime) {
            const minutes = Math.floor(diff / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setTimeTaken(
              `${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`
            );
          }
        }, 1000);

        return () => clearInterval(interval);
      } else {
        timeDataObje.stopMyTimer();
      }
    }
  }, [question?.is_attended]);

  const handleOptionSelect = (blankNumber, selectedOption) => {
    onChange({ blankNumber, selectedOption });
  };

  const handelNextFunction = async (dataitem) => {
    try {
      const response = await submitEachAnswer(dataitem);

      if (response?.data?.status) {
        timeDataObje.stopMyTimer();

        getAllQuestion();
        return response;
      }
      return null;
    } catch (error) {
      console.log(error);
      console.error("API CALL FAILED ❌");
      console.error("Full error object:", error);
      console.error("Axios error response:", error?.response);
      console.error("Axios error data:", error?.response?.data);
      return null;
    }
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    // Format the data according to the required structure
    const dataitem = {
      user_id: user_id,
      exam_id: exam_id,
      question_id: question?.id,
      question_type: "fill_in_the_blank",
      selected_answer: answers,
      time_taken: timeTaken,
    };

    // console.log("dataitem", dataitem);

    try {
      const response = await handelNextFunction(dataitem);
      // console.log("response", response);

      // console.log("response?.data.status", response?.data.status);

      if (response?.data?.status) {
        getAllQuestion();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Helper function to update a specific answer
  const updateAnswer = (blankNumber, selectedOption) => {
    // console.log("selectedOption", selectedOption);
    // console.log("blankNumber", blankNumber);

    setAnswers((prevAnswers) =>
      prevAnswers.map((answer) =>
        answer.blank_number === blankNumber
          ? { ...answer, option: selectedOption }
          : answer
      )
    );
  };

  // Check if all blanks have answers
  const allAnswersFilled = () => {
    return answers.every((answer) => answer.option !== "");
  };

  const dirtyHTML = question?.question;

  // Safety check for question data
  if (!question || !question.fill_in_text || !Array.isArray(question.options) || question.options.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Fill in the blank question data is not available or incomplete</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6 mx-auto bg-white rounded-lg ">
        <div className="mb-6">
          <p className="flex mb-2">
            <DoubleArrowIcon className="text-blue-300" />
          
            <p   dangerouslySetInnerHTML={{
                __html: cleanOptionText(question?.question),
              }} />
          </p>
          <div className="p-4 ml-3 pl-0 leading-[2.5rem] mt-7">
            <FillInTheBlank
              fillInText={question?.fill_in_text}
              options={question?.options}
              blanks={blanks}
              answers={answers}
              updateAnswer={updateAnswer}
              handleOptionSelect={handleOptionSelect}
              isAttended={isAttended}
              selectedAnswer={selectedAnswer}
              correctedAnswer={correctedAnswer}
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handleSubmit}
              disabled={!allAnswersFilled() || isSubmittingAnswer}
              className="px-3 py-3 mt-3 ml-4 text-white bg-blue-600 rounded disabled:bg-blue-300"
            >
              {isSubmittingAnswer ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillingTheBlankQuestion;

const FillInTheBlank = ({
  options,
  blanks,
  answers,
  updateAnswer,
  handleOptionSelect,
  isAttended,
  selectedAnswer,
  correctedAnswer,
}) => {
  // console.log("isAttended", isAttended);
  // console.log("selectedAnswer", selectedAnswer);
  // console.log("correctedAnswer", correctedAnswer);

  // Get dropdown options for a specific blank
  const getOptionsForBlank = (blankNumber) => {
    if (!Array.isArray(options)) return [];
    const optionData = options.find((opt) => opt.blank_number === blankNumber);
    return optionData && Array.isArray(optionData.dropdown_options) ? optionData.dropdown_options : [];
  };

  // Get the current selected value for a blank

  // Get the current selected value for a blank
  const getCurrentValue = (blankNumber) => {
    if (isAttended && Array.isArray(selectedAnswer)) {
      const selected = selectedAnswer.find(
        (ans) => ans.blank_number === blankNumber
      );
      return selected ? selected.submitted_option : ""; // default is empty
    } else if (Array.isArray(answers)) {
      const answer = answers.find((ans) => ans.blank_number === blankNumber);
      return answer ? answer.option : ""; // default is empty
    }
    return "";
  };

  return (
    <>
      {isAttended && Array.isArray(selectedAnswer) && selectedAnswer.length > 0 && Array.isArray(correctedAnswer) && correctedAnswer.length > 0 ? (
        <p>
          {Array.isArray(blanks) ? blanks.map((part, index) => {
            const blankNumber = (index + 1).toString();

            const selected = selectedAnswer.find(
              (ans) => ans.blank_number === blankNumber
            )?.submitted_option;

            const correct = correctedAnswer.find(
              (ans) => ans.blank_number === blankNumber
            )?.correct_option;

            return (
              <span key={index}>
                {part}
                {index < blanks.length - 1 && (
                  <>
                    <select
                      value={getCurrentValue(blankNumber)?.trim() || ""}
                      onChange={(e) => {
                        const selectedOption = e.target.value;
                        updateAnswer(blankNumber, selectedOption);
                        handleOptionSelect(blankNumber, selectedOption);
                      }}
                      className="p-1 mx-1 border select-container"
                    >
                      <option value="" disabled>
                        Select an answer
                      </option>
                      {getOptionsForBlank(blankNumber).map((option, i) => {
                        const trimmedOption = option.trim();
                        const trimmedSelected = (selected || "").trim();
                        const trimmedCorrect = (correct || "").trim();

                        const isSelected = trimmedOption === trimmedSelected;
                        const isCorrect = trimmedOption === trimmedCorrect;
                        const isWrongSelected =
                          isSelected && trimmedSelected !== trimmedCorrect;

                        return (
                          <option key={i} value={trimmedOption}>
                            {trimmedOption}{" "}
                            {isSelected && isCorrect && isAttended && "✅"}
                            {isWrongSelected && isAttended && "❌"}
                            {isCorrect &&
                              trimmedSelected !== trimmedCorrect &&
                              isAttended &&
                              "✅"}
                          </option>
                        );
                      })}
                    </select>
                  </>
                )}
              </span>
            );
          }) : <span>No blanks available</span>}
        </p>
      ) : (
        <p>
          {Array.isArray(blanks) ? blanks.map((part, index) => (
            <span key={index}>
              {part}
              {index < blanks.length - 1 && (
                <select
                  value={getCurrentValue((index + 1).toString())}
                  onChange={(e) => {
                    const blankNumber = (index + 1).toString();
                    const selectedOption = e.target.value;
                    updateAnswer(blankNumber, selectedOption);
                    handleOptionSelect(blankNumber, selectedOption); // <-- This is the call!
                  }}
                  className="p-1 mx-1 border select-container"
                >
                  <option value="">Select an answer</option>
                  {getOptionsForBlank((index + 1).toString()).map(
                    (option, i) => (
                      <option key={i} value={option}>
                        {option}
                      </option>
                    )
                  )}
                </select>
              )}
            </span>
          )) : <span>No blanks available</span>}
        </p>
      )}
    </>
  );
};

// export default FillInTheBlank;
// // Helper functions for timer management that would need to be implemented
// const handleStartTimer = () => {
//   // Implementation depends on your existing timer logic
// };

// const stopTimer = () => {
//   // Implementation depends on your existing timer logic
// };
