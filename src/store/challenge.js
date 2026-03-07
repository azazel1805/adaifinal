import store from './index';

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const getChallengeKey = () => {
    const { user } = store.getState();
    return user ? `challenge-state-${user.uid}` : 'challenge-state-guest';
};

export const initChallenge = () => {
    const key = getChallengeKey();
    const savedState = JSON.parse(localStorage.getItem(key)) || {
        currentChallenge: null,
        lastCompletedDate: null,
        streak: 0,
    };

    const today = getTodayDateString();

    // If the current challenge is from a previous day, reset it.
    if (savedState.currentChallenge && savedState.currentChallenge.id !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toISOString().split('T')[0];

        // Reset streak if the last completed day wasn't yesterday.
        if (savedState.lastCompletedDate !== yesterdayString) {
            savedState.streak = 0;
        }
        savedState.currentChallenge = null;
    }

    store.setState({ challengeState: savedState });
    localStorage.setItem(key, JSON.stringify(savedState));
};

export const setDailyChallenge = (challengeConfig) => {
    const newChallenge = {
        ...challengeConfig,
        id: getTodayDateString(),
        progress: 0,
        completed: false,
    };

    const { challengeState } = store.getState();
    const newState = { ...challengeState, currentChallenge: newChallenge };

    store.setState({ challengeState: newState });
    localStorage.setItem(getChallengeKey(), JSON.stringify(newState));
};

export const trackAction = (type) => {
    const { challengeState } = store.getState();
    const { currentChallenge } = challengeState;

    if (!currentChallenge || currentChallenge.completed) {
        return;
    }

    if (currentChallenge.type === type) {
        const newProgress = currentChallenge.progress + 1;
        const isCompleted = newProgress >= currentChallenge.target;

        const updatedChallenge = {
            ...currentChallenge,
            progress: newProgress,
            completed: isCompleted,
        };

        let newState;
        if (isCompleted) {
            newState = {
                ...challengeState,
                currentChallenge: updatedChallenge,
                lastCompletedDate: getTodayDateString(),
                streak: challengeState.streak + 1
            };
        } else {
            newState = { ...challengeState, currentChallenge: updatedChallenge };
        }

        store.setState({ challengeState: newState });
        localStorage.setItem(getChallengeKey(), JSON.stringify(newState));
    }
};
