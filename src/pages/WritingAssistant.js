import store from '../store/index';
import { getWritingTopic, analyzeWrittenText, improveParagraph } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderWritingAssistant = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10';

    let state = {
        topic: '',
        text: '',
        isLoadingTopic: false,
        isLoadingAnalysis: false,
        error: '',
        analysis: null,
        paragraphs: [],
        improvements: {}, // { index: data }
        improvingIndex: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGetTopic = async () => {
        setState({ isLoadingTopic: true, error: '', analysis: null, text: '', paragraphs: [], improvements: {} });
        try {
            const newTopic = await getWritingTopic();
            setState({ topic: newTopic, isLoadingTopic: false });
        } catch (e) {
            setState({ error: e.message || 'Konu alınamadı.', isLoadingTopic: false });
        }
    };

    const handleAnalyze = async () => {
        if (!state.text.trim() || !state.topic) {
            setState({ error: 'Lütfen önce bir konu seçin ve metninizi yazın.' });
            return;
        }
        setState({ isLoadingAnalysis: true, error: '', analysis: null, paragraphs: [], improvements: {} });
        try {
            const resText = await analyzeWrittenText(state.topic, state.text);
            const resJson = JSON.parse(resText);
            setState({
                analysis: resJson,
                paragraphs: state.text.split('\n').filter(p => p.trim() !== ''),
                isLoadingAnalysis: false
            });
        } catch (e) {
            setState({ error: e.message || 'Analiz hatası.', isLoadingAnalysis: false });
        }
    };

    const handleImprove = async (p, i) => {
        setState({ improvingIndex: i, error: '' });
        try {
            const resText = await improveParagraph(p);
            const resJson = JSON.parse(resText);
            const updated = { ...state.improvements, [i]: resJson };
            setState({ improvements: updated, improvingIndex: null });
        } catch (e) {
            setState({ error: `Paragraf ${i + 1} iyileştirilemedi: ${e.message}`, improvingIndex: null });
        }
    };

    const renderRawAnalysis = () => {
        if (!state.analysis) return '';
        const { analysis, paragraphs, improvements, improvingIndex } = state;
        return `
            <div class="animate-slideUp space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                    <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                        <span>✨ PARAGRAF İYİLEŞTİRİCİ</span>
                        <div class="h-px flex-1 bg-brand-primary/10"></div>
                    </h3>
                    <div class="space-y-6">
                        ${paragraphs.map((p, i) => `
                            <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:border-brand-primary/20">
                                <p class="text-sm font-bold text-slate-500 italic mb-4">"${p}"</p>
                                <button class="improve-btn text-[10px] font-black uppercase tracking-widest bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-xl hover:bg-brand-primary hover:text-white transition-all disabled:opacity-50" data-idx="${i}" ${improvingIndex === i ? 'disabled' : ''}>
                                    ${improvingIndex === i ? 'İYLEŞTİRİLİYOR...' : 'BU PARAGRAFI İYİLEŞTİR 🪄'}
                                </button>
                                
                                ${improvements[i] ? `
                                    <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4 animate-fadeIn">
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div class="space-y-2">
                                                <span class="text-[8px] font-black text-red-500 uppercase tracking-widest">ORİJİNAL</span>
                                                <p class="text-xs font-bold text-slate-400 bg-red-500/5 p-3 rounded-xl">${improvements[i].originalParagraph}</p>
                                            </div>
                                            <div class="space-y-2">
                                                <span class="text-[8px] font-black text-green-500 uppercase tracking-widest">DAHA İYİ</span>
                                                <p class="text-xs font-bold text-slate-800 dark:text-white bg-green-500/5 p-3 rounded-xl italic">${improvements[i].improvedParagraph}</p>
                                            </div>
                                        </div>
                                        <div class="bg-slate-900/5 dark:bg-slate-100/5 p-4 rounded-xl">
                                            <span class="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">NEDEN DEĞİŞTİ?</span>
                                            <ul class="space-y-1">
                                                ${improvements[i].explanation.map(exp => `<li class="text-[10px] font-bold text-slate-500 dark:text-slate-400"><span class="text-brand-primary mr-1">•</span> ${exp.change}: ${exp.reason}</li>`).join('')}
                                            </ul>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border-2 border-slate-50 dark:border-slate-800">
                        <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-4">🌍 GENEL DEĞERLENDİRME</h4>
                        <p class="text-sm font-bold text-slate-600 dark:text-white/80 leading-relaxed italic">"${analysis.overallFeedback}"</p>
                     </div>
                     <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-lg border-2 border-slate-50 dark:border-slate-800">
                        <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-4">🧱 YAPI VE TUTARLILIK</h4>
                        <p class="text-sm font-bold text-slate-600 dark:text-white/80 leading-relaxed italic">"${analysis.structureAndCohesion}"</p>
                     </div>
                </div>

                ${analysis.grammar?.length ? `
                    <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 overflow-hidden">
                        <h3 class="text-xs font-black text-red-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                            <span>🚫 GRAMER HATALARI</span>
                            <div class="h-px flex-1 bg-red-500/10"></div>
                        </h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-800">
                                        <th class="pb-4 pr-6">HATA</th>
                                        <th class="pb-4 px-6">DÜZELTME</th>
                                        <th class="pb-4 pl-6">AÇIKLAMA</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-slate-50 dark:divide-slate-800">
                                    ${analysis.grammar.map(item => `
                                        <tr>
                                            <td class="py-6 pr-6 text-sm font-black text-red-500 line-through opacity-60">${item.error}</td>
                                            <td class="py-6 px-6 text-sm font-black text-green-500 italic">${item.correction}</td>
                                            <td class="py-6 pl-6 text-xs font-bold text-slate-500 dark:text-slate-400">${item.explanation}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                ${analysis.vocabulary?.length ? `
                    <div class="bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl overflow-hidden relative">
                         <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">📚</div>
                         <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                            <span>💎 KELİME ÖNERİLERİ</span>
                            <div class="h-px flex-1 bg-brand-primary/10"></div>
                        </h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-left">
                                <thead>
                                    <tr class="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                        <th class="pb-4 pr-6 text-slate-500">KULLANDIĞIN</th>
                                        <th class="pb-4 px-6 text-brand-primary">ÖNERİLEN</th>
                                        <th class="pb-4 pl-6 text-slate-500">NEDEN?</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5">
                                    ${analysis.vocabulary.map(item => `
                                        <tr>
                                            <td class="py-6 pr-6 text-sm font-black text-slate-400 opacity-60">${item.original}</td>
                                            <td class="py-6 px-6 text-sm font-black text-brand-primary uppercase italic">${item.suggestion}</td>
                                            <td class="py-6 pl-6 text-xs font-bold text-slate-500">${item.reason}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">✍️</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic flex items-center gap-4">
                        <span>Writing Assistant</span>
                        <div class="w-10 h-2 bg-brand-primary rounded-full"></div>
                    </h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-2xl">Yazar tıkanıklığını aşın, gramerinizi mükemmelleştirin ve daha akıcı bir dil için kişiselleştirilmiş geri bildirimler alın.</p>

                    <div class="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner relative group">
                        <div class="flex-1">
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2 block">ADIM 1</span>
                            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase italic">${state.topic ? 'Kompozisyon Konun Hazır!' : 'Hadi Bir Konu Belirleyelim'}</h3>
                            ${state.topic ? `<p class="text-sm font-bold text-brand-primary italic">"${state.topic}"</p>` : '<p class="text-xs font-bold text-slate-400">Yeni bir konu oluşturmak için butona bas.</p>'}
                        </div>
                        <button id="get-topic-btn" class="bg-brand-primary text-white font-black px-10 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all group shrink-0">
                            ${state.isLoadingTopic ? 'GETİRİLİYOR...' : 'YENİ KONU OLUŞTUR 🎲'}
                        </button>
                    </div>

                    ${state.topic ? `
                        <div class="mt-10 animate-slideRight space-y-6">
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] pl-8 block">ADIM 2</span>
                            <textarea id="writing-input" placeholder="Metninizi buraya yazın..." class="w-full h-80 p-8 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2.5rem] focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none font-bold text-slate-900 dark:text-white transition-all text-lg shadow-inner resize-none">${state.text}</textarea>
                            <button id="analyze-btn" class="w-full bg-slate-900 dark:bg-black text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all disabled:opacity-50" ${state.isLoadingAnalysis || !state.text.trim() || !state.topic ? 'disabled' : ''}>
                                ${state.isLoadingAnalysis ? 'ANALİZ EDİLİYOR...' : 'YAZIMI ANALİZ ET 🔍'}
                            </button>
                        </div>
                    ` : ''}
                </div>

                ${(state.isLoadingTopic || state.isLoadingAnalysis) ? '<div class="py-12 flex justify-center"><div id="loader-target"></div></div>' : ''}
                <div id="error-area"></div>

                <div id="result-area">
                    ${renderRawAnalysis()}
                </div>
            </div>
        `;

        if (state.isLoadingTopic || state.isLoadingAnalysis) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));

        attachEvents();
    };

    const attachEvents = () => {
        const getTopicBtn = container.querySelector('#get-topic-btn');
        if (getTopicBtn) getTopicBtn.onclick = handleGetTopic;

        const input = container.querySelector('#writing-input');
        if (input) input.oninput = (e) => {
            state.text = e.target.value;
            const analyzeBtn = container.querySelector('#analyze-btn');
            if (analyzeBtn) analyzeBtn.disabled = state.isLoadingAnalysis || !state.text.trim() || !state.topic;
        };

        const analyzeBtn = container.querySelector('#analyze-btn');
        if (analyzeBtn) analyzeBtn.onclick = handleAnalyze;

        container.querySelectorAll('.improve-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                handleImprove(state.paragraphs[idx], idx);
            };
        });
    };

    render();
    return container;
};
