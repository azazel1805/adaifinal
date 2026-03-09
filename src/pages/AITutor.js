import store from '../store/index';
import { createTutorChatSession, createCreativeWritingSession } from '../services/geminiService';
import { trackAction } from '../store/challenge';
import { ErrorMessage } from '../components/Common';
import { SendIcon } from '../components/Icons';

export const renderAITutor = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto';

    let state = {
        isEnglishMode: false,
        turkishHistory: [
            { role: 'model', text: 'Merhaba! Ben Onur, senin kişisel AI İngilizce eğitmenin. İngilizce yolculuğunda sana nasıl yardımcı olabilirim?' }
        ],
        englishConversation: [],
        userInput: '',
        isLoading: false,
        error: '',
        isListening: false,
        isSpeaking: false,
        interimTranscript: '',
        turkishChatSession: null,
        englishChatSession: null,
        recognition: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const scrollToBottom = () => {
        requestAnimationFrame(() => {
            const chatContainer = container.querySelector('#chat-container');
            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
        });
    };

    const initTurkishSession = () => {
        try {
            state.turkishChatSession = createTutorChatSession();
        } catch (e) {
            setState({ error: "AI Tutor başlatılamadı." });
        }
    };

    const initEnglishSession = () => {
        try {
            state.englishChatSession = createCreativeWritingSession('conversation', 'start');
            const welcome = { role: 'model', text: "Hello! I'm Alex, your English speaking partner. Let's have a chat! How are you today?" };
            state.englishConversation = [welcome];
            speakText(welcome.text);
        } catch (e) {
            setState({ error: "English session starting error." });
        }
    };

    const setupSpeechRecognition = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setState({ error: "Speech recognition not supported in this browser." });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onstart = () => setState({ isListening: true });
        recognition.onend = () => setState({ isListening: false });
        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setState({ error: `Speech error: ${event.error}`, isListening: false });
        };

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) final += event.results[i][0].transcript;
                else interim += event.results[i][0].transcript;
            }
            state.interimTranscript = interim;
            render(); // Update interim view
            if (final.trim()) handleUserSpeech(final.trim());
        };

        state.recognition = recognition;
    };

    const speakText = async (text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.lang === 'en-US' && /female/i.test(v.name));
        utterance.voice = femaleVoice || voices.find(v => v.lang === 'en-US') || null;

        utterance.onstart = () => setState({ isSpeaking: true });
        utterance.onend = () => setState({ isSpeaking: false });
        utterance.onerror = () => setState({ isSpeaking: false, error: "Audio response failed." });

        window.speechSynthesis.speak(utterance);
    };

    const handleUserSpeech = async (transcript) => {
        if (!state.englishChatSession) return;
        setState({ isLoading: true, interimTranscript: '', englishConversation: [...state.englishConversation, { role: 'user', text: transcript }] });
        try {
            const response = await state.englishChatSession.sendMessage({ message: transcript });
            const aiText = response.text;
            setState({ englishConversation: [...state.englishConversation, { role: 'model', text: aiText }], isLoading: false });
            await speakText(aiText);
        } catch (e) {
            setState({ error: "AI response failed.", isLoading: false });
        }
    };

    const handleMicClick = () => {
        if (state.isListening) {
            state.recognition?.stop();
        } else if (!state.isSpeaking && !state.isLoading) {
            try {
                state.recognition?.start();
            } catch (e) {
                setState({ error: "Could not start listening." });
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = state.userInput.trim();
        if (!text || state.isLoading || !state.turkishChatSession) return;

        setState({
            isLoading: true,
            error: '',
            turkishHistory: [...state.turkishHistory, { role: 'user', text }],
            userInput: ''
        });
        trackAction('tutor');

        try {
            const stream = await state.turkishChatSession.sendMessageStream({ message: text });
            state.turkishHistory = [...state.turkishHistory, { role: 'model', text: '' }];
            render(); // Add the empty model bubble

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                const lastMsg = state.turkishHistory[state.turkishHistory.length - 1];
                lastMsg.text += chunkText;
                render(); // Update incrementally
                scrollToBottom();
            }
            setState({ isLoading: false });
        } catch (e) {
            setState({ error: "AI response failed.", isLoading: false });
        }
    };

    const handleModeChange = (english) => {
        window.speechSynthesis?.cancel();
        state.recognition?.stop();
        setState({
            isEnglishMode: english,
            error: '',
            isListening: false,
            isSpeaking: false,
            interimTranscript: ''
        });
        if (english) {
            if (!state.recognition) setupSpeechRecognition();
            initEnglishSession();
        } else {
            if (!state.turkishChatSession) initTurkishSession();
        }
    };

    const render = () => {
        container.innerHTML = `
            <div class="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl shadow border border-zinc-200 overflow-hidden">
                <!-- Top bar with mode tabs -->
                <div class="flex items-center justify-between px-5 py-3 border-b border-zinc-100 shrink-0 bg-white">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-black">AI</div>
                        <div>
                            <p class="text-sm font-bold text-zinc-900">${state.isEnglishMode ? 'Alex' : 'Onur'}</p>
                            <p class="text-[10px] text-zinc-400">${state.isEnglishMode ? 'Speaking Partner' : 'AI İngilizce Eğitmeni'}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
                        <button id="tr-mode-btn" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!state.isEnglishMode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}">🇹🇷 Türkçe</button>
                        <button id="en-mode-btn" class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${state.isEnglishMode ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}">🇬🇧 English</button>
                    </div>
                </div>

                <!-- Chat messages -->
                <div id="chat-container" class="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-zinc-50">
                    ${(state.isEnglishMode ? state.englishConversation : state.turkishHistory).map(msg => `
                        <div class="flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}">
                            ${msg.role === 'model' ? `<div class="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-black shrink-0">AI</div>` : ''}
                            <div class="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                                ${msg.role === 'user'
                ? 'bg-brand-primary text-white rounded-br-sm'
                : 'bg-white text-zinc-800 border border-zinc-100 rounded-bl-sm'}">
                                <p class="whitespace-pre-wrap">${msg.text}</p>
                            </div>
                            ${msg.role === 'user' ? `<div class="w-7 h-7 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 text-[10px] font-black shrink-0">Sen</div>` : ''}
                        </div>
                    `).join('')}
                    ${state.interimTranscript ? `
                        <div class="flex items-end gap-3 justify-end">
                            <div class="max-w-[75%] px-4 py-3 rounded-2xl text-sm bg-brand-primary/20 text-brand-primary rounded-br-sm italic">${state.interimTranscript}...</div>
                        </div>
                    ` : ''}
                    ${state.isLoading ? `
                        <div class="flex items-end gap-3 justify-start">
                            <div class="w-7 h-7 rounded-full bg-brand-primary flex items-center justify-center text-white text-[10px] font-black shrink-0">AI</div>
                            <div class="px-4 py-3 rounded-2xl bg-white border border-zinc-100 rounded-bl-sm">
                                <div class="flex items-center gap-1.5">
                                    <div class="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce"></div>
                                    <div class="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.15s]"></div>
                                    <div class="w-1.5 h-1.5 bg-brand-primary rounded-full animate-bounce [animation-delay:0.3s]"></div>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Input area -->
                <div class="shrink-0 px-4 py-3 bg-white border-t border-zinc-100">
                    <div id="error-area"></div>
                    ${state.isEnglishMode ? `
                        <div class="flex flex-col items-center gap-2">
                            <button id="mic-btn" class="w-14 h-14 rounded-full flex items-center justify-center text-xl shadow transition-all
                                ${(state.isSpeaking || state.isLoading) ? 'bg-zinc-200 cursor-not-allowed' : state.isListening ? 'bg-brand-primary text-white animate-pulse ring-4 ring-brand-primary/20' : 'bg-brand-primary text-white hover:scale-105'}">🎤</button>
                            <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                ${state.isLoading ? 'Alex düşünüyor...' : state.isSpeaking ? 'Alex konuşuyor...' : state.isListening ? 'Seni dinliyorum...' : 'Konuşmak için bas'}
                            </p>
                        </div>
                    ` : `
                        <form id="chat-form" class="flex items-center gap-2">
                            <input type="text" id="chat-input" value="${state.userInput}"
                                placeholder="${state.isLoading ? 'Onur düşünüyor...' : 'Mesajınızı yazın...'}"
                                class="flex-1 px-4 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary outline-none text-sm text-zinc-800 placeholder-zinc-400 transition-all"
                                ${state.isLoading ? 'disabled' : ''}>
                            <button type="submit" class="w-10 h-10 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl flex items-center justify-center transition-all shrink-0 disabled:opacity-40"
                                ${(!state.userInput.trim() || state.isLoading) ? 'disabled' : ''}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
                            </button>
                        </form>
                    `}
                </div>
            </div>
        `;

        container.querySelector('#tr-mode-btn').addEventListener('click', () => handleModeChange(false));
        container.querySelector('#en-mode-btn').addEventListener('click', () => handleModeChange(true));

        if (state.isEnglishMode) {
            container.querySelector('#mic-btn')?.addEventListener('click', handleMicClick);
        } else {
            const form = container.querySelector('#chat-form');
            form?.addEventListener('submit', handleSendMessage);
            const input = container.querySelector('#chat-input');
            input?.addEventListener('input', (e) => {
                state.userInput = e.target.value;
                const submitBtn = container.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.disabled = !state.userInput.trim() || state.isLoading;
            });
        }

        if (state.error) {
            const errEl = document.createElement('p');
            errEl.className = 'text-xs text-red-500 font-medium mb-2 text-center';
            errEl.textContent = state.error;
            container.querySelector('#error-area')?.appendChild(errEl);
        }

        scrollToBottom();
    };

    // Handle initial message from store
    const checkInitialMessage = async () => {
        const { initialChatMessage } = store.getState();
        if (initialChatMessage && state.turkishChatSession) {
            store.setState({ initialChatMessage: null });
            const userMsg = { role: 'user', text: initialChatMessage };
            setState({
                turkishHistory: [...state.turkishHistory, userMsg],
                isLoading: true
            });
            try {
                const stream = await state.turkishChatSession.sendMessageStream({ message: initialChatMessage });
                state.turkishHistory = [...state.turkishHistory, { role: 'model', text: '' }];
                render();
                for await (const chunk of stream) {
                    const lastMsg = state.turkishHistory[state.turkishHistory.length - 1];
                    lastMsg.text += chunk.text;
                    render();
                }
                setState({ isLoading: false });
            } catch (e) {
                setState({ error: "AI response failed.", isLoading: false });
            }
        }
    };

    // Initial setup
    initTurkishSession();
    render();
    checkInitialMessage();

    // Re-check initial message if store changes
    store.subscribe((newState) => {
        if (newState.initialChatMessage && !state.isEnglishMode) {
            checkInitialMessage();
        }
    });

    return container;
};
