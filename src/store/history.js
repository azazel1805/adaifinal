import store from './index';

const getHistoryKey = () => {
    const { user } = store.getState();
    return user ? `yds-analysis-history-${user.uid}` : 'yds-analysis-history-guest';
};

export const initHistory = () => {
    const key = getHistoryKey();
    const savedHistory = JSON.parse(localStorage.getItem(key)) || [];
    store.setState({ history: savedHistory });
};

export const addHistoryItem = (question, analysis) => {
    const { history } = store.getState();
    const newItem = {
        id: new Date().toISOString(),
        question,
        analysis,
        timestamp: new Date().toLocaleString('tr-TR'),
    };

    const newHistory = [newItem, ...history].slice(0, 50);
    store.setState({ history: newHistory });

    const key = getHistoryKey();
    localStorage.setItem(key, JSON.stringify(newHistory));
};

export const clearHistory = () => {
    store.setState({ history: [] });
    const key = getHistoryKey();
    localStorage.removeItem(key);
};
