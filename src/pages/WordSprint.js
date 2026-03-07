import { wordSprintData } from '../data/wordSprintData';
import { DIFFICULTY_LEVELS } from '../constants';
import { Loader } from '../components/Common';
import globalStore from '../store';
import { updatePerformance } from '../utils/performance';

const GAME_TIME = 60;

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export const renderWordSprint = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        gameState: 'setup', // setup, playing, finished
        difficulty: DIFFICULTY_LEVELS[1],
        score: 0,
        timeLeft: GAME_TIME,
        questions: [],
        currentIndex: 0,
        feedback: null, // correct, incorrect
        userChoice: null,
        highScore: 0
    };

    let timer = null;

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const loadHighScore = () => {
        const { user } = globalStore.getState();
        const userKey = user?.uid || 'guest';
        const key = `word-sprint-highscore-${userKey}-${state.difficulty}`;
        state.highScore = parseInt(localStorage.getItem(key)) || 0;
    };

    const saveHighScore = () => {
        const { user } = globalStore.getState();
        const userKey = user?.uid || 'guest';
        const key = `word-sprint-highscore-${userKey}-${state.difficulty}`;
        if (state.score > state.highScore) {
            localStorage.setItem(key, state.score);
            state.highScore = state.score;
        }
    };

    const startGame = () => {
        const wordList = wordSprintData[state.difficulty];
        const qs = shuffle(wordList).map(item => {
            const type = Math.random() < 0.5 ? 'word-to-meaning' : 'meaning-to-word';
            const questionText = type === 'word-to-meaning' ? item.word : item.meaning;
            const correctAnswer = type === 'word-to-meaning' ? item.meaning : item.word;
            const distractors = shuffle(wordList.filter(w => w.word !== item.word))
                .slice(0, 3)
                .map(w => type === 'word-to-meaning' ? w.meaning : w.word);
            return { questionText, options: shuffle([correctAnswer, ...distractors]), correctAnswer };
        });

        setState({
            gameState: 'playing',
            score: 0,
            timeLeft: GAME_TIME,
            questions: qs,
            currentIndex: 0,
            feedback: null,
            userChoice: null
        });

        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            if (state.timeLeft <= 0) {
                clearInterval(timer);
                saveHighScore();
                setState({ gameState: 'finished' });
            } else {
                state.timeLeft--;
                renderQuietly();
            }
        }, 1000);
    };

    const handleAnswer = (ans) => {
        if (state.feedback) return;
        const correct = ans === state.questions[state.currentIndex].correctAnswer;
        state.userChoice = ans;
        state.feedback = correct ? 'correct' : 'incorrect';
        if (correct) {
            state.score += 10;
            state.timeLeft = Math.min(GAME_TIME + 10, state.timeLeft + 2);
            updatePerformance('Word Sprint', true);
        } else {
            state.score = Math.max(0, state.score - 5);
            state.timeLeft = Math.max(0, state.timeLeft - 3);
            updatePerformance('Word Sprint', false);
        }
        render();

        setTimeout(() => {
            state.feedback = null;
            state.userChoice = null;
            state.currentIndex = (state.currentIndex + 1) % state.questions.length;
            render();
        }, 600);
    };

    const renderQuietly = () => {
        const timeEl = container.querySelector('#time-display');
        if (timeEl) {
            timeEl.textContent = state.timeLeft;
            if (state.timeLeft <= 10) timeEl.className = "text-5xl font-black text-red-500 animate-pulse italic";
            else timeEl.className = "text-5xl font-black text-slate-800 dark:text-white italic";
        }
    };

    const render = () => {
        if (state.gameState === 'setup') {
            loadHighScore();
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                        <div class="absolute top-0 left-0 p-10 text-8xl opacity-10 select-none grayscale">🏃</div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Sprint Master</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Zamana karşı yarışın! 60 saniyede ne kadar çok kelime bilirseniz o kadar yüksek skor. Hızlı düşün, doğru cevapla, süreni uzat.</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 max-w-3xl mx-auto space-y-12 text-center">
                        <div class="space-y-6">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">HAZIR OLURSAN...</h4>
                            <div class="flex justify-center gap-2">
                                ${DIFFICULTY_LEVELS.map(l => `
                                    <button class="diff-btn px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${state.difficulty === l ? 'bg-brand-secondary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}" data-l="${l}">${l}</button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="p-8 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-white/5 space-y-2">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">PERSONAL BEST</span>
                            <p class="text-4xl font-black text-brand-secondary italic">${state.highScore}</p>
                        </div>

                        <button id="start-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">START SPRINT 🏁</button>
                    </div>
                </div>
            `;
        } else if (state.gameState === 'playing') {
            const q = state.questions[state.currentIndex];
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="flex flex-col md:flex-row gap-8 justify-between items-center bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-4 border-slate-50 dark:border-slate-800">
                        <div class="text-center md:text-left space-y-1">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">ACTIVE SCORE</span>
                            <p class="text-5xl font-black text-brand-primary italic">${state.score}</p>
                        </div>
                        <div class="text-center md:text-right space-y-1">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">TIME REMAINING</span>
                            <p id="time-display" class="text-5xl font-black text-slate-800 dark:text-white italic">${state.timeLeft}</p>
                        </div>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center space-y-12 animate-pulseStep">
                        <div class="space-y-4">
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4 block">WHAT IS THE MEANING?</span>
                            <h3 class="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">${q.questionText}</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${q.options.map(opt => {
                let cls = "p-8 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all border-4 shadow-sm";
                if (state.feedback) {
                    if (opt === q.correctAnswer) cls += " bg-green-500 border-green-500 text-white scale-105 shadow-green-500/20";
                    else if (opt === state.userChoice) cls += " bg-red-500 border-red-500 text-white shadow-red-500/20";
                    else cls += " bg-slate-50 border-transparent opacity-20";
                } else {
                    cls += " bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:border-brand-primary/20";
                }
                return `
                                    <button class="opt-btn ${cls}" data-opt="${opt}" ${state.feedback ? 'disabled' : ''}>${opt}</button>
                                `;
            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="animate-fadeIn max-w-3xl mx-auto py-10">
                    <div class="bg-slate-950 p-14 rounded-[4rem] shadow-2xl border-4 border-white/5 text-center space-y-14">
                        <div class="space-y-4">
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.8em] mb-4 block">SPRINT FINISHED</span>
                            <h3 class="text-5xl font-black text-white italic uppercase tracking-tighter">TOTAL PERFORMANCE</h3>
                        </div>

                        <div class="flex justify-center items-center gap-10">
                            <div class="space-y-2">
                                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block">SCORE</span>
                                <p class="text-8xl font-black text-brand-primary italic">${state.score}</p>
                            </div>
                        </div>

                        ${state.score > state.highScore ? `
                            <div class="p-4 bg-green-500/20 border border-green-500/20 rounded-2xl animate-bounce">
                                <span class="text-green-500 font-black text-xs uppercase tracking-[0.4em]">NEW RECORD UNLOCKED! 🏆</span>
                            </div>
                        ` : ''}

                        <div class="flex flex-col gap-4">
                            <button id="restart-btn" class="w-full bg-white text-slate-950 font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest text-xs hover:bg-brand-primary hover:text-white transition-all">TRY AGAIN ⚡</button>
                            <button id="setup-btn" class="w-full bg-white/5 text-slate-400 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">BACK TO OPTIONS</button>
                        </div>
                    </div>
                </div>
            `;
        }

        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.diff-btn').forEach(btn => btn.onclick = () => setState({ difficulty: btn.dataset.l }));
        container.querySelector('#start-btn')?.addEventListener('click', startGame);
        container.querySelector('#restart-btn')?.addEventListener('click', startGame);
        container.querySelector('#setup-btn')?.addEventListener('click', () => setState({ gameState: 'setup' }));

        container.querySelectorAll('.opt-btn').forEach(btn => {
            btn.onclick = () => handleAnswer(btn.dataset.opt);
        });
    };

    render();
    return container;
};
