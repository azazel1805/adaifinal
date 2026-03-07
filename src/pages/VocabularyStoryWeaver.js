import globalStore from '../store';
import { generateVocabularyStory } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderVocabularyStoryWeaver = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        isLoading: false,
        error: '',
        story: '',
        usedWords: []
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGenerate = async () => {
        const voc = globalStore.getState().vocabularyList;
        if (voc.length < 5) return setState({ error: 'Hikaye için en az 5 kelime eklemelisiniz.' });
        setState({ isLoading: true, error: '', story: '', usedWords: [] });
        try {
            const shuffled = [...voc].sort(() => 0.5 - Math.random());
            const count = Math.min(10, Math.max(5, Math.floor(voc.length / 2)));
            const selected = shuffled.slice(0, count);
            const res = await generateVocabularyStory(selected);
            setState({ story: res, usedWords: selected, isLoading: false });
        } catch { setState({ error: 'Hikaye oluşturulamadı.', isLoading: false }); }
    };

    const formatStory = (story, words) => {
        const wordMap = new Map(words.map(w => [w.word.toLowerCase(), w]));
        const sortedWords = words.map(w => w.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).sort((a, b) => b.length - a.length);
        const regex = new RegExp(`\\b(${sortedWords.join('|')})\\b`, 'gi');

        return story.split('\n').map(line => {
            if (!line.trim()) return '<br>';
            return line.replace(regex, (match) => {
                const item = wordMap.get(match.toLowerCase());
                return `
                    <span class="group relative inline-block">
                        <strong class="text-brand-primary bg-brand-primary/10 px-1.5 rounded-lg cursor-help transition-all hover:bg-brand-primary hover:text-white">${match}</strong>
                        <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-4 bg-slate-900 text-white text-[10px] font-bold rounded-2xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-2xl scale-90 group-hover:scale-100 border border-white/10 leading-relaxed">
                            <span class="text-brand-primary block mb-1 uppercase tracking-widest text-[8px]">MEANING</span>
                            ${item?.meaning || 'N/A'}
                        </span>
                    </span>
                `;
            });
        }).join('<br>');
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
                    <div class="space-y-4 text-center md:text-left">
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Legend Weaver</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl">Kendi kelimelerinizden örülmüş bir dünya. Kaydettiğiniz ifadeleri yapay zeka ile anlamlı ve sürükleyici bir hikayeye dönüştürün.</p>
                    </div>
                    <button id="gen-btn" class="bg-brand-secondary text-white font-black px-12 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">HİKAYEYİ ÖR 🧶</button>
                </div>

                <div id="error-area"></div>
                ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-10"></div>` : ''}

                ${state.story ? `
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-10 animate-slideUp">
                        <div class="lg:col-span-1 space-y-6">
                            <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-6 sticky top-10">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest">KULLANILAN KELİMELER</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${state.usedWords.map(w => `<span class="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-brand-primary font-black text-[10px] uppercase rounded-xl border border-slate-100 dark:border-white/5 shadow-sm">${w.word}</span>`).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="lg:col-span-3">
                            <div class="bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                                <div class="absolute top-0 right-0 p-20 text-[20rem] opacity-5 select-none grayscale -mr-20 -mt-20">📖</div>
                                <div class="relative prose prose-slate dark:prose-invert max-w-none">
                                    <div class="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-300 leading-[2.2] tracking-tight family-serif italic">
                                        ${formatStory(state.story, state.usedWords)}
                                    </div>
                                </div>
                                <div class="mt-16 pt-10 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                                    <span class="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">END OF TALE</span>
                                    <button onclick="window.print()" class="text-[10px] font-black text-brand-secondary uppercase tracking-widest hover:underline">Yazdır veya Kaydet 🖨️</button>
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
        container.querySelector('#gen-btn')?.addEventListener('click', handleGenerate);
    };

    render();
    return container;
};
