import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import store from '../store/index';
import { Loader } from '../components/Common';
import { sendFriendRequest } from '../services/socialService';

export const renderGlobalChat = () => {
    const container = document.createElement('div');
    container.className = 'max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6 animate-fadeIn';

    let state = {
        messages: [],
        isLoading: true,
        isSending: false,
        error: ''
    };

    const render = () => {
        const { user } = store.getState();

        container.innerHTML = `
            <div class="bg-white dark:bg-slate-900 flex-1 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col overflow-hidden">
                <!-- Chat Header -->
                <div class="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-zinc-50/50">
                    <div>
                        <h2 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Global Community</h2>
                        <p class="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mt-1">Real-time collaboration</p>
                    </div>
                </div>

                <!-- Messages Area -->
                <div id="chat-messages" class="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
                    ${state.isLoading ? '<div id="loader-spinner" class="h-full flex items-center justify-center"></div>' : ''}
                    ${state.messages.map(msg => {
            const isMe = msg.userId === user?.uid || (user?.uid === 'guest' && msg.userName === user?.displayName);
            return `
                            <div class="flex ${isMe ? 'justify-end' : 'justify-start'} group animate-slideUp">
                                <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]">
                                    <div class="flex items-center gap-2 mb-1.5 px-2">
                                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${msg.userName || 'Unknown'}</span>
                                        ${!isMe ? `
                                            <button class="add-friend-btn text-brand-primary/50 hover:text-brand-primary transition-colors" data-uid="${msg.userId}" data-name="${msg.userName}">
                                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/>
                                                </svg>
                                            </button>
                                        ` : ''}
                                        <span class="text-[8px] font-bold text-slate-300">${formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div class="p-5 rounded-[2rem] ${isMe ? 'bg-brand-primary text-white rounded-tr-none shadow-brand-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50'} shadow-lg font-bold text-sm leading-relaxed flex items-start gap-3">
                                        ${!isMe ? `<img src="${msg.userPhoto || `https://ui-avatars.com/api/?name=${msg.userName}&size=32&background=random`}" class="w-6 h-6 rounded-full border border-white/50 shadow-sm flex-shrink-0">` : ''}
                                        <span>${msg.text}</span>
                                        ${isMe ? `<img src="${msg.userPhoto || `https://ui-avatars.com/api/?name=${msg.userName}&size=32&background=random`}" class="w-6 h-6 rounded-full border border-white/50 shadow-sm flex-shrink-0">` : ''}
                                    </div>
                                </div>
                            </div>
                        `;
        }).join('')}
                    ${state.messages.length === 0 && !state.isLoading ? `
                        <div class="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                            <span class="text-6xl">💬</span>
                            <p class="font-black uppercase tracking-widest text-xs">Sessizlik hakim...<br>İlk mesajı sen gönder!</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Input Area -->
                <div class="p-6 bg-zinc-50/50 border-t border-slate-50 dark:border-slate-800">
                    <form id="chat-form" class="flex gap-4">
                        <input 
                            type="text" 
                            id="message-input" 
                            placeholder="Bir şeyler yaz..." 
                            class="flex-1 p-5 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-transparent rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-sm shadow-inner transition-all"
                            maxlength="500"
                            autocomplete="off"
                        >
                        <button 
                            type="submit" 
                            id="send-btn"
                            class="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                            ${state.isSending ? 'disabled' : ''}
                        >
                            <svg class="w-6 h-6 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        `;

        if (state.isLoading) {
            const loaderContainer = container.querySelector('#loader-spinner');
            if (loaderContainer) loaderContainer.appendChild(Loader());
        }

        attachEvents();
        scrollToBottom();
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const date = ts.toDate ? ts.toDate() : new Date(ts);
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    };

    const scrollToBottom = () => {
        const chatBox = container.querySelector('#chat-messages');
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    };

    const attachEvents = () => {
        const form = container.querySelector('#chat-form');
        const input = container.querySelector('#message-input');

        form?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            const { user } = store.getState();

            if (!text || state.isSending) return;

            state.isSending = true;
            render();

            try {
                await addDoc(collection(db, 'global_messages'), {
                    text,
                    userId: user?.uid || 'guest',
                    userName: user?.displayName || 'Guest',
                    userPhoto: user?.photoURL || null,
                    timestamp: serverTimestamp()
                });
                input.value = '';
            } catch (err) {
                console.error("Error sending message:", err);
                alert("Mesaj gönderilemedi. Lütfen tekrar deneyin.");
            } finally {
                state.isSending = false;
                render();
            }
        });

        // Add Friend Events
        container.querySelectorAll('.add-friend-btn').forEach(btn => {
            btn.onclick = async () => {
                const targetId = btn.dataset.uid;
                const targetName = btn.dataset.name;
                try {
                    await sendFriendRequest({ userId: targetId, userName: targetName });
                    alert(`${targetName} adlı kullanıcıya arkadaşlık isteği gönderildi!`);
                } catch (err) {
                    alert(err.message);
                }
            };
        });
    };

    // Real-time listener
    const q = query(collection(db, 'global_messages'), orderBy('timestamp', 'asc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        state.messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        state.isLoading = false;
        render();
    }, (err) => {
        console.error("Firebase error:", err);
        state.error = "Bağlantı hatası.";
        state.isLoading = false;
        render();
    });

    // Handle cleanup when tab changes
    const originalRender = render;
    container.remove = () => {
        unsubscribe();
        return HTMLElement.prototype.remove.call(container);
    };

    render();
    return container;
};
