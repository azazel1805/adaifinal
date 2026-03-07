import { analyzeConversationForReport, createSpeakingSimulatorSession } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

const scenarios = [
    { id: 'cafe_order', title: 'Ordering at a Cafe', description: 'Go into a cafe and order a drink and something to eat for yourself.', difficulty: 'Kolay', userRole: 'a customer at a cafe', aiRole: 'a friendly and patient cafe barista', aiWelcome: "Welcome to The Cozy Corner! What can I get for you today?", objectives: ["Order a large latte.", "Ask if they have any chocolate cake.", "Order a piece of cake if they have it.", "Confirm your total order."] },
    { id: 'hotel_checkin', title: 'Checking into a Hotel', description: 'Check into a hotel where you have a reservation and get information about your room.', difficulty: 'Kolay', userRole: 'a tourist checking into a hotel', aiRole: 'a helpful hotel receptionist', aiWelcome: "Good evening! Welcome to the Grand Hotel. How can I assist you?", objectives: ["State that you have a reservation under your name.", "Ask if the room has a sea view.", "Inquire about the breakfast time.", "Ask what the Wi-Fi password is."] },
    { id: 'job_interview', title: 'Job Interview Simulation', description: 'Conduct a basic job interview for a software engineer position.', difficulty: 'Zor', userRole: 'a candidate interviewing for a junior software engineer role', aiRole: 'a hiring manager at a tech company', aiWelcome: "Hello, thanks for coming in. Please, have a seat. So, tell me a little bit about yourself.", objectives: ["Briefly introduce yourself and your background.", "Explain why you are interested in this role.", "Mention one of your key strengths.", "Ask a question about the company culture."] },
    { id: 'airport_checkin', title: 'Airport Check-in', description: 'Navigate through the airport check-in process for an international flight.', difficulty: 'Orta', userRole: 'A passenger traveling internationally', aiRole: 'An airline check-in agent', aiWelcome: "Next please! Hello, passenger. May I have your passport and ticket, please?", objectives: ["Provide your passport details.", "Ask to check in two bags.", "Request a window seat.", "Ask for the boarding gate number."] },
    { id: 'restaurant_complaint', title: 'Restaurant Complaint', description: 'Politely complain about a mistake in your order at a restaurant.', difficulty: 'Orta', userRole: 'A diner at a busy restaurant', aiRole: 'A polite but hurried waiter', aiWelcome: "Here is your steak, sir/ma'am. Enjoy your meal!", objectives: ["Politely state that this is not what you ordered.", "Explain that you ordered the vegetarian pasta.", "Ask how long it will take to get the correct dish.", "Remain polite but firm."] },
    { id: 'doctor_appointment', title: 'Doctor Appointment', description: 'Describe your symptoms and answer questions during a doctor\'s visit.', difficulty: 'Orta', userRole: 'A patient feeling unwell', aiRole: 'A general practitioner (doctor)', aiWelcome: "Hello there. So, what seems to be the problem today?", objectives: ["Describe your main symptoms (e.g., headache, fever).", "Explain how long you have been feeling unwell.", "Answer any questions the doctor has.", "Ask if you need to take any medication."] },
    { id: 'asking_directions', title: 'Asking for Directions', description: 'Ask a stranger for directions to a famous landmark.', difficulty: 'Kolay', userRole: 'A lost tourist in a new city', aiRole: 'A friendly local resident', aiWelcome: "Hi there! You look a bit lost. Can I help you?", objectives: ["Ask for directions to the nearest train station.", "Ask how long it takes to get there on foot.", "Ask if there is a bus that goes there.", "Thank the person for their help."] },
    { id: 'debating_movies', title: 'Debating Movies', description: 'Have a casual debate with a friend about which movie genre is the best.', difficulty: 'Zor', userRole: 'A movie enthusiast who loves Sci-Fi', aiRole: 'A friend who strongly prefers Action movies', aiWelcome: "I still think Action movies are the best. They are just so exciting! Don't you agree?", objectives: ["Disagree politely and state your preference.", "Give at least two reasons why your favorite genre is better.", "Respond to counter-arguments from your friend.", "Try to reach a compromise or agree to disagree."] }
];

