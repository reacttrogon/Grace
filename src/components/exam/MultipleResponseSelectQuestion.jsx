import { Button, Checkbox, message } from "antd";
import React, { useEffect, useState } from "react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { submitEachAnswer } from "../../api";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import WatchLaterRoundedIcon from "@mui/icons-material/WatchLaterRounded";
import { cleanOptionText } from "../../utils/textSanitizer";
const MultipleResponseSelectQuestion = ({
  question,
  selectedValue,
  onChange,
  config,
  handelNextFunction,
}) => {
  const [selectedOptions, setSelectedOptions] = useState(selectedValue || []); // Initial value can be passed as a prop
  const {
    setNext,
    next,
    user_id,
    exam,
    exam_id,
    getAllQuestion,
    timeLeft,
    initialTime,
    handleButtonClick,
    formatTime,
    handleStartTimer,
    stopTimer,
    isSubmittingAnswer,
  } = config;

  const handelChange = (e) => {
    const { value, checked } = e.target;

    setSelectedOptions((prevSelectedOptions) => {
      let updatedOptions;

      if (checked) {
        // Prevent selecting more than the allowed options
        if (
          prevSelectedOptions.length >=
          parseInt(question?.option_to_be_selected)
        ) {
          message.error(
            `You can only select up to ${question?.option_to_be_selected} options.`
          );
          return prevSelectedOptions;
        }

        // Add the option if checked
        updatedOptions = [...prevSelectedOptions, value];
      } else {
        // Remove the option if unchecked
        updatedOptions = prevSelectedOptions.filter((item) => item !== value);
      }

      // Trigger onChange with the updated options
      onChange(updatedOptions);

      return updatedOptions;
    });
  };
  // Notify the parent component whenever selectedOptions changes

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
      <div className="mb-5 ">
        {/* <p>{question?.question}</p> */}
        <div
          sx={{ fontSize: "1rem", color: "#333" }}
          dangerouslySetInnerHTML={{
            __html: cleanOptionText(question?.question),
          }}
        />
        {/* {cleanOptionText(question?.question)}{" "}
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

      {/* Options Section */}

      {exam?.is_tutored === "1" && question?.is_attended === 1 ? (
        <>
          <div>
            <ul className="mb-5 ml-0 lg:ml-6">
              {question?.options?.map((option, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 mb-3" // Maintain consistent gap
                >
                  {/* Icon container for correct/incorrect answer */}
                  <div className="flex items-center" style={{ width: "24px" }}>
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
                      <div style={{ width: "18px" }} /> // Placeholder to maintain alignment
                    )}
                  </div>

                  {/* Checkbox with option text */}
                  <div className="flex items-center">
                    <Checkbox
                      checked={question?.selected_answer?.includes(option?.id)} // Track whether the checkbox is checked
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
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-[90%] m-auto mt-9 h-20 bg-[#f3f3f354]  grid grid-cols-[1fr_1fr] shadow-[0px_4px_6px_rgba(0,0,0,0.1)]">
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
            {/* <div className="grid p-2 place-items-center">
              <div>
                <div className="flex items-center justify-center gap-2">
                  <span>
                    <CreateRoundedIcon />
                  </span>
                  <div>
                    <p className="text-xs">0/9 Scoring</p>
                    <p className="text-xs">Scoring Rule</p>
                  </div>
                </div>
              </div>
            </div> */}
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
          <div>
            <ul className="mb-5 ml-0 lg:ml-6 ">
              {question?.options?.map((option, index) => (
                <li key={index} className="mb-3">
                  <Checkbox
                    value={option?.id}
                    checked={selectedOptions.includes(option?.id)} // Track whether the checkbox is checked
                    onChange={(e) => handelChange(e)} // Update selectedOptions on change
                  >
                    <p
                      className="ml-2 "
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

          {/* Navigation Buttons */}

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
  );
};

export default MultipleResponseSelectQuestion;
