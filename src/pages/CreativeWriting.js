import { createCreativeWritingSession } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderCreativeWriting = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        writingState: 'setup', // 'setup', 'writing'
        format: '', // 'Short Story', 'Poem', 'Dialogue'
        startInput: '',
        storyParts: [],
        userInput: '',
        isLoading: false,
        error: ''
    };

    let chatSession = null;

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleStart = async () => {
        if (!state.format || !state.startInput.trim()) return setState({ error: 'Lütfen bir format seçin ve başlangıç metni yazın.' });
        setState({ isLoading: true, error: '', storyParts: [{ author: 'user', text: state.startInput }] });
        try {
            chatSession = createCreativeWritingSession(state.format, state.startInput);
            const stream = await chatSession.sendMessageStream({ message: state.startInput });
            state.storyParts.push({ author: 'ai', text: '' });
            state.writingState = 'writing';
            render();

            for await (const chunk of stream) {
                state.storyParts[state.storyParts.length - 1].text += chunk.text;
                renderQuietly();
            }
            setState({ isLoading: false });
        } catch { setState({ error: 'Oturum başlatılamadı.', isLoading: false }); }
    };

    const handleSend = async () => {
        if (!state.userInput.trim() || state.isLoading) return;
        const msg = state.userInput.trim();
        setState({ userInput: '', storyParts: [...state.storyParts, { author: 'user', text: msg }], isLoading: true });
        try {
            const stream = await chatSession.sendMessageStream({ message: msg });
            state.storyParts.push({ author: 'ai', text: '' });
            renderQuietly();
            for await (const chunk of stream) {
                state.storyParts[state.storyParts.length - 1].text += chunk.text;
                renderQuietly();
            }
            setState({ isLoading: false });
        } catch { setState({ error: 'Yanıt alınamadı.', isLoading: false }); }
    };

    const renderQuietly = () => {
        const storyBox = container.querySelector('#story-box');
        if (storyBox) {
            storyBox.innerHTML = state.storyParts.map(p => `
                <span class="${p.author === 'user' ? 'text-slate-900 dark:text-white' : 'text-brand-primary font-bold italic'}">${p.text} </span>
            `).join('');
            storyBox.scrollTop = storyBox.scrollHeight;
        }
    };

    const render = () => {
        if (state.writingState === 'setup') {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden text-center">
                        <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">✒️</div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Alex & Co.</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Yapay zeka yazar ortağınız Alex ile birlikte yaratıcılığınızı konuşturun. Bir format seçin ve başrolü paylaşın.</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10 max-w-4xl mx-auto">
                        <div class="space-y-6">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">1. FORMAT SEÇİN</h4>
                            <div class="flex flex-wrap gap-3">
                                ${['Short Story', 'Poem', 'Dialogue'].map(f => `
                                    <button class="format-btn px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${state.format === f ? 'bg-brand-primary text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}" data-f="${f}">${f}</button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="space-y-6">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">2. BİR BAŞLANGIÇ NOKTASI BELİRLEYİN</h4>
                            <textarea id="start-area" placeholder="Bir giriş cümlesi, birkaç anahtar kelime veya bir tema yazın..." class="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[3rem] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner resize-none text-lg">${state.startInput}</textarea>
                        </div>

                        <div id="error-area"></div>
                        <button id="start-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-20" ${state.isLoading || !state.format || !state.startInput.trim() ? 'disabled' : ''}>${state.isLoading ? 'OTURUM BAŞLATILIYOR...' : 'YAZIMA BAŞLA 🚀'}</button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-8 h-[calc(100vh-14rem)] flex flex-col">
                    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 flex justify-between items-center">
                        <div>
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-widest block mb-1">CURRENT COLLABORATION</span>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white italic uppercase">${state.format} with Alex</h3>
                        </div>
                        <button id="new-btn" class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors">🗑️ YENİ HİKAYE</button>
                    </div>

                    <div id="story-box" class="flex-grow bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 overflow-y-auto font-medium text-lg leading-relaxed tracking-tight">
                        ${state.storyParts.map(p => `
                            <span class="${p.author === 'user' ? 'text-slate-900 dark:text-white' : 'text-brand-primary font-bold italic'}">${p.text} </span>
                        `).join('')}
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-6 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800">
                        <div class="flex items-center gap-4">
                            <textarea id="user-input" placeholder="${state.isLoading ? 'Alex yazıyor...' : 'Senin sıran...'}" class="flex-grow p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-900 dark:text-white transition-all resize-none shadow-inner" rows="2" ${state.isLoading ? 'disabled' : ''}>${state.userInput}</textarea>
                            <button id="send-btn" class="w-16 h-16 bg-brand-primary text-white rounded-2xl flex items-center justify-center text-2xl shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-20" ${state.isLoading || !state.userInput.trim() ? 'disabled' : ''}>
                                <svg class="w-8 h-8 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.format-btn').forEach(btn => btn.onclick = () => setState({ format: btn.dataset.f }));
        const startArea = container.querySelector('#start-area');
        if (startArea) startArea.oninput = (e) => {
            state.startInput = e.target.value;
            const startBtn = container.querySelector('#start-btn');
            if (startBtn) startBtn.disabled = state.isLoading || !state.format || !state.startInput.trim();
        };
        const startBtn = container.querySelector('#start-btn');
        if (startBtn) startBtn.onclick = handleStart;

        const newBtn = container.querySelector('#new-btn');
        if (newBtn) newBtn.onclick = () => { chatSession = null; setState({ writingState: 'setup', format: '', startInput: '', storyParts: [], userInput: '' }); };

        const userInp = container.querySelector('#user-input');
        if (userInp) {
            userInp.oninput = (e) => {
                state.userInput = e.target.value;
                const sendBtn = container.querySelector('#send-btn');
                if (sendBtn) sendBtn.disabled = state.isLoading || !state.userInput.trim();
            };
            userInp.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };
        }
        const sendBtn = container.querySelector('#send-btn');
        if (sendBtn) sendBtn.onclick = handleSend;
    };

    render();
    return container;
};
