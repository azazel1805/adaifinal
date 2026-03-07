import { generateEssayOutline, writeFullEssayFromOutline } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

const essayTypes = ['Argumentative', 'Expository', 'Narrative', 'Descriptive', 'Compare and Contrast', 'Cause and Effect', 'Persuasive', 'Process', 'Problem-Solution'];

export const renderEssayOutliner = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        essayType: '',
        topic: '',
        outline: null,
        fullEssay: null,
        isLoadingOutline: false,
        isLoadingEssay: false,
        error: ''
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGenerateOutline = async () => {
        if (!state.essayType || !state.topic.trim()) return setState({ error: 'Lütfen tür seçin ve konu yazın.' });
        setState({ isLoadingOutline: true, error: '', outline: null, fullEssay: null });
        try {
            const res = await generateEssayOutline(state.essayType, state.topic);
            setState({ outline: res, isLoadingOutline: false });
        } catch { setState({ error: 'Taslak oluşturulamadı.', isLoadingOutline: false }); }
    };

    const handleWriteFullEssay = async () => {
        if (!state.topic || !state.outline) return;
        setState({ isLoadingEssay: true, error: '', fullEssay: null });
        try {
            const res = await writeFullEssayFromOutline(state.topic, state.outline);
            setState({ fullEssay: res, isLoadingEssay: false });
        } catch { setState({ error: 'Kompozisyon yazılamadı.', isLoadingEssay: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden text-center">
                    <div class="absolute top-0 left-0 p-10 text-8xl opacity-10 select-none grayscale">📝</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Essay Architect</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Fikirlerinizi yapılandırın. Kompozisyon türünü seçin, konunuzu girin ve AI ile profesyonel bir taslak oluşturup tam metne dönüştürün.</p>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div class="lg:col-span-1">
                        <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-8 lg:sticky top-10">
                            <div>
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-6">1. ESSAY TYPE</h4>
                                <div class="grid grid-cols-1 gap-2">
                                    ${essayTypes.map(t => `
                                        <button class="type-btn text-left px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${state.essayType === t ? 'bg-brand-secondary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}" data-t="${t}">${t}</button>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="space-y-4">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">2. DEFINE TOPIC</h4>
                                <input type="text" id="topic-input" value="${state.topic}" placeholder="e.g. The Future of AI" class="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-brand-secondary/10 outline-none font-bold text-slate-900 dark:text-white shadow-inner">
                            </div>
                            <div id="error-area"></div>
                            <button id="outline-btn" class="w-full bg-brand-primary text-white font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all disabled:opacity-20" ${state.isLoadingOutline || !state.essayType || !state.topic.trim() ? 'disabled' : ''}>${state.isLoadingOutline ? 'TASLAKLANINIYOR...' : 'TASLAK OLUŞTUR 📐'}</button>
                        </div>
                    </div>

                    <div class="lg:col-span-2 space-y-10">
                        ${state.isLoadingOutline ? `<div id="outline-loader" class="flex justify-center p-10"></div>` : ''}

                        ${state.outline ? `
                            <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-8 animate-slideUp">
                                <div class="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-8">
                                    <h3 class="text-xs font-black text-brand-secondary uppercase tracking-[0.4em]">STRUCTURED OUTLINE</h3>
                                    <span class="px-4 py-2 bg-brand-secondary/10 text-brand-secondary text-[10px] font-black rounded-lg uppercase tracking-widest">${state.essayType}</span>
                                </div>
                                <div class="prose dark:prose-invert max-w-none">
                                    <pre class="whitespace-pre-wrap font-bold text-slate-700 dark:text-slate-300 leading-relaxed text-sm bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[2.5rem] shadow-inner border border-slate-100 dark:border-white/5 family-sans">${state.outline}</pre>
                                </div>
                                <button id="essay-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-20" ${state.isLoadingEssay ? 'disabled' : ''}>${state.isLoadingEssay ? 'METİN YAZILIYOR...' : 'TAM METNE DÖNÜŞTÜR ✨'}</button>
                            </div>
                        ` : ''}

                        ${state.isLoadingEssay ? `<div id="essay-loader" class="flex justify-center p-10"></div>` : ''}

                        ${state.fullEssay ? `
                            <div class="bg-slate-950 text-white p-10 md:p-16 rounded-[4rem] shadow-2xl space-y-10 animate-slideUp">
                                <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.6em] border-b border-white/10 pb-6 block">ARCHITECTURAL MASTERPIECE</h3>
                                <div class="prose prose-invert max-w-none text-slate-300 leading-[2] font-medium text-lg">
                                    ${state.fullEssay.split('\n').map(p => p.trim() ? `<p class="mb-8">${p}</p>` : '').join('')}
                                </div>
                                <button onclick="const el = document.createElement('textarea'); el.value = this.previousElementSibling.innerText; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); alert('Kopyalandı!');" class="w-full bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-[2rem] border border-white/10 uppercase tracking-widest text-[10px] transition-all">PANEYE KOPYALA 📋</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        if (state.isLoadingOutline) container.querySelector('#outline-loader')?.appendChild(Loader());
        if (state.isLoadingEssay) container.querySelector('#essay-loader')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));

        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.type-btn').forEach(btn => btn.onclick = () => setState({ essayType: btn.dataset.t }));
        const topicInp = container.querySelector('#topic-input');
        if (topicInp) topicInp.oninput = (e) => state.topic = e.target.value;
        const outBtn = container.querySelector('#outline-btn');
        if (outBtn) outBtn.onclick = handleGenerateOutline;
        const essBtn = container.querySelector('#essay-btn');
        if (essBtn) essBtn.onclick = handleWriteFullEssay;
    };

    render();
    return container;
};
