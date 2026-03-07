import { generateDialogueExercise } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderDialogueCompletion = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        difficulty: 'Orta',
        isLoading: false,
        error: '',
        exercise: null,
        selectedOptionKey: null,
        showResults: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGenerate = async () => {
        setState({ isLoading: true, error: '', exercise: null, selectedOptionKey: null, showResults: false });
        try {
            const res = await generateDialogueExercise(state.difficulty);
            setState({ exercise: JSON.parse(res), isLoading: false });
        } catch { setState({ error: 'Alıştırma oluşturulamadı.', isLoading: false }); }
    };

    const handleSelect = (key) => {
        if (state.showResults) return;
        setState({ selectedOptionKey: key, showResults: true });
    };

    const getExplanation = (key) => {
        if (!state.exercise) return null;
        if (key === state.exercise.correctOptionKey) return state.exercise.analysis.correctExplanation;
        return state.exercise.analysis.distractorExplanations.find(d => d.optionKey === key)?.explanation;
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">💬</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Dialogue Link</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-6">Diyalogların kayıp parçasını bulun. Verilen duruma ve final cümlesine en uygun bağlamı kuran seçeneği işaretleyin.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-end">
                    <div class="flex-grow space-y-4">
                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">LEVEL</h4>
                        <select id="diff-select" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-900 dark:text-white shadow-inner appearance-none">
                            <option value="Kolay" ${state.difficulty === 'Kolay' ? 'selected' : ''}>Kolay</option>
                            <option value="Orta" ${state.difficulty === 'Orta' ? 'selected' : ''}>Orta</option>
                            <option value="Zor" ${state.difficulty === 'Zor' ? 'selected' : ''}>Zor</option>
                        </select>
                    </div>
                    <button id="gen-btn" class="bg-brand-primary text-white font-black px-12 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">YENİ DİYALOG BUL 🔍</button>
                </div>

                <div id="error-area"></div>
                ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-10"></div>` : ''}

                ${state.exercise ? `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-slideUp">
                        <div class="space-y-10">
                            <div class="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl space-y-8 border-4 border-white/5">
                                <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">SITUATION BRIEF</span>
                                <p class="text-slate-300 font-bold italic text-lg leading-relaxed">"${state.exercise.situation}"</p>
                            </div>

                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-6">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-4">CONVERSATION FLOW</h3>
                                <div class="space-y-4">
                                    <div class="flex justify-center italic text-slate-400 text-xs py-4 border-y border-slate-50 dark:border-slate-800">Conversation continues...</div>
                                    <div class="flex justify-start">
                                        <div class="p-6 bg-slate-100 dark:bg-slate-800 rounded-3xl rounded-bl-none border-2 border-dashed border-slate-300 dark:border-slate-600 w-full max-w-sm">
                                            <p class="text-xs font-black text-slate-400 mb-1 italic">MISSING RESPONSE (?)</p>
                                        </div>
                                    </div>
                                    <div class="flex justify-end">
                                        <div class="p-6 bg-brand-primary text-white rounded-[2rem] rounded-tr-none shadow-xl max-w-sm">
                                            <p class="text-[10px] font-black opacity-60 uppercase mb-1">${state.exercise.finalSentence.speaker}</p>
                                            <p class="font-bold">"${state.exercise.finalSentence.text}"</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-6">
                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-6">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-4">CHOOSE THE BEST FIT</h3>
                                <div class="grid gap-3">
                                    ${state.exercise.options.map(opt => {
            const isSelected = state.selectedOptionKey === opt.optionKey;
            const isCorrect = opt.optionKey === state.exercise.correctOptionKey;
            let cls = "w-full text-left p-6 rounded-[2rem] border-2 font-bold transition-all flex items-center shadow-sm";
            if (state.showResults) {
                if (isCorrect) cls += " bg-green-500 text-white border-green-500 shadow-green-500/20";
                else if (isSelected) cls += " bg-red-500 text-white border-red-500 shadow-red-500/20";
                else cls += " bg-slate-50 text-slate-400 border-transparent opacity-50";
            } else {
                cls += " bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100";
            }
            return `
                                            <button class="opt-btn ${cls}" data-key="${opt.optionKey}" ${state.showResults ? 'disabled' : ''}>
                                                <span class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mr-4 shrink-0">${opt.optionKey}</span>
                                                <div class="flex-grow">
                                                    <p class="text-[10px] uppercase font-black opacity-60">${opt.speaker}</p>
                                                    <p>${opt.text}</p>
                                                </div>
                                            </button>
                                        `;
        }).join('')}
                                </div>
                            </div>

                            ${state.showResults && state.selectedOptionKey ? `
                                <div class="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl space-y-6 border-4 border-white/5 animate-slideUp">
                                    <div class="flex items-center gap-4">
                                        <div class="w-12 h-12 rounded-full ${state.selectedOptionKey === state.exercise.correctOptionKey ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center text-white text-xl">
                                            ${state.selectedOptionKey === state.exercise.correctOptionKey ? '✓' : '✗'}
                                        </div>
                                        <h4 class="text-xl font-black text-white italic uppercase">${state.selectedOptionKey === state.exercise.correctOptionKey ? 'Brilliant!' : 'Not Quite'}</h4>
                                    </div>
                                    <p class="text-slate-400 font-bold italic leading-relaxed">"${getExplanation(state.selectedOptionKey)}"</p>
                                    <button id="retry-btn" class="w-full bg-brand-primary text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:-translate-y-1 transition-all">SONRAKİ DİYALOG 🔄</button>
                                </div>
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
        container.querySelector('#retry-btn')?.addEventListener('click', handleGenerate);

        container.querySelectorAll('.opt-btn').forEach(btn => {
            btn.onclick = () => handleSelect(btn.dataset.key);
        });
    };

    render();
    return container;
};
