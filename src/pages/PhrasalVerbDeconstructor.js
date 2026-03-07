import { deconstructPhrasalVerb } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderPhrasalVerbDeconstructor = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        phrasalVerb: '',
        isLoading: false,
        error: '',
        result: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleAnalyze = async () => {
        if (!state.phrasalVerb.trim()) return setState({ error: 'Lütfen bir phrasal verb girin.' });
        setState({ isLoading: true, error: '', result: null });
        try {
            const res = await deconstructPhrasalVerb(state.phrasalVerb.trim());
            setState({ result: JSON.parse(res), isLoading: false });
        } catch { setState({ error: 'Analiz edilemedi.', isLoading: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
                    <div class="space-y-4 text-center md:text-left">
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Verb Deconstructor</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl">Phrasal verb'leri atomlarına ayırın. Parçaların anlamını birleştirerek bütünü mantıksal olarak kavrayın.</p>
                    </div>
                    <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <input type="text" id="pv-input" value="${state.phrasalVerb}" placeholder="Örn: look up to" class="p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-900 dark:text-white shadow-inner appearance-none w-full md:w-80">
                        <button id="analyze-btn" class="bg-brand-primary text-white font-black px-10 py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">DECONSTRUCT 💥</button>
                    </div>
                </div>

                <div id="error-area"></div>
                ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-10"></div>` : ''}

                ${state.result ? `
                    <div class="animate-slideUp space-y-10">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div class="bg-blue-500/10 p-10 rounded-[3rem] border-4 border-blue-500/20 text-center space-y-4">
                                <h4 class="text-[10px] font-black text-blue-500 uppercase tracking-widest">STEP 1: THE CORE</h4>
                                <p class="text-4xl font-black text-blue-600 italic tracking-tighter capitalize">${state.result.mainVerb.verb}</p>
                                <p class="text-blue-500/60 font-bold italic text-sm">"${state.result.mainVerb.meaning}"</p>
                            </div>
                            <div class="bg-purple-500/10 p-10 rounded-[3rem] border-4 border-purple-500/20 text-center space-y-4">
                                <h4 class="text-[10px] font-black text-purple-500 uppercase tracking-widest">STEP 2: DIRECTION</h4>
                                <p class="text-4xl font-black text-purple-600 italic tracking-tighter capitalize">${state.result.particle.particle}</p>
                                <p class="text-purple-500/60 font-bold italic text-sm">"${state.result.particle.meaning}"</p>
                            </div>
                            <div class="bg-green-500/10 p-10 rounded-[3rem] border-4 border-green-500/20 text-center space-y-4">
                                <h4 class="text-[10px] font-black text-green-500 uppercase tracking-widest">STEP 3: SYNTHESIS</h4>
                                <p class="text-3xl font-black text-green-600 italic tracking-tighter uppercase leading-tight">${state.result.idiomaticMeaning.meaning}</p>
                            </div>
                        </div>

                        <div class="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl border-4 border-white/5 space-y-6">
                            <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4 block underline decoration-brand-primary decoration-4 underline-offset-8">THE LOGIC</h4>
                            <p class="text-slate-400 font-bold italic text-lg leading-relaxed text-center">"${state.result.idiomaticMeaning.explanation}"</p>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            ${state.result.exampleSentences.map(ex => `
                                <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 space-y-3">
                                    <p class="text-xl font-black text-slate-900 dark:text-white italic leading-tight">"${ex.en}"</p>
                                    <p class="text-sm font-bold text-slate-400">→ ${ex.tr}</p>
                                </div>
                            `).join('')}
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
        container.querySelector('#pv-input')?.addEventListener('input', (e) => state.phrasalVerb = e.target.value);
        container.querySelector('#pv-input')?.addEventListener('keypress', (e) => e.key === 'Enter' && handleAnalyze());
        container.querySelector('#analyze-btn')?.addEventListener('click', handleAnalyze);
    };

    render();
    return container;
};
