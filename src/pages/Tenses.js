import { tensesData } from '../data/tensesData';
import { Loader } from '../components/Common';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';

export const renderTenses = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        activeTenseIdx: 0,
        imageUrl: '',
        isLoadingImage: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const fetchImage = async (query) => {
        setState({ isLoadingImage: true });
        try {
            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            const data = await res.json();
            setState({ imageUrl: data.photos?.[0]?.src?.large2x || '', isLoadingImage: false });
        } catch { setState({ imageUrl: '', isLoadingImage: false }); }
    };

    const render = () => {
        const cur = tensesData[state.activeTenseIdx];
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🕒</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Tense Master</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-6">İngilizcedeki 12 temel zamanı formülleri, kullanım alanları ve canlı örnekleriyle derinlemesine keşfedin.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div class="lg:col-span-1">
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 lg:sticky top-10 space-y-2">
                            ${tensesData.map((t, i) => `
                                <button class="tense-btn w-full text-left px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${state.activeTenseIdx === i ? 'bg-brand-primary text-white shadow-lg scale-105' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}" data-idx="${i}">
                                    ${t.name}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="lg:col-span-3">
                        <div class="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-12 animate-slideUp">
                            <div class="text-center">
                                <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4 block underline decoration-brand-primary decoration-4 underline-offset-8">DETAYLI REHBER</span>
                                <h3 class="text-5xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">${cur.name} ${cur.emoji}</h3>
                                <p class="text-lg font-bold text-slate-500 max-w-2xl mx-auto mt-6">"${cur.explanation}"</p>
                            </div>

                            <div class="h-80 bg-slate-50 dark:bg-slate-800 rounded-[3rem] overflow-hidden shadow-inner flex items-center justify-center relative border-4 border-slate-100 dark:border-white/5">
                                 ${state.isLoadingImage ? '<div id="tense-loader"></div>' : state.imageUrl ? `<img src="${state.imageUrl}" class="w-full h-full object-cover">` : '<span class="text-8xl opacity-10">🖼️</span>'}
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="bg-green-500/10 p-8 rounded-[2.5rem] border border-green-500/20 text-center">
                                    <span class="text-xs font-black text-green-500 uppercase tracking-widest block mb-4">POSITIVE (+)</span>
                                    <p class="text-sm font-black text-slate-800 dark:text-white family-mono tracking-tighter">${cur.formula.positive}</p>
                                </div>
                                <div class="bg-red-500/10 p-8 rounded-[2.5rem] border border-red-500/20 text-center">
                                    <span class="text-xs font-black text-red-500 uppercase tracking-widest block mb-4">NEGATIVE (-)</span>
                                    <p class="text-sm font-black text-slate-800 dark:text-white family-mono tracking-tighter">${cur.formula.negative}</p>
                                </div>
                                <div class="bg-blue-500/10 p-8 rounded-[2.5rem] border border-blue-500/20 text-center">
                                    <span class="text-xs font-black text-blue-500 uppercase tracking-widest block mb-4">QUESTION (?)</span>
                                    <p class="text-sm font-black text-slate-800 dark:text-white family-mono tracking-tighter">${cur.formula.question}</p>
                                </div>
                            </div>

                            <div class="space-y-6">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-50 dark:border-slate-800 pb-4">KULLANIM ALANLARI</h4>
                                <div class="grid gap-3">
                                    ${cur.usage.map(u => `
                                        <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                                            <span class="w-2 h-2 bg-brand-primary rounded-full"></span>
                                            <p class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase italic">${u}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="space-y-6">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] border-b border-slate-50 dark:border-slate-800 pb-4">ÖRNEK CÜMLELER</h4>
                                <div class="grid gap-6">
                                     ${renderEx(cur.examples.positive, "(+)", "text-green-500")}
                                     ${renderEx(cur.examples.negative, "(-)", "text-red-500")}
                                     ${renderEx(cur.examples.question, "(?)", "text-blue-500")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (state.isLoadingImage) container.querySelector('#tense-loader')?.appendChild(Loader());
        attachEvents();
    };

    const renderEx = (ex, type, col) => `
        <div class="bg-slate-950 p-8 rounded-[2.5rem] shadow-2xl group flex justify-between items-center border border-white/5">
            <div>
                <span class="text-[10px] font-black ${col} uppercase tracking-[0.3em] mb-2 block">${type} STYLE</span>
                <p class="text-xl font-black text-white italic group-hover:text-brand-primary transition-colors">${ex.en}</p>
                <p class="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">${ex.tr}</p>
            </div>
            <button onclick="window.speechSynthesis.cancel(); window.speechSynthesis.speak(new SpeechSynthesisUtterance('${ex.en}'))" class="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl hover:bg-white/10 transition-all opacity-40 group-hover:opacity-100">🔊</button>
        </div>
    `;

    const attachEvents = () => {
        container.querySelectorAll('.tense-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                setState({ activeTenseIdx: idx });
                fetchImage(tensesData[idx].pexelsQuery);
            };
        });
    };

    if (!state.imageUrl) fetchImage(tensesData[0].pexelsQuery);
    else render();
    return container;
};
