import store from '../store/index';
import { addWord } from '../store/vocabulary';
import { Loader, ErrorMessage } from '../components/Common';
import { generateGeminiResponse } from '../services/geminiService';
import oxfordData from '../data/oxford5000.json';

// Global speech synthesis
const speakEn = (text) => {
    if (typeof window.speechSynthesis === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en-'));
    if (enVoice) utterance.voice = enVoice;

    window.speechSynthesis.speak(utterance);
};

export const renderOxfordTrainer = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10 animate-fadeIn';

    let state = {
        level: null, // a1, a2, b1, b2, c1
        loading: false,
        error: null,
        words: [], // { word, level, meaning }
        currentIndex: 0,
        isFlipped: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const fetchWords = async (level) => {
        setState({ loading: true, error: null, level, currentIndex: 0, isFlipped: false, words: [] });

        try {
            // Get user's existing vocabulary to avoid showing already learned words
            const existingWords = (store.getState().vocabularyList || []).map(w => w.word.toLowerCase());

            // Filter oxford data by level and not in existing
            const availableWords = oxfordData.filter(item =>
                item.level.toLowerCase() === level.toLowerCase() &&
                !existingWords.includes(item.word.toLowerCase())
            );

            // If user learned all words in this level!
            if (availableWords.length === 0) {
                setState({
                    error: `Tebrikler! ${level.toUpperCase()} seviyesindeki tüm Oxford kelimelerini Kelime Antrenörüne ekledin.`,
                    loading: false
                });
                return;
            }

            // Shuffle and pick 10 words
            const selected10 = availableWords.sort(() => 0.5 - Math.random()).slice(0, 10);
            const englishWords = selected10.map(w => w.word);

            // Fetch definitions from Gemini
            const prompt = `Aşağıdaki 10 adet İngilizce kelimenin en yaygın, en açık Türkçe anlamlarını (en fazla 1-3 kelime ile) ver. Json formatında döndür. Format: { "word1": "anlamı", "word2": "anlamı" }\nKelimeler: ${englishWords.join(', ')}`;

            const responseText = await generateGeminiResponse([
                { role: 'system', content: 'You are an english-turkish dictionary.' },
                { role: 'user', content: prompt }
            ], true); // Force JSON

            const meanings = JSON.parse(responseText);

            // Merge meanings into words
            const finalWords = selected10.map(w => ({
                word: w.word,
                level: w.level,
                meaning: meanings[w.word] || 'Çeviri bulunamadı'
            }));

            setState({ loading: false, words: finalWords });

        } catch (error) {
            console.error("Oxford kelime getirme hatası:", error);
            setState({ loading: false, error: "Kelimeler yüklenirken bir sorun oluştu. Lütfen tekrar dene." });
        }
    };

    const nextWord = () => {
        if (state.currentIndex + 1 >= state.words.length) {
            // Finished block, show end screen
            setState({ currentIndex: state.currentIndex + 1 });
        } else {
            setState({ currentIndex: state.currentIndex + 1, isFlipped: false });
        }
    };

    const handleAction = (wordObj, action) => {
        if (action === 'add') {
            addWord(wordObj.word, wordObj.meaning);
        }
        nextWord();
    };

    const render = () => {
        container.innerHTML = `
            <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10 relative overflow-hidden">
                <div class="absolute -right-10 -top-10 text-9xl opacity-[0.03] rotate-12 select-none grayscale cursor-default">🎓</div>
                
                <!-- HEADER -->
                <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 pb-10 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase flex items-center gap-3">
                            <span>Oxford 5000</span>
                        </h2>
                        <p class="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-sm leading-relaxed">
                            Resmi Oxford 5000 listesinden CEFR seviyenize uygun tamamen yeni kelimeler keşfedin ve çalışmalarınıza ekleyin.
                        </p>
                    </div>
                </div>

                ${state.loading ? `<div id="loader-container"></div>` :
                state.error ? `<div id="error-container"></div>
                                 <button id="reset-btn" class="mt-4 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 uppercase tracking-widest text-xs">Geri Dön</button>`
                    :
                    !state.level ? `
                    <div class="space-y-6">
                        <p class="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">KelimE SEVİYESİ SEÇİN</p>
                        <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                            ${['A1', 'A2', 'B1', 'B2', 'C1'].map(lvl => `
                                <button class="level-btn p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-transparent hover:border-brand-primary group transition-all" data-lvl="${lvl}">
                                    <p class="text-3xl font-black text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">${lvl}</p>
                                    <p class="text-[10px] uppercase font-bold text-slate-400 mt-2 tracking-widest">Başla</p>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                  ` : state.currentIndex >= state.words.length ? `
                    <div class="text-center py-20 bg-brand-primary/5 rounded-[3rem] border border-brand-primary/10">
                        <span class="text-6xl mb-6 inline-block">🎉</span>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">10 Kelime Tamamlandı!</h3>
                        <p class="text-slate-500 font-medium mb-10 max-w-sm mx-auto">Daha fazla yeni kelime keşfetmek veya başka bir seviyeden kelimeler almak için devam et.</p>
                        <div class="flex justify-center gap-4">
                            <button id="reset-btn" class="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-full hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">Tüm Seviyeler</button>
                            <button id="retry-btn" class="px-8 py-4 bg-brand-primary text-white font-black rounded-full shadow-lg hover:-translate-y-1 transition-all uppercase tracking-widest text-xs shadow-brand-primary/30">Daha Fazla Kelime Gelsin 🚀</button>
                        </div>
                    </div>
                  ` : `
                    <div class="space-y-8 animate-slideUp">
                        <div class="flex justify-between items-center px-4">
                            <p class="text-[10px] font-black text-brand-primary uppercase tracking-widest">${state.level.toUpperCase()} SEVİYESİ</p>
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-bold text-slate-400"><span class="text-slate-900 dark:text-white">${state.currentIndex + 1}</span> / 10</span>
                                <div class="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div class="h-full bg-brand-primary transition-all duration-500" style="width: ${((state.currentIndex + 1) / 10) * 100}%"></div>
                                </div>
                            </div>
                        </div>

                        <!-- FLASHCARD -->
                        <div id="flashcard" class="relative w-full aspect-[4/3] max-h-[400px] cursor-pointer group [perspective:1000px]">
                            <div class="relative w-full h-full transition-all duration-700 preserve-3d ${state.isFlipped ? 'rotate-y-180' : ''}">
                                <!-- Front -->
                                <div class="absolute w-full h-full backface-hidden bg-slate-50 dark:bg-slate-800 rounded-[3rem] border-4 border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center p-10 shadow-lg group-hover:border-brand-primary transition-colors">
                                    <button id="speak-front" class="absolute top-8 right-8 text-3xl opacity-30 hover:opacity-100 transition-opacity p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">🔊</button>
                                    <h3 class="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white capitalize tracking-tighter mb-4">${state.words[state.currentIndex].word}</h3>
                                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Çeviriyi görmek için karta tıkla</p>
                                </div>
                                <!-- Back -->
                                <div class="absolute w-full h-full backface-hidden bg-brand-primary rounded-[3rem] border-4 border-transparent flex flex-col items-center justify-center p-10 shadow-xl rotate-y-180">
                                    <button id="speak-back" class="absolute top-8 right-8 text-3xl text-white/50 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">🔊</button>
                                    <h3 class="text-4xl sm:text-6xl font-black text-white capitalize tracking-tighter mb-4">${state.words[state.currentIndex].meaning}</h3>
                                    <p class="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em] bg-black/20 px-4 py-2 rounded-full">Türkçe Anlamı</p>
                                </div>
                            </div>
                        </div>

                        <!-- ACTIONS -->
                        ${state.isFlipped ? `
                            <div class="flex gap-4 p-4 animate-slideUp">
                                <button id="skip-word" class="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-[10px]">
                                    Biliyorum, Es Geç ⏭️
                                </button>
                                <button id="save-word" class="flex-[2] py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black rounded-[2rem] shadow-xl hover:-translate-y-1 transition-all uppercase tracking-widest text-[10px]">
                                    Sözlüğüme Ekle ➕
                                </button>
                            </div>
                        ` : ''}
                    </div>
                  `
            }
            </div>
        `;

        // Render dynamic parts
        if (state.loading) {
            container.querySelector('#loader-container').appendChild(Loader());
        }
        if (state.error) {
            container.querySelector('#error-container').appendChild(ErrorMessage(state.error));
        }

        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.level-btn').forEach(btn => {
            btn.onclick = () => fetchWords(btn.dataset.lvl.toLowerCase());
        });

        const resetBtn = container.querySelector('#reset-btn');
        if (resetBtn) resetBtn.onclick = () => setState({ level: null, words: [], isFlipped: false });

        const retryBtn = container.querySelector('#retry-btn');
        if (retryBtn) retryBtn.onclick = () => fetchWords(state.level);

        const flashcard = container.querySelector('#flashcard');
        if (flashcard) {
            flashcard.onclick = (e) => {
                // Prevent flip if clicking speak button
                if (e.target.closest('#speak-front') || e.target.closest('#speak-back')) return;
                setState({ isFlipped: !state.isFlipped });
            };
        }

        const speakFront = container.querySelector('#speak-front');
        if (speakFront) speakFront.onclick = () => speakEn(state.words[state.currentIndex].word);

        const speakBack = container.querySelector('#speak-back');
        if (speakBack) speakBack.onclick = () => speakEn(state.words[state.currentIndex].word);

        const skipBtn = container.querySelector('#skip-word');
        if (skipBtn) skipBtn.onclick = () => handleAction(state.words[state.currentIndex], 'skip');

        const saveBtn = container.querySelector('#save-word');
        if (saveBtn) saveBtn.onclick = () => {
            const current = state.words[state.currentIndex];
            handleAction(current, 'add');
            // Optional: Show toast or feedback
        };
    };

    render();
    return container;
};
