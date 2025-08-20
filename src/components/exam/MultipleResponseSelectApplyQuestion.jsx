import React, { useState, useEffect } from "react";
import { Checkbox, Button } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

import { submitEachAnswer } from "../../api";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import WatchLaterRoundedIcon from "@mui/icons-material/WatchLaterRounded";
import { cleanOptionText } from "../../utils/textSanitizer";
const MultipleResponseSelectApplyQuestion = ({
  question,
  selectedValue,
  onChange,
  config,
  handelNextFunction,
}) => {
  // Use state to keep track of selected options
  const [selectedOptions, setSelectedOptions] = useState(selectedValue || []); // Initial value can be passed as a prop
  const {
    setNext,
    next,
    exam,
    user_id,
    exam_id,
    getAllQuestion,
    handleStartTimer,
    stopTimer,
    timeLeft,
    initialTime,
    handleButtonClick,
    formatTime,
    isSubmittingAnswer,
  } = config;

  const handelChange = (e) => {
    const { value, checked } = e.target;

    // Update the selected options based on whether checkbox is checked or unchecked
    setSelectedOptions((prevSelectedOptions) => {
      const updatedOptions = checked
        ? [...prevSelectedOptions, value] // Add value if checked
        : prevSelectedOptions.filter((item) => item !== value); // Remove value if unchecked
      // Trigger the onChange callback with the updated selected options
      onChange(updatedOptions); // This will be called every time a checkbox is clicked
      return updatedOptions;
    });
  };

  // Monitoring state changes using useEffect
  // useEffect(() => {
  //   console.log("Current selected options:", selectedOptions);
  // }, [selectedOptions]); // This will run every time selectedOptions changes

  const handelReviewClick = async () => {
    setNext(question?.id);
    localStorage.setItem("examReview", question?.id);
    const timeDifference = initialTime - timeLeft;
    handleButtonClick();
    const dataitem = {
      user_id: user_id,
      exam_id: exam_id,
      question_id: question?.id,
      selected_answer: selectedValue === null ? [] : selectedValue, // Could be an array for multiple responses
      question_type: question?.type,
      time_taken:
        exam?.is_timed === "1"
          ? formatTime(timeDifference)
          : formatTime(timeLeft),
    };

    try {
      const response = await handelNextFunction(dataitem);

      if (response?.status) {
        // stopTimer();
        // getAllQuestion();
        console.log("responseee", response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (question?.is_attended !== 1) {
      handleStartTimer();
    } else {
      stopTimer();
    }
  }, [question?.is_attended]);

  return (
    <div>
      <div>
        {/* Question Section */}
        <div className="mb-5">
          {/* <p>{question?.question}</p>  */}
          <div
            sx={{ fontSize: "1rem", color: "#333" }}
            dangerouslySetInnerHTML={{
              __html: cleanOptionText(question?.question),
            }}
          />
          {/* {cleanOptionText(question?.question)}
          </div> */}
        </div>

        {question?.question_image?.trim() !== "" && (
          <>
            <div>
              <img
                className="w-64 mt-1 mb-1 md:w-96"
                src={question?.question_image}
                alt=""
              />
            </div>
          </>
        )}
        {exam?.is_tutored === "1" && question?.is_attended === 1 ? (
          <>
            {/* Options Section */}
            <div>
              <ul className="mb-5 ml-0 lg:ml-6">
                {question?.options?.map((option, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 mb-3" // Maintain consistent gap
                  >
                    {/* Icon container for correct/incorrect answer */}
                    <div
                      className="flex items-center"
                      style={{ width: "24px" }}
                    >
                      {option?.is_correct === "1" ? (
                        <CheckCircleOutlined
                          className="text-green-500"
                          style={{ fontSize: "18px" }}
                        />
                      ) : question?.selected_answer?.includes(option?.id) &&
                        option?.is_correct !== "1" ? (
                        <CloseCircleOutlined
                          className="text-red-600"
                          style={{ fontSize: "18px" }}
                        />
                      ) : (
                        <div style={{ width: "18px" }} /> // Placeholder for alignment
                      )}
                    </div>

                    {/* Checkbox and option text */}
                    <Checkbox
                      checked={question?.selected_answer?.includes(option?.id)} // Handle the checked state
                      className="flex items-center"
                    >
                      <p
                        className="text-[16px] ml-2"
                        dangerouslySetInnerHTML={{
                          __html: cleanOptionText(option?.option_text),
                        }}
                      />
                      {/* {cleanOptionText(option?.option_text)}
                      </p> */}
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </div>

            <div className="max-w-[90%] mt-9 m-auto h-20 bg-[#f3f3f354]  grid grid-cols-[1fr_1fr] shadow-[0px_4px_6px_rgba(0,0,0,0.1)]">
              <div className="grid p-2 place-items-center">
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span>
                      <BookmarkAddedRoundedIcon />
                    </span>
                    <div>
                      <p className="text-xs">0/9</p>
                      <p className="text-xs">Scored max</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid p-2 place-items-center">
                <div>
                  <div className="flex items-center justify-center gap-2">
                    <span>
                      <WatchLaterRoundedIcon />
                    </span>
                    <div>
                      <p className="text-xs">{question?.time_taken}</p>
                      <p className="text-xs">Time Spend</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Options Section */}
            <div>
              <ul className="mb-5 ml-0 lg:ml-6">
                {question?.options?.map((option, index) => (
                  <li key={index} className="mb-3">
                    <Checkbox
                      value={option?.id}
                      checked={selectedOptions?.includes(option?.id)} // Track whether the checkbox is checked
                      onChange={handelChange} // Update selectedOptions on change
                    >
                      <p
                        dangerouslySetInnerHTML={{
                          __html: cleanOptionText(option?.option_text),
                        }}
                      />
                    </Checkbox>
                  </li>
                ))}
              </ul>
            </div>

            {/* Navigation Buttons (optional, if you want to keep them) */}
            {exam?.is_tutored === "1" && (
              <div className="mb-5 ml-0 lg:ml-6">
                <Button
                  style={{ background: "blue", color: "white" }}
                  onClick={() => {
                    onChange(selectedOptions);
                    handelReviewClick();
                  }}
                  disabled={isSubmittingAnswer}
                  loading={isSubmittingAnswer}
                >
                  {isSubmittingAnswer ? "Submitting..." : "Submit"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MultipleResponseSelectApplyQuestion;
