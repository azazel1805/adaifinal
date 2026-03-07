import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    serverTimestamp,
    getDocs,
    deleteDoc
} from 'firebase/firestore';
import store from '../store/index';

export const sendFriendRequest = async (targetUser) => {
    const { user } = store.getState();
    if (!user || user.uid === targetUser.userId) return;

    // Check if already friends or request exists
    const q = query(
        collection(db, 'friend_requests'),
        where('fromId', 'in', [user.uid, targetUser.userId]),
        where('toId', 'in', [user.uid, targetUser.userId])
    );

    const snap = await getDocs(q);
    if (!snap.empty) {
        throw new Error("Zaten bir arkadaşlık isteği mevcut veya arkadaştınız.");
    }

    await addDoc(collection(db, 'friend_requests'), {
        fromId: user.uid,
        fromName: user.displayName,
        toId: targetUser.userId,
        toName: targetUser.userName,
        status: 'pending',
        timestamp: serverTimestamp()
    });
};

export const acceptFriendRequest = async (requestId) => {
    const requestDoc = doc(db, 'friend_requests', requestId);
    await updateDoc(requestDoc, {
        status: 'accepted',
        acceptedAt: serverTimestamp()
    });
};

export const rejectFriendRequest = async (requestId) => {
    const requestDoc = doc(db, 'friend_requests', requestId);
    await deleteDoc(requestDoc);
};

export const listenToFriendships = (callback) => {
    const { user } = store.getState();
    if (!user) return () => { };

    const q = query(
        collection(db, 'friend_requests'),
        where('status', '==', 'accepted'),
        where('fromId', '==', user.uid)
    );

    const q2 = query(
        collection(db, 'friend_requests'),
        where('status', '==', 'accepted'),
        where('toId', '==', user.uid)
    );

    const friends = new Map();

    const unsub1 = onSnapshot(q, (snap) => {
        snap.docs.forEach(doc => {
            const data = doc.data();
            friends.set(data.toId, { id: data.toId, name: data.toName, requestId: doc.id });
        });
        callback(Array.from(friends.values()));
    });

    const unsub2 = onSnapshot(q2, (snap) => {
        snap.docs.forEach(doc => {
            const data = doc.data();
            friends.set(data.fromId, { id: data.fromId, name: data.fromName, requestId: doc.id });
        });
        callback(Array.from(friends.values()));
    });

    return () => {
        unsub1();
        unsub2();
    };
};

export const listenToPendingRequests = (callback) => {
    const { user } = store.getState();
    if (!user) return () => { };

    const q = query(
        collection(db, 'friend_requests'),
        where('toId', '==', user.uid),
        where('status', '==', 'pending')
    );

    return onSnapshot(q, (snap) => {
        const requests = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(requests);
    });
};
