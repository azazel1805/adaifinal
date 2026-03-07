import store from '../store/index';
import { clearHistory } from '../store/history';
import { clearExamHistory } from '../store/examHistory';

const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}dk ${secs}sn`;
};

const renderAnalysisResult = (result) => {
    return `
        <div class="space-y-8 animate-fadeIn">
            <div class="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden relative group">
                <div class="absolute top-0 right-0 p-6 text-6xl opacity-10 grayscale group-hover:rotate-12 transition-transform select-none">📊</div>
                <h4 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-6">Analiz Özeti</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div class="space-y-1">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soru Tipi</span>
                        <p class="text-sm font-black text-slate-900 dark:text-white">${result.soruTipi || 'Belirtilmemiş'}</p>
                    </div>
                    <div class="space-y-1">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konu</span>
                        <p class="text-sm font-black text-slate-900 dark:text-white">${result.konu || 'Belirtilmemiş'}</p>
                    </div>
                    <div class="space-y-1">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zorluk</span>
                        <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">${result.zorlukSeviyesi || 'Belirtilmemiş'}</p>
                    </div>
                    <div class="space-y-1">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doğru Cevap</span>
                        <p class="text-2xl font-black text-green-500 tracking-tighter">${result.dogruCevap || 'N/A'}</p>
                    </div>
                </div>
            </div>

            ${result.analiz ? `
                <div class="bg-white dark:bg-slate-900 p-8 pt-0 animate-slideRight">
                    <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">Detaylı Çözüm Adımları</h4>
                    <div class="grid gap-4">
                        ${Object.entries(result.analiz).map(([key, value]) => `
                            <div class="flex items-start gap-4 group">
                                <div class="w-1.5 h-1.5 rounded-full bg-brand-primary mt-2 group-hover:scale-150 transition-transform"></div>
                                <div class="flex-1">
                                    <strong class="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">${key.replace(/_/g, ' ')}</strong>
                                    <p class="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed">${value}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div class="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                 <div class="absolute bottom-0 right-0 p-6 text-6xl opacity-10 grayscale group-hover:scale-110 transition-transform select-none">💡</div>
                 <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">Kapsamlı Açıklama</h4>
                 <p class="text-sm font-medium text-slate-300 leading-relaxed italic">"${result.detayliAciklama || 'Açıklama bulunamadı.'}"</p>
            </div>

            ${result.digerSecenekler?.length ? `
                <div class="space-y-4">
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">Diğer Seçeneklerin Çürütülmesi</h4>
                    <div class="grid gap-3">
                        ${result.digerSecenekler.map(opt => `
                            <div class="bg-red-500/5 dark:bg-red-500/10 p-5 rounded-2xl border-l-4 border-red-500 transition-all hover:bg-red-500/10 dark:hover:bg-red-500/20">
                                <span class="text-sm font-black text-red-500 mr-2">${opt.secenek}:</span>
                                <span class="text-sm font-bold text-slate-600 dark:text-slate-400">${opt.aciklama}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
};

const renderExamResult = (result, onAskTutor) => {
    return `
        <div class="space-y-8 animate-fadeIn">
            <div class="bg-brand-primary text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-8 text-8xl opacity-10 grayscale select-none">🏆</div>
                <h3 class="text-[10px] font-black uppercase tracking-[0.4em] mb-8 opacity-60">PDF SINAV SONUCU</h3>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-8">
                    <div>
                        <span class="text-[10px] font-black uppercase tracking-widest opacity-60">DOĞRU</span>
                        <p class="text-4xl font-black tracking-tighter">${result.score}</p>
                    </div>
                    <div>
                        <span class="text-[10px] font-black uppercase tracking-widest opacity-60">TOPLAM</span>
                        <p class="text-4xl font-black tracking-tighter">${result.totalQuestions}</p>
                    </div>
                    <div>
                        <span class="text-[10px] font-black uppercase tracking-widest opacity-60">BAŞARI</span>
                        <p class="text-4xl font-black tracking-tighter">${((result.score / result.totalQuestions) * 100).toFixed(0)}%</p>
                    </div>
                    <div>
                        <span class="text-[10px] font-black uppercase tracking-widest opacity-60">SÜRE</span>
                        <p class="text-2xl font-black h-10 flex items-end">${formatTime(result.timeTaken)}</p>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border-2 border-slate-50 dark:border-slate-800">
                <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] mb-8">KONU BAZLI PERFORMANS</h4>
                <div class="grid gap-6">
                    ${Object.entries(result.performanceByType).map(([type, stats]) => `
                        <div class="space-y-2">
                            <div class="flex justify-between items-end">
                                <span class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">${type}</span>
                                <span class="text-[10px] font-black text-slate-400">${stats.correct} / ${stats.total}</span>
                            </div>
                            <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div class="h-full bg-brand-primary rounded-full transition-all duration-1000" style="width: ${(stats.correct / stats.total) * 100}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-6">
                <h4 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4">TÜM SORULARIN İNCELENMESİ</h4>
                <div class="grid gap-4">
                    ${result.questions.map((q, i) => {
        const userAnswer = result.userAnswers[q.questionNumber];
        const isCorrect = userAnswer === q.correctAnswer;
        return `
                            <div class="bg-white dark:bg-slate-800/50 p-6 rounded-3xl border-2 transition-all group ${isCorrect ? 'border-green-100 dark:border-green-900/10' : 'border-red-100 dark:border-red-900/10'}">
                                <div class="flex items-start gap-4 mb-4">
                                    <span class="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">${q.questionNumber}</span>
                                    <p class="text-sm font-black text-slate-900 dark:text-white leading-relaxed flex-1">${q.questionText}</p>
                                </div>
                                <div class="grid gap-2 pl-12">
                                    ${q.options.map(opt => {
            const isUser = opt.key === userAnswer;
            const isCor = opt.key === q.correctAnswer;
            let cls = "text-xs font-bold p-2 px-3 rounded-lg border ";
            if (isCor) cls += "bg-green-500/10 border-green-500/20 text-green-600";
            else if (isUser) cls += "bg-red-500/10 border-red-500/20 text-red-600 line-through";
            else cls += "bg-transparent border-transparent text-slate-400";
            return `
                                            <div class="${cls}">
                                                <span class="mr-2">${opt.key})</span>
                                                <span>${opt.value}</span>
                                                ${isCor ? ' <span class="text-[8px] font-black ml-2 uppercase opacity-60">(DOĞRU)</span>' : ''}
                                                ${isUser && !isCor ? ' <span class="text-[8px] font-black ml-2 uppercase opacity-60">(SENİN CEVABIN)</span>' : ''}
                                            </div>
                                        `;
        }).join('')}
                                </div>
                                ${!isCorrect ? `
                                    <div class="mt-4 text-right">
                                        <button class="ask-tutor-btn text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline" data-num="${q.questionNumber}">NEDEN YANLIŞ YAPTIM? ONUR'A SOR 💡</button>
                                    </div>
                                ` : ''}
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        </div>
    `;
};

export const renderHistory = (onAskTutor) => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    const getAnalysisList = () => {
        try { const h = store.getState().history; return h?.list || []; } catch { return []; }
    };
    const getExamList = () => {
        try { const e = store.getState().examHistory; return Array.isArray(e) ? e : (e?.list || []); } catch { return []; }
    };

    let state = {
        activeTab: 'analysis',
        selectedAnalysis: null,
        selectedExam: null
    };

    // Init selections
    const al = getAnalysisList();
    const el = getExamList();
    state.selectedAnalysis = al[0] || null;
    state.selectedExam = el[0] || null;
    if (el.length > 0 && al.length === 0) state.activeTab = 'exam';

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const render = () => {
        const currentAnalysisList = getAnalysisList();
        const currentExamList = getExamList();

        if (currentAnalysisList.length === 0 && currentExamList.length === 0) {
            container.innerHTML = `
                <div class="text-center py-20 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800">
                    <span class="text-8xl block mb-8">🗂️</span>
                    <h2 class="text-3xl font-black text-slate-800 dark:text-white mb-2 uppercase italic tracking-tight">Henüz Geçmişin Yok</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Analizlerin ve deneme sınavların burada saklanacak. Hadi bir şeyler çalışalım!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic flex items-center gap-4">
                            <span>History</span>
                        </h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium">Öğrenme yolculuğundaki her adımı burada bulabilirsin.</p>
                    </div>

                    <div class="flex items-center gap-4">
                        <div class="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl flex shadow-inner">
                            <button class="tab-btn px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.activeTab === 'analysis' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500'}" data-tab="analysis">Analizler</button>
                            <button class="tab-btn px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${state.activeTab === 'exam' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-500'}" data-tab="exam">Deneme Sınavları</button>
                        </div>
                        <button id="clear-btn" class="bg-red-500/10 text-red-500 font-black px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Temizle</button>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <!-- Sidebar list -->
                    <div class="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 h-[700px] overflow-y-auto scrollbar-thin">
                        <div class="space-y-3">
                            ${state.activeTab === 'analysis' ?
                currentAnalysisList.map(item => `
                                    <button class="analysis-item-btn w-full text-left p-5 rounded-2xl transition-all border-2 ${state.selectedAnalysis?.id === item.id ? 'bg-brand-primary border-brand-primary text-white shadow-lg -translate-y-1' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-brand-primary/20'}" data-id="${item.id}">
                                        <p class="text-[10px] font-black mb-2 opacity-50 uppercase">${item.timestamp}</p>
                                        <p class="text-sm font-black truncate">${item.question}</p>
                                        <p class="text-[8px] font-black mt-2 uppercase tracking-widest">${item.analysis.soruTipi || 'Genel'}</p>
                                    </button>
                                `).join('') :
                currentExamList.map(item => `
                                    <button class="exam-item-btn w-full text-left p-5 rounded-2xl transition-all border-2 ${state.selectedExam?.id === item.id ? 'bg-brand-primary border-brand-primary text-white shadow-lg -translate-y-1' : 'bg-slate-50 dark:bg-slate-800/50 border-transparent hover:border-brand-primary/20'}" data-id="${item.id}">
                                        <div class="flex justify-between items-start mb-2">
                                            <p class="text-[10px] font-black opacity-50 uppercase">${item.timestamp}</p>
                                            <span class="text-xs font-black ${state.selectedExam?.id === item.id ? 'text-white' : 'text-brand-primary'} underline underline-offset-4 decoration-2">${item.score}/${item.totalQuestions}</span>
                                        </div>
                                        <p class="text-sm font-black uppercase italic">PDF Sınav Sonucu</p>
                                    </button>
                                `).join('')
            }
                        </div>
                    </div>

                    <!-- Detail pane -->
                    <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-2 border-slate-50 dark:border-slate-800 h-[700px] overflow-y-auto scrollbar-thin">
                        ${state.activeTab === 'analysis' ?
                (state.selectedAnalysis ? `
                                <div class="space-y-10">
                                    <div class="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                                         <div class="absolute top-0 left-0 p-6 text-2xl opacity-20 grayscale select-none">❔</div>
                                         <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">Analiz Edilen Soru</h4>
                                         <p class="text-sm font-bold leading-relaxed whitespace-pre-wrap">${state.selectedAnalysis.question}</p>
                                    </div>
                                    ${renderAnalysisResult(state.selectedAnalysis.analysis)}
                                </div>
                            ` : '<div class="h-full flex items-center justify-center text-slate-400 font-bold italic">Detay görmek için soldan bir analiz seçin.</div>') :
                (state.selectedExam ? renderExamResult(state.selectedExam, onAskTutor) : '<div class="h-full flex items-center justify-center text-slate-400 font-bold italic">Detay görmek için soldan bir sınav seçin.</div>')
            }
                    </div>
                </div>
            </div>
        `;

        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                const tab = btn.dataset.tab;
                const analyses = getAnalysisList();
                const exams = getExamList();
                setState({
                    activeTab: tab,
                    selectedAnalysis: analyses[0] || null,
                    selectedExam: exams[0] || null
                });
            };
        });

        container.querySelector('#clear-btn').onclick = () => {
            if (state.activeTab === 'analysis') clearHistory();
            else clearExamHistory();
            render();
        };

        container.querySelectorAll('.analysis-item-btn').forEach(btn => {
            btn.onclick = () => {
                const item = getAnalysisList().find(h => h.id === btn.dataset.id);
                setState({ selectedAnalysis: item });
            };
        });

        container.querySelectorAll('.exam-item-btn').forEach(btn => {
            btn.onclick = () => {
                const item = getExamList().find(h => h.id === btn.dataset.id);
                setState({ selectedExam: item });
            };
        });

        container.querySelectorAll('.ask-tutor-btn').forEach(btn => {
            btn.onclick = () => {
                const num = parseInt(btn.dataset.num);
                const q = state.selectedExam.questions.find(qq => qq.questionNumber === num);
                const userAnswer = state.selectedExam.userAnswers[num];
                const optionsText = q.options.map(opt => `${opt.key}) ${opt.value}`).join('\n');
                const context = `Merhaba Onur, deneme sınavındaki bu soruyu yanlış yaptım. Nedenini açıklayabilir misin?\n\n---SORU---\nSoru ${q.questionNumber}: ${q.questionText}\n\nSeçenekler:\n${optionsText}\n\n---CEVAPLARIM---\nBenim Cevabım: ${userAnswer || 'Boş'}\nDoğru Cevap: ${q.correctAnswer}`;
                if (onAskTutor) onAskTutor(context);
            };
        });
    };

    render();
    return container;
};
