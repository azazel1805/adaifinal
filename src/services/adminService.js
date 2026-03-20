import { db } from '../firebase';
import { 
    collection, 
    getDocs, 
    updateDoc, 
    doc, 
    Timestamp 
} from 'firebase/firestore';

export const getAllUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (e) {
        console.error("Kullanıcı listesi alınırken hata:", e);
        return [];
    }
};

export const activateUserSubscription = async (uid, months) => {
    try {
        const userDocRef = doc(db, "users", uid);
        const now = new Date();
        const endDate = new Date(now.setMonth(now.getMonth() + months));
        
        await updateDoc(userDocRef, {
            "subscription.status": "active",
            "subscription.plan": `${months} ay`,
            "subscription.startDate": Timestamp.now(),
            "subscription.endDate": Timestamp.fromDate(endDate)
        });
        return true;
    } catch (e) {
        console.error("Abonelik güncellenirken hata:", e);
        return false;
    }
};

export const deactivateUserSubscription = async (uid) => {
    try {
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, {
            "subscription.status": "expired"
        });
        return true;
    } catch (e) {
        console.error("Abonelik dondurulurken hata:", e);
        return false;
    }
};
