import store from '../store/index';
import { analyzeQuestion, generateSimilarQuiz } from '../services/geminiService';
import { addHistoryItem } from '../store/history';
import { trackAction } from '../store/challenge';
import { parseGeneratedQuestions } from '../utils/questionParser';
import { Loader, ErrorMessage } from '../components/Common';
import { renderAnalysisResultDisplay } from '../components/AnalysisResultDisplay';

export const renderQuestionAnalyzer = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto';

    let state = {
        questionInput: '',
        isLoading: false,
        error: '',
        analysisResults: null // Array of { id, question, analysis, quiz: { isLoading, error, questions, userAnswers, showResults } }
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleAnalyze = async () => {
        const text = state.questionInput.trim();
        if (!text) {
            setState({ error: 'Lütfen analiz edilecek bir soru veya metin girin.' });
            return;
        }

        setState({ isLoading: true, error: '', analysisResults: [] });

        try {
            const parsedQuiz = parseGeneratedQuestions(text);

            if (parsedQuiz.questions.length > 0) {
                // Multi-question flow
                const results = [];
                for (const q of parsedQuiz.questions) {
                    const resText = await analyzeQuestion(q.fullText);
                    const resJson = JSON.parse(resText);
                    const newRes = {
                        id: `${Date.now()}-${Math.random()}`,
                        question: q.fullText,
                        analysis: resJson,
                        quiz: null
                    };
                    results.push(newRes);
                    addHistoryItem(q.fullText, resJson);
                    trackAction('analyze');
                    setState({ analysisResults: [...results] });
                }
            } else {
                // Single question flow
                const resText = await analyzeQuestion(text);
                const resJson = JSON.parse(resText);
                const results = [{
                    id: `${Date.now()}-${Math.random()}`,
                    question: text,
                    analysis: resJson,
                    quiz: null
                }];
                addHistoryItem(text, resJson);
                trackAction('analyze');
                setState({ analysisResults: results });
            }
        } catch (e) {
            setState({ error: e.message || 'Analiz sırasında bir hata oluştu.' });
        } finally {
            setState({ isLoading: false });
        }
    };

    const handleGenerateQuiz = async (resId) => {
        const results = state.analysisResults.map(r =>
            r.id === resId ? { ...r, quiz: { isLoading: true, error: '', questions: [], userAnswers: {}, showResults: false } } : r
        );
        setState({ analysisResults: results });

        const target = state.analysisResults.find(r => r.id === resId);
        try {
            const quizText = await generateSimilarQuiz(target.analysis, target.question);
            const parsed = parseGeneratedQuestions(quizText);

            if (parsed.questions.length === 0) throw new Error("Quiz formatı hatalı.");

            const updatedResults = state.analysisResults.map(r =>
                r.id === resId ? { ...r, quiz: { isLoading: false, error: '', questions: parsed.questions, userAnswers: {}, showResults: false } } : r
            );
            setState({ analysisResults: updatedResults });
        } catch (e) {
            const updatedResults = state.analysisResults.map(r =>
                r.id === resId ? { ...r, quiz: { ...r.quiz, isLoading: false, error: e.message || 'Quiz oluşturulamadı.' } } : r
            );
            setState({ analysisResults: updatedResults });
        }
    };

    const handleQuizAnswer = (resId, qId, ans) => {
        const results = state.analysisResults.map(r => {
            if (r.id === resId && r.quiz) {
                return { ...r, quiz: { ...r.quiz, userAnswers: { ...r.quiz.userAnswers, [qId]: ans } } };
            }
            return r;
        });
        setState({ analysisResults: results });
    };

    const handleCheckQuiz = (resId) => {
        const results = state.analysisResults.map(r =>
            (r.id === resId && r.quiz) ? { ...r, quiz: { ...r.quiz, showResults: true } } : r
        );
        setState({ analysisResults: results });
    };

    const handleAskTutor = (qContext) => {
        store.setState({ initialChatMessage: qContext });
        window.dispatchEvent(new CustomEvent('navigate', { detail: 'chat' }));
    };

    const render = () => {
        container.innerHTML = `
            <div class="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800 transition-all duration-300">
                <div class="flex items-center gap-4 mb-6">
                    <div class="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-2xl">🔍</div>
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Soru Analisti</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium">Sorunu yapıştır, detaylı analizini al ve benzer sorularla pratik yap.</p>
                    </div>
                </div>
                
                <div class="relative group">
                    <textarea id="question-input" placeholder="Soru metnini buraya yapıştırın..." class="w-full h-48 p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none text-slate-800 dark:text-slate-200 resize-none font-mono text-sm leading-relaxed transition-all duration-300 disabled:opacity-50" ${state.isLoading ? 'disabled' : ''}>${state.questionInput}</textarea>
                    <div class="absolute bottom-4 right-4 text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-focus-within:opacity-100 transition-opacity">CTRL + ENTER İLE GÖNDER</div>
                </div>

                <div id="error-area" class="mt-4"></div>

                <button id="analyze-btn" class="mt-6 w-full bg-brand-primary hover:bg-brand-secondary text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-2xl hover:-translate-y-1 uppercase tracking-widest text-xs" ${state.isLoading ? 'disabled' : ''}>
                    ${state.isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                </button>
            </div>

            <div id="results-container" class="space-y-8 mt-12 animate-fadeIn">
                ${state.analysisResults && state.analysisResults.length > 0 ? `
                    <div class="flex items-center gap-3 mb-6">
                        <div class="h-1 w-8 bg-brand-primary rounded-full"></div>
                        <h2 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Analiz Sonuçları</h2>
                    </div>
                ` : ''}
            </div>
            ${state.isLoading ? '<div class="py-12 flex justify-center"><div id="loader-target"></div></div>' : ''}
        `;

        const textarea = container.querySelector('#question-input');
        textarea.addEventListener('input', (e) => state.questionInput = e.target.value);
        textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter' && !state.isLoading) handleAnalyze();
        });

        container.querySelector('#analyze-btn').onclick = handleAnalyze;

        if (state.isLoading) {
            container.querySelector('#loader-target').appendChild(Loader());
        }

        if (state.error) {
            container.querySelector('#error-area').appendChild(ErrorMessage(state.error));
        }

        const resultsContainer = container.querySelector('#results-container');
        if (state.analysisResults) {
            state.analysisResults.forEach((res, idx) => {
                const resEl = document.createElement('div');
                resEl.className = 'bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border-2 border-slate-100 dark:border-slate-800 animate-fadeIn';
                resEl.innerHTML = `
                    <div class="flex justify-between items-start mb-8">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center font-black">${idx + 1}</div>
                            <h3 class="text-xl font-black text-slate-900 dark:text-white">${state.analysisResults.length > 1 ? `Soru ${idx + 1}` : 'Soru Analizi'}</h3>
                        </div>
                    </div>
                    
                    <div class="mb-8">
                        <h4 class="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-[0.2em] flex items-center gap-2">
                            <span>📝</span> Orijinal Soru
                        </h4>
                        <div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-inner font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">${res.question}</div>
                    </div>

                    <div id="analysis-display-${res.id}"></div>

                    <div class="mt-8 pt-8 border-t-2 border-slate-50 dark:border-slate-800/50">
                        ${!res.quiz ? `
                            <button class="generate-quiz-btn w-full bg-slate-900 dark:bg-brand-primary hover:bg-black dark:hover:bg-brand-secondary text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 uppercase tracking-widest text-xs" data-id="${res.id}">
                                🚀 BENZER SORULUK PRATİK TESTİ OLUŞTUR
                            </button>
                        ` : `
                            <div class="space-y-6">
                                <div class="flex items-center justify-between">
                                    <h4 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">Pratik Testi</h4>
                                    ${res.quiz.isLoading ? '<div class="quiz-loader-target"></div>' : ''}
                                </div>
                                
                                <div class="quiz-error-target"></div>

                                ${res.quiz.questions.length > 0 ? `
                                    <div class="space-y-8 mt-4">
                                        ${res.quiz.questions.map((q, qIdx) => {
                    const showResults = res.quiz.showResults;
                    const userAnswer = res.quiz.userAnswers[q.id];
                    const isCorrect = userAnswer === q.correctAnswer;
                    return `
                                                <div class="space-y-4">
                                                    <div class="flex items-start gap-3">
                                                        <span class="text-brand-primary font-black text-sm pt-0.5">${qIdx + 1}.</span>
                                                        <p class="font-bold text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">${q.questionText}</p>
                                                    </div>
                                                    <div class="grid grid-cols-1 gap-2 pl-6">
                                                        ${q.options.map(opt => {
                        const isSelected = userAnswer === opt.key;
                        const isTrue = opt.key === q.correctAnswer;
                        let classes = "w-full flex items-center p-3 rounded-xl border-2 transition-all duration-300 text-left text-sm font-bold ";

                        if (showResults) {
                            if (isTrue) classes += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300";
                            else if (isSelected) classes += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 line-through";
                            else classes += "border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 opacity-50";
                        } else if (isSelected) {
                            classes += "border-brand-primary bg-brand-primary/10 text-brand-primary";
                        } else {
                            classes += "border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400";
                        }

                        return `
                                                                <button class="quiz-opt-btn ${classes}" data-res-id="${res.id}" data-q-id="${q.id}" data-ans="${opt.key}" ${showResults ? 'disabled' : ''}>
                                                                    <span class="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black mr-3 ${isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'}">${opt.key}</span>
                                                                    ${opt.value}
                                                                </button>
                                                            `;
                    }).join('')}
                                                    </div>
                                                    ${showResults && !isCorrect ? `
                                                        <div class="mt-3 text-right">
                                                            <button class="quiz-tutor-btn text-[10px] font-black text-sky-600 dark:text-sky-400 hover:underline uppercase tracking-widest" data-res-id="${res.id}" data-q-id="${q.id}">💡 NEDEN YANLIŞ?</button>
                                                        </div>
                                                    ` : ''}
                                                </div>
                                            `;
                }).join('')}
                                        
                                        ${!res.quiz.showResults ? `
                                            <button class="check-quiz-btn w-full bg-teal-500 hover:bg-teal-600 text-white font-black py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-1 uppercase tracking-widest text-xs" data-id="${res.id}">
                                                CEVAPLARI KONTROL ET
                                            </button>
                                        ` : ''}
                                    </div>
                                ` : ''}
                            </div>
                        `}
                    </div>
                `;
                resultsContainer.appendChild(resEl);

                // Re-attach analysis result component
                resEl.querySelector(`#analysis-display-${res.id}`).appendChild(renderAnalysisResultDisplay(res.analysis));

                // Attach quiz events
                const genQuizBtn = resEl.querySelector('.generate-quiz-btn');
                if (genQuizBtn) genQuizBtn.onclick = () => handleGenerateQuiz(res.id);

                if (res.quiz) {
                    if (res.quiz.isLoading) resEl.querySelector('.quiz-loader-target').appendChild(Loader());
                    if (res.quiz.error) resEl.querySelector('.quiz-error-target').appendChild(ErrorMessage(res.quiz.error));

                    resEl.querySelectorAll('.quiz-opt-btn').forEach(btn => {
                        btn.onclick = () => handleQuizAnswer(btn.dataset.resId, parseInt(btn.dataset.qId), btn.dataset.ans);
                    });

                    const checkBtn = resEl.querySelector('.check-quiz-btn');
                    if (checkBtn) checkBtn.onclick = () => handleCheckQuiz(res.id);

                    resEl.querySelectorAll('.quiz-tutor-btn').forEach(btn => {
                        btn.onclick = () => {
                            const q = res.quiz.questions.find(quest => quest.id === parseInt(btn.dataset.qId));
                            const userAnswer = res.quiz.userAnswers[q.id];
                            const userAnswerValue = q.options.find(o => o.key === userAnswer)?.value || 'Boş bırakıldı';
                            const correctAnswerValue = q.options.find(o => o.key === q.correctAnswer)?.value;
                            const questionContext = q.fullText.replace(/Correct answer: [A-E]/i, '').trim();
                            const context = `Merhaba Onur, bu soruyu yanlış yaptım. Bana nedenini açıklayabilir misin?\n\n---SORU---\n${questionContext}\n\n---CEVAPLARIM---\nBenim Cevabım: ${userAnswer || 'Boş'}) ${userAnswerValue}\nDoğru Cevap: ${q.correctAnswer}) ${correctAnswerValue}`;
                            handleAskTutor(context);
                        };
                    });
                }
            });
        }
    };

    render();
    return container;
};
