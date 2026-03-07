import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from "firebase/firestore";
import store from './index';

export const initAuth = () => {
    let profileUnsubscribe;

    onAuthStateChanged(auth, (currentUser) => {
        store.setState({ user: currentUser });

        if (profileUnsubscribe) {
            profileUnsubscribe();
        }

        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);
            profileUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    store.setState({ userProfile: snapshot.data(), loading: false });
                } else {
                    console.error("Kullanıcı profili bulunamadı.");
                    store.setState({ userProfile: null, loading: false });
                }
            });
        } else {
            store.setState({ userProfile: null, loading: false });
        }
    });
};

export const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Giriş sırasında hata oluştu:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Çıkış sırasında hata oluştu:", error);
    }
};

export const isSubscribed = (userProfile) => {
    return (
        !!userProfile &&
        userProfile.subscription?.status === 'active' &&
        userProfile.subscription.endDate.toDate() > new Date()
    );
};
