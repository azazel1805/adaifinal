import store from '../store/index';
import { getDictionaryEntry, getEli5Explanation, getTurkishToEnglishTranslation } from '../services/geminiService';
import { addWord, removeWord, isWordSaved } from '../store/vocabulary';
import { Loader, ErrorMessage } from '../components/Common';

const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';

export const renderDictionary = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10';

    let state = {
        word: '',
        direction: 'en_to_tr', // 'en_to_tr', 'tr_to_en'
        isLoading: false,
        error: '',
        entry: null,
        trToEnResult: null,
        imageUrl: null,
        isEli5Mode: false,
        eli5Explanation: null,
        isLoadingEli5: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const fetchImage = async (query) => {
        try {
            const response = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            if (!response.ok) return null;
            const data = await response.json();
            return data.photos?.[0]?.src?.large || null;
        } catch (error) {
            console.error('Error fetching image:', error);
            return null;
        }
    };

    const executeSearch = async (searchTerm) => {
        const cleaned = searchTerm.trim();
        if (!cleaned) {
            setState({ error: 'Lütfen bir kelime girin.' });
            return;
        }
        setState({ word: cleaned, isLoading: true, error: '', entry: null, trToEnResult: null, imageUrl: null, isEli5Mode: false, eli5Explanation: null });
        try {
            if (state.direction === 'en_to_tr') {
                const [resultText, fetchedImageUrl] = await Promise.all([
                    getDictionaryEntry(cleaned),
                    fetchImage(cleaned)
                ]);
                const parsedResult = JSON.parse(resultText);
                setState({ entry: parsedResult, imageUrl: fetchedImageUrl, isLoading: false });
            } else {
                const resultText = await getTurkishToEnglishTranslation(cleaned);
                const parsedResult = JSON.parse(resultText);
                setState({ trToEnResult: parsedResult, isLoading: false });
            }
        } catch (e) {
            setState({ error: e.message || 'Hata oluştu.', isLoading: false });
        }
    };

    const handleSpeak = (text) => {
        if (!text) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v => v.lang === 'en-US' && /female/i.test(v.name));
        utterance.voice = femaleVoice || voices.find(v => v.lang === 'en-US') || null;
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const handleToggleEli5 = async () => {
        if (!state.entry || !state.word) return;
        const newMode = !state.isEli5Mode;
        setState({ isEli5Mode: newMode });
        if (newMode && !state.eli5Explanation) {
            setState({ isLoadingEli5: true });
            try {
                const explanation = await getEli5Explanation(state.word, state.entry);
                setState({ eli5Explanation: explanation, isLoadingEli5: false });
            } catch (e) {
                setState({ error: e.message || 'Hata.', isEli5Mode: false, isLoadingEli5: false });
            }
        }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden transition-all duration-300">
                    <div class="absolute -top-10 -right-10 w-40 h-40 bg-brand-primary/10 rounded-full blur-3xl"></div>
                    <div class="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                        <div class="flex-1">
                            <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic flex items-center gap-4">
                                <span>Dictionary</span>
                                <span class="bg-yellow-400 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase not-italic tracking-widest shadow-lg">Smart</span>
                            </h2>
                            <p class="text-slate-500 dark:text-slate-400 font-medium">Kapsamlı anlamlar, telaffuzlar ve görsel hafıza desteği bir arada.</p>
                        </div>

                        <div class="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shadow-inner flex shrink-0">
                            <button id="en-tr-btn" class="px-6 py-2 rounded-xl text-xs font-black transition-all ${state.direction === 'en_to_tr' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700'}">EN-TR</button>
                            <button id="tr-en-btn" class="px-6 py-2 rounded-xl text-xs font-black transition-all ${state.direction === 'tr_to_en' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:bg-white dark:hover:bg-slate-700'}">TR-EN</button>
                        </div>
                    </div>

                    <div class="mt-10 flex flex-col sm:flex-row gap-4 relative z-10">
                        <input id="dict-input" type="text" value="${state.word}" placeholder="${state.direction === 'en_to_tr' ? 'Search English...' : 'Türkçe kelime ara...'}" class="flex-1 p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none font-bold text-slate-900 dark:text-white text-lg transition-all shadow-inner">
                        <button id="search-btn" class="px-12 bg-slate-900 dark:bg-brand-primary hover:bg-black dark:hover:bg-brand-secondary text-white font-black py-5 rounded-3xl transition-all shadow-xl uppercase tracking-widest text-xs disabled:opacity-50 hover:-translate-y-1">
                            ${state.isLoading ? 'ARAŞTIRILIYOR...' : 'SÖZLÜKTE ARA 🔍'}
                        </button>
                    </div>
                </div>

                ${state.isLoading ? '<div class="py-12 flex justify-center"><div id="loader-target"></div></div>' : ''}
                <div id="error-area"></div>

                ${(state.entry || state.trToEnResult) ? `
                    <div class="animate-slideUp space-y-10">
                        <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                            <div class="flex justify-between items-center mb-10 pb-6 border-b-2 border-slate-50 dark:border-slate-800">
                                <div class="flex items-center gap-6">
                                    <h3 class="text-5xl font-black text-brand-primary tracking-tighter capitalize">${state.word}</h3>
                                    ${state.entry?.pronunciation ? `
                                        <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-100 dark:border-slate-700">
                                            <span class="text-lg font-mono text-slate-400 font-medium">${state.entry.pronunciation}</span>
                                            <button id="pronounce-btn" class="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">🔊</button>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="flex items-center gap-4">
                                     ${state.direction === 'en_to_tr' ? `
                                        <div class="flex items-center gap-3 mr-4">
                                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basit Anlat</span>
                                            <button id="eli5-btn" class="w-12 h-6 rounded-full transition-all relative ${state.isEli5Mode ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'}">
                                                <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${state.isEli5Mode ? 'translate-x-6' : ''}"></div>
                                            </button>
                                        </div>
                                     ` : ''}
                                     <button id="save-word-btn" class="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-2xl">
                                        ${isWordSaved(state.word) ? '✅' : '🔖'}
                                     </button>
                                </div>
                            </div>

                            ${state.imageUrl && !state.isEli5Mode ? `
                                <div class="mb-12 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
                                    <img src="${state.imageUrl}" class="w-full h-[400px] object-cover transition-transform duration-1000 hover:scale-110">
                                </div>
                            ` : ''}

                            ${state.isLoadingEli5 ? '<div class="py-12 flex justify-center"><div id="loader-target-eli5"></div></div>' : ''}

                            ${state.isEli5Mode && state.eli5Explanation ? `
                                <div class="bg-yellow-50 dark:bg-yellow-900/10 border-4 border-yellow-100 dark:border-yellow-900/20 p-10 rounded-[3rem] animate-fadeIn">
                                    <h4 class="text-2xl font-black text-yellow-800 dark:text-yellow-400 mb-4 flex items-center gap-3">
                                        <span>🧸</span>
                                        <span>Basitçe Anlatalım</span>
                                    </h4>
                                    <p class="text-lg font-bold text-yellow-900/70 dark:text-yellow-200/70 leading-relaxed italic">"${state.eli5Explanation}"</p>
                                </div>
                            ` : `
                                <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    <div class="lg:col-span-12 space-y-10">
                                        ${state.direction === 'en_to_tr' ? renderEnToTr(state.entry) : renderTrToEn(state.trToEnResult)}
                                    </div>
                                </div>
                            `}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (state.isLoading) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.isLoadingEli5) container.querySelector('#loader-target-eli5')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));

        attachEvents();
    };

    const renderEnToTr = (entry) => `
        <div class="space-y-10">
            ${entry.turkishMeanings ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${entry.turkishMeanings.map(m => `
                        <div class="p-8 bg-slate-50 dark:bg-slate-800/80 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-700 group hover:border-brand-primary transition-all">
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] mb-4 block">${m.type}</span>
                            <p class="text-2xl font-black text-slate-900 dark:text-white leading-tight">${m.meaning}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                ${entry.definitions ? `
                    <div class="bg-white dark:bg-slate-800/30 p-10 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">İngilizce Tanımlar</h4>
                        <ul class="space-y-6">
                            ${entry.definitions.map(def => `
                                <li class="flex gap-4">
                                    <div class="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 flex-shrink-0"></div>
                                    <p class="font-bold text-slate-700 dark:text-slate-300 italic leading-relaxed">"${def}"</p>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                 ${entry.exampleSentences ? `
                    <div class="bg-white dark:bg-slate-800/30 p-10 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Örnek Cümleler</h4>
                        <ul class="space-y-6">
                            ${entry.exampleSentences.map(ex => `
                                <li class="flex gap-4">
                                    <div class="w-1.5 h-1.5 rounded-full bg-brand-secondary mt-2 flex-shrink-0"></div>
                                    <p class="font-bold text-slate-700 dark:text-slate-300 leading-relaxed">${ex}</p>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>

            <div class="flex flex-wrap gap-8">
                ${entry.synonyms?.length ? `
                    <div class="flex-1 min-w-[200px]">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Eş Anlamlılar</h4>
                        <div class="flex flex-wrap gap-2">
                             ${entry.synonyms.map(s => `<button class="search-word-btn px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-brand-primary hover:text-white transition-all shadow-sm">${s}</button>`).join('')}
                        </div>
                    </div>
                ` : ''}
                ${entry.antonyms?.length ? `
                    <div class="flex-1 min-w-[200px]">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Zıt Anlamlılar</h4>
                        <div class="flex flex-wrap gap-2">
                             ${entry.antonyms.map(s => `<button class="search-word-btn px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white transition-all shadow-sm">${s}</button>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            ${entry.etymology ? `
                <div class="p-8 bg-slate-950 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                     <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-brand-primary/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="relative z-10">
                        <h4 class="text-[10px] font-black text-brand-primary uppercase font-mono tracking-[0.3em] mb-4">📜 Kelime Kökeni (Etimoloji)</h4>
                        <p class="text-sm font-medium text-slate-400 leading-relaxed">${entry.etymology}</p>
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    const renderTrToEn = (result) => `
        <div class="space-y-6">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">İngilizce Karşılıkları</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${result.englishTranslations.map(tx => `
                    <div class="p-10 bg-white dark:bg-slate-800 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-700 transition-all hover:border-brand-primary relative group">
                        <div class="flex justify-between items-start mb-6">
                            <div>
                                <h5 class="text-3xl font-black text-brand-primary tracking-tighter cursor-pointer hover:underline" data-search="${tx.word}">${tx.word}</h5>
                                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">${tx.type}</span>
                            </div>
                            <div class="flex gap-2">
                                <button class="play-btn w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center hover:bg-brand-primary hover:text-white transition-all shadow-sm" data-text="${tx.word}">🔊</button>
                                <button class="add-btn w-10 h-10 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-xl flex items-center justify-center hover:shadow-lg transition-all" data-word="${tx.word}" data-tr="${state.word}">
                                    ${isWordSaved(tx.word) ? '✅' : '🔖'}
                                </button>
                            </div>
                        </div>
                        <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl italic font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                            "${tx.example}"
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    const attachEvents = () => {
        const input = container.querySelector('#dict-input');
        if (input) {
            input.oninput = (e) => state.word = e.target.value;
            input.onkeydown = (e) => {
                if (e.key === 'Enter') executeSearch(input.value);
            };
        }

        container.querySelector('#search-btn').onclick = () => {
            const val = container.querySelector('#dict-input')?.value || state.word;
            executeSearch(val);
        };
        container.querySelector('#en-tr-btn').onclick = () => setState({ direction: 'en_to_tr' });
        container.querySelector('#tr-en-btn').onclick = () => setState({ direction: 'tr_to_en' });

        const pronounceBtn = container.querySelector('#pronounce-btn');
        if (pronounceBtn) pronounceBtn.onclick = () => handleSpeak(state.word);

        const saveBtn = container.querySelector('#save-word-btn');
        if (saveBtn) {
            saveBtn.onclick = () => {
                const w = state.word;
                if (isWordSaved(w)) {
                    removeWord(w);
                } else {
                    const meaning = state.entry?.turkishMeanings?.map(m => `(${m.type}) ${m.meaning}`).join(', ') || 'N/A';
                    addWord(w, meaning);
                }
                render();
            };
        }

        const eli5Btn = container.querySelector('#eli5-btn');
        if (eli5Btn) eli5Btn.onclick = handleToggleEli5;

        container.querySelectorAll('.search-word-btn, [data-search]').forEach(btn => {
            btn.onclick = (e) => executeSearch(btn.dataset.search || btn.textContent);
        });

        container.querySelectorAll('.play-btn').forEach(btn => {
            btn.onclick = () => handleSpeak(btn.dataset.text);
        });

        container.querySelectorAll('.add-btn').forEach(btn => {
            btn.onclick = () => {
                const w = btn.dataset.word;
                if (!isWordSaved(w)) addWord(w, btn.dataset.tr);
                render();
            };
        });
    };

    render();
    return container;
};
