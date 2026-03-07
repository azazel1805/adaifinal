import store from './index';

const getExamHistoryKey = () => {
    const { user } = store.getState();
    return user ? `yds-exam-history-${user.uid}` : 'yds-exam-history-guest';
};

const getPerformanceKey = () => {
    const { user } = store.getState();
    return user ? `yds-performance-stats-${user.uid}` : 'yds-performance-stats-guest';
};

export const initExamHistory = () => {
    const historyKey = getExamHistoryKey();
    const performanceKey = getPerformanceKey();

    const savedHistory = JSON.parse(localStorage.getItem(historyKey)) || [];
    const savedStats = JSON.parse(localStorage.getItem(performanceKey)) || {};

    store.setState({
        examHistory: savedHistory,
        performanceStats: savedStats
    });
};

export const addExamResult = (result) => {
    const { examHistory, performanceStats } = store.getState();
    const newResult = {
        ...result,
        id: new Date().toISOString(),
        timestamp: new Date().toLocaleString('tr-TR'),
    };

    const newHistory = [newResult, ...examHistory].slice(0, 10);

    const newStats = { ...performanceStats };
    for (const type in result.performanceByType) {
        const perf = result.performanceByType[type];
        const current = newStats[type] || { correct: 0, total: 0 };
        newStats[type] = {
            correct: current.correct + perf.correct,
            total: current.total + perf.total,
        };
    }

    store.setState({ examHistory: newHistory, performanceStats: newStats });
    localStorage.setItem(getExamHistoryKey(), JSON.stringify(newHistory));
    localStorage.setItem(getPerformanceKey(), JSON.stringify(newStats));
};

export const trackSingleQuestionResult = (questionType, isCorrect) => {
    const { performanceStats } = store.getState();
    const newStats = { ...performanceStats };
    const current = newStats[questionType] || { correct: 0, total: 0 };
    newStats[questionType] = {
        correct: current.correct + (isCorrect ? 1 : 0),
        total: current.total + 1,
    };

    store.setState({ performanceStats: newStats });
    localStorage.setItem(getPerformanceKey(), JSON.stringify(newStats));
};

export const clearExamHistory = () => {
    store.setState({ examHistory: [], performanceStats: {} });
    localStorage.removeItem(getExamHistoryKey());
    localStorage.removeItem(getPerformanceKey());
};
