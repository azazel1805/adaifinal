import store from '../store/index';
import { generateTutorResponse } from '../services/geminiService';
import { Loader } from '../components/Common';

export const renderShadowingLab = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10 animate-fadeIn';

    let state = {
        script: '',
        userTranscript: '',
        feedback: null,
        status: 'idle', // 'idle', 'loading', 'listening', 'analyzing', 'result'
        error: '',
        isSpeaking: false,
        recognition: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const generateNewScript = async () => {
        setState({ status: 'loading', error: '', feedback: null, userTranscript: '' });
        try {
            const prompt = "Dil öğrenimi için shadowing (gölge konuşma) pratiği yapabileceğim, 2-3 cümlelik, orta seviye, telaffuzu geliştirici ilginç bir İngilizce metin üret. Sadece metni döndür.";
            const res = await generateTutorResponse(prompt);
            setState({ script: res, status: 'idle' });
        } catch (e) {
            setState({ error: "Yeni metin oluşturulamadı.", status: 'idle' });
        }
    };

    const listenToScript = () => {
        if (state.isSpeaking) {
            window.speechSynthesis.cancel();
            setState({ isSpeaking: false });
            return;
        }

        const utterance = new SpeechSynthesisUtterance(state.script);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.onstart = () => setState({ isSpeaking: true });
        utterance.onend = () => setState({ isSpeaking: false });
        window.speechSynthesis.speak(utterance);
    };

    const startRecording = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setState({ error: "Tarayıcınız ses tanımayı desteklemiyor." });
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = true;

        recognition.onstart = () => setState({ status: 'listening', userTranscript: '' });
        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
            }
            if (finalTranscript) state.userTranscript = finalTranscript;
        };
        recognition.onend = () => {
            if (state.status === 'listening') {
                analyzeShadowing();
            }
        };

        recognition.start();
        state.recognition = recognition;
    };

    const analyzeShadowing = async () => {
        if (!state.userTranscript) {
            setState({ status: 'idle', error: "Ses algılanamadı. Lütfen tekrar deneyin." });
            return;
        }

        setState({ status: 'analyzing' });
        try {
            const prompt = `Shadowing analizi yap. 
            Orijinal Metin: "${state.script}"
            Kullanıcının Söylediği: "${state.userTranscript}"
            
            Görevin: Kullanıcının telaffuzunu ve doğruluğunu analiz et. 
            Yanıtını şu JSON formatında ver: { "score": 0-100, "perfect": true/false, "corrections": ["yanlış telaffuz edilen kelimeler ve öneriler"], "feedback": "Kısa teşvik edici yorum" }
            Analiz dili Türkçe olsun.`;

            const res = await generateTutorResponse(prompt);
            const feedback = JSON.parse(res.replace(/```json|```/g, ''));
            setState({ feedback, status: 'result' });
        } catch (e) {
            setState({ status: 'idle', error: "Analiz sırasında hata oluştu." });
        }
    };

    const render = () => {
        container.innerHTML = `
            <div class="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10">
                <div class="border-b border-slate-50 dark:border-slate-800 pb-8 flex justify-between items-center">
                    <div>
                        <h2 class="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Shadowing Lab</h2>
                        <p class="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mt-1">Pronunciation & Rhythm Training</p>
                    </div>
                    <button id="new-script-btn" class="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-zinc-100 transition-all text-xl">🎲</button>
                </div>

                <!-- Script Display -->
                <div class="bg-slate-950 p-10 rounded-[3rem] shadow-inner relative overflow-hidden min-h-[200px] flex items-center justify-center">
                    <div class="absolute top-0 left-0 w-2 h-full bg-brand-primary"></div>
                    ${state.status === 'loading' ? '<div id="loader-target"></div>' : `
                        <p class="text-2xl font-bold text-slate-300 leading-relaxed text-center italic">
                            ${state.script || 'Metin oluşturmak için yukarıdaki zar simgesine tıkla.'}
                        </p>
                    `}
                </div>

                <!-- Controls -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button id="listen-btn" class="group relative bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-brand-primary transition-all duration-500">
                        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            ${state.isSpeaking ? '🛑' : '🔊'}
                        </div>
                        <span class="font-black text-xs uppercase tracking-widest text-slate-400 group-hover:text-brand-primary">DİNLE</span>
                    </button>

                    <button id="record-btn" 
                        class="group relative ${state.status === 'listening' ? 'bg-brand-primary border-brand-primary/20' : 'bg-white dark:bg-slate-800 border-4 border-slate-50 dark:border-slate-700'} p-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-brand-primary transition-all duration-500"
                        ${state.status === 'listening' ? '' : ''}>
                        <div class="w-16 h-16 ${state.status === 'listening' ? 'bg-white text-brand-primary animate-pulse' : 'bg-slate-100 dark:bg-slate-700'} rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            🎤
                        </div>
                        <span class="font-black text-xs uppercase tracking-widest ${state.status === 'listening' ? 'text-white' : 'text-slate-400 group-hover:text-brand-primary'}">
                            ${state.status === 'listening' ? 'SENİ DİNLİYORUM...' : 'ANKERİ TEKRAR ET'}
                        </span>
                    </button>
                </div>

                <!-- Analysis/Result -->
                ${state.status === 'analyzing' ? `
                    <div class="p-10 bg-slate-50 dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center gap-4 animate-pulse">
                        <div class="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                        <p class="font-black text-[10px] text-slate-400 uppercase tracking-widest">Telaffuzun Analiz Ediliyor...</p>
                    </div>
                ` : ''}

                ${state.feedback ? `
                    <div class="p-10 bg-green-500/5 rounded-[3.5rem] border-4 border-green-500/20 space-y-6 animate-slideUp">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center gap-4">
                                <span class="text-4xl">${state.feedback.score >= 90 ? '🏆' : state.feedback.score >= 70 ? '💪' : '✨'}</span>
                                <div>
                                    <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase italic">ANALİZ RAPORU</h3>
                                    <p class="text-[10px] font-black text-green-600 uppercase tracking-widest">DOĞRULUK SKORU: %${state.feedback.score}</p>
                                </div>
                            </div>
                            <div class="text-4xl font-black text-green-600">%${state.feedback.score}</div>
                        </div>
                        
                        <p class="text-slate-600 dark:text-slate-400 font-bold italic border-l-4 border-green-500 pl-4 py-2">${state.feedback.feedback}</p>
                        
                        ${state.feedback.corrections.length > 0 ? `
                            <div class="space-y-4 pt-4">
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Geliştirme Önerileri:</h4>
                                <div class="flex flex-wrap gap-2">
                                    ${state.feedback.corrections.map(c => `
                                        <span class="px-4 py-2 bg-red-500/10 text-red-600 rounded-xl text-xs font-bold">${c}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                ${state.error ? `
                    <div class="p-6 bg-red-500/10 text-red-600 rounded-[2rem] border-2 border-red-500/20 font-bold text-sm text-center">
                        ${state.error}
                    </div>
                ` : ''}
            </div>
        `;

        const loaderTarget = container.querySelector('#loader-target');
        if (loaderTarget) loaderTarget.appendChild(Loader());

        attachEvents();
    };

    const attachEvents = () => {
        container.querySelector('#new-script-btn')?.addEventListener('click', generateNewScript);
        container.querySelector('#listen-btn')?.addEventListener('click', listenToScript);
        container.querySelector('#record-btn')?.addEventListener('click', () => {
            if (state.status === 'listening') {
                state.recognition?.stop();
            } else {
                startRecording();
            }
        });
    };

    // Auto-generate script on first load
    if (!state.script && state.status === 'idle') {
        generateNewScript();
    }

    render();
    return container;
};
