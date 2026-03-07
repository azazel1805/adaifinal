import { getNewsSummary, generateNewsQuestions } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderNewsReader = ({ onAskTutor }) => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        topic: null,
        paragraph: '',
        sources: [],
        questions: [],
        userAnswers: {},
        showResults: false,
        isLoading: false,
        isLoadingQuestions: false,
        error: '',
        activeView: 'quiz' // quiz, sources
    };

    const categories = ["Technology", "World", "Sports", "Health", "Economy", "Science"];

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGetNews = async (cat) => {
        setState({ topic: cat, isLoading: true, error: '', paragraph: '', sources: [], questions: [], userAnswers: {}, showResults: false, activeView: 'quiz' });
        try {
            const result = await getNewsSummary(cat);
            setState({ paragraph: result.text, sources: result.sources, isLoading: false, isLoadingQuestions: true });

            const qRes = await generateNewsQuestions(result.text);
            const qData = JSON.parse(qRes);
            if (qData.questions) setState({ questions: qData.questions, isLoadingQuestions: false });
            else throw new Error("Questions missing");
        } catch { setState({ error: 'Haberler alınamadı.', isLoading: false, isLoadingQuestions: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🌍</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Global Context</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-6">Dünyadan canlı haberlerle dil öğrenin. Gerçek olayları okuyun, analiz edin ve anlama becerinizi güncel olaylarla test edin.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800">
                    <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-6 text-center">SELECT CATEGORY</h4>
                    <div class="flex flex-wrap justify-center gap-3">
                        ${categories.map(c => `
                            <button class="cat-btn px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${state.topic === c ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}" data-c="${c}">${c}</button>
                        `).join('')}
                    </div>
                </div>

                <div id="error-area"></div>
                ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-10"></div>` : ''}

                ${state.paragraph ? `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-slideUp">
                        <div class="space-y-10">
                            <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative">
                                <span class="bg-brand-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest absolute -top-4 left-10 shadow-lg">${state.topic} BRIEF</span>
                                <div class="prose prose-slate dark:prose-invert max-w-none">
                                    <p class="text-lg md:text-xl font-bold leading-relaxed text-slate-700 dark:text-slate-300 first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:text-brand-primary">
                                        ${state.paragraph}
                                    </p>
                                </div>
                            </div>

                            <div class="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl border-4 border-white/5 space-y-6">
                                <h4 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em]">AUTHENTIC SOURCES</h4>
                                <ul class="space-y-4">
                                    ${state.sources.map(s => `
                                        <li class="flex items-center gap-4 group">
                                            <div class="w-2 h-2 rounded-full bg-brand-primary"></div>
                                            <a href="${s.web.uri}" target="_blank" class="text-slate-400 font-bold hover:text-white transition-all text-sm truncate">${s.web.title || s.web.uri}</a>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>

                        <div class="space-y-8">
                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-8">
                                <div class="flex justify-between items-end border-b border-slate-50 dark:border-slate-800 pb-6 mb-10">
                                    <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">COMPREHENSION CHECK</h3>
                                    ${state.isLoadingQuestions ? `<div id="q-loader" class="scale-50"></div>` : ''}
                                </div>

                                <div class="space-y-10">
                                    ${state.questions.map((q, i) => {
            const userAns = state.userAnswers[i];
            return `
                                            <div class="space-y-6">
                                                <div class="flex gap-4">
                                                    <span class="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shrink-0">${i + 1}</span>
                                                    <p class="font-bold text-slate-700 dark:text-white">${q.question}</p>
                                                </div>
                                                <div class="grid gap-3 pl-12">
                                                    ${q.options.map(opt => {
                const isSelected = userAns === opt.key;
                const isCorrect = opt.key === q.correctAnswer;
                let cls = "w-full text-left p-4 rounded-2xl border-2 font-bold transition-all text-sm";
                if (state.showResults) {
                    if (isCorrect) cls += " bg-green-500 text-white border-green-500 shadow-green-500/20";
                    else if (isSelected) cls += " bg-red-500 text-white border-red-500 shadow-red-500/20";
                    else cls += " bg-slate-50 text-slate-400 border-transparent opacity-50";
                } else {
                    cls += isSelected ? " bg-brand-primary text-white border-brand-primary" : " bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 hover:bg-slate-100";
                }
                return `<button class="opt-btn ${cls}" data-qi="${i}" data-val="${opt.key}" ${state.showResults ? 'disabled' : ''}>${opt.key}) ${opt.value}</button>`;
            }).join('')}
                                                </div>
                                                ${state.showResults && userAns !== q.correctAnswer ? `
                                                    <div class="pl-12 text-right">
                                                        <button class="ask-btn text-[10px] font-black text-cyan-600 hover:underline" data-qi="${i}">ANALİZ İSTE 🤖</button>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
        }).join('')}
                                </div>

                                ${!state.showResults && state.questions.length > 0 ? `
                                    <button id="check-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">CHECK ANSWERS ✔️</button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (state.isLoading) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.isLoadingQuestions) container.querySelector('#q-loader')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage({ message: state.error }));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.cat-btn').forEach(btn => btn.onclick = () => handleGetNews(btn.dataset.c));
        container.querySelector('#check-btn')?.addEventListener('click', () => setState({ showResults: true }));

        container.querySelectorAll('.opt-btn').forEach(btn => {
            btn.onclick = () => {
                state.userAnswers[btn.dataset.qi] = btn.dataset.val;
                render();
            };
        });

        container.querySelectorAll('.ask-btn').forEach(btn => {
            btn.onclick = () => {
                const i = parseInt(btn.dataset.qi);
                const q = state.questions[i];
                const context = `News Analysis Request:\n\nTEXT:\n${state.paragraph}\n\nQUESTION:\n${q.question}\nOPTIONS:\n${q.options.map(o => `${o.key}: ${o.value}`).join('\n')}\nUSER ANSWER: ${state.userAnswers[i]}\nCORRECT ANSWER: ${q.correctAnswer}`;
                onAskTutor(context);
            };
        });
    };

    render();
    return container;
};