export const renderSpeakingSimulator = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        view: 'selection', // selection, briefing, active, report
        scenario: null,
        conversation: [],
        isLoading: false,
        isListening: false,
        isSpeaking: false,
        interim: '',
        report: null,
        error: ''
    };

    let chatSession = null;
    let recognition = null;

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const initSpeech = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return setState({ error: 'Tarayıcınız ses tanımayı desteklemiyor.' });
        recognition = new SR();
        recognition.lang = 'en-US';
        recognition.interimResults = true;
        recognition.onstart = () => setState({ isListening: true });
        recognition.onend = () => setState({ isListening: false });
        recognition.onresult = (e) => {
            let int = '', fin = '';
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) fin += e.results[i][0].transcript;
                else int += e.results[i][0].transcript;
            }
            state.interim = int;
            renderQuietly();
            if (fin.trim()) handleUserSpeech(fin.trim());
        };
    };

    const handleUserSpeech = async (text) => {
        if (!chatSession) return;
        state.interim = '';
        setState({ conversation: [...state.conversation, { speaker: 'user', text }] });
        try {
            const res = await chatSession.sendMessage({ message: text });
            const aiText = res.text;
            setState({ conversation: [...state.conversation, { speaker: 'ai', text: aiText }] });
            await speak(aiText);
        } catch { setState({ error: 'AI yanıt veremedi.' }); }
    };

    const speak = (text) => {
        return new Promise((res) => {
            window.speechSynthesis.cancel();
            const ut = new SpeechSynthesisUtterance(text);
            ut.lang = 'en-US';
            ut.onstart = () => setState({ isSpeaking: true });
            ut.onend = () => { setState({ isSpeaking: false }); res(); };
            window.speechSynthesis.speak(ut);
        });
    };

    const renderQuietly = () => {
        const box = container.querySelector('#chat-box');
        if (box) {
            box.innerHTML = state.conversation.map(m => `
                <div class="flex ${m.speaker === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp">
                    <div class="max-w-[80%] p-6 rounded-[2.5rem] ${m.speaker === 'user' ? 'bg-brand-primary text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none'} shadow-xl font-bold">
                        ${m.text}
                    </div>
                </div>
            `).join('') + (state.interim ? `<div class="flex justify-end opacity-50"><div class="bg-brand-primary text-white p-4 rounded-2xl italic">${state.interim}</div></div>` : '');
            box.scrollTop = box.scrollHeight;
        }
    };

    const render = () => {
        if (state.view === 'selection') {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10">
                    <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🎭</div>
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Linguist Lab</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Gerçek hayat senaryolarında konuşma pratiği yapın. AI partnerinizle diyalog kurun ve detaylı analiz raporu alın.</p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        ${scenarios.map(s => `
                            <button class="scenario-btn bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-left hover:scale-105 active:scale-95 transition-all group" data-id="${s.id}">
                                <span class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${s.difficulty === 'Zor' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'} mb-6 inline-block">${s.difficulty}</span>
                                <h3 class="text-2xl font-black text-slate-900 dark:text-white italic uppercase group-hover:text-brand-primary transition-colors">${s.title}</h3>
                                <p class="text-slate-400 font-bold text-sm mt-4 leading-relaxed">${s.description}</p>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (state.view === 'briefing') {
            container.innerHTML = `
                <div class="max-w-3xl mx-auto space-y-10 animate-fadeIn">
                    <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10">
                        <div class="text-center">
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4 block">SCENARIO BRIEFING</span>
                            <h3 class="text-4xl font-black text-slate-900 dark:text-white italic uppercase">${state.scenario.title}</h3>
                        </div>
                        <div class="grid gap-6">
                            <div class="bg-slate-50 dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5">
                                <h4 class="text-xs font-black text-brand-primary uppercase mb-4 tracking-widest">PERSONAS</h4>
                                <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">🤖 Alex: <span class="font-black italic">${state.scenario.aiRole}</span></p>
                                <p class="text-sm font-bold text-slate-700 dark:text-slate-300">👤 Sen: <span class="font-black italic">${state.scenario.userRole}</span></p>
                            </div>
                            <div class="bg-slate-950 p-8 rounded-3xl border border-white/10">
                                <h4 class="text-xs font-black text-brand-primary uppercase mb-4 tracking-widest">OBJECTIVES</h4>
                                <ul class="space-y-3">
                                    ${state.scenario.objectives.map(o => `<li class="text-xs font-bold text-slate-400 italic flex gap-3"><span>🎯</span> ${o}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                        <div class="flex gap-4">
                            <button id="start-btn" class="flex-grow bg-brand-primary text-white font-black py-6 rounded-[2rem] shadow-2xl uppercase tracking-widest text-xs hover:scale-105 transition-all">SİMÜLASYONU BAŞLAT ▶️</button>
                            <button id="back-btn" class="px-10 bg-slate-100 text-slate-400 font-black rounded-[2rem] uppercase tracking-widest text-[10px] hover:bg-slate-200">GERİ</button>
                        </div>
                    </div>
                </div>
            `;
        } else if (state.view === 'active') {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10 h-[calc(100vh-14rem)] flex flex-col">
                    <div class="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-xl border-4 border-slate-50 dark:border-slate-800 flex justify-between items-center">
                        <div>
                     <h3 class="text-base font-black text-zinc-900 uppercase tracking-tight">${state.scenario.title}</h3>
                        </div>
                        <button id="stop-btn" class="bg-brand-primary text-white font-bold px-5 py-2 rounded-lg uppercase tracking-wider text-xs shadow hover:bg-brand-secondary transition-all">Bitir & Analiz Et</button>
                    </div>

                    <div id="chat-box" class="flex-1 bg-zinc-50 rounded-2xl border border-zinc-200 p-4 overflow-y-auto space-y-3" style="min-height:0;">
                         ${state.conversation.map(m => `
                            <div class="flex ${m.speaker === 'user' ? 'justify-end' : 'justify-start'}">
                                <div class="max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium shadow-sm ${m.speaker === 'user' ? 'bg-brand-primary text-white rounded-br-sm' : 'bg-white text-zinc-800 border border-zinc-200 rounded-bl-sm'}">
                                    ${m.text}
                                </div>
                            </div>
                        `).join('')}
                        ${state.interim ? `<div class="flex justify-end"><div class="max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium bg-brand-primary/20 text-brand-primary rounded-br-sm italic">${state.interim}...</div></div>` : ''}
                    </div>

                    <div class="flex flex-col items-center gap-3 pt-2">
                        <button id="mic-btn" class="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all ${state.isSpeaking ? 'bg-zinc-200 opacity-50 cursor-not-allowed' : state.isListening ? 'bg-brand-primary text-white scale-110 animate-pulse ring-4 ring-brand-primary/20' : 'bg-brand-primary text-white hover:scale-105 active:scale-95'}">🎤</button>
                        <p class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">${state.isSpeaking ? 'AI KONUŞUYOR...' : state.isListening ? 'SENİ DİNLİYORUM...' : 'KONUŞMAK İÇİN BAS'}</p>
                    </div>
                </div>
             `;
            // Auto-scroll chat to bottom
            requestAnimationFrame(() => {
                const chatBox = container.querySelector('#chat-box');
                if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
            });
        } else if (state.view === 'report') {
            container.innerHTML = `
                <div class="animate-fadeIn space-y-10 pb-20">
                     <div class="bg-slate-950 p-14 rounded-[4rem] shadow-2xl border-4 border-white/5 space-y-14">
                        <div class="text-center">
                            <span class="text-[10px] font-black text-brand-primary uppercase tracking-[0.8em] mb-4 block underline decoration-brand-primary decoration-4 underline-offset-8">DIAGNOSTIC REPORT</span>
                            <h3 class="text-4xl font-black text-white italic uppercase">Speech Performance</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div class="space-y-6">
                                <h4 class="text-xs font-black text-brand-primary uppercase tracking-widest">🎯 HEDEF ANALİZİ</h4>
                                <div class="grid gap-3">
                                    ${state.report.objectiveCompletion.map(o => `
                                        <div class="p-6 rounded-3xl ${o.completed ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} border">
                                            <p class="text-xs font-black ${o.completed ? 'text-green-400' : 'text-red-400'} uppercase mb-2">${o.completed ? 'BAŞARILI' : 'EKSİK'}</p>
                                            <p class="text-sm font-bold text-white mb-2">${o.objective}</p>
                                            <p class="text-[10px] text-slate-400 italic font-medium leading-relaxed">${o.reasoning}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            <div class="space-y-10">
                                <div class="p-10 bg-white/5 rounded-[3rem] border border-white/10">
                                    <h4 class="text-xs font-black text-brand-primary uppercase mb-6 tracking-widest">💬 GENEL DEĞERLENDİRME</h4>
                                    <p class="text-lg font-bold text-slate-300 italic leading-relaxed">"${state.report.overallFeedback}"</p>
                                </div>
                                <div class="grid gap-6">
                                    ${state.report.grammarFeedback.length ? `
                                        <div class="space-y-4">
                                            <h4 class="text-xs font-black text-brand-secondary uppercase tracking-widest">✍️ GRAMER NOTLARI</h4>
                                            ${state.report.grammarFeedback.slice(0, 3).map(g => `
                                                <div class="p-6 bg-brand-secondary/5 rounded-2xl border border-brand-secondary/10">
                                                    <p class="text-xs text-brand-secondary font-black italic mb-2">"${g.error}" &rarr; "${g.correction}"</p>
                                                    <p class="text-[10px] text-slate-400 font-bold">${g.explanation}</p>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>

                        <button id="end-report-btn" class="w-full bg-white text-slate-950 font-black py-6 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:bg-brand-primary hover:text-white transition-all">LİSTEYE GERİ DÖN ↩️</button>
                     </div>
                </div>
            `;
        }

        if (state.isLoading) {
            const l = Loader();
            l.className += " fixed inset-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur flex items-center justify-center";
            container.appendChild(l);
        }
        if (state.error) container.prepend(ErrorMessage(state.error));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.onclick = () => {
                const s = scenarios.find(i => i.id === btn.dataset.id);
                setState({ scenario: s, view: 'briefing' });
            };
        });

        container.querySelector('#back-btn')?.addEventListener('click', () => setState({ view: 'selection', scenario: null }));
        container.querySelector('#start-btn')?.addEventListener('click', () => {
            chatSession = createSpeakingSimulatorSession(state.scenario);
            setState({ view: 'active', conversation: [{ speaker: 'ai', text: state.scenario.aiWelcome }] });
            speak(state.scenario.aiWelcome);
            if (!recognition) initSpeech();
        });

        container.querySelector('#stop-btn')?.addEventListener('click', async () => {
            window.speechSynthesis.cancel();
            recognition?.stop();
            setState({ isLoading: true });
            try {
                const repText = await analyzeConversationForReport(state.scenario, state.conversation);
                setState({ report: JSON.parse(repText), view: 'report', isLoading: false });
            } catch { setState({ error: 'Rapor oluşturulamadı.', isLoading: false }); }
        });

        const micBtn = container.querySelector('#mic-btn');
        if (micBtn) {
            micBtn.onclick = () => {
                if (state.isListening) recognition?.stop();
                else if (!state.isSpeaking) recognition?.start();
            };
        }

        container.querySelector('#end-report-btn')?.addEventListener('click', () => setState({ view: 'selection', scenario: null, conversation: [], report: null }));
    };

    render();
    return container;
};
