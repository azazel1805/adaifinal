import { analyzeAndTranslateSentence } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderTranslationAnalyst = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        sentence: '',
        direction: 'tr_to_en', // tr_to_en, en_to_tr
        isLoading: false,
        error: '',
        result: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleAnalyze = async () => {
        if (!state.sentence.trim()) return setState({ error: 'Lütfen bir cümle girin.' });
        setState({ isLoading: true, error: '', result: null });
        try {
            const res = await analyzeAndTranslateSentence(state.sentence, state.direction);
            setState({ result: JSON.parse(res), isLoading: false });
        } catch { setState({ error: 'Analiz başarısız.', isLoading: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div class="space-y-4 text-center md:text-left">
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Translation Analyst</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl">Diller arasındaki köprüyü teknik hassasiyetle kurun. Sadece neyi değil, niçin öyle çevrildiğini derinlemesine analiz edin.</p>
                    </div>
                    <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-[2rem]">
                        <button id="tr-en-btn" class="px-8 py-3 text-xs font-black rounded-full transition-all ${state.direction === 'tr_to_en' ? 'bg-brand-primary text-white shadow-lg scale-105' : 'text-slate-400 hover:text-brand-primary uppercase tracking-widest'}">TR → EN</button>
                        <button id="en-tr-btn" class="px-8 py-3 text-xs font-black rounded-full transition-all ${state.direction === 'en_to_tr' ? 'bg-brand-primary text-white shadow-lg scale-105' : 'text-slate-400 hover:text-brand-primary uppercase tracking-widest'}">EN → TR</button>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-8 animate-slideUp">
                    <div class="space-y-4">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest pl-6">SENTENCE TO ANALYZE</label>
                        <textarea id="sentence-input" class="w-full h-32 p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[3rem] focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-700 dark:text-white shadow-inner resize-none appearance-none" placeholder="Buraya cümleni yaz...">${state.sentence}</textarea>
                    </div>
                    <div id="error-area"></div>
                    <button id="analyze-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50" ${state.isLoading ? 'disabled' : ''}>KÖPRÜYÜ KUR 🌉</button>
                    ${state.isLoading ? `<div id="loader-target" class="flex justify-center"></div>` : ''}
                </div>

                ${state.result ? `
                    <div class="animate-slideUp space-y-10">
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 space-y-4">
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">DETECTED LANGUAGE</h4>
                                <p class="text-3xl font-black text-brand-primary uppercase italic tracking-tighter">${state.result.originalSentenceAnalysis.language}</p>
                            </div>
                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 space-y-4">
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">KEY GRAMMAR</h4>
                                <p class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">${state.result.originalSentenceAnalysis.keyGrammar}</p>
                            </div>
                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 space-y-4">
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">PRECISION KEYWORD</h4>
                                <p class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-tight">${state.result.originalSentenceAnalysis.keyVocabulary}</p>
                            </div>
                        </div>

                        <div class="bg-slate-950 p-12 md:p-20 rounded-[5rem] shadow-2xl border-4 border-white/5 space-y-16">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                                <div class="space-y-4">
                                    <h5 class="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">LITERAL (Birebir)</h5>
                                    <p class="text-white/60 font-bold italic text-lg leading-relaxed">"${state.result.translations.literal}"</p>
                                </div>
                                <div class="space-y-4">
                                    <h5 class="text-[10px] font-black text-green-400 uppercase tracking-[0.4em]">NATURAL (Doğal)</h5>
                                    <p class="text-white font-black italic text-2xl leading-tight">"${state.result.translations.natural}"</p>
                                </div>
                                <div class="space-y-4">
                                    <h5 class="text-[10px] font-black text-purple-400 uppercase tracking-[0.4em]">ACADEMIC (Resmi)</h5>
                                    <p class="text-white/60 font-bold italic text-lg leading-relaxed">"${state.result.translations.academic}"</p>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-white/10">
                                <div class="space-y-6">
                                    <h5 class="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em] underline decoration-4 underline-offset-8">RATIONALE (Gerekçe)</h5>
                                    <p class="text-slate-400 font-bold text-sm leading-relaxed">${state.result.translationRationale}</p>
                                </div>
                                <div class="space-y-6">
                                    <h5 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] underline decoration-4 underline-offset-8">REVERSE VERIFICATION</h5>
                                    <p class="text-slate-400 font-bold text-xs mb-2">Geri çeviri sağlaması:</p>
                                    <p class="text-white font-black italic text-lg bg-white/5 p-6 rounded-3xl border border-white/5 tracking-tight">"${state.result.reverseTranslation}"</p>
                                </div>
                            </div>
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
        container.querySelector('#sentence-input')?.addEventListener('input', (e) => state.sentence = e.target.value);
        container.querySelector('#tr-en-btn')?.addEventListener('click', () => setState({ direction: 'tr_to_en' }));
        container.querySelector('#en-tr-btn')?.addEventListener('click', () => setState({ direction: 'en_to_tr' }));
        container.querySelector('#analyze-btn')?.addEventListener('click', handleAnalyze);
    };

    render();
    return container;
};
