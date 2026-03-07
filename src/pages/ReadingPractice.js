import store from '../store/index';
import { analyzeReadingPassage } from '../services/geminiService';
import { addWord, removeWord, isWordSaved } from '../store/vocabulary';
import { trackSingleQuestionResult } from '../store/examHistory';
import { Loader, ErrorMessage } from '../components/Common';

export const renderReadingPractice = (onAskTutor) => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10';

    let state = {
        text: '',
        isLoading: false,
        error: '',
        result: null,
        userAnswers: {},
        showResults: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleAnalyze = async () => {
        if (!state.text.trim()) {
            setState({ error: 'Lütfen analiz edilecek bir metin girin.' });
            return;
        }
        setState({ isLoading: true, error: '', result: null, userAnswers: {}, showResults: false });
        try {
            const resultText = await analyzeReadingPassage(state.text);
            const resultJson = JSON.parse(resultText);
            setState({ result: resultJson, isLoading: false });
        } catch (e) {
            setState({ error: e.message || 'Analiz hatası.', isLoading: false });
        }
    };

    const handleCheckAnswers = () => {
        if (!state.result) return;
        state.result.questions.forEach((q, i) => {
            const isCorrect = state.userAnswers[i] === q.correctAnswer;
            trackSingleQuestionResult('Okuma Anlama', isCorrect);
        });
        setState({ showResults: true });
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">📖</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic flex items-center gap-4">
                        <span>Reading Practice</span>
                        <div class="w-3 h-3 bg-brand-primary rounded-full"></div>
                    </h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium mb-8">Herhangi bir metni analiz edin, özetini görün ve anlama seviyenizi test edin.</p>

                    <textarea id="reading-input" placeholder="İngilizce metni buraya yapıştırın..." class="w-full h-80 p-8 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2.5rem] focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none font-bold text-slate-900 dark:text-white transition-all text-lg shadow-inner resize-none">${state.text}</textarea>

                    <button id="analyze-btn" class="mt-8 w-full bg-brand-primary text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all disabled:opacity-50">
                        ${state.isLoading ? 'METİN ANALİZ EDİLİYOR...' : 'ANALİZ YAP VE TEST OLUŞTUR 🚀'}
                    </button>
                </div>

                ${state.isLoading ? '<div class="py-12 flex justify-center"><div id="loader-target"></div></div>' : ''}
                <div id="error-area"></div>

                ${state.result ? `
                    <div class="animate-slideUp space-y-10">
                         <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                             <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                                <span>🇹🇷 TÜRKÇE ÖZET</span>
                                <div class="h-px flex-1 bg-brand-primary/10"></div>
                             </h3>
                             <p class="text-xl font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">"${state.result.summary}"</p>
                         </div>

                         <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                             <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                                <span>🗝️ ANAHTAR KELİMELER</span>
                                <div class="h-px flex-1 bg-brand-primary/10"></div>
                             </h3>
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                ${state.result.vocabulary.map(v => `
                                    <div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
                                        <div>
                                            <span class="font-black text-slate-900 dark:text-white text-lg">${v.word}</span>
                                            <span class="text-slate-400 font-bold text-sm block">${v.meaning}</span>
                                        </div>
                                        <button class="save-btn w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm hover:shadow-lg transition-all text-2xl" data-word="${v.word}" data-meaning="${v.meaning}">
                                            ${isWordSaved(v.word) ? '✅' : '🔖'}
                                        </button>
                                    </div>
                                `).join('')}
                             </div>
                         </div>

                         <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                            <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-12 flex items-center gap-3">
                                <span>🧠 ANLAMA SORULARI</span>
                                <div class="h-px flex-1 bg-brand-primary/10"></div>
                            </h3>
                            <div class="space-y-12">
                                ${state.result.questions.map((q, i) => {
            const userAnswer = state.userAnswers[i];
            const isCorrect = userAnswer === q.correctAnswer;
            return `
                                        <div class="space-y-6">
                                            <p class="text-xl font-black text-slate-900 dark:text-white leading-tight"><span class="text-brand-primary mr-4 opacity-50">Q${i + 1}.</span>${q.question}</p>
                                            <div class="grid gap-3">
                                                ${q.options.map(opt => {
                const isSel = userAnswer === opt.key;
                const isCor = opt.key === q.correctAnswer;
                let cls = "flex items-center p-5 rounded-2xl border-2 font-black transition-all cursor-pointer ";
                if (state.showResults) {
                    if (isCor) cls += "bg-green-500 border-green-500 text-white shadow-lg";
                    else if (isSel) cls += "bg-red-500 border-red-500 text-white line-through opacity-80";
                    else cls += "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-400 opacity-40";
                } else {
                    if (isSel) cls += "bg-brand-primary border-brand-primary text-white shadow-xl -translate-y-1";
                    else cls += "bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300 hover:border-brand-primary/30";
                }
                return `
                                                        <label class="${cls}">
                                                            <input type="radio" name="q-${i}" class="hidden" value="${opt.key}" ${state.showResults ? 'disabled' : ''} ${isSel ? 'checked' : ''}>
                                                            <span class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center mr-4 text-xs">${opt.key}</span>
                                                            <span class="text-sm">${opt.value}</span>
                                                        </label>
                                                    `;
            }).join('')}
                                            </div>
                                            ${state.showResults && !isCorrect ? `
                                                <div class="text-right">
                                                    <button class="ask-tutor-btn text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary hover:underline" data-idx="${i}">SORUNUN NEDENİ ONUR'A SOR 💡</button>
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
        }).join('')}
                            </div>
                            ${!state.showResults ? `<button id="check-btn" class="mt-14 w-full bg-slate-900 dark:bg-black text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">CEVAPLARI KONTROL ET ✅</button>` : ''}
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
        const input = container.querySelector('#reading-input');
        if (input) input.onchange = (e) => state.text = e.target.value;

        const analyzeBtn = container.querySelector('#analyze-btn');
        if (analyzeBtn) analyzeBtn.onclick = handleAnalyze;

        container.querySelectorAll('.save-btn').forEach(btn => {
            btn.onclick = () => {
                const w = btn.dataset.word;
                if (isWordSaved(w)) removeWord(w);
                else addWord(w, btn.dataset.meaning);
                render();
            };
        });

        container.querySelectorAll('label input').forEach(input => {
            input.onchange = (e) => {
                const qIdx = parseInt(input.name.split('-')[1]);
                const updated = { ...state.userAnswers, [qIdx]: e.target.value };
                setState({ userAnswers: updated });
            };
        });

        const checkBtn = container.querySelector('#check-btn');
        if (checkBtn) checkBtn.onclick = handleCheckAnswers;

        container.querySelectorAll('.ask-tutor-btn').forEach(btn => {
            btn.onclick = () => {
                const i = parseInt(btn.dataset.idx);
                const q = state.result.questions[i];
                const userAnswer = state.userAnswers[i];
                const userAnswerValue = q.options.find(o => o.key === userAnswer)?.value || 'Boş';
                const correctAnswerValue = q.options.find(o => o.key === q.correctAnswer)?.value;
                const context = `Merhaba Onur, bu okuma parçası sorusunu yanlış yaptım. Nedenini açıklayabilir misin?\n\n---METİN---\n${state.text}\n\n---SORU---\n${q.question}\n\nSeçenekler:\n${q.options.map(o => `${o.key}) ${o.value}`).join('\n')}\n\n---CEVAPLARIM---\nBenim Cevabım: ${userAnswer || 'Boş'}) ${userAnswerValue}\nDoğru Cevap: ${q.correctAnswer}) ${correctAnswerValue}`;
                if (onAskTutor) onAskTutor(context);
                else {
                    window.location.hash = '#tutor';
                    setTimeout(() => {
                        const tutorInput = document.querySelector('#tutor-input');
                        if (tutorInput) {
                            tutorInput.value = context;
                            tutorInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                    }, 500);
                }
            };
        });
    };

    render();
    return container;
};
