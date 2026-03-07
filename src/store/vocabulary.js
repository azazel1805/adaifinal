import store from './index';

const getVocabularyKey = () => {
    const { user } = store.getState();
    return user ? `vocabulary-list-${user.uid}` : 'vocabulary-list-guest';
};

export const initVocabulary = () => {
    const key = getVocabularyKey();
    const savedList = (JSON.parse(localStorage.getItem(key)) || []).map(item => ({
        ...item,
        srs: item.srs || { level: 0, nextReview: new Date().toISOString(), interval: 0 }
    }));
    store.setState({ vocabularyList: savedList });
};

export const addWord = (word, meaning) => {
    const { vocabularyList } = store.getState();
    const normalizedWord = word.toLowerCase().trim();

    if (!isWordSaved(normalizedWord)) {
        const newItem = {
            id: new Date().toISOString(),
            word: normalizedWord,
            meaning: meaning.trim(),
            srs: {
                level: 0,
                nextReview: new Date().toISOString(),
                interval: 0, // days
            }
        };
        const newList = [newItem, ...vocabularyList];
        store.setState({ vocabularyList: newList });
        localStorage.setItem(getVocabularyKey(), JSON.stringify(newList));
    }
};

export const removeWord = (word) => {
    const { vocabularyList } = store.getState();
    const normalizedWord = word.toLowerCase().trim();
    const newList = vocabularyList.filter(item => item.word.toLowerCase() !== normalizedWord);

    store.setState({ vocabularyList: newList });
    localStorage.setItem(getVocabularyKey(), JSON.stringify(newList));
};

export const isWordSaved = (word) => {
    const { vocabularyList } = store.getState();
    if (!vocabularyList) return false;
    const normalizedWord = word.toLowerCase().trim();
    return vocabularyList.some(item => item.word.toLowerCase() === normalizedWord);
};

export const updateSRS = (wordId, success) => {
    const { vocabularyList } = store.getState();
    const newList = vocabularyList.map(item => {
        if (item.id === wordId) {
            const currentLevel = item.srs?.level || 0;
            const newLevel = success ? currentLevel + 1 : Math.max(0, currentLevel - 1);

            // Simplified SM-2 Intervals
            const intervals = [0, 1, 3, 7, 14, 30, 90, 180];
            const newInterval = intervals[Math.min(newLevel, intervals.length - 1)];

            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + newInterval);

            return {
                ...item,
                srs: {
                    level: newLevel,
                    nextReview: nextDate.toISOString(),
                    interval: newInterval
                }
            };
        }
        return item;
    });

    store.setState({ vocabularyList: newList });
    const { user } = store.getState();
    const key = user ? `vocabulary-list-${user.uid}` : 'vocabulary-list-guest';
    localStorage.setItem(key, JSON.stringify(newList));
};
