import globalStore from '../store/index';

/**
 * Updates the global performance stats for a specific category.
 * @param {string} category - The category to update (e.g., 'Adam Asmaca', 'Tense Analysis').
 * @param {boolean} isCorrect - Whether the attempt was correct.
 */
export const updatePerformance = (category, isCorrect) => {
    const state = globalStore.getState();
    const stats = { ...state.performanceStats };

    if (!stats[category]) {
        stats[category] = { correct: 0, total: 0 };
    }

    stats[category].total += 1;
    if (isCorrect) {
        stats[category].correct += 1;
    }

    globalStore.setState({ performanceStats: stats });

    // Save to localStorage for persistence
    const user = state.user?.uid || 'guest';
    localStorage.setItem(`performance-stats-${user}`, JSON.stringify(stats));
};

/**
 * Initializes performance stats from localStorage.
 */
export const initPerformanceStats = () => {
    const user = globalStore.getState().user?.uid || 'guest';
    const saved = localStorage.getItem(`performance-stats-${user}`);
    if (saved) {
        globalStore.setState({ performanceStats: JSON.parse(saved) });
    }
};
