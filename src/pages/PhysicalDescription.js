import { analyzeVisualDescription } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';
const searchQueries = ['portrait', 'person face', 'man portrait', 'woman portrait', 'person smiling'];

const adjectives = {
    'Saç (Hair)': { 'blonde': 'sarışın', 'brunette': 'esmer', 'redhead': 'kızıl saçlı', 'curly': 'kıvırcık', 'straight': 'düz', 'wavy': 'dalgalı', 'short': 'kısa', 'long': 'uzun', 'bald': 'kel' },
    'Gözler (Eyes)': { 'blue': 'mavi', 'green': 'yeşil', 'brown': 'kahverengi', 'hazel': 'ela', 'big': 'büyük', 'small': 'küçük' },
    'Vücut Yapısı (Build)': { 'slim': 'ince', 'thin': 'zayıf', 'plump': 'balık etli', 'muscular': 'kaslı', 'tall': 'uzun boylu', 'short': 'kısa boylu' },
    'Yaş (Age)': { 'young': 'genç', 'middle-aged': 'orta yaşlı', 'elderly': 'yaşlı' },
    'Genel (General)': { 'handsome': 'yakışıklı', 'beautiful': 'güzel', 'attractive': 'çekici', 'pale': 'solgun', 'tanned': 'bronzlaşmış', 'freckles': 'çiller', 'beard': 'sakal', 'mustache': 'bıyık' }
};

export const renderPhysicalDescription = () => {
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
            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=portrait`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            const data = await res.json();
            if (data.photos?.length) {
                const p = data.photos[Math.floor(Math.random() * data.photos.length)];
                setState({ imageUrl: p.src.large, imageAlt: p.alt || 'Portrait', isLoadingImage: false });
            } else throw new Error();
        } catch { setState({ error: 'Görsel yüklenemedi.', isLoadingImage: false }); }
    };

    const handleAnalyze = async () => {
        const count = state.description.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
        if (count < 3) return setState({ error: 'Lütfen en az 3 cümlede betimleyin.' });
        setState({ isLoadingAnalysis: true, error: '', analysis: null });
        try {
            const res = await analyzeVisualDescription(state.description);
            setState({ analysis: JSON.parse(res), isLoadingAnalysis: false });
        } catch { setState({ error: 'Analiz hatası.', isLoadingAnalysis: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🧑‍🎨</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Vivid Portrait</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-6">Ekranda beliren kişiyi İngilizce olarak betimleyin. Görsel hafızanızı ve kelime dağarcığınızı birleştirin.</p>
                    <button id="refresh-btn" class="mt-8 bg-brand-secondary text-white font-black px-10 py-4 rounded-2xl shadow-lg uppercase tracking-widest text-[10px] hover:-translate-y-1 transition-all">YENİ KİŞİ GETİR ✨</button>
                    <div id="error-area" class="mt-4"></div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div class="lg:col-span-2 space-y-10">
                        <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800">
                             ${state.isLoadingImage ? `
                                <div class="h-[600px] flex flex-col items-center justify-center gap-6" id="img-loader-target">
                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">GALERİDEN RASTGELE BİR PORTRE SEÇİLİYOR...</p>
                                </div>
                             ` : `
                                <div class="w-full h-[600px] rounded-[3rem] overflow-hidden shadow-2xl bg-black relative group">
                                    <img src="${state.imageUrl}" class="w-full h-full object-cover">
                                    <div class="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/80 to-transparent">
                                        <p class="text-[10px] font-black text-brand-secondary uppercase tracking-[0.4em]">CURRENT SUBJECT</p>
                                        <h3 class="text-2xl font-black text-white italic uppercase tracking-tight">${state.imageAlt}</h3>
                                    </div>
                                </div>
                             `}
                             
                             <div class="mt-10 space-y-6">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">WHAT DOES THIS PERSON LOOK LIKE?</h4>
                                <textarea id="desc-area" placeholder="Describe hair, eyes, age, build..." class="w-full h-48 p-8 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2.5rem] focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary outline-none font-bold text-slate-900 dark:text-white transition-all shadow-inner resize-none text-lg">${state.description}</textarea>
                                <button id="analyze-btn" class="w-full bg-brand-primary text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all disabled:opacity-20" ${state.description.length < 10 ? 'disabled' : ''}>${state.isLoadingAnalysis ? 'ANALİZ YAPILIYOR...' : 'BETİMLEMEYİ ANALİZ ET 🔍'}</button>
                             </div>
                        </div>

                        ${state.isLoadingAnalysis ? `<div id="analysis-loader" class="flex justify-center p-10"></div>` : ''}

                        ${state.analysis ? `
                            <div class="bg-slate-950 text-white p-10 md:p-14 rounded-[4rem] shadow-2xl space-y-12 animate-slideUp">
                                <div class="text-center">
                                    <span class="text-[10px] font-black text-brand-secondary uppercase tracking-[0.6em] mb-4 block">FEEDBACK MATRIX</span>
                                    <p class="text-3xl font-black italic max-w-2xl mx-auto leading-tight">"${state.analysis.overallFeedback}"</p>
                                </div>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div class="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                                        <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">GÜÇLÜ YANLAR</h4>
                                        <p class="text-sm font-medium text-slate-300 italic opacity-80">${state.analysis.descriptiveStrengths}</p>
                                    </div>
                                    <div class="p-8 bg-brand-secondary/10 rounded-[2.5rem] border border-brand-secondary/20">
                                        <h4 class="text-[10px] font-black text-brand-secondary uppercase tracking-widest mb-4">💡 GELİŞTİRME ÖNERİLERİ</h4>
                                        <div class="space-y-6">
                                            ${state.analysis.improvementSuggestions.map(s => `
                                                <div>
                                                    <p class="text-xs font-black uppercase text-white tracking-tight">${s.suggestion}</p>
                                                    <p class="text-xs text-brand-secondary mt-1 font-bold italic">"${s.example}"</p>
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
                                                <div class="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-6 rounded-3xl border border-white/10">
                                                    <span class="text-red-400 font-black line-through text-xs">${g.error}</span>
                                                    <span class="text-brand-primary text-xl">➜</span>
                                                    <span class="text-green-400 font-black text-xs">${g.correction}</span>
                                                    <p class="text-[10px] font-bold text-slate-400 italic md:ml-auto">${g.explanation}</p>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>

                    <div class="space-y-10">
                        <div class="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 lg:sticky top-10">
                            <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-10 pb-4 border-b border-slate-50 dark:border-slate-800">YARDIMCI KELİMELER 📒</h3>
                            <div class="space-y-10">
                                ${Object.entries(adjectives).map(([cat, words]) => `
                                    <div>
                                        <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase italic mb-6 flex items-center gap-3">
                                            <div class="w-1 h-3 bg-brand-primary rounded-full"></div>
                                            ${cat}
                                        </h4>
                                        <div class="grid gap-2">
                                            ${Object.entries(words).map(([en, tr]) => `
                                                <div class="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl group hover:bg-brand-primary transition-all">
                                                    <span class="text-sm font-black text-slate-900 dark:text-white group-hover:text-white">${en}</span>
                                                    <span class="text-[10px] font-black text-slate-400 uppercase group-hover:text-white/60">${tr}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
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
        if (descArea) descArea.oninput = (e) => { state.description = e.target.value; container.querySelector('#analyze-btn').disabled = state.description.length < 10; };
    };

    if (!state.imageUrl) fetchImage();
    else render();
    return container;
};
