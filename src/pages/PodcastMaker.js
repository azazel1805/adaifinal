import { generatePodcastAudio, listTTSVoices } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

// Audio Utilities
function decode(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

async function decodeAudioData(data, ctx, sampleRate, numChannels) {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
}

const bufferToWave = (abuffer) => {
    const numOfChan = abuffer.numberOfChannels;
    const sampleRate = abuffer.sampleRate;
    const length = abuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    let pos = 0;
    const setUint32 = (data) => { view.setUint32(pos, data, true); pos += 4; };
    const setUint16 = (data) => { view.setUint16(pos, data, true); pos += 2; };

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(sampleRate); setUint32(sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164);
    setUint32(length - pos - 4);

    for (let offset = 0; offset < abuffer.length; offset++) {
        for (let i = 0; i < numOfChan; i++) {
            let sample = Math.max(-1, Math.min(1, abuffer.getChannelData(i)[offset]));
            sample = sample < 0 ? sample * 32768 : sample * 32767;
            view.setInt16(pos, sample, true);
            pos += 2;
        }
    }
    return new Blob([view], { type: 'audio/wav' });
};

export const renderPodcastMaker = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        script: '',
        isLoading: false,
        error: '',
        audioUrl: null,
        voices: [],
        selectedVoice: 'Kore',
        isLoadingVoices: true,
        rate: 1.0,
        pitch: 0.0
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const fetchVoices = async () => {
        try {
            const v = await listTTSVoices();
            setState({ voices: v, isLoadingVoices: false, selectedVoice: v.some(x => x.name === 'Kore') ? 'Kore' : (v[0]?.name || 'Kore') });
        } catch { setState({ isLoadingVoices: false }); }
    };

    const handleGenerate = async () => {
        if (!state.script.trim()) return setState({ error: 'Lütfen bir metin girin.' });
        setState({ isLoading: true, error: '', audioUrl: null });
        try {
            const base64 = await generatePodcastAudio(state.script, state.selectedVoice, state.rate, state.pitch);
            const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
            const bytes = decode(base64);
            const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
            const blob = bufferToWave(buffer);
            setState({ audioUrl: URL.createObjectURL(blob), isLoading: false });
        } catch { setState({ error: 'Podcast oluşturulamadı.', isLoading: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🎙️</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Podcast Forge</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto mt-6">Düşüncelerinizi sese dönüştürün. Metninizi girin, ses ayarlarını yapın ve anında profesyonel bir podcast kaydı oluşturun.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-12 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-12">
                    <div class="space-y-4">
                        <label class="text-xs font-black text-slate-400 uppercase tracking-widest pl-6">PODCAST SCRIPT</label>
                        <textarea id="script-input" class="w-full h-80 p-8 bg-slate-50 dark:bg-slate-800 border-none rounded-[3rem] focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-700 dark:text-white shadow-inner resize-none appearance-none" placeholder="Buraya seslendirmek istediğiniz metni yazın...">${state.script}</textarea>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div class="space-y-4">
                            <label class="text-xs font-black text-slate-400 uppercase tracking-widest pl-2">VOICE SELECTION</label>
                            <select id="voice-select" class="w-full p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-4 focus:ring-brand-primary/10 outline-none font-bold text-slate-900 dark:text-white shadow-inner appearance-none">
                                ${state.isLoadingVoices ? `<option>Yükleniyor...</option>` : state.voices.map(v => `<option value="${v.name}" ${state.selectedVoice === v.name ? 'selected' : ''}>${v.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="space-y-4">
                            <div class="flex justify-between px-2">
                                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">SPEED</label>
                                <span class="text-[10px] font-black text-brand-primary">${state.rate.toFixed(1)}x</span>
                            </div>
                            <input type="range" id="rate-range" min="0.5" max="2" step="0.1" value="${state.rate}" class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-primary">
                        </div>
                        <div class="space-y-4">
                            <div class="flex justify-between px-2">
                                <label class="text-xs font-black text-slate-400 uppercase tracking-widest">PITCH</label>
                                <span class="text-[10px] font-black text-brand-primary">${state.pitch.toFixed(1)}</span>
                            </div>
                            <input type="range" id="pitch-range" min="-10" max="10" step="1" value="${state.pitch}" class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-brand-primary">
                        </div>
                    </div>

                    <div id="error-area"></div>
                    <button id="gen-btn" class="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:scale-105 transition-all disabled:opacity-50" ${state.isLoading ? 'disabled' : ''}>${state.isLoading ? 'SESLENDİRİLİYOR...' : 'GENERATE AUDIO 🔊'}</button>
                </div>

                ${state.audioUrl ? `
                    <div class="bg-indigo-600 p-12 rounded-[4rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-10 animate-slideUp">
                        <div class="space-y-4 text-center md:text-left">
                            <h4 class="text-white font-black text-2xl tracking-tighter uppercase italic">Podcast Hazır!</h4>
                            <p class="text-white/60 font-bold text-sm">Ses dosyasını dinleyebilir veya indirebilirsiniz.</p>
                        </div>
                        <div class="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                            <audio controls src="${state.audioUrl}" class="h-14"></audio>
                            <a href="${state.audioUrl}" download="adai-podcast.wav" class="bg-white text-indigo-600 font-black px-10 py-5 rounded-2xl shadow-xl uppercase tracking-widest text-[10px] hover:-translate-y-1 transition-all">İNDİR (.WAV)</a>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (state.isLoading) {
            const loaderBox = document.createElement('div');
            loaderBox.className = 'flex justify-center p-10';
            loaderBox.appendChild(Loader());
            container.querySelector('#gen-btn').insertAdjacentElement('beforebegin', loaderBox);
        }
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelector('#script-input')?.addEventListener('input', (e) => state.script = e.target.value);
        container.querySelector('#voice-select')?.addEventListener('change', (e) => state.selectedVoice = e.target.value);
        container.querySelector('#rate-range')?.addEventListener('input', (e) => setState({ rate: parseFloat(e.target.value) }));
        container.querySelector('#pitch-range')?.addEventListener('input', (e) => setState({ pitch: parseFloat(e.target.value) }));
        container.querySelector('#gen-btn')?.addEventListener('click', handleGenerate);
    };

    fetchVoices();
    render();
    return container;
};
