import { generateListeningTask } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';
import { DIFFICULTY_LEVELS } from '../constants';
import store from '../store';

export const renderListeningPractice = ({ onAskTutor } = {}) => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        difficulty: DIFFICULTY_LEVELS[1],
        isLoading: false,
        error: '',
        task: null,
        userAnswers: {},
        showResults: false,
        isSpeaking: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGenerate = async () => {
        window.speechSynthesis.cancel();
        setState({ isLoading: true, error: '', task: null, userAnswers: {}, showResults: false, isSpeaking: false });
        try {
            const res = await generateListeningTask(state.difficulty);
            setState({ task: JSON.parse(res), isLoading: false });
        } catch { setState({ error: 'Görev oluşturulamadı.', isLoading: false }); }
    };

    const toggleSpeech = () => {
        if (!state.task) return;
        if (state.isSpeaking) {
            window.speechSynthesis.cancel();
            setState({ isSpeaking: false });
        } else {
            const ut = new SpeechSynthesisUtterance(state.task.script);
            ut.lang = 'en-US';
            ut.onstart = () => setState({ isSpeaking: true });
            ut.onend = () => setState({ isSpeaking: false });
            window.speechSynthesis.speak(ut);
        }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🎧</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Ear Training</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-6">Dinleme becerilerinizi zorlu seviyelerde test edin. AI tarafından anlık oluşturulan senaryoları dinleyin ve soruları yanıtlayın.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-end">
                    <div class="flex-grow space-y-4">
                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">DIFFICULTY LEVEL</h4>
                        <select id="diff-select" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-900 dark:text-white shadow-inner appearance-none">
                            ${DIFFICULTY_LEVELS.map(d => `<option value="${d}" ${state.difficulty === d ? 'selected' : ''}>${d}</option>`).join('')}
                        </select>
                    </div>
                    <button id="gen-btn" class="bg-brand-primary text-white font-black px-12 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">YENİ GÖREV OLUŞTUR 🔊</button>
                </div>

                <div id="error-area"></div>
                ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-10"></div>` : ''}

                ${state.task ? `
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-slideUp">
                        <div class="lg:col-span-1">
                            <div class="bg-slate-950 p-10 rounded-[3rem] shadow-2xl border-4 border-white/5 space-y-8 text-center sticky top-10">
                                <div class="w-24 h-24 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl animate-pulse">🔊</div>
                                <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em]">LISTENING CONTEXT</h3>
                                <p class="text-slate-400 font-bold italic text-sm leading-relaxed">"Sesli metni dikkatlice dinleyin. Gerekirse tekrar oynatabilirsiniz."</p>
                                <button id="play-btn" class="w-full ${state.isSpeaking ? 'bg-red-500 shadow-red-500/20' : 'bg-brand-primary shadow-brand-primary/20'} text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">
                                    ${state.isSpeaking ? 'DURDUR ⏹️' : 'OYNAT ▶️'}
                                </button>
                            </div>
                        </div>

                        <div class="lg:col-span-2 space-y-6">
                            ${state.task.questions.map((q, i) => `
                                <div class="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-8">
                                    <div class="flex gap-4">
                                        <span class="text-3xl font-black text-brand-primary opacity-20 italic">0${i + 1}</span>
                                        <h4 class="text-xl font-black text-slate-800 dark:text-white leading-tight">${q.question}</h4>
                                    </div>
                                    <div class="grid gap-3">
                                        ${q.options.map(opt => {
            const isSelected = state.userAnswers[i] === opt.key;
            const isCorrect = opt.key === q.correctAnswer;
            let cls = "flex items-center p-6 rounded-3xl border-2 font-bold transition-all shadow-sm";
            if (state.showResults) {
                if (isCorrect) cls += " bg-green-500 text-white border-green-500 shadow-green-500/20";
                else if (isSelected) cls += " bg-red-500 text-white border-red-500 shadow-red-500/20 line-through";
                else cls += " bg-slate-50 text-slate-400 border-transparent opacity-50";
            } else {
                if (isSelected) cls += " bg-brand-primary text-white border-brand-primary shadow-brand-primary/20 scale-[1.02]";
                else cls += " bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100";
            }
            return `
                                                <button class="opt-btn ${cls} text-left" data-qi="${i}" data-okey="${opt.key}" ${state.showResults ? 'disabled' : ''}>
                                                    <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 shrink-0">${opt.key}</span>
                                                    ${opt.value}
                                                </button>
                                            `;
        }).join('')}
                                    </div>
                                    ${state.showResults && state.userAnswers[i] !== q.correctAnswer ? `
                                        <button class="tutor-btn text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline mt-4" data-qi="${i}">Alex'e Sebebini Sor 🤖</button>
                                    ` : ''}
                                </div>
                            `).join('')}

                            ${!state.showResults ? `
                                <button id="check-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">CEVAPLARI KONTROL ET ✔️</button>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (state.isLoading) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelector('#diff-select')?.addEventListener('change', (e) => state.difficulty = e.target.value);
        container.querySelector('#gen-btn')?.addEventListener('click', handleGenerate);
        container.querySelector('#play-btn')?.addEventListener('click', toggleSpeech);
        container.querySelector('#check-btn')?.addEventListener('click', () => setState({ showResults: true }));

        container.querySelectorAll('.opt-btn').forEach(btn => {
            btn.onclick = () => {
                const qi = btn.dataset.qi;
                const okey = btn.dataset.okey;
                state.userAnswers[qi] = okey;
                render();
            };
        });

        container.querySelectorAll('.tutor-btn').forEach(btn => {
            btn.onclick = () => {
                const qi = btn.dataset.qi;
                const q = state.task.questions[qi];
                const ua = state.userAnswers[qi];
                const uav = q.options.find(o => o.key === ua)?.value || 'N/A';
                const cav = q.options.find(o => o.key === q.correctAnswer)?.value;
                const ctx = `Alex, bu dinleme sorusunu yanlış yaptım. Bana nedenini açıklayabilir misin?\n\n---METİN---\n${state.task.script}\n\n---SORU---\n${q.question}\n\nSEÇİMLER:\n${q.options.map(o => `${o.key}: ${o.value}`).join('\n')}\n\nBenim Cevabım: ${ua}) ${uav}\nDoğru Cevap: ${q.correctAnswer}) ${cav}`;
                onAskTutor(ctx);
            };
        });
    };

    render();
    return container;
};
