import { convertImageToText } from '../services/geminiService';
import { Loader, ErrorMessage } from '../components/Common';

export const renderHandwritingConverter = () => {
    const container = document.createElement('div');
    container.className = 'max-w-4xl mx-auto space-y-10';

    let state = {
        imageFile: null,
        imagePreview: null,
        convertedText: '',
        isLoading: false,
        error: ''
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) return setState({ error: 'Lütfen bir resim dosyası yükleyin.' });
        setState({ error: '', imageFile: file, convertedText: '' });
        const reader = new FileReader();
        reader.onloadend = () => setState({ imagePreview: reader.result });
        reader.readAsDataURL(file);
    };

    const handleConvert = async () => {
        if (!state.imageFile) return setState({ error: 'Lütfen önce bir resim seçin.' });
        setState({ isLoading: true, error: '', convertedText: '' });
        try {
            const text = await convertImageToText(state.imageFile);
            setState({ convertedText: text, isLoading: false });
        } catch (e) { setState({ error: 'Dönüştürme hatası.', isLoading: false }); }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">✍️</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Scribe AI</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-6">El yazısı notlarınızı, karalamalarınızı veya beyaz tahta fotoğraflarınızı anında dijital metne dönüştürün.</p>
                </div>

                <div class="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-10">
                    ${!state.imagePreview ? `
                        <div id="drop-zone" class="border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] p-20 text-center cursor-pointer hover:border-brand-primary/20 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all group">
                            <div class="p-10 bg-brand-primary/10 rounded-[2.5rem] w-24 h-24 flex items-center justify-center text-5xl mx-auto mb-6 group-hover:scale-110 transition-transform">🖼️</div>
                            <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase italic">Dosyayı Buraya Sürükleyin</h3>
                            <p class="text-[10px] font-black text-slate-400 mt-2 tracking-[0.3em] uppercase">YA DA TIKLAYARAK SEÇİN (PNG, JPG, WEBP)</p>
                            <input type="file" id="file-input" class="hidden" accept="image/*">
                        </div>
                    ` : `
                        <div class="space-y-8 animate-fadeIn">
                             <div class="w-full h-80 bg-slate-50 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden border-2 border-slate-100 dark:border-slate-700 shadow-inner group relative">
                                <img src="${state.imagePreview}" class="w-full h-full object-contain">
                                <button id="clear-btn" class="absolute top-6 right-6 w-12 h-12 bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-xl flex items-center justify-center text-xl font-black text-red-500 hover:scale-110 transition-all">&times;</button>
                             </div>
                             <button id="convert-btn" class="w-full bg-brand-primary text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">DİJİTAL METNE DÖNÜŞTÜR ⚡</button>
                        </div>
                    `}

                    <div id="error-area"></div>
                    <div id="loader-target" class="flex justify-center p-6"></div>

                    ${state.convertedText ? `
                        <div class="space-y-8 animate-slideUp">
                            <div class="flex justify-between items-center border-b border-slate-50 dark:border-slate-800 pb-6">
                                <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em]">DÖNÜŞTÜRÜLEN METİN</h3>
                                <button id="download-btn" class="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary transition-colors">📄 DOSYA OLARAK İNDİR</button>
                            </div>
                            <textarea id="text-area" class="w-full h-72 p-10 bg-slate-950 text-brand-primary border-none rounded-[3rem] font-mono text-sm leading-relaxed shadow-2xl focus:ring-4 focus:ring-brand-primary/20 outline-none resize-none">${state.convertedText}</textarea>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        if (state.isLoading) container.querySelector('#loader-target')?.appendChild(Loader());
        if (state.error) container.querySelector('#error-area')?.appendChild(ErrorMessage({ message: state.error }));

        attachEvents();
    };

    const attachEvents = () => {
        const dropZone = container.querySelector('#drop-zone');
        if (dropZone) {
            dropZone.onclick = () => container.querySelector('#file-input').click();
            dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('border-brand-primary'); };
            dropZone.ondragleave = () => { dropZone.classList.remove('border-brand-primary'); };
            dropZone.ondrop = (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file);
            };
        }

        const fileInput = container.querySelector('#file-input');
        if (fileInput) fileInput.onchange = (e) => handleFile(e.target.files[0]);

        const clearBtn = container.querySelector('#clear-btn');
        if (clearBtn) clearBtn.onclick = () => setState({ imageFile: null, imagePreview: null, convertedText: '' });

        const convBtn = container.querySelector('#convert-btn');
        if (convBtn) convBtn.onclick = handleConvert;

        const downBtn = container.querySelector('#download-btn');
        if (downBtn) downBtn.onclick = () => {
            const blob = new Blob([state.convertedText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'adai-converted-text.txt';
            a.click();
            URL.revokeObjectURL(url);
        };

        const textArea = container.querySelector('#text-area');
        if (textArea) textArea.oninput = (e) => state.convertedText = e.target.value;
    };

    render();
    return container;
};
