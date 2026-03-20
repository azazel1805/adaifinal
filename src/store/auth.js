import {
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import store from './index';

export const initAuth = () => {
    let profileUnsubscribe;

    onAuthStateChanged(auth, async (currentUser) => {
        store.setState({ user: currentUser });

        if (profileUnsubscribe) {
            profileUnsubscribe();
            profileUnsubscribe = null;
        }

        if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);

            // Check if profile exists, if not, create it
            const docSnap = await getDoc(userDocRef);
            if (!docSnap.exists()) {
                await setDoc(userDocRef, {
                    uid: currentUser.uid,
                    email: currentUser.email,
                    displayName: currentUser.displayName,
                    photoURL: currentUser.photoURL,
                    createdAt: serverTimestamp(),
                    subscription: {
                        status: 'expired',
                        plan: 'inactive',
                        startDate: null,
                        endDate: null
                    }
                });
            }

            profileUnsubscribe = onSnapshot(userDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    store.setState({ userProfile: snapshot.data(), loading: false });
                } else {
                    store.setState({ userProfile: null, loading: false });
                }
            });
        } else {
            store.setState({ userProfile: null, loading: false });
        }
    });
};

export const loginWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (error) {
        console.error("Giriş sırasında hata oluştu:", error);
        throw error;
    }
};

export const loginWithEmail = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Email ile giriş hatası:", error);
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
    if (!userProfile || !userProfile.subscription) return false;
    if (userProfile.subscription.status !== 'active') return false;
    if (!userProfile.subscription.endDate) return false;
    
    // endDate matches Firestore Timestamp toDate()
    try {
        const end = userProfile.subscription.endDate.toDate ? userProfile.subscription.endDate.toDate() : new Date(userProfile.subscription.endDate);
        return end > new Date();
    } catch(e) {
        return false;
    }
};
