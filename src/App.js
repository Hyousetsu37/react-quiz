import { useEffect, useReducer, useRef } from "react";
import Header from "./components/Header";
import Main from "./components/Main";
import Loader from "./components/Loader";
import Error from "./components/Error";
import StartScreen from "./components/StartScreen";
import Question from "./components/Question";
import Progress from "./components/Progress";
import FinishScreen from "./components/FinishScreen";
import NextButton from "./components/NextButton";
import Footer from "./components/Footer";
import Timer from "./components/Timer";

function App() {
  const initialState = {
    questions: [],
    // 'loading', 'ready', 'active' , 'error', 'finished'
    status: "loading",
    index: 0,
    answer: null,
    points: 0,
    highscore: 0,
    secondsRemaining: null,
  };

  function reducer(state, action) {
    const SECS_PER_QUESTION = 5;
    const newHighscore =
      state.points > state.highscore ? state.points : state.highscore;
    switch (action.type) {
      case "dataReceived":
        return { ...state, questions: action.payload, status: "ready" };
      case "dataFailed":
        return { ...state, status: "error" };
      case "startGame":
        return {
          ...state,
          status: "active",
          secondsRemaining: state.questions.length * SECS_PER_QUESTION,
        };
      case "newAnswer":
        const question = state.questions.at(state.index);
        return {
          ...state,
          answer: action.payload,
          points:
            action.payload === question.correctOption
              ? state.points + question.points
              : state.points,
        };
      case "nextAnswer":
        return { ...state, index: state.index + 1, answer: null };
      case "finish":
        return {
          ...state,
          status: "finished",
          highscore: newHighscore,
        };
      case "restart":
        return {
          ...initialState,
          questions: state.questions,
          status: "active",
          highscore: state.highscore,
        };
      case "tick":
        return {
          ...state,
          secondsRemaining: state.secondsRemaining - 1,
          highscore: newHighscore,
          status: state.secondsRemaining === 0 ? "finished" : state.status,
        };

      default:
        throw new Error("Action unknown");
    }
  }
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);
  const totalPointsRef = useRef(0);
  const numQuestions = questions.length;
  useEffect(function () {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8000/questions");
        const data = await response.json();
        dispatch({ type: "dataReceived", payload: data });
      } catch (error) {
        dispatch({ type: "dataFailed" });
      }
    }
    fetchData();
  }, []);

  useEffect(
    function () {
      totalPointsRef.current = questions.reduce(
        (acc, question) => acc + question.points,
        0
      );
    },
    [questions]
  );

  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              numQuestions={numQuestions}
              points={points}
              index={index}
              totalPoints={totalPointsRef.current}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                index={index}
                numQuestions={numQuestions}
                answer={answer}
                dispatch={dispatch}
              />
            </Footer>
          </>
        )}
        {status === "finished" && (
          <FinishScreen
            points={points}
            totalPoints={totalPointsRef.current}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}

export default App;
