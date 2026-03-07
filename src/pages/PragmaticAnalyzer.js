import { analyzePragmatics } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderPragmaticAnalyzer = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        text: '',
        isLoading: false,
        error: '',
        result: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleAnalyze = async () => {
        if (!state.text.trim()) return setState({ error: 'Analiz etmek için lütfen bir metin girin.' });
        setState({ isLoading: true, error: '', result: null });
        try {
            const res = await analyzePragmatics(state.text);
            setState({ result: JSON.parse(res), isLoading: false });
        } catch { setState({ error: 'Analiz yapılamadı.', isLoading: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">⚖️</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Pragmatic Analyzer</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Sadece ne söylendiğini değil, nasıl söylendiğini keşfedin. Metnin tonu, resmiyet düzeyi ve farklı sosyal bağlamlardaki yansımalarını analiz edin.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-8 animate-slideUp">
                    <div class="space-y-4">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest pl-6">SOURCE TEXT</label>
                        <textarea id="text-input" class="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[3rem] focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-700 dark:text-white shadow-inner resize-none appearance-none" placeholder="Analiz edilecek metni buraya yapıştırın...">${state.text}</textarea>
                    </div>
                    <div id="error-area"></div>
                    <button id="analyze-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50" ${state.isLoading ? 'disabled' : ''}>NE SÖYLEMEK İSTEDİ? 🤔</button>
                    ${state.isLoading ? `<div id="loader-target" class="flex justify-center"></div>` : ''}
                </div>

                ${state.result ? `
                    <div class="animate-slideUp space-y-10">
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            ${[
                    { label: 'FORMALITY', val: state.result.formality, icon: '🎩' },
                    { label: 'TONE', val: state.result.tone, icon: '🎭' },
                    { label: 'INTENT', val: state.result.intent, icon: '🎯' },
                    { label: 'AUDIENCE', val: state.result.audience, icon: '👥' }
                ].map(x => `
                                <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 text-center space-y-3">
                                    <div class="text-3xl mb-2">${x.icon}</div>
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${x.label}</span>
                                    <p class="text-lg font-black text-brand-primary uppercase italic tracking-tighter leading-tight">${x.val}</p>
                                </div>
                            `).join('')}
                        </div>

                        <div class="space-y-8">
                            <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-6">BAĞLAMSAL ALTERNATİFLER</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                ${state.result.alternatives.map(alt => `
                                    <div class="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-6 relative overflow-hidden group hover:border-brand-primary transition-all">
                                        <div class="absolute top-0 right-0 p-8 text-4xl opacity-5 group-hover:opacity-10 transition-all">💬</div>
                                        <h4 class="text-xs font-black text-brand-secondary uppercase tracking-widest underline decoration-2 underline-offset-4">${alt.type}</h4>
                                        <p class="text-xl font-bold text-slate-700 dark:text-slate-200 italic leading-relaxed">"${alt.text}"</p>
                                        <div class="pt-4 border-t border-slate-50 dark:border-slate-800">
                                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">REASONING</p>
                                            <p class="text-xs font-bold text-slate-500 leading-relaxed">${alt.explanation}</p>
                                        </div>
                                    </div>
                                `).join('')}
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
        container.querySelector('#text-input')?.addEventListener('input', (e) => state.text = e.target.value);
        container.querySelector('#analyze-btn')?.addEventListener('click', handleAnalyze);
    };

    render();
    return container;
};
