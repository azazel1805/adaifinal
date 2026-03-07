import { generateConceptWeaverWords, analyzeConceptWeaverStory } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderConceptWeaver = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        gameState: 'setup', // setup, playing, analyzing, results
        words: [],
        story: '',
        analysis: null,
        isLoading: false,
        error: ''
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleStart = async () => {
        setState({ isLoading: true, error: '', story: '', analysis: null });
        try {
            const res = await generateConceptWeaverWords();
            setState({ words: res, gameState: 'playing', isLoading: false });
        } catch { setState({ error: 'Oyun başlatılamadı.', isLoading: false }); }
    };

    const handleSubmit = async () => {
        if (state.story.trim().length < 10) return setState({ error: 'Lütfen en az 10 karakterlik bir hikaye yazın.' });
        setState({ gameState: 'analyzing', error: '' });
        try {
            const res = await analyzeConceptWeaverStory(state.words.map(w => w.word), state.story);
            setState({ analysis: JSON.parse(res), gameState: 'results' });
        } catch { setState({ error: 'Analiz başarısız.', gameState: 'playing' }); }
    };

    const formatStory = (story, words) => {
        const wordMap = new Map(words.map(w => [w.word.toLowerCase(), w]));
        const sorted = words.map(w => w.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).sort((a, b) => b.length - a.length);
        const regex = new RegExp(`\\b(${sorted.join('|')})\\b`, 'gi');

        return story.replace(regex, (match) => {
            const item = wordMap.get(match.toLowerCase());
            return `
                <span class="group relative inline-block">
                    <strong class="text-brand-primary bg-brand-primary/10 px-1.5 rounded-lg cursor-help transition-all hover:bg-brand-primary hover:text-white">${match}</strong>
                    <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-90 group-hover:scale-100 border border-white/10 leading-relaxed text-center">
                        ${item?.meaning || 'N/A'}
                    </span>
                </span>
            `;
        });
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                    <div class="absolute top-0 left-0 p-10 text-8xl opacity-10 select-none grayscale">🕸️</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Concept Weaver</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Kelimelerin ötesinde bağlar kurun. Verilen kavramları yaratıcı bir kurguyla birleştirin ve ifadenizin gücünü test edin.</p>
                </div>

                <div id="error-area"></div>

                ${state.gameState === 'setup' ? `
                    <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center space-y-8 animate-slideUp">
                        <p class="text-slate-500 dark:text-slate-400 font-bold max-w-lg mx-auto italic">"Sana üç rastgele kelime vereceğiz. Senin görevin, bu kelimelerin hepsini içeren kısa ve tutarlı bir hikaye yazmak. Hazır mısın?"</p>
                        <button id="start-btn" class="bg-brand-secondary text-white font-black px-12 py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">OYUNA BAŞLA 🎮</button>
                    </div>
                ` : ''}

                ${state.gameState === 'playing' ? `
                    <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10 animate-slideUp">
                        <div class="flex flex-wrap justify-center gap-4">
                            ${state.words.map(w => `
                                <div class="group relative px-8 py-4 bg-brand-primary/10 text-brand-primary font-black rounded-3xl border-2 border-brand-primary/20 text-xl tracking-tighter cursor-help">
                                    ${w.word}
                                    <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-4 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 text-center">
                                        ${w.meaning}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                        <textarea id="story-input" class="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[2.5rem] focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-700 dark:text-white shadow-inner resize-none appearance-none" placeholder="Buraya hikayeni yazmaya başla..."></textarea>
                        <button id="submit-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">ANALİZ ET 🧪</button>
                    </div>
                ` : ''}

                ${state.gameState === 'analyzing' ? `
                    <div class="flex flex-col items-center justify-center py-20 animate-fadeIn">
                        <div id="loader-target"></div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white mt-8 mb-2">Hikayen Dokunuyor...</h3>
                        <p class="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-widest">ALEX KELİMELERİNİ ANALİZ EDİYOR</p>
                    </div>
                ` : ''}

                ${state.gameState === 'results' ? `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-slideUp">
                        <div class="space-y-10">
                            <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative">
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">SENİN HİKAYEN</h4>
                                <p class="text-2xl font-bold text-slate-700 dark:text-slate-200 leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:text-brand-primary italic">
                                    "${formatStory(state.story, state.words)}"
                                </p>
                            </div>
                            <button id="retry-btn" class="w-full bg-slate-100 dark:bg-slate-800 text-slate-400 font-black py-6 rounded-2xl shadow-md uppercase tracking-widest text-xs hover:bg-brand-primary hover:text-white transition-all">YENİDEN DENEYELİM Mİ? 🔄</button>
                        </div>

                        <div class="space-y-8">
                            <div class="bg-slate-950 p-12 rounded-[4rem] shadow-2xl border-4 border-white/5 relative overflow-hidden">
                                <div class="absolute top-0 right-0 p-10 text-[10rem] opacity-5 select-none -mr-10 -mt-10 grayscale">🌟</div>
                                <div class="flex items-end gap-2 mb-8">
                                    <span class="text-7xl font-black text-brand-primary italic">${state.analysis.creativityScore}</span>
                                    <span class="text-2xl font-bold text-slate-700 mb-2">/ 10</span>
                                </div>
                                <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">ALEX'İN NOTU</h4>
                                <p class="text-white font-bold italic text-lg leading-relaxed">${state.analysis.creativityFeedback}</p>
                            </div>

                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-6">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">GRAMMAR & VOCAB FOCUS</h3>
                                <div class="space-y-6">
                                    ${state.analysis.grammarFeedback.map(f => `
                                        <div class="p-6 bg-red-500/5 rounded-3xl border border-red-500/10 space-y-2">
                                            <p class="text-sm"><span class="line-through text-red-400">${f.error}</span> → <span class="text-green-500 font-black uppercase tracking-tighter">${f.correction}</span></p>
                                            <p class="text-[10px] text-slate-400 font-bold">${f.explanation}</p>
                                        </div>
                                    `).join('')}
                                    ${state.analysis.vocabularySuggestions.map(s => `
                                        <div class="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 space-y-2">
                                            <p class="text-sm font-bold text-slate-700 dark:text-slate-300">"${s.original}" yerine <span class="text-brand-primary font-black uppercase tracking-tighter">${s.suggestion}</span> kullanmayı dene.</p>
                                            <p class="text-[10px] text-slate-400 font-bold">${s.reason}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (state.isLoading || state.gameState === 'analyzing') container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelector('#start-btn')?.addEventListener('click', handleStart);
        container.querySelector('#story-input')?.addEventListener('input', (e) => state.story = e.target.value);
        container.querySelector('#submit-btn')?.addEventListener('click', handleSubmit);
        container.querySelector('#retry-btn')?.addEventListener('click', () => setState({ gameState: 'setup', words: [], story: '', analysis: null }));
    };

    render();
    return container;
};
