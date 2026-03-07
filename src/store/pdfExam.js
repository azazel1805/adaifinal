import store from './index';

const initialState = {
    questions: [],
    userAnswers: {},
    timeLeft: 0,
    isActive: false,
};

export const initPdfExam = () => {
    // Current exam state is usually not persisted beyond session
    // but check if we want to restore from memory or similar
    store.setState({ examState: initialState });
};

export const startExam = (questions, durationSeconds) => {
    store.setState({
        examState: {
            questions,
            userAnswers: {},
            timeLeft: durationSeconds,
            isActive: true,
        }
    });
};

export const updateAnswer = (questionNumber, answer) => {
    const { examState } = store.getState();
    store.setState({
        examState: {
            ...examState,
            userAnswers: {
                ...examState.userAnswers,
                [questionNumber]: answer
            }
        }
    });
};

export const setTime = (timeLeft) => {
    const { examState } = store.getState();
    store.setState({
        examState: {
            ...examState,
            timeLeft
        }
    });
};

export const endExam = () => {
    store.setState({
        examState: initialState
    });
};
