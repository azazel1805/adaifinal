import globalStore from '../store';
import { generateStudyPlan } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderStudyPlanner = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    const getUserKey = () => {
        const { user } = globalStore.getState();
        return user?.uid || user?.email || 'guest';
    };

    const getInitialState = () => {
        const userKey = getUserKey();
        const planKey = `study-plan-${userKey}`;
        const reportKey = `placement-test-report-${userKey}`;

        return {
            savedPlan: JSON.parse(localStorage.getItem(planKey)) || null,
            cefrReport: JSON.parse(localStorage.getItem(reportKey)) || null,
            targetDate: '',
            studyHours: 5,
            isLoading: false,
            error: ''
        };
    };

    let state = getInitialState();

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleGenerate = async () => {
        if (!state.targetDate || state.studyHours < 1) return setState({ error: 'Lütfen geçerli bir tarih ve süre girin.' });

        const perf = globalStore.getState().performanceStats || {};
        if (Object.keys(perf).length === 0 && !state.cefrReport) {
            return setState({ error: 'Plan için önce Seviye Tespit Sınavı çözmeli veya pratik yapmalısınız.' });
        }

        setState({ isLoading: true, error: '' });
        try {
            const res = await generateStudyPlan(perf, state.targetDate, state.studyHours, state.cefrReport);
            const plan = JSON.parse(res);
            const userKey = getUserKey();
            localStorage.setItem(`study-plan-${userKey}`, JSON.stringify(plan));
            setState({ savedPlan: plan, isLoading: false });
        } catch { setState({ error: 'Plan oluşturulamadı.', isLoading: false }); }
    };

    const handleDelete = () => {
        const userKey = getUserKey();
        localStorage.removeItem(`study-plan-${userKey}`);
        setState({ savedPlan: null, error: '' });
    };

    const render = () => {
        if (state.savedPlan) {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div class="space-y-4 text-center md:text-left">
                            <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Tactical Roadmap</h2>
                            <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl">Heba edilmeyen her saniye, hedefe giden bir adımdır. Senin için optimize edilmiş çalışma planın hazır.</p>
                        </div>
                        <button id="del-btn" class="bg-red-500/10 text-red-500 font-black px-8 py-4 rounded-2xl border-2 border-red-500/20 uppercase tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all">YENİ PLAN OLUŞTUR 🚮</button>
                    </div>

                    <div class="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl border-4 border-white/5 space-y-6 animate-slideUp">
                         <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4 block underline decoration-brand-primary decoration-4 underline-offset-8">ALEX'İN TAVSİYESİ</span>
                         <p class="text-slate-400 font-bold italic text-lg leading-relaxed">"${state.savedPlan.overallRecommendation}"</p>
                    </div>

                    <div class="space-y-10">
                        ${state.savedPlan.weeks.map(w => `
                            <div class="bg-white dark:bg-slate-900 p-10 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10 animate-slideUp">
                                <div class="flex items-center gap-6 pb-6 border-b border-slate-50 dark:border-slate-800">
                                    <div class="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary font-black text-2xl shadow-inner">${w.weekNumber}</div>
                                    <div>
                                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">WEEKLY TARGET</p>
                                        <h3 class="text-2xl font-black text-slate-900 dark:text-white uppercase italic">${w.weeklyFocus}</h3>
                                    </div>
                                </div>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    ${w.dailyTasks.map(d => `
                                        <div class="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6">
                                            <h4 class="font-black text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
                                                <span class="w-2 h-2 rounded-full bg-brand-primary"></span> ${d.day}
                                            </h4>
                                            <ul class="space-y-4">
                                                ${d.tasks.map(t => `
                                                    <li class="flex items-start gap-3">
                                                        <span class="text-brand-primary mt-1">▹</span>
                                                        ${t.action ? `
                                                            <button class="nav-btn text-left text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-brand-primary transition-all" data-tab="${t.action.navigateTo}">${t.description}</button>
                                                        ` : `<span class="text-sm font-bold text-slate-600 dark:text-slate-400">${t.description}</span>`}
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } else {
            const today = new Date().toISOString().split('T')[0];
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">📅</div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-secondary">Strategic Planner</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mt-6">Verilerinizden süzülen bir başarı rotası. Mevsimlik hedefleriniz, haftalık odağınız ve günlük görevleriniz, yapay zeka tarafından size özel kurgulanır.</p>
                    </div>

                    <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 max-w-4xl mx-auto space-y-12">
                        ${state.cefrReport ? `
                            <div class="p-6 bg-brand-primary/5 rounded-[2rem] border-2 border-brand-primary/20 flex items-center gap-6 animate-pulseStep">
                                <div class="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">${state.cefrReport.overallCefrLevel}</div>
                                <p class="text-brand-primary font-black uppercase tracking-widest text-[10px]">Tespit edilen seviyeniz planlama verilerine dahil edildi.</p>
                            </div>
                        ` : ''}

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div class="space-y-4">
                                <label class="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">HEDEF TARİH</label>
                                <input type="date" id="target-date" min="${today}" value="${state.targetDate}" class="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-900 dark:text-white shadow-inner appearance-none">
                            </div>
                            <div class="space-y-4">
                                <label class="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">HAFTALIK EFOR (SAAT)</label>
                                <input type="number" id="study-hours" min="1" max="40" value="${state.studyHours}" class="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-900 dark:text-white shadow-inner appearance-none">
                            </div>
                        </div>

                        <div id="error-area"></div>
                        <button id="gen-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all">STRATEJİYİ OLUŞTUR 🚀</button>
                    </div>
                </div>
            `;
        }

        if (state.isLoading) {
            container.innerHTML = '<div class="py-20 flex flex-col items-center justify-center"></div>';
            container.firstChild.appendChild(Loader());
        }
        if (state.error) {
            const errArea = container.querySelector('#error-area');
            if (errArea) errArea.appendChild(ErrorMessage(state.error));
            else container.prepend(ErrorMessage(state.error));
        }

        attachEvents();
    };

    const attachEvents = () => {
        container.querySelector('#target-date')?.addEventListener('change', (e) => state.targetDate = e.target.value);
        container.querySelector('#study-hours')?.addEventListener('change', (e) => state.studyHours = parseInt(e.target.value));
        container.querySelector('#gen-btn')?.addEventListener('click', handleGenerate);
        container.querySelector('#del-btn')?.addEventListener('click', handleDelete);
        container.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => {
                window.location.hash = btn.dataset.tab;
            };
        });
    };

    render();
    return container;
};
