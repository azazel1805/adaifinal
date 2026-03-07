import store from '../store/index';
import { deconstructPassage } from '../services/geminiService';
import { addWord, removeWord, isWordSaved } from '../store/vocabulary';
import { Loader, ErrorMessage } from '../components/Common';

export const renderPassageDeconstruction = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        passageText: '',
        isLoading: false,
        error: '',
        analysisResult: null,
        selectedSentenceIndex: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleAnalyze = async () => {
        if (!state.passageText.trim()) {
            setState({ error: 'Lütfen analiz edilecek bir metin girin.' });
            return;
        }
        setState({ isLoading: true, error: '', analysisResult: null, selectedSentenceIndex: null });
        try {
            const resultText = await deconstructPassage(state.passageText);
            const resultJson = JSON.parse(resultText);
            setState({ analysisResult: resultJson, isLoading: false });
        } catch (e) {
            setState({ error: e.message || 'Analiz hatası.', isLoading: false });
        }
    };

    const renderDetail = () => {
        if (!state.analysisResult) return '<div class="flex items-center justify-center h-full text-slate-400 font-medium p-20 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">Analiz sonuçları burada gösterilecektir.</div>';

        const res = state.analysisResult;
        const sel = state.selectedSentenceIndex !== null ? res.deconstructedSentences[state.selectedSentenceIndex] : null;

        if (!sel) return `
            <div class="animate-fadeIn space-y-10 p-4">
                <div class="bg-brand-primary/5 p-10 rounded-[3rem] border-2 border-brand-primary/20">
                    <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-4">MİSYON ÖZETİ</h3>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 italic">DETAYLAR İÇİN SOLDAKİ METİNDEN BİR CÜMLE SEÇİN</p>
                    <div class="space-y-8">
                        <div>
                            <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tight">🎯 Ana Fikir</h4>
                            <p class="text-lg font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">"${res.mainIdea}"</p>
                        </div>
                        <div>
                            <h4 class="text-sm font-black text-slate-900 dark:text-white uppercase mb-4 tracking-tight">🎭 Yazara Özgü Üslup</h4>
                            <p class="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">${res.authorTone}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return `
            <div class="animate-slideUp space-y-10 p-4">
                 <div class="bg-white dark:bg-slate-800/30 p-10 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl">
                    <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-8 flex items-center gap-3">
                        <span>🧠 CÜMLE ANALİZİ</span>
                        <div class="h-px flex-1 bg-brand-primary/10"></div>
                    </h3>

                    <div class="space-y-8">
                        <div>
                            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gramer Açıklaması</h4>
                            <p class="text-lg font-bold text-slate-800 dark:text-white leading-relaxed italic">"${sel.grammarExplanation}"</p>
                        </div>

                        <div>
                            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Basitleştirilmiş Versiyon (ELI5)</h4>
                            <div class="bg-slate-900 p-6 rounded-2xl border-l-4 border-brand-primary text-brand-primary font-mono text-xs leading-relaxed">
                                ${sel.simplifiedSentence}
                            </div>
                        </div>

                        ${sel.vocabulary?.length ? `
                            <div>
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Öne Çıkan Kelimeler</h4>
                                <div class="space-y-2">
                                    ${sel.vocabulary.map(v => `
                                        <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
                                            <div>
                                                <span class="font-black text-slate-900 dark:text-white">${v.word}</span>
                                                <span class="text-slate-500 font-bold text-xs ml-3 italic opacity-60">"${v.meaning}"</span>
                                            </div>
                                            <button class="save-btn text-xl p-2 hover:scale-110 transition-transform" data-word="${v.word}" data-meaning="${v.meaning}">
                                                ${isWordSaved(v.word) ? '✅' : '🔖'}
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                 </div>
            </div>
        `;
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🔨</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic flex items-center gap-4">
                        <span>Passage Deconstruction</span>
                        <div class="w-10 h-2 bg-brand-primary rounded-full"></div>
                    </h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-2xl">Karmaşık cümleleri atomlarına ayırarak dildeki mantığı keşfedin. Anlamadığınız her metin birer bulmaca olsun.</p>

                    <textarea id="passage-input" placeholder="İngilizce metni buraya yapıştırın..." class="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2.5rem] focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none font-bold text-slate-900 dark:text-white transition-all text-lg shadow-inner resize-none">${state.passageText}</textarea>

                    <button id="analyze-btn" class="mt-6 w-full bg-brand-primary text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all disabled:opacity-50">
                        ${state.isLoading ? 'PARÇALARA AYRILIYOR...' : 'ANALİZE BAŞLA 🦾'}
                    </button>
                </div>

                ${state.isLoading ? '<div class="py-12 flex justify-center"><div id="loader-target"></div></div>' : ''}
                <div id="error-area"></div>

                ${state.analysisResult ? `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                         <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-brand-primary/20 pr-4">
                             <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-10 pl-2">ORİJİNAL METİN</h3>
                             <div class="space-y-2">
                                ${state.analysisResult.deconstructedSentences.map((s, i) => `
                                    <button class="sentence-btn w-full text-left p-4 rounded-2xl transition-all border-2 ${state.selectedSentenceIndex === i ? 'bg-brand-primary border-brand-primary text-white shadow-lg -translate-y-1' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400 hover:border-brand-primary/20'}" data-idx="${i}">
                                        <p class="text-sm font-black leading-relaxed">${s.originalSentence}</p>
                                    </button>
                                `).join('')}
                             </div>
                         </div>

                         <div id="detail-area" class="h-[600px] overflow-y-auto pr-4 scrollbar-thin">
                             ${renderDetail()}
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
        const input = container.querySelector('#passage-input');
        if (input) input.onchange = (e) => state.passageText = e.target.value;

        const analyzeBtn = container.querySelector('#analyze-btn');
        if (analyzeBtn) analyzeBtn.onclick = handleAnalyze;

        container.querySelectorAll('.sentence-btn').forEach(btn => {
            btn.onclick = () => setState({ selectedSentenceIndex: parseInt(btn.dataset.idx) });
        });

        container.querySelectorAll('.save-btn').forEach(btn => {
            btn.onclick = (e) => {
                const w = btn.dataset.word;
                if (isWordSaved(w)) removeWord(w);
                else addWord(w, btn.dataset.meaning);
                render();
            };
        });
    };

    render();
    return container;
};
