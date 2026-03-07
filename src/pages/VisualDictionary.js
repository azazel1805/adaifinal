import store from '../store/index';
import { identifyObjectsInImage } from '../services/geminiService';
import { addWord, isWordSaved } from '../store/vocabulary';
import { Loader, ErrorMessage } from '../components/Common';

export const renderVisualDictionary = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10';

    let state = {
        viewState: 'idle', // 'idle', 'camera', 'captured', 'analyzing', 'results'
        error: '',
        capturedImage: null,
        identifiedObjects: []
    };

    let stream = null;
    let videoEl = null;
    let canvasEl = null;

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    };

    const startCamera = async () => {
        stopCamera();
        setState({ error: '', viewState: 'camera' });
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error("Kamera bu tarayıcıda desteklenmiyor.");
            }
            stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoEl) videoEl.srcObject = stream;
        } catch (err) {
            setState({
                error: "Kamera erişimi reddedildi veya bir hata oluştu. İzinleri kontrol edin.",
                viewState: 'idle'
            });
        }
    };

    const analyzeImage = async (base64Image) => {
        setState({ viewState: 'analyzing', identifiedObjects: [] });
        try {
            const pureBase64 = base64Image.split(',')[1];
            const resultText = await identifyObjectsInImage(pureBase64, 'image/jpeg');
            const resultJson = JSON.parse(resultText);
            setState({ identifiedObjects: resultJson, viewState: 'results' });
        } catch (e) {
            setState({ error: e.message || 'Analiz hatası.', viewState: 'captured' });
        }
    };

    const captureImage = () => {
        if (videoEl && canvasEl) {
            canvasEl.width = videoEl.videoWidth;
            canvasEl.height = videoEl.videoHeight;
            const ctx = canvasEl.getContext('2d');
            ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);
            const dataUrl = canvasEl.toDataURL('image/jpeg', 0.9);
            setState({ capturedImage: dataUrl, viewState: 'captured' });
            stopCamera();
            analyzeImage(dataUrl);
        }
    };

    const reset = () => {
        stopCamera();
        setState({ viewState: 'idle', capturedImage: null, identifiedObjects: [], error: '' });
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden text-center">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">📷</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic">Visual Dictionary</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium mb-8">Çevrendeki nesnelerin fotoğrafını çek, İngilizce adını anında öğren.</p>

                    ${state.viewState === 'idle' ? `
                        <button id="start-btn" class="inline-flex items-center gap-4 bg-brand-primary text-white font-black px-12 py-6 rounded-[2rem] shadow-2xl uppercase tracking-[0.2em] text-sm hover:-translate-y-1 transition-all group">
                            <span>KAMERAYI BAŞLAT</span>
                            <span class="text-2xl group-hover:rotate-12 transition-transform">📸</span>
                        </button>
                    ` : ''}
                </div>

                <div id="error-area"></div>

                <div class="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] shadow-xl border-2 border-slate-50 dark:border-slate-800 overflow-hidden min-h-[400px] flex flex-col justify-center">
                    ${state.viewState === 'camera' ? `
                        <div class="flex flex-col items-center gap-8">
                            <div class="w-full max-w-2xl bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-slate-100 dark:border-slate-800 relative">
                                <video id="vd-video" autoplay playsinline muted class="w-full h-auto"></video>
                                <div class="absolute inset-0 pointer-events-none border-[40px] border-black/20 flex items-center justify-center">
                                    <div class="w-64 h-64 border-2 border-white/40 border-dashed rounded-3xl"></div>
                                </div>
                            </div>
                            <canvas id="vd-canvas" class="hidden"></canvas>
                            <button id="capture-btn" class="w-24 h-24 rounded-full bg-red-500 border-8 border-white dark:border-slate-800 shadow-2xl hover:scale-110 active:scale-95 transition-all outline-none"></button>
                        </div>
                    ` : ''}

                    ${(state.viewState === 'captured' || state.viewState === 'analyzing' || state.viewState === 'results') ? `
                        <div class="space-y-10 animate-fadeIn">
                             <div class="relative w-full max-w-2xl mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-100 dark:border-slate-800">
                                <img src="${state.capturedImage}" class="w-full h-auto">
                                ${state.viewState === 'analyzing' ? `
                                    <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                        <div id="loader-target"></div>
                                        <p class="mt-6 text-xs font-black uppercase tracking-[0.3em] animate-pulse">OBJELER TANIMLANIYOR...</p>
                                    </div>
                                ` : ''}
                             </div>

                             ${state.viewState === 'results' ? `
                                <div class="space-y-8 max-w-2xl mx-auto">
                                    <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] flex items-center gap-3">
                                        <span>🔍 BULUNAN NESNELER (${state.identifiedObjects.length})</span>
                                        <div class="h-px flex-1 bg-brand-primary/10"></div>
                                    </h3>

                                    ${state.identifiedObjects.length > 0 ? `
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            ${state.identifiedObjects.map(obj => `
                                                <div class="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group hover:bg-white dark:hover:bg-slate-700 transition-all">
                                                    <div>
                                                        <p class="font-black text-slate-900 dark:text-white text-lg capitalize tracking-tight">${obj.englishName}</p>
                                                        <p class="text-xs font-bold text-slate-400 mt-1 italic">${obj.turkishName}</p>
                                                    </div>
                                                    <button class="save-word-btn w-12 h-12 rounded-2xl bg-white dark:bg-slate-600 shadow-sm hover:shadow-lg transition-all text-2xl flex items-center justify-center" data-en="${obj.englishName}" data-tr="${obj.turkishName}">
                                                        ${isWordSaved(obj.englishName) ? '✅' : '🔖'}
                                                    </button>
                                                </div>
                                            `).join('')}
                                        </div>
                                    ` : `
                                        <div class="text-center py-10">
                                            <p class="text-slate-500 font-bold italic">Üzgünüz, bu fotoğrafta belirgin bir nesne bulamadık. 🧐</p>
                                        </div>
                                    `}
                                    <button id="reset-btn" class="w-full bg-slate-900 dark:bg-black text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">YENİ FOTOĞRAF ÇEK 🔄</button>
                                </div>
                             ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        videoEl = container.querySelector('#vd-video');
        canvasEl = container.querySelector('#vd-canvas');
        if (state.viewState === 'analyzing') container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage(state.error));

        attachEvents();
    };

    const attachEvents = () => {
        const startBtn = container.querySelector('#start-btn');
        if (startBtn) startBtn.onclick = startCamera;

        const captureBtn = container.querySelector('#capture-btn');
        if (captureBtn) captureBtn.onclick = captureImage;

        const resetBtn = container.querySelector('#reset-btn');
        if (resetBtn) resetBtn.onclick = reset;

        container.querySelectorAll('.save-word-btn').forEach(btn => {
            btn.onclick = () => {
                const en = btn.dataset.en;
                if (!isWordSaved(en)) {
                    addWord(en, btn.dataset.tr);
                    render();
                }
            };
        });
    };

    render();
    return container;
};
