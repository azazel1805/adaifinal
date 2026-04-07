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
    user: { uid: 'guest-id', email: 'guest@adai.com', displayName: 'Misafir Kullanıcı' },
    userProfile: { uid: 'guest-id', email: 'guest@adai.com', displayName: 'Misafir Kullanıcı', subscription: { status: 'active', plan: 'Lifetime', endDate: '2099-12-31' } },
    loading: false,
    theme: localStorage.getItem('theme-mode') || 'light',
    activeTab: 'dashboard',
    isMenuOpen: false,
    vocabularyList: JSON.parse(localStorage.getItem('vocabulary-list')) || [],
    unlockedAchievements: JSON.parse(localStorage.getItem('unlocked-achievements')) || [],
    openAccordions: JSON.parse(localStorage.getItem('open-accordions')) || [],
    history: [], 
    examHistory: [], 
    performanceStats: {}, 
    initialChatMessage: null, 
    weakWords: [], 
    challengeState: JSON.parse(localStorage.getItem('challenge-state')) || {
        currentChallenge: null,
        lastCompletedDate: null,
        streak: 0,
    },
    friends: [],
    pendingRequests: [],
});

export default globalStore;
