import store from '../store/index';
import { removeWord, updateSRS } from '../store/vocabulary';
import { Loader } from '../components/Common';

export const renderVocabularyTrainer = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10';

    let state = {
        mode: 'srs', // 'srs', 'quiz', 'all'
        currentIndex: 0,
        isFlipped: false,
        userAnswers: {},
        quizQuestions: [],
        showResults: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const getDueWords = () => {
        const list = store.getState().vocabularyList || [];
        const now = new Date();
        return list.filter(word => !word.srs?.nextReview || new Date(word.srs.nextReview) <= now);
    };

    const handleSRSAction = (success) => {
        const dueWords = getDueWords();
        const currentWord = dueWords[state.currentIndex];

        // Update SRS metadata in store/localStorage
        updateSRS(currentWord.id, success);

        // Advance or finish
        if (state.currentIndex + 1 >= dueWords.length) {
            setState({ showResults: true });
        } else {
            setState({ currentIndex: state.currentIndex + 1, isFlipped: false });
        }
    };

    const startQuiz = () => {
        const list = store.getState().vocabularyList || [];
        if (list.length < 4) return;

        const questions = [...list].sort(() => Math.random() - 0.5).slice(0, 10).map(correctItem => {
            const distractors = [...list].filter(item => item.id !== correctItem.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(item => item.meaning);
            const options = [correctItem.meaning, ...distractors].sort(() => Math.random() - 0.5);
            return { id: correctItem.id, word: correctItem.word, correctMeaning: correctItem.meaning, options };
        });

        setState({ mode: 'quiz', quizQuestions: questions, currentIndex: 0, userAnswers: {}, showResults: false });
    };

    const render = () => {
        const list = store.getState().vocabularyList || [];
        const dueWords = getDueWords();

        if (list.length === 0) {
            container.innerHTML = `
                <div class="text-center py-24 bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-50">
                    <span class="text-8xl block mb-8">🏜️</span>
                    <h2 class="text-3xl font-black text-slate-800 mb-4 uppercase italic">Sözlüğün Boş</h2>
                    <p class="text-slate-500 font-bold italic">Kelime ekleyerek akıllı tekrar sistemini başlatabilirsin.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Linguistic Core</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium">Spaced Repetition (SRS) destekli akıllı öğrenme.</p>
                    </div>

                    <div class="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex shadow-inner">
                        <button class="mode-btn px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.mode === 'srs' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}" data-mode="srs">Akıllı Tekrar</button>
                        <button class="mode-btn px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.mode === 'quiz' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'}" data-mode="quiz">Test</button>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 min-h-[500px] flex flex-col justify-center transition-all duration-300">
                    ${state.mode === 'srs' ? renderSRS(dueWords) : renderQuiz()}
                </div>

                <!-- Complete List -->
                <div class="bg-slate-950 p-12 rounded-[4rem] shadow-2xl border-4 border-white/5 space-y-8">
                    <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] flex justify-between items-center">
                        <span>FULL ARCHIVE (${list.length})</span>
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${list.map(item => {
            const level = item.srs?.level || 0;
            return `
                                <div class="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex justify-between items-center group hover:border-brand-primary transition-all">
                                    <div class="flex-1">
                                        <div class="flex items-center gap-2 mb-1">
                                            <p class="text-lg font-black text-white capitalize">${item.word}</p>
                                            <span class="px-2 py-0.5 bg-brand-primary/20 text-brand-primary rounded-full text-[8px] font-black">LVL ${level}</span>
                                        </div>
                                        <p class="text-xs font-bold text-slate-500 italic line-clamp-1">${item.meaning}</p>
                                    </div>
                                    <button class="del-word-btn w-10 h-10 flex items-center justify-center text-white/20 hover:text-red-500 transition-colors text-2xl" data-word="${item.word}">&times;</button>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;

        attachEvents();
    };

    const renderSRS = (dueWords) => {
        if (state.showResults) {
            return `
                <div class="text-center space-y-8 animate-zoomIn">
                    <div class="text-8xl">📊</div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase italic">Oturum Tamamlandı!</h2>
                    <p class="text-slate-500 font-bold max-w-sm mx-auto italic">Tüm kelimeleri gözden geçirdin. Hafızan artık daha güçlü.</p>
                    <button id="restart-srs" class="bg-brand-primary text-white font-black px-12 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">YENİDEN BAŞLA</button>
                </div>
            `;
        }

        if (dueWords.length === 0) {
            return `
                <div class="text-center space-y-8 animate-fadeIn grayscale">
                    <div class="text-8xl">☕</div>
                    <h2 class="text-3xl font-black text-slate-400 uppercase italic">Tekrar Edilecek Kelime Yok</h2>
                    <p class="text-slate-400 font-bold italic">Tebrikler! Şu an için tüm kelimelerin hafızanda taze.</p>
                    <button class="mode-btn bg-slate-100 px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500" data-mode="quiz">Test Çözerek İlerle</button>
                </div>
            `;
        }

        const word = dueWords[state.currentIndex];
        return `
            <div class="animate-fadeIn space-y-12">
                 <div class="text-center">
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b-2 border-slate-100 pb-2">${state.currentIndex + 1} / ${dueWords.length} GÖZDEN GEÇİRGİ</span>
                </div>

                <div id="flashcard" class="relative w-72 h-72 mx-auto cursor-pointer group" style="perspective: 2000px">
                    <div class="relative w-full h-full transition-all duration-700 preserve-3d shadow-2xl rounded-[3rem] ${state.isFlipped ? 'rotate-y-180' : ''}">
                         <div class="absolute inset-0 bg-slate-950 text-white rounded-[3rem] flex flex-col items-center justify-center backface-hidden p-10 shadow-lg border-4 border-white/5">
                            <h4 class="text-4xl font-black capitalize tracking-tighter">${word.word}</h4>
                            <p class="mt-6 text-[8px] font-black uppercase tracking-[0.3em] opacity-40">Dokun ve Hatırla</p>
                         </div>
                         <div class="absolute inset-0 bg-white text-slate-950 rounded-[3rem] flex flex-col items-center justify-center backface-hidden rotate-y-180 p-10 shadow-lg border-4 border-slate-100">
                             <p class="text-2xl font-black text-center leading-tight italic">"${word.meaning}"</p>
                         </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row justify-center gap-6 ${state.isFlipped ? 'animate-slideUp' : 'opacity-20 pointer-events-none grayscale'}">
                    <button id="srs-fail" class="flex-1 bg-red-500/10 text-red-500 font-black py-6 rounded-[2rem] border-2 border-red-500/20 uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all">HATIRLAMADIM ❌</button>
                    <button id="srs-success" class="flex-1 bg-green-500 text-white font-black py-6 rounded-[2rem] shadow-xl uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-green-500/20">HATIRLADIM ✅</button>
                </div>
            </div>
        `;
    };

    const renderQuiz = () => {
        if (state.showResults) return renderQuizResults();
        if (state.quizQuestions.length === 0) {
            return `
                <div class="text-center space-y-8 animate-fadeIn">
                    <div class="text-8xl">🎯</div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase italic">Kelime Meydan Okuması</h2>
                    <p class="text-slate-500 font-bold italic">Rastgele seçilen 10 kelime ile kendini test et.</p>
                    <button id="start-quiz-btn" class="bg-brand-primary text-white font-black px-12 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">TESTİ BAŞLAT</button>
                </div>
            `;
        }

        const q = state.quizQuestions[state.currentIndex];
        return `
            <div class="animate-fadeIn space-y-10">
                <div class="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-6 rounded-[2rem]">
                    <span class="text-xl font-black italic capitalize text-slate-900 dark:text-white">${q.word}</span>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${state.currentIndex + 1} / 10</span>
                </div>

                <div class="grid grid-cols-1 gap-4">
                    ${q.options.map(opt => `
                        <button class="ans-btn p-6 rounded-2xl text-left border-2 font-bold text-sm transition-all
                            ${state.userAnswers[state.currentIndex] === opt ? 'bg-brand-primary border-brand-primary text-white' : 'bg-white dark:bg-slate-900 border-slate-100 hover:border-brand-primary/50 text-slate-600 dark:text-slate-300'}"
                            data-ans="${opt}">
                            ${opt}
                        </button>
                    `).join('')}
                </div>

                <div class="pt-6">
                    <button id="next-quiz-btn" class="w-full bg-slate-950 text-white font-black py-6 rounded-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all"
                        ${!state.userAnswers[state.currentIndex] ? 'disabled opacity-20' : ''}>
                        ${state.currentIndex === state.quizQuestions.length - 1 ? 'SONUCU GÖR ✅' : 'SONRAKİ SORU &rarr;'}
                    </button>
                </div>
            </div>
        `;
    };

    const renderQuizResults = () => {
        const correctCount = state.quizQuestions.filter((q, i) => state.userAnswers[i] === q.correctMeaning).length;
        return `
             <div class="text-center space-y-10 animate-zoomIn">
                <div class="inline-block relative">
                    <div class="w-40 h-40 border-8 border-brand-primary/10 border-t-brand-primary rounded-full animate-spin"></div>
                    <div class="absolute inset-0 flex flex-col items-center justify-center font-black">
                        <span class="text-4xl text-brand-primary">${Math.round((correctCount / state.quizQuestions.length) * 100)}%</span>
                        <span class="text-[8px] text-slate-400 uppercase tracking-widest">BAŞARI</span>
                    </div>
                </div>
                <div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase italic">Test Sonucu: ${correctCount} / ${state.quizQuestions.length}</h2>
                    <p class="text-slate-500 font-bold italic mt-2">Hataların SRS sistemine aktarıldı.</p>
                </div>
                <button id="restart-quiz" class="bg-brand-primary text-white font-black px-12 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">YENİ TEST BAŞLAT</button>
            </div>
        `;
    };

    const attachEvents = () => {
        container.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => setState({ mode: btn.dataset.mode, currentIndex: 0, isFlipped: false, showResults: false, quizQuestions: [] }));
        });

        // SRS Events
        container.querySelector('#flashcard')?.addEventListener('click', () => setState({ isFlipped: !state.isFlipped }));
        container.querySelector('#srs-success')?.addEventListener('click', () => handleSRSAction(true));
        container.querySelector('#srs-fail')?.addEventListener('click', () => handleSRSAction(false));
        container.querySelector('#restart-srs')?.addEventListener('click', () => setState({ showResults: false, currentIndex: 0, isFlipped: false }));

        // Quiz Events
        container.querySelector('#start-quiz-btn')?.addEventListener('click', startQuiz);
        container.querySelectorAll('.ans-btn').forEach(btn => {
            btn.onclick = () => {
                const updated = { ...state.userAnswers, [state.currentIndex]: btn.dataset.ans };
                setState({ userAnswers: updated });
            };
        });
        container.querySelector('#next-quiz-btn')?.addEventListener('click', () => {
            if (state.currentIndex + 1 >= state.quizQuestions.length) {
                // Update SRS for each quiz question
                state.quizQuestions.forEach((q, i) => {
                    const success = state.userAnswers[i] === q.correctMeaning;
                    updateSRS(q.id, success);
                });
                setState({ showResults: true });
            } else {
                setState({ currentIndex: state.currentIndex + 1 });
            }
        });
        container.querySelector('#restart-quiz')?.addEventListener('click', startQuiz);

        // Word management
        container.querySelectorAll('.del-word-btn').forEach(btn => {
            btn.onclick = () => {
                if (confirm('Bu kelimeyi silmek istediğine emin misin?')) {
                    removeWord(btn.dataset.word);
                    render();
                }
            };
        });
    }

    render();
    return container;
};
