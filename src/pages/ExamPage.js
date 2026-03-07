import store from '../store/index';
import { extractExamFromPDF } from '../services/geminiService';
import { addExamResult } from '../store/examHistory';
import { startExam, updateAnswer, setTime, endExam } from '../store/pdfExam';
import { Loader, ErrorMessage } from '../components/Common';

export const renderExamPage = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto';

    let localState = {
        importerState: 'idle', // 'idle' | 'processing' | 'quiz' | 'finished'
        error: '',
        processingMessage: '',
        timerInterval: null
    };

    const setState = (newState) => {
        localState = { ...localState, ...newState };
        render();
    };

    const EXAM_DURATION_MINUTES = 90;

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (file) processFile(file);
    };

    const processFile = async (file) => {
        setState({ importerState: 'processing', error: '', processingMessage: 'PDF yükleniyor ve analiz ediliyor...' });

        try {
            const resultText = await extractExamFromPDF(file);
            setState({ processingMessage: 'Sorular ayrıştırılıyor...' });
            const resultJson = JSON.parse(resultText);

            if (!resultJson.questions || resultJson.questions.length === 0) {
                throw new Error("PDF'den geçerli soru ayrıştırılamadı.");
            }

            const sortedQuestions = resultJson.questions.sort((a, b) => a.questionNumber - b.questionNumber);

            startExam(sortedQuestions, EXAM_DURATION_MINUTES * 60);
            setState({ importerState: 'quiz' });
            startTimer();

        } catch (e) {
            setState({ error: e.message || "PDF işlenirken bir hata oluştu.", importerState: 'idle' });
        }
    };

    const startTimer = () => {
        if (localState.timerInterval) clearInterval(localState.timerInterval);
        localState.timerInterval = setInterval(() => {
            const { examState } = store.getState();
            if (examState.timeLeft <= 1) {
                handleSubmit();
            } else {
                setTime(examState.timeLeft - 1);
                // We don't necessarily need to call render() here if we only update the timer element
                updateTimerUI(examState.timeLeft - 1);
            }
        }, 1000);
    };

    const updateTimerUI = (seconds) => {
        const timerEl = container.querySelector('#timer-display');
        if (timerEl) {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            const timeStr = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            timerEl.innerText = timeStr;
            if (seconds < 300) timerEl.classList.add('text-red-500', 'animate-pulse');
        }
    };

    const handleSubmit = () => {
        if (localState.timerInterval) clearInterval(localState.timerInterval);

        const { examState } = store.getState();
        const { questions, userAnswers, timeLeft } = examState;

        let score = 0;
        const performanceByType = {};

        questions.forEach(q => {
            const type = q.questionType || 'Bilinmeyen Tip';
            if (!performanceByType[type]) performanceByType[type] = { correct: 0, total: 0 };
            performanceByType[type].total += 1;

            if (userAnswers[q.questionNumber] === q.correctAnswer) {
                score += 1;
                performanceByType[type].correct += 1;
            }
        });

        const resultData = {
            questions,
            userAnswers,
            timeTaken: (EXAM_DURATION_MINUTES * 60) - timeLeft,
            score,
            totalQuestions: questions.length,
            performanceByType,
        };

        addExamResult(resultData);
        endExam();
        setState({ importerState: 'finished', error: '' });

        // Navigate to history to see results
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'history' }));
    };

    const handleAskTutor = (q) => {
        const { examState } = store.getState();
        const optionsText = q.options.map(opt => `${opt.key}) ${opt.value}`).join('\n');
        const context = `Lütfen aşağıdaki soru hakkında yardımcı ol:\n\nSoru ${q.questionNumber}: ${q.questionText}\n\nSeçenekler:\n${optionsText}\n\nKullanıcının Seçtiği Cevap: ${examState.userAnswers[q.questionNumber] || 'Henüz cevaplanmadı.'}`;

        store.setState({ initialChatMessage: context });
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'chat' }));
    };

    const render = () => {
        const { examState } = store.getState();

        if (localState.importerState === 'idle') {
            container.innerHTML = `
                <div class="max-w-4xl mx-auto text-center bg-white dark:bg-slate-900 p-12 rounded-3xl shadow-2xl border-2 border-slate-100 dark:border-slate-800 animate-fadeIn">
                    <div class="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <span class="text-6xl">📄</span>
                    </div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">PDF Sınav Yükleyici</h2>
                    <p class="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
                        Deneme sınavlarını interaktif bir teste dönüştür. PDF'ini yükle, yapay zeka senin için soruları çıkarsın.
                    </p>
                    
                    <div id="drop-zone" class="group relative p-16 border-4 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl cursor-pointer hover:border-brand-primary hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 transform hover:scale-[1.01]">
                        <input type="file" id="file-input" accept="application/pdf" class="hidden">
                        <div class="flex flex-col items-center justify-center">
                            <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                            <p class="text-xl font-bold text-slate-900 dark:text-white mb-2">PDF Dosyasını Seç veya Sürükle</p>
                            <p class="text-sm text-slate-400 font-medium">Sadece .pdf (Max 10MB)</p>
                        </div>
                    </div>
                    <div id="error-area" class="mt-6"></div>
                </div>
            `;
            const dropZone = container.querySelector('#drop-zone');
            const fileInput = container.querySelector('#file-input');
            dropZone.onclick = () => fileInput.click();
            fileInput.onchange = handleFileChange;

            // Drag and drop events
            dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('border-brand-primary', 'bg-slate-50'); };
            dropZone.ondragleave = () => { dropZone.classList.remove('border-brand-primary', 'bg-slate-50'); };
            dropZone.ondrop = (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file && file.type === 'application/pdf') processFile(file);
                else setState({ error: "Lütfen sadece PDF yükleyin." });
            };
        } else if (localState.importerState === 'processing') {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-32 animate-fadeIn">
                    <div class="relative w-32 h-32 mb-10">
                        <div class="absolute inset-0 border-8 border-brand-primary/20 rounded-full"></div>
                        <div class="absolute inset-0 border-8 border-brand-primary rounded-full border-t-transparent animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-4xl animate-bounce">🤖</span>
                        </div>
                    </div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-3">Yapay Zeka Çalışıyor...</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-bold tracking-wider uppercase text-xs">${localState.processingMessage}</p>
                </div>
            `;
        } else if (localState.importerState === 'quiz') {
            const { questions, userAnswers, timeLeft } = examState;
            container.innerHTML = `
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <!-- Questions List -->
                    <div class="lg:col-span-3 space-y-8 order-2 lg:order-1">
                        ${questions.map((q, idx) => {
                const showPassage = q.passage && (idx === 0 || q.passage !== questions[idx - 1].passage);
                return `
                                <div id="q-${q.questionNumber}" class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800 p-8 scroll-mt-24 transition-all duration-300 hover:shadow-2xl">
                                    ${showPassage ? `
                                        <div class="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl mb-8 border border-slate-100 dark:border-slate-700 shadow-inner">
                                            <h4 class="text-[10px] uppercase font-black text-brand-primary mb-3 tracking-[0.2em]">Okuma Parçası</h4>
                                            <p class="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">${q.passage}</p>
                                        </div>
                                    ` : ''}

                                    <div class="flex items-start gap-4 mb-6">
                                        <div class="w-10 h-10 bg-brand-primary text-white rounded-xl flex items-center justify-center font-black flex-shrink-0 shadow-lg">${q.questionNumber}</div>
                                        <p class="text-lg font-bold text-slate-800 dark:text-white leading-tight pt-2">${q.questionText}</p>
                                    </div>

                                    <div class="grid grid-cols-1 gap-3">
                                        ${q.options.map(opt => `
                                            <button class="option-btn flex items-center p-4 rounded-xl border-2 transition-all duration-200 text-left ${userAnswers[q.questionNumber] === opt.key ? 'bg-brand-primary border-brand-primary text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 border-transparent hover:border-brand-primary/30 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'}" data-q="${q.questionNumber}" data-opt="${opt.key}">
                                                <span class="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm mr-4 ${userAnswers[q.questionNumber] === opt.key ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-600'}">${opt.key}</span>
                                                <span class="font-bold text-sm">${opt.value}</span>
                                            </button>
                                        `).join('')}
                                    </div>

                                    <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                        <button class="ask-tutor-btn text-xs font-black text-brand-primary uppercase tracking-widest hover:bg-brand-primary/10 px-4 py-2 rounded-lg transition-colors" data-idx="${idx}">🎓 Yardım İste</button>
                                    </div>
                                </div>
                            `;
            }).join('')}
                    </div>

                    <!-- Sidebar -->
                    <aside class="lg:col-span-1 order-1 lg:order-2">
                        <div class="sticky top-24 space-y-6">
                            <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800 p-6 overflow-hidden">
                                <div class="text-center mb-6">
                                    <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Kalan Süre</p>
                                    <div id="timer-display" class="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">00:00</div>
                                </div>
                                <div class="grid grid-cols-5 gap-2 mb-8">
                                    ${questions.map(q => `
                                        <button class="nav-q-btn w-full aspect-square flex items-center justify-center rounded-lg text-xs font-black transition-all ${userAnswers[q.questionNumber] ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200'} " data-num="${q.questionNumber}">${q.questionNumber}</button>
                                    `).join('')}
                                </div>
                                <button id="submit-btn" class="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 uppercase tracking-widest text-xs">
                                    Sınavı Bitir
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            `;

            // Sidebar Events
            container.querySelector('#submit-btn').onclick = handleSubmit;
            container.querySelectorAll('.nav-q-btn').forEach(btn => {
                btn.onclick = () => container.querySelector(`#q-${btn.dataset.num}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
            });

            // Option Selection
            container.querySelectorAll('.option-btn').forEach(btn => {
                btn.onclick = () => {
                    const qNum = parseInt(btn.dataset.q);
                    const opt = btn.dataset.opt;
                    updateAnswer(qNum, opt);
                    render(); // Re-render to update UI (specifically sidebar markers and selected state)
                };
            });

            // Tutor Buttons
            container.querySelectorAll('.ask-tutor-btn').forEach(btn => {
                btn.onclick = () => handleAskTutor(questions[parseInt(btn.dataset.idx)]);
            });

            startTimer();
            updateTimerUI(timeLeft);
        }

        if (localState.error) {
            const errArea = container.querySelector('#error-area');
            if (errArea) errArea.appendChild(ErrorMessage(localState.error));
        }
    };

    render();
    return container;
};
