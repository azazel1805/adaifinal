import { db } from '../firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    query,
    where,
    updateDoc,
    doc,
    serverTimestamp,
    deleteDoc
} from 'firebase/firestore';
import store from '../store/index';
import { Loader } from '../components/Common';

export const renderWordDuel = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10 animate-fadeIn';

    let state = {
        room: null,
        status: 'lobby', // 'lobby', 'waiting', 'playing', 'result'
        questions: [],
        currentIndex: 0,
        score: 0,
        opponentScore: 0,
        isLoading: false,
        timer: 10
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const createRoom = async () => {
        const { user } = store.getState();
        setState({ isLoading: true });
        try {
            // Sample questions
            const quizData = [
                { q: "Ephemeral", a: "Kısa süreli", options: ["Kalıcı", "Kısa süreli", "Değerli", "Hızlı"] },
                { q: "Meticulous", a: "Titiz", options: ["Dağınık", "Hızlı", "Titiz", "Korkak"] },
                { q: "Obscure", a: "Belirsiz", options: ["Belirsiz", "Parlak", "Ünlü", "Zengin"] }
            ];

            const roomRef = await addDoc(collection(db, 'word_duels'), {
                player1: { uid: user.uid, name: user.displayName, photo: user.photoURL || null, score: 0, finished: false },
                player2: null,
                status: 'waiting',
                questions: quizData,
                createdAt: serverTimestamp()
            });

            subscribeToRoom(roomRef.id);
        } catch (e) {
            console.error(e);
            setState({ isLoading: false });
        }
    };

    const joinRoom = async (roomId) => {
        const { user } = store.getState();
        const roomRef = doc(db, 'word_duels', roomId);
        await updateDoc(roomRef, {
            player2: { uid: user.uid, name: user.displayName, photo: user.photoURL || null, score: 0, finished: false },
            status: 'playing'
        });
        subscribeToRoom(roomId);
    };

    const subscribeToRoom = (roomId) => {
        onSnapshot(doc(db, 'word_duels', roomId), (snapshot) => {
            const data = snapshot.data();
            if (!data) return;

            const { user } = store.getState();
            const isP1 = data.player1.uid === user.uid;
            const me = isP1 ? data.player1 : data.player2;
            const opp = isP1 ? data.player2 : data.player1;

            setState({
                room: { id: snapshot.id, ...data },
                status: data.status,
                score: me?.score || 0,
                opponentScore: opp?.score || 0
            });

            if (data.player1.finished && data.player2?.finished) {
                setState({ status: 'result' });
            }
        });
    };

    const handleAnswer = async (selected) => {
        const q = state.room.questions[state.currentIndex];
        const isCorrect = selected === q.a;
        const newScore = state.score + (isCorrect ? 10 : 0);

        const { user } = store.getState();
        const isP1 = state.room.player1.uid === user.uid;
        const roomRef = doc(db, 'word_duels', state.room.id);

        if (state.currentIndex + 1 >= state.room.questions.length) {
            const updateProps = isP1
                ? { 'player1.score': newScore, 'player1.finished': true }
                : { 'player2.score': newScore, 'player2.finished': true };
            await updateDoc(roomRef, updateProps);
        } else {
            const updateProps = isP1 ? { 'player1.score': newScore } : { 'player2.score': newScore };
            await updateDoc(roomRef, updateProps);
            setState({ currentIndex: state.currentIndex + 1 });
        }
    };

    const render = () => {
        if (state.status === 'lobby') {
            container.innerHTML = `
                <div class="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10">
                    <div class="text-center space-y-4">
                        <div class="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner">⚔️</div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Word Duel</h2>
                        <p class="text-slate-500 font-bold italic">Diğer ADAl kullanıcılarına meydan oku, kelime gücünü kanıtla!</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                        <button id="create-btn" class="p-10 bg-slate-950 text-white rounded-[3rem] border-4 border-white/5 hover:border-brand-primary/50 transition-all group flex flex-col items-center gap-4">
                            <span class="text-4xl group-hover:scale-125 transition-transform">➕</span>
                            <span class="font-black text-xs tracking-[0.3em] uppercase">Yeni Düello Başlat</span>
                        </button>
                        <div class="bg-slate-50 dark:bg-slate-800 p-8 rounded-[3rem] border-4 border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-4">
                            <h3 class="font-black text-[10px] text-slate-400 uppercase tracking-widest">Aktif Odalar</h3>
                            <div id="rooms-list" class="w-full space-y-3 max-h-48 overflow-y-auto pr-2">
                                <p class="text-xs text-slate-400 italic text-center py-4">Şu an aktif düello bulunmuyor...</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Listen for waiting rooms
            onSnapshot(query(collection(db, 'word_duels'), where('status', '==', 'waiting')), (snapshot) => {
                const roomsList = container.querySelector('#rooms-list');
                if (!roomsList) return;
                const { user } = store.getState();
                const availableRooms = snapshot.docs.filter(d => d.data().player1.uid !== user.uid);

                if (availableRooms.length === 0) {
                    roomsList.innerHTML = '<p class="text-xs text-slate-400 italic text-center py-4">Şu an aktif düello bulunmuyor...</p>';
                } else {
                    roomsList.innerHTML = availableRooms.map(d => `
                        <button class="join-room-btn w-full p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-100 dark:border-slate-700 hover:border-brand-primary transition-all flex justify-between items-center" data-id="${d.id}">
                            <span class="font-bold text-sm text-slate-700 dark:text-slate-300">🎮 ${d.data().player1.name}</span>
                            <span class="text-[10px] font-black text-brand-primary uppercase">KATIL</span>
                        </button>
                    `).join('');

                    container.querySelectorAll('.join-room-btn').forEach(btn => {
                        btn.onclick = () => joinRoom(btn.dataset.id);
                    });
                }
            });
        } else if (state.status === 'waiting') {
            container.innerHTML = `
                <div class="bg-white dark:bg-slate-900 p-16 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col items-center space-y-10">
                    <div class="relative">
                        <div class="w-32 h-32 border-8 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center text-4xl">⏳</div>
                    </div>
                    <div class="text-center">
                        <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Rakip Bekleniyor...</h2>
                        <p class="text-slate-500 font-bold italic mt-2">Biri odaya girdiğinde otomatik olarak başlayacak.</p>
                    </div>
                </div>
            `;
        } else if (state.status === 'playing') {
            const q = state.room.questions[state.currentIndex];
            container.innerHTML = `
                <div class="space-y-8 animate-fadeIn">
                    <!-- Scoreboard -->
                    <div class="grid grid-cols-3 items-center bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border-4 border-slate-50 dark:border-slate-800">
                        <div class="flex flex-col items-center gap-2">
                             <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-primary/20">
                                <img src="${state.room.player1.uid === store.getState().user.uid ? (store.getState().user.photoURL || `https://ui-avatars.com/api/?name=${state.room.player1.name}`) : (state.room.player1.photo || `https://ui-avatars.com/api/?name=${state.room.player1.name}`)}" class="w-full h-full object-cover">
                             </div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${state.room.player1.uid === store.getState().user.uid ? 'SİZ' : 'RAKİP'}</p>
                            <p class="text-3xl font-black text-brand-primary">${state.room.player1.score}</p>
                        </div>
                        <div class="text-center text-3xl font-black text-slate-200 uppercase italic">VS</div>
                        <div class="flex flex-col items-center gap-2">
                             <div class="w-12 h-12 rounded-full overflow-hidden border-2 border-red-500/20">
                                <img src="${state.room.player2?.uid === store.getState().user.uid ? (store.getState().user.photoURL || `https://ui-avatars.com/api/?name=${state.room.player2?.name}`) : (state.room.player2?.photo || `https://ui-avatars.com/api/?name=${state.room.player2?.name}`)}" class="w-full h-full object-cover">
                             </div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${state.room.player2?.uid === store.getState().user.uid ? 'SİZ' : 'RAKİP'}</p>
                            <p class="text-3xl font-black text-red-500">${state.room.player2?.score || 0}</p>
                        </div>
                    </div>

                    <!-- Question -->
                    <div class="bg-slate-950 p-12 rounded-[4rem] shadow-2xl border-4 border-white/5 relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-8 text-white/5 text-8xl font-black select-none">${state.currentIndex + 1}</div>
                        <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4 block">KELİME ANLAMI</span>
                        <h3 class="text-5xl font-black text-white italic tracking-tighter uppercase mb-10">${q.q}</h3>
                        
                        <div class="grid grid-cols-2 gap-4">
                            ${q.options.map(opt => `
                                <button class="ans-btn p-6 bg-white/5 border-2 border-white/10 rounded-[2rem] text-white font-bold text-sm hover:bg-brand-primary hover:border-brand-primary transition-all text-left" data-ans="${opt}">
                                    ${opt}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
            container.querySelectorAll('.ans-btn').forEach(btn => {
                btn.onclick = () => handleAnswer(btn.dataset.ans);
            });
        } else if (state.status === 'result') {
            const iWon = state.score > state.opponentScore;
            container.innerHTML = `
                <div class="bg-white dark:bg-slate-900 p-16 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center space-y-10 animate-slideUp">
                    <div class="text-8xl">${iWon ? '👑' : '🤝'}</div>
                    <div>
                        <h2 class="text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                            ${state.score === state.opponentScore ? 'BERABERE!' : (iWon ? 'ZAFER!' : 'MAĞLUBİYET')}
                        </h2>
                        <p class="text-slate-500 font-bold italic mt-4">Düello sona erdi. Skorlar:</p>
                    </div>
                    
                    <div class="flex justify-center gap-12 py-6">
                        <div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">SİZİN SKORUNUZ</p>
                            <p class="text-6xl font-black text-brand-primary">${state.score}</p>
                        </div>
                        <div class="w-px bg-slate-100"></div>
                        <div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RAKİP SKORU</p>
                            <p class="text-6xl font-black text-slate-400">${state.opponentScore}</p>
                        </div>
                    </div>

                    <button onclick="window.location.hash='dashboard'" class="bg-slate-950 text-white font-black px-12 py-6 rounded-[2.5rem] uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl">ANA SAYFAYA DÖN ⚡</button>
                    <button onclick="window.location.reload()" class="block w-fit mx-auto text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 mt-4">YENİ DÜELLO ARA</button>
                </div>
            `;
        }

        attachLobbyEvents();
    };

    const attachLobbyEvents = () => {
        container.querySelector('#create-btn')?.addEventListener('click', createRoom);
    };

    render();
    return container;
};
