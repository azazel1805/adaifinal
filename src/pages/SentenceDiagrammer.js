import { diagramSentence } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

const partTypeColors = {
    'Subject': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Verb': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Main Verb': 'bg-red-500 text-white border-red-500 font-black',
    'Object': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Complement': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Adjective': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
    'Adverb': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    'Determiner': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    'Prepositional Phrase': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
    'Clause': 'bg-slate-900 text-white border-slate-900',
    'Conjunction': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Pronoun': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    'Other': 'bg-slate-100 text-slate-400 border-slate-200',
};

const getPartColorClass = (type) => {
    const t = type.toLowerCase();
    if (t.includes('main verb')) return partTypeColors['Main Verb'];
    if (t.includes('verb')) return partTypeColors['Verb'];
    if (t.includes('subject')) return partTypeColors['Subject'];
    if (t.includes('object')) return partTypeColors['Object'];
    if (t.includes('complement')) return partTypeColors['Complement'];
    if (t.includes('adjective')) return partTypeColors['Adjective'];
    if (t.includes('adverb')) return partTypeColors['Adverb'];
    if (t.includes('determiner')) return partTypeColors['Determiner'];
    if (t.includes('prepositional phrase')) return partTypeColors['Prepositional Phrase'];
    if (t.includes('clause')) return partTypeColors['Clause'];
    if (t.includes('conjunction')) return partTypeColors['Conjunction'];
    if (t.includes('pronoun')) return partTypeColors['Pronoun'];
    return partTypeColors['Other'];
};

export const renderSentenceDiagrammer = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        sentence: '',
        isLoading: false,
        error: '',
        result: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleAnalyze = async () => {
        if (!state.sentence.trim()) return setState({ error: 'Lütfen bir cümle girin.' });
        setState({ isLoading: true, error: '', result: null });
        try {
            const res = await diagramSentence(state.sentence);
            setState({ result: JSON.parse(res), isLoading: false });
        } catch { setState({ error: 'Analiz başarısız.', isLoading: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                    <div class="absolute top-0 left-0 p-10 text-8xl opacity-10 select-none grayscale">📊</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Sentence Blueprint</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Cümleleri gramer DNA'larına kadar ayrıştırın. Karmaşık yapıları görsel bir şema ile anlamlandırın ve dilin matematiğini keşfedin.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-8 animate-slideUp">
                    <div class="space-y-4">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest pl-6">SENTENCE</label>
                        <textarea id="sentence-input" class="w-full h-32 p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[3rem] focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-700 dark:text-white shadow-inner resize-none appearance-none" placeholder="Analiz edilecek İngilizce cümleyi buraya yapıştırın...">${state.sentence}</textarea>
                    </div>
                    <div id="error-area"></div>
                    <button id="analyze-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50" ${state.isLoading ? 'disabled' : ''}>YAPIYI GÖRSELLEŞTİR 🗺️</button>
                    ${state.isLoading ? `<div id="loader-target" class="flex justify-center"></div>` : ''}
                </div>

                ${state.result ? `
                    <div class="animate-slideUp space-y-10">
                        <div class="bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative">
                             <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-10">THE VISUALIZATION</h3>
                             <div class="flex flex-wrap items-center gap-x-2 gap-y-4 leading-[3]">
                                ${state.result.parts.map(p => `
                                    <span class="px-3 py-1.5 rounded-xl border-2 transition-all duration-300 font-bold hover:scale-110 ${getPartColorClass(p.type)}">
                                        ${p.text}
                                    </span>
                                `).join('')}
                             </div>
                        </div>

                        <div class="space-y-8">
                             <h3 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] ml-6">LEXICAL COMPONENT BREAKDOWN</h3>
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                ${state.result.parts.map(p => `
                                    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 flex items-start gap-6 group hover:border-brand-primary transition-all">
                                        <div class="px-4 py-2 rounded-xl border-2 font-black text-[8px] uppercase tracking-widest ${getPartColorClass(p.type)} shrink-0">${p.type}</div>
                                        <div>
                                            <p class="text-lg font-black text-slate-900 dark:text-white italic mb-1">"${p.text}"</p>
                                            <p class="text-xs font-bold text-slate-500 leading-relaxed">${p.description}</p>
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
        container.querySelector('#sentence-input')?.addEventListener('input', (e) => state.sentence = e.target.value);
        container.querySelector('#analyze-btn')?.addEventListener('click', handleAnalyze);
    };

    render();
    return container;
};
