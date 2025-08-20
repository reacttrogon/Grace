import React, { useEffect, useMemo, useState } from "react";
import { Button } from "antd";
import AccessAlarmsRoundedIcon from "@mui/icons-material/AccessAlarmsRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import FullscreenExitRoundedIcon from "@mui/icons-material/FullscreenExitRounded";
import { useAppContext } from "../../context";

const Header = ({ config, currentQuestion }) => {
  const {
    setTextModal,
    setFeedBackModal,
    exam,
    currentIndex,
    setIsModalVisible,
    innerQuestionIndex,
    currentSubIndex,

    enterFullScreen,
    exitFullScreen,
    isFullScreen,

    timeLeft,
    timerRunning,
    formatTime,
    handleButtonClick,
    notTime,
    timeDataObje,
  } = config;

  const {
    questionCount,
    setQuestionCount,
    setQuestionNo,
    questionNo,
    indexNo,
    currentQuestionId,
  } = useAppContext();
  
  
  // console.log("exam?.questions?",exam?.questions?.length);
  // console.log("exam?.questions?",exam?.questions);
  

  const QuestionsCount = exam?.questions?.reduce((count, question) => {
    const parts = Array.isArray(question?.questions) ? question.questions : null; 
    // console.log("parts",parts?.length);
    
    return count + (parts?.length || 1);
  }, 0) || 0; 
  // console.log("QueQuestionsCountstion ",QuestionsCount);
  
  
  
  // const QuestionsCount = exam?.questions?.reduce((count, question) => {
  //   const parts = Array.isArray(question?.question_parts) ? question.question_parts : null; 
  //   console.log("parts",parts.length);
    
  //   return count + (parts?.length || 1);
  // }, 0) || 0; 
  
  
  
  
  const flatQuestionIds = useMemo(() => {
    if (!exam || !Array.isArray(exam.questions)) return [];
  
    return exam.questions.flatMap((q) => {
      if (q?.questions && Array.isArray(q.questions) && q.questions.length > 0) {
        return q.questions.map((part) => part?.id || '');
      } else if (q?.questions && Array.isArray(q.questions) && q.questions.length > 0) {
        return q.questions.map((part) => part?.id || '');
      } else if (q?.id) {
        return [q.id];
      } else {
        return [];
      }
    });
  }, [exam]); 
  
  
  // const flatQuestionIds = useMemo(() => {
  //   if (!exam || !Array.isArray(exam.questions)) return [];
  
  //   return exam.questions.flatMap((q) => {
  //     if (q?.question_parts && Array.isArray(q.question_parts) && q.question_parts.length > 0) {
  //       return q.question_parts.map((part) => part?.id || '');
  //     } else if (q?.questions && Array.isArray(q.questions) && q.questions.length > 0) {
  //       return q.questions.map((part) => part?.id || '');
  //     } else if (q?.id) {
  //       return [q.id];
  //     } else {
  //       return [];
  //     }
  //   });
  // }, [exam]);
  
  // console.log("flatQuestionIds",flatQuestionIds);
  // console.log("currentQuestionId",currentQuestionId);
  
  
  
  const currentQuestionNumber = currentQuestionId ? flatQuestionIds.indexOf(currentQuestionId) + 1 : 1;
  setQuestionNo(currentQuestionNumber > 0 ? currentQuestionNumber : 1); 
  
  // console.log("currentQuestionNumber",currentQuestionNumber);
  
  
  let idCounter = 1;

  const allQuestions = useMemo(() => {
    if (!exam?.questions || !Array.isArray(exam.questions)) return [];
    
    return exam.questions.reduce((acc, question) => {
      if (question?.question_parts && Array.isArray(question.question_parts) && question.question_parts.length > 0) {
        const subQuestionsWithId = question.question_parts.map((subQ) => ({
          ...subQ,
          custom_id: idCounter++,
          parent_id: question.id,
        }));
        return [...acc, ...subQuestionsWithId];
      } else {
        return [...acc, { ...question, custom_id: idCounter++ }];
      }
    }, []); 
  }, [exam]);

  // console.log("allQuestions",allQuestions);
  
  useEffect(() => {
    setQuestionCount(QuestionsCount);
  }, [setQuestionCount, QuestionsCount]);

  const { currentSeconds, formatMyTimer } = timeDataObje || {};

  const QuestionNo = currentIndex + 1 + (indexNo || 0);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between p-1 px-4 text-white bg-blue-900 ">
        {/* Left Section */}
        <div className="w-full mb-4 text-left sm:w-auto sm:mb-0">
          <h1 className="text-lg font-bold">NCLEX-RN TEST - TONY ALEX</h1>
        </div>

        {/* Middle Section (Hidden on smaller screens) */}
        <div className="flex-col hidden w-full gap-3 mb-4 sm:w-auto sm:mb-0 lg:flex sm:flex-row">
          <p className="text-sm">{exam?.title || ''}</p>
          <p className="text-sm">
            QId:{" "}
            {currentQuestion?.questions?.[currentSubIndex]?.id ??
              exam?.questions?.[currentIndex]?.id ??
              "N/A"}
          </p>
        </div>

        {/* Right Section */}
        <div className="flex flex-wrap justify-start w-full gap-2 sm:justify-end sm:w-auto">
          <div>
            <div className="flex items-center justify-start gap-2 mb-1">
              <h4 className="text-sm">Time</h4>
              <span className="text-sm">
                <AccessAlarmsRoundedIcon />
              </span>

              {exam?.is_timed === "1" ? (
                <h4 className="text-sm">{formatTime ? formatTime(timeLeft) : "00:00"}</h4>
              ) : (
                <h4 className="text-sm">{formatMyTimer && currentSeconds ? formatMyTimer(currentSeconds) : "00:00"}</h4>
              )}
            </div>

            <div className="flex items-center justify-start gap-2">
              <h4 className="text-sm">Question</h4>
              <span className="text-sm">
                <HelpRoundedIcon />
              </span>

              <h4 className="text-sm">{`${currentQuestionNumber > 0 ? currentQuestionNumber : 1} of ${questionCount || 1}`}</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Buttons Section */}
      <div className="flex justify-end items-center bg-[#88adff] p-2">
        <div className="flex gap-6 px-5">
          <div
            className="cursor-pointer"
            onClick={isFullScreen ? exitFullScreen : enterFullScreen}
          >
            {isFullScreen ? (
              <FullscreenExitRoundedIcon />
            ) : (
              <FullscreenRoundedIcon />
            )}
          </div>
          <div
            className="w-full text-white cursor-pointer sm:w-auto"
            onClick={() => setTextModal && setTextModal(true)}
          >
            Notes
          </div>
          <div
            className="w-full text-white cursor-pointer sm:w-auto"
            onClick={() => setIsModalVisible && setIsModalVisible(true)}
          >
            Calculator
          </div>
          <div
            className="w-full text-white cursor-pointer sm:w-auto"
            onClick={() => setFeedBackModal && setFeedBackModal(true)}
          >
            Feedback
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;