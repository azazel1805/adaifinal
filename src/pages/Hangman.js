import { hangmanWords } from '../data/hangmanWords';
import { DIFFICULTY_LEVELS } from '../constants';
import { updatePerformance } from '../utils/performance';

const HANGMAN_SVG_PARTS = [
    '<circle cx="250" cy="90" r="40" stroke="currentColor" stroke-width="8" fill="none" class="animate-draw" />',
    '<line x1="250" y1="130" x2="250" y2="250" stroke="currentColor" stroke-width="8" class="animate-draw" />',
    '<line x1="250" y1="170" x2="200" y2="220" stroke="currentColor" stroke-width="8" class="animate-draw" />',
    '<line x1="250" y1="170" x2="300" y2="220" stroke="currentColor" stroke-width="8" class="animate-draw" />',
    '<line x1="250" y1="250" x2="200" y2="300" stroke="currentColor" stroke-width="8" class="animate-draw" />',
    '<line x1="250" y1="250" x2="300" y2="300" stroke="currentColor" stroke-width="8" class="animate-draw" />',
];

export const renderHangman = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        gameState: 'setup', // setup, playing, won, lost
        difficulty: DIFFICULTY_LEVELS[1],
        word: '',
        definition: '',
        guessed: new Set(),
        hintUsed: false,
        showHint: false
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        checkGameStatus();
        render();
    };

    const startGame = () => {
        const list = hangmanWords[state.difficulty];
        const item = list[Math.floor(Math.random() * list.length)];
        setState({
            word: item.word.toUpperCase(),
            definition: item.definition,
            guessed: new Set(),
            hintUsed: false,
            showHint: false,
            gameState: 'playing'
        });
    };

    const handleGuess = (letter) => {
        if (state.gameState !== 'playing' || state.guessed.has(letter)) return;
        state.guessed.add(letter);
        setState({ guessed: new Set(state.guessed) });
    };

    const checkGameStatus = () => {
        if (state.gameState !== 'playing') return;
        const wordArr = state.word.split('');
        const isWon = wordArr.every(l => state.guessed.has(l));
        const wrongCount = [...state.guessed].filter(l => !state.word.includes(l)).length;

        if (isWon) {
            state.gameState = 'won';
            updatePerformance('Adam Asmaca', true);
        } else if (wrongCount >= HANGMAN_SVG_PARTS.length) {
            state.gameState = 'lost';
            updatePerformance('Adam Asmaca', false);
        }
    };

    const render = () => {
        const wrongCount = [...state.guessed].filter(l => !state.word.includes(l)).length;

        if (state.gameState === 'setup') {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">💀</div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Lexical Survival</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Klasik Adam Asmaca deneyimi, modern bir dokunuşla. Kelime haznenizi test edin, hayatta kalın ve yeni kelimeler öğrenin.</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 max-w-3xl mx-auto space-y-10 text-center">
                        <div class="space-y-4">
                            <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">ZORLUK SEVİYESİ</h4>
                            <div class="flex justify-center gap-2">
                                ${DIFFICULTY_LEVELS.map(l => `
                                    <button class="diff-btn px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${state.difficulty === l ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}" data-l="${l}">${l}</button>
                                `).join('')}
                            </div>
                        </div>
                        <button id="start-btn" class="w-full bg-brand-primary text-white font-black py-6 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">OYUNU BAŞLAT ⚔️</button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex justify-center aspect-square relative overflow-hidden">
                             <svg viewBox="0 0 350 350" class="w-full max-w-[300px] text-slate-800 dark:text-white">
                                <line x1="20" y1="330" x2="150" y2="330" stroke="currentColor" stroke-width="8" class="animate-draw" />
                                <line x1="85" y1="330" x2="85" y2="20" stroke="currentColor" stroke-width="8" class="animate-draw" />
                                <line x1="85" y1="20" x2="250" y2="20" stroke="currentColor" stroke-width="8" class="animate-draw" />
                                <line x1="250" y1="20" x2="250" y2="50" stroke="currentColor" stroke-width="8" class="animate-draw" />
                                ${HANGMAN_SVG_PARTS.slice(0, wrongCount).join('')}
                            </svg>
                            ${state.gameState === 'won' || state.gameState === 'lost' ? `
                                <div class="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-10 space-y-6 animate-fadeIn">
                                    <div class="text-6xl">${state.gameState === 'won' ? '🏆' : '💀'}</div>
                                    <h3 class="text-4xl font-black text-white italic uppercase tracking-tighter">${state.gameState === 'won' ? 'ZAFER!' : 'ELENDİN'}</h3>
                                    ${state.gameState === 'lost' ? `<p class="text-slate-400 font-bold uppercase tracking-widest text-xs">LOGOS: <span class="text-brand-primary">${state.word}</span></p>` : ''}
                                    <div class="flex flex-col gap-3 w-full">
                                        <button id="again-btn" class="w-full bg-brand-primary text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">TEKRAR DENE</button>
                                        <button id="setup-btn" class="w-full bg-white/5 text-slate-400 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">MENÜYE DÖN</button>
                                    </div>
                                </div>
                            ` : ''}
                        </div>

                        <div class="space-y-10">
                            <div class="flex justify-center flex-wrap gap-2">
                                ${state.word.split('').map(l => `
                                    <div class="w-12 h-16 bg-white dark:bg-slate-800 border-b-4 ${state.guessed.has(l) ? 'border-brand-primary text-slate-900 dark:text-white' : 'border-slate-200 dark:border-slate-700 text-transparent'} flex items-center justify-center text-3xl font-black shadow-lg rounded-t-xl transition-all">
                                        ${state.guessed.has(l) ? l : ''}
                                    </div>
                                `).join('')}
                            </div>

                            <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center space-y-6">
                                <button id="hint-btn" class="text-[10px] font-black uppercase tracking-[0.4em] ${state.hintUsed ? 'text-slate-300 cursor-not-allowed' : 'text-brand-primary hover:scale-105'} transition-all" ${state.hintUsed ? 'disabled' : ''}>💡 İPUCU İSTE</button>
                                ${state.showHint ? `
                                    <div class="p-6 bg-brand-primary/5 rounded-2xl border border-brand-primary/10 text-brand-primary font-bold italic text-sm animate-slideUp">
                                        ${state.definition}
                                    </div>
                                ` : ''}
                            </div>

                            <div class="grid grid-cols-7 sm:grid-cols-9 gap-2">
                                ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => {
                const isGuessed = state.guessed.has(l);
                const isCorrect = state.word.includes(l);
                let cls = "h-12 rounded-xl font-black text-sm transition-all shadow-sm";
                if (isGuessed) {
                    cls += isCorrect ? " bg-green-500 text-white" : " bg-slate-100 text-slate-300 scale-90 opacity-50";
                } else {
                    cls += " bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 hover:scale-105 active:scale-95";
                }
                return `<button class="guess-btn ${cls}" data-l="${l}" ${isGuessed || state.gameState !== 'playing' ? 'disabled' : ''}>${l}</button>`;
            }).join('')}
                            </div>
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
        container.querySelector('#again-btn')?.addEventListener('click', startGame);
        container.querySelector('#setup-btn')?.addEventListener('click', () => setState({ gameState: 'setup' }));
        container.querySelector('#hint-btn')?.addEventListener('click', () => setState({ showHint: true, hintUsed: true }));

        container.querySelectorAll('.guess-btn').forEach(btn => {
            btn.onclick = () => handleGuess(btn.dataset.l);
        });
    };

    render();
    return container;
};
