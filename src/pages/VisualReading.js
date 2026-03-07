import { analyzeVisualDescription } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';
const searchQueries = ['busy street', 'city park life', 'crowded market', 'cultural festival', 'people working together', 'family dinner', 'children playing outside', 'street art', 'architecture'];

export const renderVisualReading = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        isLoadingImage: true,
        isLoadingAnalysis: false,
        error: '',
        imageUrl: '',
        imageAlt: '',
        description: '',
        analysis: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const fetchImage = async () => {
        setState({ isLoadingImage: true, error: '', analysis: null, description: '' });
        try {
            const query = searchQueries[Math.floor(Math.random() * searchQueries.length)];
            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=landscape`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            const data = await res.json();
            if (data.photos?.length) {
                const p = data.photos[Math.floor(Math.random() * data.photos.length)];
                setState({ imageUrl: p.src.large, imageAlt: p.alt || 'Visual Scene', isLoadingImage: false });
            } else throw new Error();
        } catch { setState({ error: 'Görsel yüklenemedi.', isLoadingImage: false }); }
    };

    const handleAnalyze = async () => {
        const count = state.description.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        if (count < 5) return setState({ error: 'Lütfen en az 5 cümlede betimleyin.' });
        setState({ isLoadingAnalysis: true, error: '', analysis: null });
        try {
            const res = await analyzeVisualDescription(state.description);
            setState({ analysis: JSON.parse(res), isLoadingAnalysis: false });
        } catch { setState({ error: 'Analiz hatası.', isLoadingAnalysis: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden text-center">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🖼️</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Scene Analyst</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Karmaşık görselleri inceleyin, detayları fark edin ve İngilizce olarak hikayeleştirin. En az 5 cümle kurmalısınız.</p>
                    <button id="refresh-btn" class="mt-8 bg-brand-primary text-white font-black px-10 py-4 rounded-2xl shadow-lg uppercase tracking-widest text-[10px] hover:-translate-y-1 transition-all">YENİ GÖRSEL GETİR 🔄</button>
                    <div id="error-area" class="mt-4"></div>
                </div>

                <div class="grid grid-cols-1 gap-10">
                    <div class="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col items-center">
                         ${state.isLoadingImage ? `
                            <div class="w-full h-[500px] flex flex-col items-center justify-center gap-6" id="img-loader-target">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">DERİNLİKLİ BİR MANZARA SEÇİLİYOR...</p>
                            </div>
                         ` : `
                            <div class="w-full h-[600px] rounded-[3rem] overflow-hidden shadow-2xl bg-black relative group mb-10">
                                <img src="${state.imageUrl}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000">
                                <div class="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 to-transparent">
                                    <h3 class="text-2xl font-black text-white italic uppercase tracking-tight">${state.imageAlt}</h3>
                                </div>
                            </div>
                         `}
                         
                         <div class="w-full space-y-6 max-w-4xl mx-auto">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">WHAT DO YOU OBSERVE IN THIS SCENE?</h4>
                            <textarea id="desc-area" placeholder="Describe the atmosphere, people, actions, and objects you see..." class="w-full h-64 p-10 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[3rem] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner resize-none text-lg">${state.description}</textarea>
                            <button id="analyze-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-20" ${state.description.length < 20 ? 'disabled' : ''}>${state.isLoadingAnalysis ? 'ANALİZ YAPILIYOR...' : 'AÇIKLAMAYI ANALİZ ET 🔍'}</button>
                         </div>
                    </div>

                    ${state.isLoadingAnalysis ? `<div id="analysis-loader" class="flex justify-center p-10"></div>` : ''}

                    ${state.analysis ? `
                        <div class="bg-slate-950 text-white p-10 md:p-14 rounded-[4rem] shadow-2xl space-y-12 animate-slideUp">
                            <div class="text-center">
                                <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4 block underline decoration-brand-primary decoration-4 underline-offset-8">GÖRSEL ANALİZ RAPORU</span>
                                <p class="text-3xl font-black italic max-w-3xl mx-auto leading-tight">"${state.analysis.overallFeedback}"</p>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div class="p-10 bg-white/5 rounded-[3rem] border border-white/10">
                                    <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">GÜÇLÜ GÖZLEMLER</h4>
                                    <p class="text-sm font-medium text-slate-300 italic opacity-80">${state.analysis.descriptiveStrengths}</p>
                                </div>
                                <div class="p-10 bg-brand-primary/10 rounded-[3rem] border border-brand-primary/20">
                                    <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">💡 ANLATIM ÖNERİLERİ</h4>
                                    <div class="space-y-6">
                                        ${state.analysis.improvementSuggestions.map(s => `
                                            <div>
                                                <p class="text-xs font-black uppercase text-white tracking-tight">${s.suggestion}</p>
                                                <p class="text-xs text-brand-primary mt-1 font-bold italic">"${s.example}"</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            </div>

                            ${state.analysis.grammar?.length ? `
                                <div class="space-y-6">
                                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-4">DİLBİLGİSİ DÜZELTMELERİ</h4>
                                    <div class="grid gap-4">
                                        ${state.analysis.grammar.map(g => `
                                            <div class="flex flex-col md:flex-row gap-6 items-center bg-white/5 p-8 rounded-[2rem] border border-white/10">
                                                <span class="text-red-400 font-black line-through text-xs">${g.error}</span>
                                                <span class="text-brand-primary text-xl">➜</span>
                                                <span class="text-green-400 font-black text-xs">${g.correction}</span>
                                                <p class="text-[10px] font-bold text-slate-400 italic md:ml-auto">${g.explanation}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}

                            ${state.analysis.vocabulary?.length ? `
                                <div class="space-y-6">
                                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-white/10 pb-4">KELİME SEÇİMİ ÖNERİLERİ</h4>
                                    <div class="grid gap-4">
                                        ${state.analysis.vocabulary.map(v => `
                                            <div class="flex flex-col md:flex-row gap-6 items-center bg-white/5 p-8 rounded-[2rem] border border-white/10">
                                                <span class="text-amber-400 font-black text-xs">${v.original}</span>
                                                <span class="text-brand-primary text-xl">➜</span>
                                                <span class="text-teal-400 font-black text-xs">${v.suggestion}</span>
                                                <p class="text-[10px] font-bold text-slate-400 italic md:ml-auto">${v.reason}</p>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        if (state.isLoadingImage) container.querySelector('#img-loader-target')?.appendChild(Loader());
        if (state.isLoadingAnalysis) container.querySelector('#analysis-loader')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));

        attachEvents();
    };

    const attachEvents = () => {
        const refBtn = container.querySelector('#refresh-btn');
        if (refBtn) refBtn.onclick = fetchImage;

        const anaBtn = container.querySelector('#analyze-btn');
        if (anaBtn) anaBtn.onclick = handleAnalyze;

        const descArea = container.querySelector('#desc-area');
        if (descArea) descArea.oninput = (e) => { state.description = e.target.value; container.querySelector('#analyze-btn').disabled = state.description.length < 20; };
    };

    if (!state.imageUrl) fetchImage();
    else render();
    return container;
};
