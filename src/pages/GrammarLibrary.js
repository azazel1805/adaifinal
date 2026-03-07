import { getGrammarTopicDetails, checkUserGrammarSentence } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';
import globalStore from '../store';

const grammarTopics = {
    "Başlangıç (A1-A2)": ["Present Simple", "Present Continuous", "Past Simple", "Future Tenses (will vs. going to)", "Frequency Adverbs", "Articles (a, an, the)", "Prepositions of Place", "Verb 'to be'", "Quantifiers", "Comparatives", "Superlatives", "Modals (can, must, have to, should)", "Adverbs of Manner"],
    "Orta (B1-B2)": ["Present Perfect", "Present Perfect Continuous", "Past Continuous", "Used To", "Conditionals (Type 1 & 2)", "Relative Clauses (defining)", "Passive Voice (Simple Tenses)", "Gerunds and Infinitives", "Reported Speech"],
    "İleri (C1-C2)": ["Past Perfect", "Future Perfect", "Causatives", "Conditionals (Type 3 & Mixed)", "Advanced Modals (might have, should have)", "Reported Speech", "Subjunctive Mood"]
};

export const renderGrammarLibrary = ({ onAskTutor }) => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        selectedTopic: null,
        topicDetails: null,
        isLoading: false,
        error: '',
        miniTestAnswers: {},
        showResults: false,
        userSentence: '',
        sentenceFeedback: null,
        isChecking: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const fetchDetails = async (topic) => {
        setState({ selectedTopic: topic, isLoading: true, error: '', topicDetails: null, miniTestAnswers: {}, showResults: false, userSentence: '', sentenceFeedback: null });
        try {
            const res = await getGrammarTopicDetails(topic);
            setState({ topicDetails: JSON.parse(res), isLoading: false });
        } catch { setState({ error: 'Konu yüklenemedi.', isLoading: false }); }
    };

    const handleCheckSentence = async () => {
        if (!state.userSentence.trim() || state.isChecking) return;
        setState({ isChecking: true, sentenceFeedback: null });
        try {
            const res = await checkUserGrammarSentence(state.userSentence, state.selectedTopic);
            setState({ sentenceFeedback: JSON.parse(res), isChecking: false });
        } catch { setState({ isChecking: false, error: 'Kontrol edilemedi.' }); }
    };

    const formatInteractive = (sentence, part, expl) => {
        const regex = new RegExp(`(${part})`, 'gi');
        return sentence.split(regex).map(p => {
            if (p.toLowerCase() === part.toLowerCase()) {
                return `
                    <span class="group relative inline-block">
                        <strong class="text-brand-primary bg-brand-primary/10 px-1.5 rounded-lg cursor-help transition-all hover:bg-brand-primary hover:text-white">${p}</strong>
                        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-90 group-hover:scale-100 border border-white/10 leading-relaxed text-center">
                            ${expl}
                        </span>
                    </span>
                `;
            }
            return p;
        }).join('');
    };

    const render = () => {
        if (state.selectedTopic) {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <button id="back-btn" class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-all flex items-center gap-2">
                        ← ARŞİVE DÖN
                    </button>

                    ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-20"></div>` : ''}
                    <div id="error-area"></div>

                    ${state.topicDetails ? `
                        <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
                            <div class="lg:col-span-3 space-y-10">
                                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🏛️</div>
                                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">${state.topicDetails.topicName}</h2>
                                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6 italic">"${state.topicDetails.simpleExplanation}"</p>
                                </div>

                                <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-8">
                                    <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">INTERACTIVE EXAMPLES</h3>
                                    <div class="space-y-6">
                                        ${state.topicDetails.interactiveExamples.map(ex => `
                                            <div class="p-6 bg-slate-50 dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-white/5 text-lg font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
                                                ${formatInteractive(ex.sentence, ex.interactivePart, ex.explanation)}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>

                                <div class="bg-slate-950 p-10 rounded-[4rem] shadow-2xl border-4 border-white/5 space-y-10">
                                    <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em]">CHALLENGE YOURSELF</h3>
                                    <div class="space-y-4">
                                        <p class="text-slate-400 text-sm font-bold italic">Bu kuralı kullanarak kendi cümleni kur, analiz edelim.</p>
                                        <div class="flex gap-4">
                                            <input type="text" id="sentence-input" value="${state.userSentence}" placeholder="Write something here..." class="flex-grow p-6 bg-white/5 border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-white shadow-inner">
                                            <button id="check-s-btn" class="bg-brand-primary text-white font-black px-8 py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50" ${state.isChecking ? 'disabled' : ''}>KONTROL ET</button>
                                        </div>
                                        ${state.sentenceFeedback ? `
                                            <div class="p-6 rounded-2xl ${state.sentenceFeedback.isCorrect ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'} font-bold italic animate-slideUp">
                                                ${state.sentenceFeedback.isCorrect ? '✓' : '✗'} ${state.sentenceFeedback.feedback}
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>

                            <div class="lg:col-span-1 space-y-8">
                                <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10">
                                    <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-6">KISA TEST</h3>
                                    ${state.topicDetails.miniTest.map((q, i) => `
                                        <div class="space-y-6">
                                            <p class="text-sm font-black text-slate-800 dark:text-white leading-tight">Q${i + 1}: ${q.question}</p>
                                            <div class="grid gap-2">
                                                ${q.options.map(opt => {
                const isSelected = state.miniTestAnswers[i] === opt;
                const isCorrect = q.correctAnswer === opt;
                let cls = "w-full text-left p-4 rounded-2xl border-2 font-bold transition-all text-[10px] uppercase tracking-widest";
                if (state.showResults) {
                    if (isCorrect) cls += " bg-green-500 text-white border-green-500";
                    else if (isSelected) cls += " bg-red-500 text-white border-red-500";
                    else cls += " bg-slate-50 text-slate-400 border-transparent opacity-50";
                } else {
                    cls += isSelected ? " bg-brand-primary text-white border-brand-primary shadow-lg" : " bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 hover:bg-slate-100";
                }
                return `<button class="opt-btn ${cls}" data-qi="${i}" data-val="${opt}" ${state.showResults ? 'disabled' : ''}>${opt}</button>`;
            }).join('')}
                                            </div>
                                        </div>
                                    `).join('')}
                                    
                                    ${!state.showResults ? `
                                        <button id="check-test-btn" class="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-[10px] hover:scale-105 transition-all">SCORE CHECK</button>
                                    ` : `
                                        <button id="ask-tutor-btn" class="w-full bg-brand-secondary/10 text-brand-secondary font-black py-4 rounded-2xl border-2 border-brand-secondary/20 uppercase tracking-widest text-[10px] hover:bg-brand-secondary hover:text-white transition-all">DETAYLI ANALİZ İSTE 🤖</button>
                                    `}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                        <div class="absolute top-0 left-0 p-10 text-8xl opacity-10 select-none grayscale">🏛️</div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Linguistic Archives</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Dilbilgisinin tozlu raflarında kaybolmayın. Her konu, her kural; interaktif örnekler ve anlık geri bildirimlerle kristal netliğinde.</p>
                    </div>

                    <div class="space-y-12">
                        ${Object.entries(grammarTopics).map(([level, topics]) => `
                            <div class="space-y-6">
                                <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] ml-6">${level}</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    ${topics.map(t => `
                                        <button class="topic-btn p-6 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 text-left font-black text-slate-900 dark:text-white uppercase italic tracking-tighter hover:border-brand-primary hover:-translate-y-1 transition-all" data-t="${t}">
                                            ${t}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (state.isLoading) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.topic-btn').forEach(btn => btn.onclick = () => fetchDetails(btn.dataset.t));
        container.querySelector('#back-btn')?.addEventListener('click', () => setState({ selectedTopic: null, topicDetails: null }));
        container.querySelector('#sentence-input')?.addEventListener('input', (e) => state.userSentence = e.target.value);
        container.querySelector('#check-s-btn')?.addEventListener('click', handleCheckSentence);
        container.querySelector('#check-test-btn')?.addEventListener('click', () => setState({ showResults: true }));

        container.querySelectorAll('.opt-btn').forEach(btn => {
            btn.onclick = () => {
                state.miniTestAnswers[btn.dataset.qi] = btn.dataset.val;
                render();
            };
        });

        container.querySelector('#ask-tutor-btn')?.addEventListener('click', () => {
            onAskTutor(`Gramer Analizi: ${state.selectedTopic} konusu üzerine mini testi tamamladım fakat bazı noktaları netleştirmek istiyorum. Detaylı açıklama yapabilir misin?`);
        });
    };

    render();
    return container;
};
