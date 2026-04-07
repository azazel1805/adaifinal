import store from './index';

export const initAuth = () => {
    // Auth is now static, set in store/index.js initial state
    console.log("ADAI: Auth initialized in standalone mode.");
};

export const loginWithGoogle = async () => {
    console.warn("Login is disabled in standalone mode.");
};

export const loginWithEmail = async (email, password) => {
    console.warn("Login is disabled in standalone mode.");
};

export const logout = async () => {
    console.warn("Logout is disabled in standalone mode.");
};

export const isSubscribed = (userProfile) => {
    // In standalone / no-auth mode, all features are unlocked.
    return true;
};
