import React, { useEffect, useState } from "react";
import { Table, Radio, Button, Checkbox } from "antd";
import { submitEachAnswer } from "../../api";
import BookmarkAddedRoundedIcon from "@mui/icons-material/BookmarkAddedRounded";
import CreateRoundedIcon from "@mui/icons-material/CreateRounded";
import WatchLaterRoundedIcon from "@mui/icons-material/WatchLaterRounded";
import { cleanOptionText } from "../../utils/textSanitizer";

const MatrixMultipleChoiceQuestion = ({
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

  const [tabClick, setTabClick] = useState(null);
  const [testing, setTesting] = useState(null);

  const isAttended = question?.is_attended;
  const selectedAnswer = question?.selected_answer;
  const correctedAnswer = question?.options;

  // Handle button click to submit answers
  const handleButtonClick = async () => {
    const timeDifference = initialTime - timeLeft;
    console.log("handleButtonClick");

    handeltimeStop();

    // Format the selected answers according to the required structure
    const dataitem = {
      user_id: user_id,
      exam_id: exam_id,
      question_id: question?.id,
      selected_answer: Object.values(selectedAnswers).flatMap((item) =>
        item.column_numbers.map((colId) => ({
          row_id: item.row_id,
          column_id: colId,
        }))
      ),
      question_type: question?.type || "matrix_multiple_choice",
      time_taken: formatTime(timeDifference),
    };

    try {
      const response = await submitEachAnswer(dataitem);

      if (response?.status) {
        setTesting(response.data);
        getAllQuestion();
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle selection change for each statement
  const handleSelectionChange = (
    rowId,
    questionText,
    columnHeader,
    column_number,
    isChecked
  ) => {
    const existing = selectedAnswers[questionText]?.values || [];

    // console.log("column_number",column_number);

    const updatedValues = isChecked
      ? [...existing, columnHeader] // Add to selection
      : existing.filter((val) => val !== columnHeader); // Remove from selection

    const updatedAnswers = {
      ...selectedAnswers,
      [questionText]: {
        values: updatedValues,
        row_id: rowId,
        column_numbers: isChecked
          ? [
              ...(selectedAnswers[questionText]?.column_numbers || []),
              column_number,
            ]
          : (selectedAnswers[questionText]?.column_numbers || []).filter(
              (num) => num !== column_number
            ),
      },
    };

    setSelectedAnswers(updatedAnswers);

    onChange({
      rowId,
      questionText,
      selectedValues: updatedValues,
      column_numbers: updatedAnswers[questionText].column_numbers,
    });
  };

  // Set initial tabClick value when question data is available
  useEffect(() => {
    if (question?.question_parts?.length > 0) {
      setTabClick(question.question_parts[0].id); // Automatically click the first tab
    }
  }, [question]);

  useEffect(() => {
    if (exam?.is_timed === "1") {
      // console.log("exam?.is_timed ", exam?.is_timed);

      if (question?.is_attended !== 1) {
        // console.log("question?.is_attended", question?.is_attended);

        handleStartTimer && handleStartTimer();
      } else {
        stopTimer && stopTimer();
      }
    } else {
      if (question?.is_attended !== 1) {
        timeDataObje.startMyTimer();

        // console.log("question?.is_attended", question?.is_attended);
      } else {
        timeDataObje.stopMyTimer();
      }
    }
  }, [question?.is_attended]);

  // Columns definition for the Ant Design Table
  const columns = [
    {
      title: question?.options?.[0]?.first_column || "Question",
      dataIndex: "question",
      key: "question",
    },
    ...(Array.isArray(question?.options?.[0]?.choices) 
      ? question.options[0].choices.map((choice, index) => ({
          title: choice.text || choice.header,
          key: choice.id || index,
          render: (_, record) => (
            <Checkbox
              checked={selectedAnswers[record.question]?.values?.includes(
                choice.text || choice.header
              )}
              onChange={(e) => {
                if (record?.row_number !== undefined) {
                  handleSelectionChange(
                    record.row_number,
                    record.question,
                    choice.text || choice.header,
                    choice.column_number,
                    e.target.checked
                  );
                }
              }}
            />
          ),
        }))
      : []),
  ];

  const columnsSame = [
    {
      title: question?.options?.[0]?.first_column || "Question",
      dataIndex: "question",
      key: "question",
    },
    ...(Array.isArray(question?.options?.[0]?.choices) 
      ? question.options[0].choices.map((choice, index) => ({
          title: choice.text || choice.header,
          key: choice.id || index,
          render: (_, record) => {
        const choiceText = choice.text || choice.header;
        const columnNumber = String(choice.column_number);
        const rowNumber = String(record?.row_number);

        // Create a map from column_number to text
        const diseaseMap = {};
        question?.options?.[0]?.choices?.forEach((c) => {
          diseaseMap[String(c.column_number)] = c.text || c.header;
        });

        const correctAnswer = correctedAnswer?.find(
          (item) => item.row_number === rowNumber
        );

        const isCorrect =
          Array.isArray(correctAnswer?.answer) &&
          correctAnswer.answer.includes(choiceText);

        // Find all user selections for this row
        const selectedInRow = selectedAnswer?.filter(
          (selected) => selected.row_id === rowNumber
        );

        // Check if this specific column was selected by user
        const isSelected = selectedInRow?.some(
          (selected) => String(selected.submitted_column_id) === columnNumber
        );

        const isWrongSelection = isSelected && !isCorrect;

        const showFeedback =
          Array.isArray(selectedAnswer) && selectedAnswer.length > 0;

        // ✅ Logging with correct mapping
        // if (showFeedback) {
        //   if (isSelected && isCorrect) {
        //     console.log(
        //       `✅ Row ${rowNumber} - Correctly selected: ${choiceText}`
        //     );
        //   } else if (isWrongSelection) {
        //     console.log(
        //       `❌ Row ${rowNumber} - Incorrectly selected: ${choiceText}`
        //     );
        //   } else if (!isSelected && isCorrect) {
        //     console.log(
        //       `⚠️ Row ${rowNumber} - Correct answer NOT selected: ${choiceText}`
        //     );
        //   } else if (!isSelected && !isCorrect) {
        //     console.log(
        //       `ℹ️ Row ${rowNumber} - Option not selected and not correct: ${choiceText}`
        //     );
        //   }
        // }

        return (
          <div style={{ position: "relative", padding: "5px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                margin: "0 auto",
              }}
            >
              {showFeedback ? (
                isCorrect ? (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#52c41a",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    ✓
                  </div>
                ) : isWrongSelection ? (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "#f5222d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    ✗
                  </div>
                ) : (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "1px solid #d9d9d9",
                      backgroundColor: "white",
                    }}
                  ></div>
                )
              ) : (
                <Checkbox checked={isSelected} disabled={showFeedback} />
              )}
            </div>
          </div>
        );
      },
    }))
      : []),
  ];

  // console.log("exam?.is_tutored ", exam?.is_tutored);
  // console.log("question?.is_attended ", question?.is_attended);

  // Data preparation for the table
  // Handle both old format and new API format
  const data = Array.isArray(question?.options) 
    ? question.options.map((option, index) => ({
        key: index,
        question: option.question,
        choices: option.choices,
        row_number: option.row_number,
      }))
    : [];

  const handelTabClick = (id) => {
    setTabClick(id);
  };

  // Check if all rows have a selection
  const allRowsSelected =
    data.length > 0 &&
    data.every((row) => selectedAnswers[row.question]?.value);

  // console.log("allRowsSelected", allRowsSelected);
  const dirtyHTML = question?.question;

  // Safety check for question data
  if (!question || !Array.isArray(question.options) || question.options.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Matrix question data is not available or incomplete</p>
      </div>
    );
  }

  return (
    <div>
      {/* <h1 className="mb-5 text-[16px]">{question?.question}</h1>  */}
      <div
        sx={{ fontSize: "1rem", color: "#333" }}
        dangerouslySetInnerHTML={{
          __html: cleanOptionText(question?.question || ""),
        }}
      />
      {/* {cleanOptionText(question?.question)} */}
      {/* </div> */}

      {Array.isArray(question?.question_parts) && question.question_parts.length > 0 && (
        <>
          <div className="flex items-center justify-start gap-3 mb-3">
            {question.question_parts.map((item, index) => (
              <div
                key={index}
                className={`cursor-pointer px-4 py-2 rounded ${
                  tabClick === item?.id
                    ? "bg-gray-200 text-black"
                    : "bg-white text-black"
                }`}
                onClick={() => handelTabClick(item?.id)}
              >
                {item?.title}
              </div>
            ))}
          </div>

          <div className="max-w-[90%] m-auto mt-9 h-20 bg-[#f3f3f354] grid grid-cols-[1fr_1fr] shadow-[0px_4px_6px_rgba(0,0,0,0.1)]">
            <div className="grid p-2 place-items-center">
              <div>
                <div className="flex items-center justify-center gap-2">
                  <span>
                    <BookmarkAddedRoundedIcon />
                  </span>
                  <div>
                    <p className="text-xs">{question?.time_taken}</p>
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
                    <p className="text-xs">02 secs</p>
                    <p className="text-xs">Time Spend</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {question?.final_part?.trim() !== "" && (
        <div className="mb-3 max">
          <p> {question?.final_part}</p>
        </div>
      )}

      {exam?.is_tutored === "1" && question?.is_attended === 1 ? (
        <>
          <Table
            columns={columnsSame}
            dataSource={data}
            pagination={false}
            bordered
            rowKey="key"
          />
        </>
      ) : (
        <>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            rowKey="key"
          />

          {(exam?.is_tutored === "1" || true) && (
            <div className="mt-5 mb-4">
              <Button
                style={{ background: "blue", color: "white" }}
                onClick={handleButtonClick}
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

export default MatrixMultipleChoiceQuestion;
