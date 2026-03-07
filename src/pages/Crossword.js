import globalStore from '../store';
import { generateCrossword } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderCrossword = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        isLoading: false,
        error: '',
        crossword: null,
        userGrid: [],
        cellStatus: [],
        activeCell: null,
        direction: 'across'
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGenerate = async () => {
        const voc = globalStore.getState().vocabularyList;
        if (voc.length < 5) return setState({ error: 'Bulmaca için en az 5 kelime eklemelisiniz.' });
        setState({ isLoading: true, error: '', crossword: null, userGrid: [], activeCell: null, cellStatus: [] });
        try {
            const words = [...voc].sort(() => 0.5 - Math.random()).slice(0, 20);
            const res = await generateCrossword(words);
            const data = JSON.parse(res);

            const clueMap = {};
            [...data.clues.across, ...data.clues.down].forEach(c => {
                const k = `${c.row},${c.col}`;
                if (!clueMap[k]) clueMap[k] = c.number;
            });

            const grid = data.grid.map((r, ri) => r.map((c, ci) => {
                if (c === null) return null;
                const num = clueMap[`${ri},${ci}`];
                return num ? `${num}|${c}` : c;
            }));

            setState({
                crossword: { ...data, grid },
                userGrid: Array(data.size.rows).fill(null).map(() => Array(data.size.cols).fill('')),
                cellStatus: Array(data.size.rows).fill(null).map(() => Array(data.size.cols).fill(null)),
                isLoading: false
            });
        } catch { setState({ error: 'Bulmaca oluşturulamadı.', isLoading: false }); }
    };

    const handleCellClick = (r, c) => {
        if (!state.crossword || state.crossword.grid[r][c] === null) return;
        if (state.activeCell?.row === r && state.activeCell?.col === c) {
            const hasDown = state.crossword.clues.down.some(cl => cl.col === c && r >= cl.row && r < cl.row + cl.answer.length);
            const hasAcross = state.crossword.clues.across.some(cl => cl.row === r && c >= cl.col && c < cl.col + cl.answer.length);
            if (state.direction === 'across' && hasDown) setState({ direction: 'down' });
            else if (state.direction === 'down' && hasAcross) setState({ direction: 'across' });
        } else {
            const hasAcross = state.crossword.clues.across.some(cl => cl.row === r && c >= cl.col && c < cl.col + cl.answer.length);
            setState({ activeCell: { row: r, col: c }, direction: hasAcross ? 'across' : 'down' });
        }
    };

    const handleKeyDown = (e) => {
        if (!state.activeCell || !state.crossword) return;
        const { row, col } = state.activeCell;
        const { rows, cols } = state.crossword.size;

        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            state.userGrid[row][col] = e.key.toUpperCase();
            state.cellStatus[row][col] = null;
            if (state.direction === 'across' && col + 1 < cols && state.crossword.grid[row][col + 1] !== null) state.activeCell = { row, col: col + 1 };
            else if (state.direction === 'down' && row + 1 < rows && state.crossword.grid[row + 1][col] !== null) state.activeCell = { row: row + 1, col };
            render();
        } else if (e.key === 'Backspace') {
            state.userGrid[row][col] = '';
            state.cellStatus[row][col] = null;
            if (state.direction === 'across' && col - 1 >= 0 && state.crossword.grid[row][col - 1] !== null) state.activeCell = { row, col: col - 1 };
            else if (state.direction === 'down' && row - 1 >= 0 && state.crossword.grid[row - 1][col] !== null) state.activeCell = { row: row - 1, col };
            render();
        }
    };

    const getActiveClue = () => {
        if (!state.activeCell || !state.crossword) return null;
        const { row, col } = state.activeCell;
        return state.crossword.clues[state.direction].find(c =>
            state.direction === 'across' ? c.row === row && col >= c.col && col < c.col + c.answer.length : c.col === col && row >= c.row && row < c.row + c.answer.length
        );
    };

    const render = () => {
        const activeClue = getActiveClue();
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-10">
                    <div class="space-y-4 text-center md:text-left">
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Cipher Grid</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl">Kendi kelime haznenizle oluşturulan dinamik bulmacaları çözün. Harfleri birleştirin, anlamları yakalayın.</p>
                    </div>
                    <button id="gen-btn" class="bg-brand-primary text-white font-black px-12 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">YENİ BULMACA 🔡</button>
                </div>

                <div id="error-area"></div>
                ${state.isLoading ? `<div id="loader-target" class="flex justify-center p-10"></div>` : ''}

                ${state.crossword ? `
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-slideUp">
                        <div class="lg:col-span-2 space-y-8">
                            <div class="bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                                <div class="grid mx-auto gap-px bg-slate-200 dark:bg-slate-700 p-px rounded-xl overflow-hidden" style="grid-template-columns: repeat(${state.crossword.size.cols}, 1fr); max-width: 600px;">
                                    ${state.crossword.grid.map((row, r) => row.map((cell, c) => {
            if (cell === null) return `<div class="aspect-square bg-slate-950/90"></div>`;
            const num = cell.includes('|') ? cell.split('|')[0] : '';
            const char = cell.includes('|') ? cell.split('|')[1] : cell;
            const isActive = state.activeCell?.row === r && state.activeCell?.col === c;
            const isInWord = activeClue && (state.direction === 'across' ? activeClue.row === r && c >= activeClue.col && c < activeClue.col + activeClue.answer.length : activeClue.col === c && r >= activeClue.row && r < activeClue.row + activeClue.answer.length);
            const status = state.cellStatus[r][c];
            const reveal = status === 'revealed';

            let bg = "bg-white dark:bg-slate-800";
            if (isActive) bg = "bg-yellow-400 dark:bg-yellow-500";
            else if (isInWord) bg = "bg-brand-primary/10 dark:bg-brand-primary/20";

            let txt = status === 'correct' ? 'text-green-500' : status === 'incorrect' ? 'text-red-500' : reveal ? 'text-brand-secondary' : 'text-slate-900 dark:text-white';

            return `
                                            <div class="cell aspect-square ${bg} relative flex items-center justify-center cursor-pointer group transition-all" data-r="${r}" data-c="${c}">
                                                ${num ? `<span class="absolute top-1 left-1.5 text-[8px] font-black text-slate-400">${num}</span>` : ''}
                                                <span class="text-xl font-black uppercase ${txt}">${reveal ? char : state.userGrid[r][c]}</span>
                                            </div>
                                        `;
        }).join('')).join('')}
                                </div>
                            </div>
                            
                            ${activeClue ? `
                                <div class="bg-slate-950 p-6 rounded-3xl border-4 border-white/5 flex items-center gap-6 animate-slideUp">
                                    <div class="w-12 h-12 bg-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary font-black">${activeClue.number}</div>
                                    <div class="flex-grow">
                                        <p class="text-[10px] font-black text-brand-primary uppercase tracking-widest">${state.direction === 'across' ? 'Across' : 'Down'}</p>
                                        <p class="text-white font-bold italic">"${activeClue.clue}"</p>
                                    </div>
                                </div>
                            ` : ''}

                            <div class="flex flex-wrap gap-3 justify-center">
                                <button id="check-w-btn" class="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-50 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Kelimeyi Kontrol Et</button>
                                <button id="reveal-w-btn" class="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-2 border-slate-50 dark:border-slate-800 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">Kelimeyi Aç</button>
                                <button id="reveal-p-btn" class="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">Tümünü Çöz ✨</button>
                            </div>
                        </div>

                        <div class="space-y-8 max-h-[700px] overflow-y-auto pr-4 scrollbar-thin">
                            <div class="space-y-6">
                                <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] sticky top-0 bg-slate-50 dark:bg-slate-950 py-2 z-10">ACROSS</h3>
                                <div class="grid gap-2">
                                    ${state.crossword.clues.across.map(c => `
                                        <button class="clue-btn p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 ${activeClue?.number === c.number && state.direction === 'across' ? 'border-brand-primary shadow-lg scale-[1.02]' : 'border-transparent opacity-60 hover:opacity-100'} text-left transition-all" data-r="${c.row}" data-c="${c.col}" data-d="across">
                                            <span class="font-black text-brand-primary mr-3">${c.number}.</span>
                                            <span class="text-xs font-bold text-slate-700 dark:text-white">${c.clue}</span>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="space-y-6">
                                <h3 class="text-xs font-black text-brand-secondary uppercase tracking-[0.4em] sticky top-0 bg-slate-50 dark:bg-slate-950 py-2 z-10">DOWN</h3>
                                <div class="grid gap-2">
                                    ${state.crossword.clues.down.map(c => `
                                        <button class="clue-btn p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 ${activeClue?.number === c.number && state.direction === 'down' ? 'border-brand-secondary shadow-lg scale-[1.02]' : 'border-transparent opacity-60 hover:opacity-100'} text-left transition-all" data-r="${c.row}" data-c="${c.col}" data-d="down">
                                            <span class="font-black text-brand-secondary mr-3">${c.number}.</span>
                                            <span class="text-xs font-bold text-slate-700 dark:text-white">${c.clue}</span>
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
            <input type="text" id="hidden-input" style="position:fixed; top:-100px; opacity:0">
        `;

        if (state.isLoading) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelector('#gen-btn')?.addEventListener('click', handleGenerate);
        const inp = container.querySelector('#hidden-input');

        container.querySelectorAll('.cell').forEach(c => {
            c.onclick = () => {
                handleCellClick(parseInt(c.dataset.r), parseInt(c.dataset.c));
                inp?.focus();
            };
        });

        container.querySelectorAll('.clue-btn').forEach(b => {
            b.onclick = () => {
                setState({ activeCell: { row: parseInt(b.dataset.r), col: parseInt(b.dataset.c) }, direction: b.dataset.d });
                inp?.focus();
            };
        });

        if (inp) {
            inp.onkeydown = (e) => handleKeyDown(e);
            inp.oninput = (e) => { e.target.value = ''; };
        }

        container.querySelector('#check-w-btn')?.addEventListener('click', () => {
            const cl = getActiveClue();
            if (!cl) return;
            for (let i = 0; i < cl.answer.length; i++) {
                const ri = cl.direction === 'across' ? cl.row : cl.row + i;
                const ci = cl.direction === 'across' ? cl.col + i : cl.col;
                const char = state.crossword.grid[ri][ci].split('|').pop();
                if (state.userGrid[ri][ci]) state.cellStatus[ri][ci] = state.userGrid[ri][ci] === char ? 'correct' : 'incorrect';
            }
            render();
        });

        container.querySelector('#reveal-w-btn')?.addEventListener('click', () => {
            const cl = getActiveClue();
            if (!cl) return;
            for (let i = 0; i < cl.answer.length; i++) {
                const ri = cl.direction === 'across' ? cl.row : cl.row + i;
                const ci = cl.direction === 'across' ? cl.col + i : cl.col;
                const char = state.crossword.grid[ri][ci].split('|').pop();
                state.userGrid[ri][ci] = char;
                state.cellStatus[ri][ci] = 'revealed';
            }
            render();
        });

        container.querySelector('#reveal-p-btn')?.addEventListener('click', () => {
            state.crossword.grid.forEach((row, ri) => row.forEach((cell, ci) => {
                if (cell) {
                    state.userGrid[ri][ci] = cell.split('|').pop();
                    state.cellStatus[ri][ci] = 'revealed';
                }
            }));
            render();
        });
    };

    render();
    return container;
};
