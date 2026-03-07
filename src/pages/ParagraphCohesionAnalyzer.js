import store from '../store/index';
import { analyzeParagraphCohesion } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderParagraphCohesionAnalyzer = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        paragraphText: '',
        isLoading: false,
        error: '',
        analysisResult: null,
        selectedSentence: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleAnalyze = async () => {
        if (!state.paragraphText.trim()) {
            setState({ error: 'Lütfen analiz edilecek bir paragraf girin.' });
            return;
        }
        setState({ isLoading: true, error: '', analysisResult: null, selectedSentence: null });
        try {
            const resultText = await analyzeParagraphCohesion(state.paragraphText);
            const resultJson = JSON.parse(resultText);
            setState({
                analysisResult: resultJson,
                isLoading: false,
                selectedSentence: resultJson.sentenceAnalyses?.[0] || null
            });
        } catch (e) {
            setState({ error: e.message || 'Analiz hatası.', isLoading: false });
        }
    };

    const getRatingColor = (rating) => {
        const r = rating.toLowerCase();
        if (r.includes('güçlü') || r.includes('strong') || r.includes('yüksek')) return 'border-b-green-500';
        if (r.includes('orta') || r.includes('medium')) return 'border-b-yellow-500';
        if (r.includes('zayıf') || r.includes('weak') || r.includes('düşük')) return 'border-b-red-500';
        return 'border-b-slate-400';
    };

    const getRatingBg = (rating) => {
        const r = rating.toLowerCase();
        if (r.includes('güçlü') || r.includes('strong') || r.includes('yüksek')) return 'bg-green-500/10';
        if (r.includes('orta') || r.includes('medium')) return 'bg-yellow-500/10';
        if (r.includes('zayıf') || r.includes('weak') || r.includes('düşük')) return 'bg-red-500/10';
        return 'bg-slate-100';
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🧩</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic flex items-center gap-4">
                        <span>Paragraph Cohesion</span>
                        <div class="w-10 h-2 bg-brand-primary rounded-full"></div>
                    </h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium mb-8 max-w-2xl">Cümleler arasındaki mantıksal akışı ve anlamsal bütünlüğü mikroskop altına alın. Akıcı bir dil için en güçlü aracınız.</p>

                    <textarea id="cohesion-input" placeholder="Analiz edilecek İngilizce paragrafı buraya yapıştırın..." class="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2.5rem] focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none font-bold text-slate-900 dark:text-white transition-all text-lg shadow-inner resize-none">${state.paragraphText}</textarea>

                    <button id="analyze-btn" class="mt-6 w-full bg-brand-primary text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all disabled:opacity-50">
                        ${state.isLoading ? 'BAĞLANTILAR TARANIYOR...' : 'AKISI ANALİZ ET 🔍'}
                    </button>
                </div>

                ${state.isLoading ? '<div class="py-12 flex justify-center"><div id="loader-target"></div></div>' : ''}
                <div id="error-area"></div>

                ${state.analysisResult ? `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                             <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-8">INTERAKTİF AKIŞ HARİTASI</h3>
                             <div class="text-xl font-bold leading-[2.2] text-slate-700 dark:text-slate-300">
                                ${state.analysisResult.sentenceAnalyses.map((item, i) => `
                                    <span class="sentence-item cursor-pointer px-1 rounded-lg border-b-4 transition-all ${getRatingColor(item.rating)} ${state.selectedSentence?.sentence === item.sentence ? getRatingBg(item.rating) + ' shadow-sm scale-110 inline-block mx-1 text-slate-900 dark:text-white' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}" data-idx="${i}">
                                        ${item.sentence}
                                    </span>
                                `).join(' ')}
                             </div>

                             <div class="mt-10 pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-4">
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">GÜÇLÜ</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ORTA</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ZAYIF</span>
                                </div>
                             </div>
                        </div>

                        <div class="space-y-8">
                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 animate-slideRight">
                                <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-8">CÜMLE ÖZELİNDE ANALİZ</h3>
                                ${state.selectedSentence ? `
                                    <div class="space-y-8">
                                        <div>
                                            <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">🛡️ Cümlenin Rolü</h4>
                                            <p class="text-lg font-black text-slate-800 dark:text-white leading-tight uppercase italic">${state.selectedSentence.role}</p>
                                        </div>
                                        <div>
                                            <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-3">🔗 Bağlantı Türü</h4>
                                            <p class="text-sm font-bold text-slate-500 leading-relaxed">${state.selectedSentence.connection}</p>
                                        </div>
                                        ${state.selectedSentence.suggestion && !state.selectedSentence.suggestion.toLowerCase().includes('yok') ? `
                                            <div class="bg-yellow-50 dark:bg-yellow-900/10 p-6 rounded-2xl border-l-4 border-yellow-400 animate-pulse">
                                                <h4 class="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-2">💡 İyileştirme Önerisi</h4>
                                                <p class="text-xs font-bold text-yellow-900 dark:text-yellow-200/80 leading-relaxed italic">"${state.selectedSentence.suggestion}"</p>
                                            </div>
                                        ` : ''}
                                    </div>
                                ` : '<p class="text-slate-400 font-medium p-4">Analiz için bir cümleye tıklayın.</p>'}
                            </div>

                            <div class="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                <div class="absolute top-0 right-0 p-8 text-6xl opacity-10 select-none grayscale">🌐</div>
                                <h3 class="text-[10px] font-black text-brand-primary uppercase font-mono tracking-[0.4em] mb-6">GLOBAL DEĞERLENDİRME</h3>
                                <p class="text-sm font-medium text-slate-400 leading-relaxed italic">"${state.analysisResult.overallCohesion}"</p>
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
        const input = container.querySelector('#cohesion-input');
        if (input) input.onchange = (e) => state.paragraphText = e.target.value;

        const analyzeBtn = container.querySelector('#analyze-btn');
        if (analyzeBtn) analyzeBtn.onclick = handleAnalyze;

        container.querySelectorAll('.sentence-item').forEach(el => {
            el.onclick = () => setState({ selectedSentence: state.analysisResult.sentenceAnalyses[parseInt(el.dataset.idx)] });
        });
    };

    render();
    return container;
};
