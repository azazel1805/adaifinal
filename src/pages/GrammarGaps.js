import { generateGrammarGapsStory } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';
import { DIFFICULTY_LEVELS } from '../constants';

const parsePlaceholder = (placeholder) => {
    const content = placeholder.replace(/[\[\]]/g, '');
    const [partOfSpeech, description] = content.split(':');
    let prompt = partOfSpeech.charAt(0).toUpperCase() + partOfSpeech.slice(1).toLowerCase();
    if (description) prompt += ` (${description.trim()})`;
    return prompt;
};

export const renderGrammarGaps = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        gameState: 'setup', // setup, playing, finished
        difficulty: DIFFICULTY_LEVELS[1],
        isLoading: false,
        error: '',
        storyTemplate: '',
        placeholders: [],
        userWords: [],
        currentStep: 0,
        finalStory: ''
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleStart = async () => {
        setState({ isLoading: true, error: '' });
        try {
            const template = await generateGrammarGapsStory(state.difficulty);
            const found = template.match(/\[(.*?)\]/g);
            if (!found) throw new Error();
            setState({ storyTemplate: template, placeholders: found, userWords: new Array(found.length).fill(''), currentStep: 0, gameState: 'playing', isLoading: false });
        } catch { setState({ error: 'Hikaye oluşturulamadı.', isLoading: false }); }
    };

    const handleWordSubmit = (word) => {
        const newWords = [...state.userWords];
        newWords[state.currentStep] = word.trim();
        if (state.currentStep < state.placeholders.length - 1) {
            setState({ userWords: newWords, currentStep: state.currentStep + 1 });
        } else {
            let story = state.storyTemplate;
            state.placeholders.forEach((ph, i) => {
                const regex = new RegExp(ph.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                story = story.replace(regex, `<strong class="text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-lg">${newWords[i]}</strong>`);
            });
            setState({ userWords: newWords, finalStory: story, gameState: 'finished' });
        }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">✏️</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Linguistic Gaps</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Eğlenceli bir 'Mad Libs' deneyimi. Kelimeleri seçin, AI'nın hazırladığı hikayedeki boşlukları doldurun ve ortaya çıkan sürprizi görün.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 max-w-3xl mx-auto">
                    ${state.gameState === 'setup' ? `
                        <div class="space-y-10 text-center">
                            <div class="space-y-4">
                                <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">ZORLUK SEVİYESİ</h4>
                                <div class="flex justify-center gap-2">
                                    ${DIFFICULTY_LEVELS.map(l => `
                                        <button class="diff-btn px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${state.difficulty === l ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}" data-l="${l}">${l}</button>
                                    `).join('')}
                                </div>
                            </div>
                            <button id="start-btn" class="w-full bg-brand-primary text-white font-black py-6 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-20" ${state.isLoading ? 'disabled' : ''}>${state.isLoading ? 'HİKAYE HAZIRLANIYOR...' : 'OYUNU BAŞLAT 🏁'}</button>
                        </div>
                    ` : state.gameState === 'playing' ? `
                        <div class="space-y-8 text-center animate-slideUp">
                            <div class="flex justify-center gap-2 mb-10">
                                ${state.placeholders.map((_, i) => `<div class="w-2 h-2 rounded-full ${i <= state.currentStep ? 'bg-brand-primary' : 'bg-slate-100 dark:bg-slate-800'}"></div>`).join('')}
                            </div>
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4 block">ADIM ${state.currentStep + 1} / ${state.placeholders.length}</span>
                            <h3 class="text-3xl font-black text-slate-900 dark:text-white italic uppercase tracking-tight">BİR <span class="text-brand-primary underline decoration-brand-primary decoration-4 underline-offset-[12px]">${parsePlaceholder(state.placeholders[state.currentStep])}</span> YAZIN</h3>
                            <div class="flex flex-col md:flex-row gap-4 mt-12">
                                <input type="text" id="word-input" class="flex-grow p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] font-black text-2xl text-center text-slate-900 dark:text-white shadow-inner focus:ring-4 focus:ring-brand-primary/10 outline-none" autofocus placeholder="...">
                                <button id="next-btn" class="bg-brand-primary text-white font-black px-12 py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">İLERLE</button>
                            </div>
                        </div>
                    ` : `
                        <div class="space-y-10 animate-slideUp">
                            <div class="text-center">
                                <span class="text-[10px] font-black text-green-500 uppercase tracking-[0.8em] mb-4 block animate-bounce">HİKAYENİZ HAZIR! 🎉</span>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-800/50 p-12 rounded-[3.5rem] shadow-inner text-lg font-bold text-slate-700 dark:text-slate-300 leading-[2] tracking-tight border border-slate-100 dark:border-white/5">
                                ${state.finalStory.replace(/\n/g, '<br />')}
                            </div>
                            <button id="again-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">YENİDEN OYNA 🔄</button>
                        </div>
                    `}
                </div>

                <div id="error-area"></div>
                ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-10"></div>` : ''}
            </div>
        `;

        if (state.isLoading) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage({ message: state.error }));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.diff-btn').forEach(btn => btn.onclick = () => setState({ difficulty: btn.dataset.l }));
        container.querySelector('#start-btn')?.addEventListener('click', handleStart);
        container.querySelector('#again-btn')?.addEventListener('click', () => setState({ gameState: 'setup', finalStory: '' }));

        const nextBtn = container.querySelector('#next-btn');
        const wordInp = container.querySelector('#word-input');
        if (nextBtn && wordInp) {
            const submit = () => { if (wordInp.value.trim()) handleWordSubmit(wordInp.value); };
            nextBtn.onclick = submit;
            wordInp.onkeydown = (e) => { if (e.key === 'Enter') submit(); };
        }
    };

    render();
    return container;
};
