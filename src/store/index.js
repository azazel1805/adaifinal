/**
 * A simple reactive store implementation.
 */
export class Store {
    constructor(initialState = {}) {
        this.state = initialState;
        this.listeners = [];
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(listener => listener(this.state));
    }
}

const globalStore = new Store({
    user: null,
    userProfile: null,
    loading: true,
    theme: localStorage.getItem('theme-mode') || 'light',
    activeTab: 'dashboard',
    isMenuOpen: false,
    vocabularyList: JSON.parse(localStorage.getItem('vocabulary-list')) || [],
    unlockedAchievements: JSON.parse(localStorage.getItem('unlocked-achievements')) || [],
    openAccordions: JSON.parse(localStorage.getItem('open-accordions')) || [],
    history: [], // Added for QuestionAnalyzer
    examHistory: [], // Added for Mock Exams
    performanceStats: {}, // Added for Performance Tracking
    initialChatMessage: null, // Initial message for AITutor from other pages
    weakWords: [], // Added for VocabularyTrainer
    challengeState: JSON.parse(localStorage.getItem('challenge-state')) || {
        currentChallenge: null,
        lastCompletedDate: null,
        streak: 0,
    },
    friends: [],
    pendingRequests: [],
});

export default globalStore;
