import { generateSentenceOrderingExercise } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';
import { DIFFICULTY_LEVELS } from '../constants';

export const renderSentenceOrdering = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        difficulty: DIFFICULTY_LEVELS[1],
        isLoading: false,
        error: '',
        exercise: null,
        userOrderedSentences: [],
        showResults: false
    };

    let draggedIdx = null;

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGenerate = async () => {
        setState({ isLoading: true, error: '', exercise: null, userOrderedSentences: [], showResults: false });
        try {
            const res = await generateSentenceOrderingExercise(state.difficulty);
            const data = JSON.parse(res);
            setState({ exercise: data, userOrderedSentences: data.sentences.map((text, id) => ({ id, text })), isLoading: false });
        } catch { setState({ error: 'Alıştırma oluşturulamadı.', isLoading: false }); }
    };

    const reorder = (from, to) => {
        const list = [...state.userOrderedSentences];
        const [removed] = list.splice(from, 1);
        list.splice(to, 0, removed);
        setState({ userOrderedSentences: list });
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🧱</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Flow Master</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-6">Karışık verilen cümleleri sürükle-bırak yöntemiyle anlamlı bir paragrafa dönüştürün. Metin akışı ustalığınızı konuşturun.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-end">
                    <div class="flex-grow space-y-4">
                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">COMPLEXITY</h4>
                        <select id="diff-select" class="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-brand-secondary/10 outline-none font-bold text-slate-900 dark:text-white shadow-inner appearance-none">
                            ${DIFFICULTY_LEVELS.map(d => `<option value="${d}" ${state.difficulty === d ? 'selected' : ''}>${d}</option>`).join('')}
                        </select>
                    </div>
                    <button id="gen-btn" class="bg-brand-secondary text-white font-black px-12 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">YENİ KURGU OLUŞTUR 🧩</button>
                </div>

                <div id="error-area"></div>
                ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-10"></div>` : ''}

                ${state.exercise ? `
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div class="lg:col-span-2 space-y-6">
                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-6">
                                <h3 class="text-xs font-black text-brand-secondary uppercase tracking-[0.4em] mb-10 pb-4 border-b border-slate-50 dark:border-slate-800">CÜMLELERİ SIRALA</h3>
                                <div id="sentence-list" class="space-y-3">
                                    ${state.userOrderedSentences.map((s, i) => {
            const isCorrect = state.showResults && state.exercise.analysis.correctOrderIndices[i] === s.id;
            let cls = "flex items-center gap-6 p-6 rounded-3xl border-2 transition-all font-bold group";
            if (state.showResults) {
                cls += isCorrect ? " bg-green-500/10 border-green-500/20 text-green-600" : " bg-red-500/10 border-red-500/20 text-red-600";
            } else {
                cls += " bg-slate-50 dark:bg-slate-800 border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 cursor-move";
            }
            return `
                                            <div class="sentence-item ${cls}" draggable="${!state.showResults}" data-idx="${i}">
                                                <span class="text-3xl font-black opacity-10 italic">0${i + 1}</span>
                                                <p class="flex-grow">${s.text}</p>
                                                ${!state.showResults ? `
                                                    <div class="flex flex-col gap-1">
                                                        <button class="up-btn p-2 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100" data-idx="${i}">▲</button>
                                                        <button class="down-btn p-2 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100" data-idx="${i}">▼</button>
                                                    </div>
                                                ` : ''}
                                            </div>
                                        `;
        }).join('')}
                                </div>
                                ${!state.showResults ? `
                                    <button id="check-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">CEVAPLARI KONTROL ET ✔️</button>
                                ` : ''}
                            </div>
                        </div>

                        ${state.showResults ? `
                            <div class="lg:col-span-1">
                                <div class="bg-slate-950 text-white p-10 rounded-[3.5rem] shadow-2xl space-y-8 animate-slideUp border-4 border-white/5 sticky top-10">
                                    <span class="text-[10px] font-black text-brand-secondary uppercase tracking-[0.6em] mb-4 block underline decoration-brand-secondary decoration-4 underline-offset-8">ALEX'İN ANALİZİ</span>
                                    <h4 class="text-xl font-black italic uppercase">Bağlamsal Mantık</h4>
                                    <div class="prose prose-invert max-w-none text-slate-400 text-sm leading-loose italic">
                                        ${state.exercise.analysis.explanation}
                                    </div>
                                    <button id="retry-btn" class="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl border border-white/10 uppercase tracking-widest text-[10px] transition-all">TEKRAR DENE 🔄</button>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;

        if (state.isLoading) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelector('#diff-select')?.addEventListener('change', (e) => state.difficulty = e.target.value);
        container.querySelector('#gen-btn')?.addEventListener('click', handleGenerate);
        container.querySelector('#check-btn')?.addEventListener('click', () => setState({ showResults: true }));
        container.querySelector('#retry-btn')?.addEventListener('click', handleGenerate);

        const list = container.querySelector('#sentence-list');
        if (list && !state.showResults) {
            list.querySelectorAll('.sentence-item').forEach(el => {
                el.ondragstart = (e) => { draggedIdx = parseInt(el.dataset.idx); el.classList.add('opacity-40'); };
                el.ondragend = () => { el.classList.remove('opacity-40'); };
                el.ondragover = (e) => e.preventDefault();
                el.ondrop = (e) => {
                    const to = parseInt(el.dataset.idx);
                    if (draggedIdx !== null) reorder(draggedIdx, to);
                };
            });

            list.querySelectorAll('.up-btn').forEach(btn => btn.onclick = () => {
                const i = parseInt(btn.dataset.idx);
                if (i > 0) reorder(i, i - 1);
            });
            list.querySelectorAll('.down-btn').forEach(btn => btn.onclick = () => {
                const i = parseInt(btn.dataset.idx);
                if (i < state.userOrderedSentences.length - 1) reorder(i, i + 1);
            });
        }
    };

    render();
    return container;
};
