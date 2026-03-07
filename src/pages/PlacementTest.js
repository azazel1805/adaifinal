import store from '../store/index';
import { generatePlacementTest, evaluatePlacementTest } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';


const CEFR_LEVELS = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
const SKILL_ORDER = ['grammar', 'listening', 'reading', 'writing'];

const renderRadarChart = (skills) => {
    const size = 300;
    const center = size / 2;
    const numAxes = skills.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    const points = skills.map((skill, i) => {
        const level = CEFR_LEVELS[skill.cefrLevel] || 1;
        const value = (level / 6) * (center * 0.8);
        const x = center + value * Math.cos(angleSlice * i - Math.PI / 2);
        const y = center + value * Math.sin(angleSlice * i - Math.PI / 2);
        return `${x},${y}`;
    }).join(' ');

    let svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="mx-auto">`;
    // Grids
    for (let i = 0; i < 6; i++) {
        svg += `<circle cx="${center}" cy="${center}" r="${((i + 1) / 6) * (center * 0.8)}" fill="none" stroke="rgba(100, 116, 139, 0.1)" />`;
    }
    // Axes and labels
    skills.forEach((skill, i) => {
        const x = center + (center * 0.95) * Math.cos(angleSlice * i - Math.PI / 2);
        const y = center + (center * 0.95) * Math.sin(angleSlice * i - Math.PI / 2);
        svg += `
            <line x1="${center}" y1="${center}" x2="${center + (center * 0.8) * Math.cos(angleSlice * i - Math.PI / 2)}" y2="${center + (center * 0.8) * Math.sin(angleSlice * i - Math.PI / 2)}" stroke="rgba(100,116,139,0.1)" />
            <text x="${x}" y="${y}" text-anchor="middle" dy="${y > center ? '1.2em' : '-0.5em'}" style="font-size:10px; font-weight:900; fill: #94a3b8; text-transform:uppercase; letter-spacing:0.1em;">${skill.skill}</text>
        `;
    });
    // Data polygon
    svg += `<polygon points="${points}" class="fill-brand-primary/40 stroke-brand-primary" stroke-width="3" />`;
    svg += `</svg>`;
    return svg;
};

export const renderPlacementTest = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10';

    const getReportKey = () => {
        const { user } = store.getState();
        return user ? `placement-test-report-${user.uid}` : 'placement-test-report-guest';
    };

    const loadReport = () => JSON.parse(localStorage.getItem(getReportKey())) || null;
    const saveReport = (report) => localStorage.setItem(getReportKey(), JSON.stringify(report));

    let state = {
        testState: loadReport() ? 'results' : 'intro', // 'intro', 'generating', 'testing', 'analyzing', 'results'
        error: '',
        testContent: null,
        userAnswers: { grammar: {}, listening: {}, reading: {}, writing: '' },
        currentSectionIndex: 0,
        isSpeaking: false,
        report: loadReport()
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleStartTest = async () => {
        setState({ testState: 'generating', error: '' });
        try {
            const resultText = await generatePlacementTest();
            const resultJson = JSON.parse(resultText);
            setState({
                testContent: resultJson,
                currentSectionIndex: 0,
                userAnswers: { grammar: {}, listening: {}, reading: {}, writing: '' },
                testState: 'testing'
            });
        } catch (e) {
            setState({ error: 'Sınav oluşturulamadı.', testState: 'intro' });
        }
    };

    const handleSubmit = async () => {
        setState({ testState: 'analyzing', error: '' });
        try {
            const resultText = await evaluatePlacementTest(state.testContent, state.userAnswers);
            const resultJson = JSON.parse(resultText);
            saveReport(resultJson);
            setState({ report: resultJson, testState: 'results' });
        } catch (e) {
            setState({ error: 'Değerlendirme hatası.', testState: 'testing' });
        }
    };

    const handlePlayAudio = (script) => {
        if (state.isSpeaking) {
            window.speechSynthesis.cancel();
            setState({ isSpeaking: false });
            return;
        }
        window.speechSynthesis.cancel();
        const ut = new SpeechSynthesisUtterance(script);
        ut.lang = 'en-US';
        ut.onstart = () => setState({ isSpeaking: true });
        ut.onend = () => setState({ isSpeaking: false });
        ut.onerror = () => setState({ isSpeaking: false });
        window.speechSynthesis.speak(ut);
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    ${renderContent()}
                </div>
            </div>
        `;

        if (state.testState === 'generating' || state.testState === 'analyzing') {
            container.querySelector('#loader-target')?.appendChild(Loader());
        }

        attachEvents();
    };

    const renderContent = () => {
        switch (state.testState) {
            case 'intro': return `
                <div class="text-center space-y-10">
                    <div class="w-24 h-24 bg-brand-primary/10 rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto">🧭</div>
                    <div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Placement Test</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto mt-6">Mevcut İngilizce seviyenizi CEFR (A1-C2) ölçeğine göre belirlemek için yapay zeka destekli sınava katılın. Yaklaşık 20 dakika sürer.</p>
                    </div>
                    <button id="start-btn" class="bg-brand-primary text-white font-black px-12 py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">SINAVI BAŞLAT 🚀</button>
                    <div id="error-area"></div>
                </div>
            `;
            case 'generating': return `
                <div class="text-center space-y-8 py-10">
                    <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">KİŞİSELLEŞTİRİLMİŞ SINAVINIZ HAZIRLANIYOR</h2>
                    <div id="loader-target" class="flex justify-center"></div>
                    <p class="text-lg font-bold text-brand-primary italic animate-pulse">Dilbilgisi, okuma ve dinleme metinleri oluşturuluyor...</p>
                </div>
            `;
            case 'testing':
                const curKey = SKILL_ORDER[state.currentSectionIndex];
                const curData = state.testContent[curKey];
                const isLast = state.currentSectionIndex === SKILL_ORDER.length - 1;
                return `
                    <div class="animate-fadeIn space-y-10">
                        <div class="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-8">
                            <div>
                                <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-2">${curData.title}</h3>
                                <div class="flex items-center gap-2">
                                    <div class="h-1.5 w-48 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div class="h-full bg-brand-primary rounded-full transition-all" style="width: ${((state.currentSectionIndex + 1) / SKILL_ORDER.length) * 100}%"></div>
                                    </div>
                                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">${state.currentSectionIndex + 1} / ${SKILL_ORDER.length}</span>
                                </div>
                            </div>
                        </div>

                        ${curData.script ? `
                            <div class="flex items-center gap-6 bg-slate-50 dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-dashed border-slate-100 dark:border-slate-700">
                                <button id="play-btn" class="w-16 h-16 rounded-2xl bg-brand-primary text-white shadow-xl flex items-center justify-center text-3xl hover:scale-105 active:scale-95 transition-all outline-none">
                                    ${state.isSpeaking ? '⏹️' : '🔊'}
                                </button>
                                <div>
                                    <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">${state.isSpeaking ? 'METİN OKUNUYOR...' : 'DİNLEME PARÇASINI OYNAT'}</p>
                                    <p class="text-xs font-bold text-slate-400 mt-1 italic">Kulaklık kullanmanız önerilir.</p>
                                </div>
                            </div>
                        ` : ''}

                        ${curData.passage ? `
                            <div class="bg-slate-950 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div class="absolute bottom-0 right-0 p-8 text-8xl opacity-10 select-none grayscale">📖</div>
                                <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-6">OKUMA PARÇASI</h4>
                                <p class="text-sm font-medium text-slate-300 leading-relaxed italic whitespace-pre-wrap">${curData.passage}</p>
                            </div>
                        ` : ''}

                        <div class="space-y-10">
                            ${curData.questions?.map((q, i) => `
                                <div class="space-y-4">
                                    <p class="text-lg font-black text-slate-900 dark:text-white"><span class="text-brand-primary opacity-50 mr-4">Q${i + 1}.</span>${q.question}</p>
                                    <div class="grid gap-3">
                                        ${q.options.map(opt => {
                    const isSel = state.userAnswers[curKey][i] === opt;
                    return `
                                                <label class="flex items-center p-5 rounded-2xl border-2 font-black text-sm transition-all cursor-pointer ${isSel ? 'bg-brand-primary border-brand-primary text-white shadow-xl -translate-y-1' : 'bg-slate-50 dark:bg-slate-800 border-transparent text-slate-600 dark:text-slate-300 hover:border-brand-primary/20'}">
                                                    <input type="radio" name="q-${i}" class="hidden" value="${opt}" ${isSel ? 'checked' : ''}>
                                                    <span class="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center mr-4 text-[10px]">${opt.charAt(0)}</span>
                                                    <span>${opt}</span>
                                                </label>
                                            `;
                }).join('')}
                                    </div>
                                </div>
                            `).join('') || ''}

                            ${curData.writingPrompt ? `
                                <div class="space-y-4">
                                    <div class="bg-brand-primary/5 p-8 rounded-[2rem] border-2 border-brand-primary/10 mb-6">
                                        <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">WRITING PROMPT</h4>
                                        <p class="text-lg font-black text-slate-800 dark:text-white leading-tight uppercase italic">${curData.writingPrompt}</p>
                                    </div>
                                    <textarea id="writing-area" placeholder="Metninizi buraya yazın (en az 50-100 kelime)..." class="w-full h-80 p-8 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2.5rem] focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none font-bold text-slate-900 dark:text-white transition-all text-lg shadow-inner resize-none">${state.userAnswers.writing}</textarea>
                                </div>
                            ` : ''}
                        </div>

                        <div class="flex justify-between items-center pt-10 border-t border-slate-50 dark:border-slate-800">
                             <button id="prev-btn" class="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-950 disabled:opacity-20" ${state.currentSectionIndex === 0 ? 'disabled' : ''}>&larr; GEÇMİŞ BÖLÜM</button>
                             ${isLast ?
                        `<button id="submit-btn" class="bg-green-500 text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">ANALİZ İÇİN GÖNDER ✅</button>` :
                        `<button id="next-btn" class="bg-brand-primary text-white px-10 py-5 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">SIRADAKİ BÖLÜM &rarr;</button>`
                    }
                        </div>
                    </div>
                `;
            case 'analyzing': return `
                <div class="text-center space-y-8 py-10">
                    <h2 class="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">SONUÇLARINIZ DEĞERLENDİRİLİYOR</h2>
                    <div id="loader-target" class="flex justify-center"></div>
                    <p class="text-lg font-bold text-brand-primary italic animate-pulse">Yapay zeka tüm cevaplarınızı mikroskop altına alıyor...</p>
                </div>
            `;
            case 'results':
                const rep = state.report;
                return `
                    <div class="animate-zoomIn space-y-10">
                        <div class="text-center">
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4 block">SEVİYE BELİRLEME RAPORU</span>
                            <div class="inline-block relative">
                                <span class="text-[12rem] font-black text-brand-primary tabular-nums tracking-tighter leading-none opacity-10 absolute inset-0 -top-4">${rep.overallCefrLevel}</span>
                                <span class="text-9xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter relative z-10">${rep.overallCefrLevel}</span>
                            </div>
                            <p class="text-lg font-bold text-slate-500 max-w-xl mx-auto mt-6 italic">"${rep.detailedFeedback}"</p>
                        </div>

                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-slate-50 dark:bg-slate-800/20 p-10 rounded-[3rem] border-2 border-slate-50 dark:border-slate-800">
                            <div class="flex justify-center scale-110">
                                ${renderRadarChart(rep.skillReports)}
                            </div>
                            <div class="space-y-4">
                                ${rep.skillReports.map(sr => `
                                    <div class="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 group hover:shadow-lg transition-all">
                                        <div class="flex justify-between items-center mb-3">
                                            <h4 class="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight">${sr.skill}</h4>
                                            <span class="font-black text-brand-primary px-3 py-1 bg-brand-primary/10 rounded-xl text-[10px]">${sr.cefrLevel}</span>
                                        </div>
                                        <p class="text-[10px] font-bold text-slate-400 leading-relaxed italic">${sr.feedback}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="flex justify-center pt-6">
                            <button id="retake-btn" class="bg-slate-900 dark:bg-black text-white px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all outline-none">SINAVI YENİDEN ÇÖZ 🔄</button>
                        </div>
                    </div>
                `;
        }
    };

    const attachEvents = () => {
        const startBtn = container.querySelector('#start-btn');
        if (startBtn) startBtn.onclick = handleStartTest;

        const nextBtn = container.querySelector('#next-btn');
        if (nextBtn) nextBtn.onclick = () => setState({ currentSectionIndex: state.currentSectionIndex + 1 });

        const prevBtn = container.querySelector('#prev-btn');
        if (prevBtn) prevBtn.onclick = () => setState({ currentSectionIndex: state.currentSectionIndex - 1 });

        const submitBtn = container.querySelector('#submit-btn');
        if (submitBtn) submitBtn.onclick = handleSubmit;

        const retakeBtn = container.querySelector('#retake-btn');
        if (retakeBtn) retakeBtn.onclick = () => {
            localStorage.removeItem(getReportKey());
            setState({ testState: 'intro', report: null, testContent: null });
        };

        const playBtn = container.querySelector('#play-btn');
        if (playBtn) playBtn.onclick = () => handlePlayAudio(state.testContent[SKILL_ORDER[state.currentSectionIndex]].script);

        const writingArea = container.querySelector('#writing-area');
        if (writingArea) writingArea.oninput = (e) => state.userAnswers.writing = e.target.value;

        container.querySelectorAll('input[type="radio"]').forEach(inp => {
            inp.onchange = (e) => {
                const qIdx = parseInt(inp.name.split('-')[1]);
                const curKey = SKILL_ORDER[state.currentSectionIndex];
                state.userAnswers[curKey][qIdx] = e.target.value;
                render();
            };
        });
    };

    render();
    return container;
};
