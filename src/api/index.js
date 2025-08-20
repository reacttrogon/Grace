import axios from "axios";

export const API = axios.create({ baseURL: "https://co-tutorlearning.com/" });
// API.defaults.timeout = 5000;
// auth
const config = {
  headers: {
    "Content-Type": "application/json",
  },
}; 

export const getQuestions = (user_id, exam_id) =>
  API.get(
    `/api/Nclex_exam/get_questions?user_id=${user_id}&exam_id=${exam_id}`
  ); 

  // export const getQuestions = (user_id, exam_id) =>
  //   API.get(
  //     `/api/Nclex_exam/get_all_questions`
  //   );

export const getQuestionsById = (id) =>
  API.get(
    `https://co-tutorlearning.com/api/Nclex_exam/view_question?question_id=${id}`
  );

export const submitEachAnswer = (data) =>
  axios.post(
    `https://co-tutorlearning.com/api/nclex_exam/submit_each_answer`,
    data
  );
