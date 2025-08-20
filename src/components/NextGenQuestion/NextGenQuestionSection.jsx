import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import MatrixMultipleChoiceQuestion from "../exam/MatrixMultipleChoiceQuestion";
import FillingTheBlankQuestion from "../exam/FillingTheBlankQuestion";
import MultipleChoiceQuestion from "../exam/MultipleChoiceQuestion";
import MultipleResponseSelectQuestion from "../exam/MultipleResponseSelectQuestion";
import MultipleResponseSelectApplyQuestion from "../exam/MultipleResponseSelectApplyQuestion";
import { useAppContext } from "../../context";
import { cleanOptionText } from "../../utils/textSanitizer";

const NextGenQuestionSection = ({ config, prop }) => {
  const {
    currentIndex,
    currentSubIndex,
    handleNext,
    handelNextFunction,
    timeDataObj,
    selectedAnswers,
  } = config;
  const {
    questionCount,
    questionNo,
    setQuestionNo,
    indexNo,
    setIndexNo,
    currentQuestionNo,
    setCurrentQuestionId,
    responses,
    setResponses,
  } = useAppContext();

  const questions = prop;
  // console.log("questions prop", questions);

  const questionParts = questions?.question_parts || [];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 800);
  const [activeTab, setActiveTab] = useState(
    questionParts?.[0] || "" // Default to first tab's ID
  );

  // const [responses, setResponses] = useState({}); // Store user responses
  // console.log("responses", responses);
  // console.log("selectedAnswers", selectedAnswers);

  // Reset activeTab when questionParts changes (e.g., on reload)
  useEffect(() => {
    if (Array.isArray(questionParts) && questionParts.length > 0) {
      if (!activeTab || !questionParts.find(part => part.id === activeTab)) {
        setActiveTab(questionParts[0].id);
      }
    }
  }, [questionParts]);

  const handleAnswerChangeMatrix = (
    rowId,
    questionText,
    columnHeader,
    column_number,
    type,
    id,
    isChecked
  ) => {
    setResponses((prev) => {
      const prevAnswer = prev[id]?.answer || {};

      const key = `row_${rowId}_col_${column_number}`;

      const updatedAnswer = { ...prevAnswer };

      if (isChecked) {
        updatedAnswer[key] = questionText; // Add selection
      } else {
        delete updatedAnswer[key]; // Remove selection
      }

      return {
        ...prev,
        [id]: {
          ...prev[id],
          type,
          answer: updatedAnswer,
        },
      };
    });
  };

  const handleAnswerChange = (id, value, type, blankNumber = null) => {
    // console.log("handleAnswerChange");

    // console.log("Value:", value);
    // console.log("Type:", type);
    // console.log("Blank Number:", blankNumber);
    // console.log("ID:", id);

    if (type === "fill_in_the_blank") {
      setResponses((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          type,
          answer: {
            ...(prev[id]?.answer || {}),
            [blankNumber]: value,
          },
        },
      }));
    } else {
      setResponses((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          type,
          answer: value,
        },
      }));
    }
  };

  const currentQuestion =
    Array.isArray(questions?.questions) && questions.questions.length > currentSubIndex 
      ? questions.questions[currentSubIndex] 
      : null;
  // console.log("currentQuestion", currentQuestion);

  // rendering questions
  const renderQuestion = (questions) => {
    if (!questions || !currentQuestion) {
      console.log("questions or currentQuestion is null");
      return (
        <div className="p-4 text-center text-gray-500">
          <p>No question data available</p>
        </div>
      );
    }

    // console.log("this is from render questions", questions);

    // const { id = "", type = "" } = questions || {};

    const type = currentQuestion.type || "";
    const id = currentQuestion.id || "";

    // console.log("from render id", id);
    // console.log("from render type", type);

    // const commonProps = {
    //   selectedValue: responses[id]?.answer || null,
    //   onChange: (value) => handleAnswerChange(id, value, type), // Pass type here
    // };

    const commonProps = {
      selectedValue: responses[id]?.answer || null,
      onChange: (value, isChecked) => {
        // For fill in the blank, value will be an object like { blankNumber, selectedOption }
        if (type === "fill_in_the_blank") {
          handleAnswerChange(id, value.selectedOption, type, value.blankNumber);
        } else if (type === "matrix_multiple_choice") {
          // console.log("this is from matrix_multiple_choice commonprops.....");

          // console.log("Value: from matrix_multiple_choice", value);

          const { rowId, columnHeader, column_number, questionText } = value;

          console.log("value", value);
          console.log("column_number", column_number);

          handleAnswerChangeMatrix(
            rowId,
            questionText,
            columnHeader,
            column_number,
            type,
            id,
            isChecked
          );
        } else {
          handleAnswerChange(id, value, type);
        }
      },
    };

    // console.log("commonprops", commonProps);

    if (questionParts) {
      const currentQues = questions?.questions[currentSubIndex];
      setCurrentQuestionId(currentQues.id);

      const type = questions?.questions[currentSubIndex].type;

      switch (type) {
        case "multiple_choice":
          // console.log("selected", type);
          return (
            <MultipleChoiceQuestion
              question={currentQues}
              {...commonProps}
              config={config}
              handelNextFunction={handelNextFunction}
            />
          );

        case "multiple_response_select":
          // console.log("selected", type);
          return (
            <MultipleResponseSelectQuestion
              question={currentQues}
              {...commonProps}
              config={config}
              handelNextFunction={handelNextFunction}
            />
          );
        case "multiple_response_select_apply":
          // console.log("selected", type);
          return (
            <MultipleResponseSelectApplyQuestion
              question={currentQues}
              {...commonProps}
              config={config}
              handelNextFunction={handelNextFunction}
            />
          );

        case "matrix_multiple_choice":
          // console.log("selected", type);
          return (
            <MatrixMultipleChoiceQuestion
              question={currentQues}
              config={config}
              {...commonProps}
            />
          );

        case "fill_in_the_blank":
          // console.log("selected", type);
          return (
            <FillingTheBlankQuestion
              question={currentQues}
              config={config}
              {...commonProps}
            />
          );

        default:
          return null;
      }
    } else {
      console.log("this is from else case ");
    }
  };

  useEffect(() => {}, [questions]);
  const index = questions?.questions.indexOf(
    questions?.questions[currentSubIndex]
  );
  setIndexNo(index);

  return (
    <div className="flex flex-col w-full min-h-screen text-black lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Left Section (Tabs + Item Info) */}
      <div
        className={`w-full lg:w-1/2 flex flex-col gap-4 lg:gap-6 p-6 lg:p-8 lg:border-r-2 ${
          isMobile ? "" : "lg:overflow-y-auto"
        }`}
        style={!isMobile ? { maxHeight: "100vh" } : {}}
      >
        {/* Question Title */}
        <div>
          <p
            className="font-semibold"
            dangerouslySetInnerHTML={{
              __html: cleanOptionText(questions?.title),
            }}
          />
        </div>
        {/* Item Info */}
        <div>
          {Array.isArray(questions?.questions) && questions.questions.length > 1 && (
            <p className="font-semibold">
              Item {index + 1} of {questions.questions.length}
            </p>
          )}
        </div>

        {/* Tabs */}
        {Array.isArray(questionParts) && questionParts.length > 0 && (
          <div className="border-b ">
            <div className="flex flex-wrap">
              {questionParts.map((part) => (
                <button
                  key={part.id}
                  className={`px-4 py-2 text-lg font-medium transition-all duration-300 ease-in-out rounded-tl-lg rounded-tr-lg ${
                    activeTab === part.id
                      ? "bg-gray-100 border-[1px] border-black"
                      : "bg-white text-gray-700"
                  }`}
                  onClick={() => setActiveTab(part.id)}
                >
                  {part.title}
                </button>
              ))}
            </div>
            <div className="p-4 mb-0 border border-black lg:p-6 max-h-[60vh] overflow-y-auto ">
              {questionParts.map((part) =>
                activeTab === part.id ? (
                  <div key={part.id}> 
                    <h2 className="mb-4 text-xl font-bold">{part.title}</h2>
                    <div className="custom-html">
                      <div
                        className="text-black custom-content"
                        dangerouslySetInnerHTML={{
                          __html: cleanOptionText(part.content),
                        }}
                      />
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Section (Question + Explanation) */}
      <div
        className={`w-full lg:w-1/2 bg-white flex flex-col gap-6 p-6 lg:p-8 ${
          isMobile ? "overflow-y-auto" : "lg:overflow-y-auto"
        }`}
        style={!isMobile ? { maxHeight: "100vh" } : {}}
      >
        {/* Question Title */}
        {/* <div>
          <p className="font-semibold">{cleanOptionText(questions?.title)}</p>
        </div> */}

        {/* Render Question */}
        <div>{renderQuestion(questions)}</div>

        {/* Explanation */}
        {currentQuestion?.is_attended === 1 && (
          <div className="pt-4 border-t">
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
              className="custom-content"
              dangerouslySetInnerHTML={{
                __html: cleanOptionText(currentQuestion?.explanation),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NextGenQuestionSection;
