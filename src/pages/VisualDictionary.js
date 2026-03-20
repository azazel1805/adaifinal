import store from '../store/index';
import { identifyObjectsInImage } from '../services/geminiService';
import { addWord, isWordSaved } from '../store/vocabulary';
import { Loader, ErrorMessage } from '../components/Common';

export const renderVisualDictionary = () => {
    const container = document.createElement('div');
    container.className = 'max-w-5xl mx-auto space-y-12 pb-20';

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
            const mimeType = base64Image.split(';')[0].split(':')[1];
            // service returns an array now
            const identifiedObjects = await identifyObjectsInImage(pureBase64, mimeType);
            setState({ identifiedObjects: identifiedObjects || [], viewState: 'results' });
        } catch (e) {
            console.error("Analysis error:", e);
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

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            setState({ capturedImage: dataUrl, viewState: 'captured' });
            analyzeImage(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const reset = () => {
        stopCamera();
        setState({ viewState: 'idle', capturedImage: null, identifiedObjects: [], error: '' });
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-12">
                <!-- Header Card -->
                <div class="relative bg-gradient-to-br from-indigo-600 to-brand-primary p-12 md:p-16 rounded-[4rem] shadow-3xl overflow-hidden text-center text-white">
                    <div class="absolute -top-10 -right-10 text-[10rem] opacity-10 select-none grayscale rotate-12">🔍</div>
                    <div class="absolute -bottom-10 -left-10 text-[10rem] opacity-10 select-none grayscale -rotate-12">📄</div>
                    
                    <div class="relative z-10 space-y-6">
                        <div class="inline-flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-xs font-black tracking-[0.3em] uppercase">
                            <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            VISION AI POWERED
                        </div>
                        <h2 class="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">Visual<br/>Dictionary</h2>
                        <p class="text-white/80 font-medium max-w-xl mx-auto text-lg">
                            Çevrendeki dünyayı fotoğrafla, nesnelerin İngilizce karşılıklarını ve anlamlarını anında keşfet.
                        </p>
                    </div>

                    ${state.viewState === 'idle' ? `
                        <div class="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 max-w-2xl mx-auto">
                            <button id="start-camera-btn" class="flex flex-col items-center gap-4 bg-white text-zinc-900 p-8 rounded-[3rem] shadow-2xl hover:scale-105 hover:-translate-y-1 transition-all group">
                                <span class="text-4xl group-hover:rotate-12 transition-transform">📸</span>
                                <div class="text-left">
                                    <span class="block font-black text-sm uppercase tracking-widest text-brand-primary">KAMERA</span>
                                    <span class="text-xs font-bold text-zinc-400 italic lowercase">Canlı fotoğraf çek</span>
                                </div>
                            </button>
                            
                            <label for="file-upload" class="flex flex-col items-center gap-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 text-white p-8 rounded-[3rem] shadow-2xl cursor-pointer hover:bg-white/20 hover:scale-105 hover:-translate-y-1 transition-all group">
                                <span class="text-4xl group-hover:scale-110 transition-transform">📁</span>
                                <div class="text-left">
                                    <span class="block font-black text-sm uppercase tracking-widest">DOSYA YÜKLE</span>
                                    <input id="file-upload" type="file" accept="image/*" class="hidden">
                                    <span class="text-xs font-bold text-white/40 italic lowercase">Galeriden seç</span>
                                </div>
                            </label>
                        </div>
                    ` : ''}
                </div>

                <div id="error-area"></div>

                <!-- Main Interaction Area -->
                <div class="${state.viewState === 'idle' ? 'hidden' : 'block'} bg-white dark:bg-zinc-900 p-8 md:p-12 rounded-[4.5rem] shadow-xl border-8 border-zinc-100 dark:border-zinc-800 overflow-hidden min-h-[400px]">
                    
                    ${state.viewState === 'camera' ? `
                        <div class="flex flex-col items-center gap-10">
                            <div class="w-full max-w-3xl bg-black rounded-[3.5rem] overflow-hidden shadow-3xl border-8 border-zinc-100 dark:border-zinc-800 relative aspect-video">
                                <video id="vd-video" autoplay playsinline muted class="w-full h-full object-cover"></video>
                                <div class="absolute inset-0 pointer-events-none border-[60px] border-black/30 flex items-center justify-center">
                                    <div class="w-full h-full border-4 border-white/20 border-dashed rounded-[2rem]"></div>
                                    <div class="absolute text-white/20 font-black text-[10px] tracking-[0.5em] uppercase">KADRAJI HİZALAYIN</div>
                                </div>
                            </div>
                            <canvas id="vd-canvas" class="hidden"></canvas>
                            <div class="flex items-center gap-8">
                                <button id="cancel-camera-btn" class="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-800 text-2xl flex items-center justify-center hover:bg-zinc-200 transition-all">✕</button>
                                <button id="capture-btn" class="w-32 h-32 rounded-full bg-white border-[12px] border-brand-primary shadow-3xl hover:scale-110 active:scale-95 transition-all outline-none flex items-center justify-center relative">
                                    <div class="w-full h-full rounded-full border-4 border-zinc-900 absolute opacity-10"></div>
                                </button>
                                <div class="w-16 h-16"></div> <!-- Spacer -->
                            </div>
                        </div>
                    ` : ''}

                    ${(state.viewState === 'captured' || state.viewState === 'analyzing' || state.viewState === 'results') ? `
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start animate-fadeIn">
                             <!-- Image Side -->
                             <div class="sticky top-24">
                                 <div class="relative w-full rounded-[4rem] overflow-hidden shadow-3xl border-4 border-zinc-100 dark:border-zinc-800 group">
                                    <img src="${state.capturedImage}" class="w-full h-auto">
                                    ${state.viewState === 'analyzing' ? `
                                        <div class="absolute inset-0 bg-brand-primary/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-10 text-center">
                                            <div id="loader-target" class="scale-150"></div>
                                            <div class="mt-12 space-y-2">
                                                <p class="text-lg font-black uppercase tracking-[0.4em] animate-pulse">Analiz Ediliyor</p>
                                                <p class="text-white/60 font-bold text-xs italic lowercase">Nesneler tek tek tanımlanıyor...</p>
                                            </div>
                                        </div>
                                    ` : ''}
                                    <button id="reset-btn" class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-xl border border-white/40 text-white font-black px-10 py-5 rounded-[2rem] hover:bg-white/40 transition-all uppercase tracking-widest text-xs">🔄 YENİ GÖRSEL</button>
                                 </div>
                             </div>

                             <!-- Results Side -->
                             <div class="space-y-10">
                                 <div class="flex items-center justify-between pb-6 border-b-2 border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <h3 class="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter italic">Tespit Edilenler</h3>
                                        <p class="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                                            <span class="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                                            ${state.identifiedObjects.length} NESNE BULUNDU
                                        </p>
                                    </div>
                                    <div class="text-4xl opacity-20">🔎</div>
                                 </div>

                                 ${state.viewState === 'results' ? `
                                    <div class="grid grid-cols-1 gap-4">
                                        ${state.identifiedObjects.length > 0 ? state.identifiedObjects
                                            .filter(obj => obj && obj.englishName && obj.turkishName)
                                            .map(obj => `
                                            <div class="group relative bg-zinc-50 dark:bg-zinc-800/50 p-8 rounded-[2.5rem] border border-transparent hover:border-brand-primary/20 hover:bg-white dark:hover:bg-zinc-800 transition-all flex justify-between items-center shadow-sm hover:shadow-xl">
                                                <div class="space-y-1">
                                                    <p class="font-black text-zinc-900 dark:text-white text-2xl capitalize tracking-tighter italic">${obj.englishName}</p>
                                                    <p class="text-sm font-bold text-brand-primary italic lowercase flex items-center gap-2">
                                                        <span>TR</span>
                                                        <span class="px-3 py-1 bg-zinc-100 dark:bg-zinc-700 rounded-full">${obj.turkishName}</span>
                                                    </p>
                                                </div>
                                                <button class="save-word-btn w-16 h-16 rounded-[1.5rem] bg-white dark:bg-zinc-800 shadow-xl border border-zinc-100 dark:border-zinc-700 hover:scale-110 active:scale-95 transition-all flex items-center justify-center text-3xl group-hover:border-brand-primary/30" data-en="${obj.englishName}" data-tr="${obj.turkishName}">
                                                    ${isWordSaved(obj.englishName) ? '✅' : '🔖'}
                                                </button>
                                                
                                                <div class="absolute -z-10 bottom-0 right-0 p-2 text-6xl opacity-0 group-hover:opacity-[0.03] transition-opacity select-none capitalize font-black">${obj.englishName}</div>
                                            </div>
                                        `).join('') : `
                                            <div class="text-center py-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-[3rem] border-4 border-dashed border-zinc-100 dark:border-zinc-800">
                                                <div class="text-6xl mb-6">🧐</div>
                                                <p class="text-zinc-500 font-bold italic">Üzgünüz, belirlenmiş nesne bulunamadı.</p>
                                                <p class="text-zinc-400 text-xs mt-2 italic lowercase">Başka bir açıdan veya daha net bir fotoğraf deneyin.</p>
                                            </div>
                                        `}
                                    </div>
                                 ` : `
                                    <div class="space-y-4 opacity-50">
                                        ${[1,2,3].map(() => `
                                            <div class="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-[2.5rem] animate-pulse"></div>
                                        `).join('')}
                                    </div>
                                 `}
                             </div>
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
        const startBtn = container.querySelector('#start-camera-btn');
        if (startBtn) startBtn.onclick = startCamera;

        const cancelBtn = container.querySelector('#cancel-camera-btn');
        if (cancelBtn) cancelBtn.onclick = reset;

        const captureBtn = container.querySelector('#capture-btn');
        if (captureBtn) captureBtn.onclick = captureImage;

        const resetBtn = container.querySelector('#reset-btn');
        if (resetBtn) resetBtn.onclick = reset;

        const fileInput = container.querySelector('#file-upload');
        if (fileInput) fileInput.onchange = handleFileUpload;

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
