import store from '../store/index';
import { verbToBeData } from '../data/verbToBeData';
import { Loader, ErrorMessage } from '../components/Common';


const PEXELS_API_KEY = 'BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq';

const speak = (text) => {
    if (typeof window.speechSynthesis === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en-'));
    if (enVoice) utterance.voice = enVoice;

    window.speechSynthesis.speak(utterance);
};
window.speakEn = speak;

const moduleData = {
    colors: { title: 'Renkleri Öğren', icon: '🎨', description: 'Renkleri ve okunuşlarını keşfet.' },
    numbers: { title: 'Sayıları Öğren', icon: '🔢', description: '0-100 arası sayıları ve okunuşlarını keşfet.' },
    alphabet: { title: 'Etkileşimli Alfabe', icon: '🔤', description: 'Harflerin telaffuzunu dinle.' },
    days: { title: 'Haftanın Günleri', icon: '🗓️', description: 'Günlerin telaffuzunu ve sırasını öğren.' },
    dates: { title: 'Tarih Okuma', icon: '📅', description: 'Seçtiğin tarihi İngilizce olarak dinle.' },
    seasons: { title: 'Mevsimler Rehberi', icon: '☀️', description: 'Ayların hangi mevsime ait olduğunu gör.' },
    time: { title: 'Dijital Saat Okuma', icon: '⏰', description: 'Ayarladığın saati İngilizce olarak dinle.' },
    verbToBe: { title: 'Verb "to be"', icon: '👋', description: 'En temel fiilin kullanımını öğren.' },
    questionFormer: { title: 'Soru Oluşturma', icon: '❓', description: 'Altı çizili öğeyi soran doğru soruyu oluştur.' },
    sentenceBuilder: { title: 'Cümle Kurucu', icon: '🏗️', description: 'Kelimeleri sürükleyip bırakarak basit cümleler kur.' },
};

const renderColors = () => {
    const colors = [
        { name: 'red', hex: '#ef4444', tr: 'Kırmızı', txt: 'text-white' },
        { name: 'blue', hex: '#3b82f6', tr: 'Mavi', txt: 'text-white' },
        { name: 'green', hex: '#22c55e', tr: 'Yeşil', txt: 'text-white' },
        { name: 'yellow', hex: '#eab308', tr: 'Sarı', txt: 'text-black' },
        { name: 'orange', hex: '#f97316', tr: 'Turuncu', txt: 'text-white' },
        { name: 'purple', hex: '#a855f7', tr: 'Mor', txt: 'text-white' },
        { name: 'pink', hex: '#ec4899', tr: 'Pembe', txt: 'text-black' },
        { name: 'black', hex: '#000000', tr: 'Siyah', txt: 'text-white' },
        { name: 'white', hex: '#ffffff', tr: 'Beyaz', txt: 'text-black' },
        { name: 'gray', hex: '#6b7280', tr: 'Gri', txt: 'text-white' },
        { name: 'brown', hex: '#78350f', tr: 'Kahverengi', txt: 'text-white' },
        { name: 'cyan', hex: '#06b6d4', tr: 'Camgöbeği', txt: 'text-black' }
    ];
    return `
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fadeIn">
            ${colors.map(c => `
                <button onclick="window.speakEn('${c.name}')" style="background-color: ${c.hex}; border: ${c.name === 'white' ? '1px solid #ccc' : 'none'}" class="p-6 h-36 rounded-3xl flex flex-col justify-between items-start transition-all hover:scale-105 shadow-lg ${c.txt}">
                    <div>
                        <p class="text-xl font-black capitalize tracking-tight">${c.name}</p>
                        <p class="text-xs font-bold opacity-80 uppercase">${c.tr}</p>
                    </div>
                </button>
            `).join('')}
        </div>
    `;
};

const renderNumbers = () => {
    const numbers = [
        { num: 0, word: 'zero' }, { num: 1, word: 'one' }, { num: 2, word: 'two' }, { num: 3, word: 'three' },
        { num: 4, word: 'four' }, { num: 5, word: 'five' }, { num: 6, word: 'six' }, { num: 7, word: 'seven' },
        { num: 8, word: 'eight' }, { num: 9, word: 'nine' }, { num: 10, word: 'ten' }, { num: 11, word: 'eleven' },
        { num: 12, word: 'twelve' }, { num: 13, word: 'thirteen' }, { num: 14, word: 'fourteen' }, { num: 15, word: 'fifteen' },
        { num: 16, word: 'sixteen' }, { num: 17, word: 'seventeen' }, { num: 18, word: 'eighteen' }, { num: 19, word: 'nineteen' },
        { num: 20, word: 'twenty' }, { num: 30, word: 'thirty' }, { num: 40, word: 'forty' }, { num: 50, word: 'fifty' },
        { num: 60, word: 'sixty' }, { num: 70, word: 'seventy' }, { num: 80, word: 'eighty' }, { num: 90, word: 'ninety' },
        { num: 100, word: 'one hundred' }
    ];
    return `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
            ${numbers.map(n => `
                <button onclick="window.speakEn('${n.word}')" class="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl text-center border-2 border-transparent hover:border-brand-primary group transition-all">
                    <p class="text-4xl font-black text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">${n.num}</p>
                    <p class="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">${n.word}</p>
                </button>
            `).join('')}
        </div>
    `;
};

const renderAlphabet = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return `
        <div class="grid grid-cols-5 sm:grid-cols-6 gap-3 animate-fadeIn">
            ${alphabet.map(l => `
                <button onclick="window.speakEn('${l}')" class="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-900 dark:text-white hover:bg-brand-primary hover:text-white shadow-sm transition-all">
                    ${l}
                </button>
            `).join('')}
        </div>
    `;
};

const renderDays = () => {
    const days = [
        { en: 'Monday', tr: 'Pazartesi' }, { en: 'Tuesday', tr: 'Salı' }, { en: 'Wednesday', tr: 'Çarşamba' },
        { en: 'Thursday', tr: 'Perşembe' }, { en: 'Friday', tr: 'Cuma' }, { en: 'Saturday', tr: 'Cumartesi' },
        { en: 'Sunday', tr: 'Pazar' }
    ];
    return `
        <div class="space-y-3 animate-fadeIn">
            ${days.map(d => `
                <button onclick="window.speakEn('${d.en}')" class="w-full p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex justify-between items-center group hover:bg-brand-primary transition-all">
                    <div class="text-left">
                        <p class="text-lg font-black text-slate-900 dark:text-white group-hover:text-white whitespace-pre-wrap">${d.en}</p>
                        <p class="text-[10px] font-black text-slate-400 group-hover:text-white/60 uppercase tracking-widest">${d.tr}</p>
                    </div>
                    <span class="text-2xl group-hover:scale-125 transition-transform opacity-40 group-hover:opacity-100">🔊</span>
                </button>
            `).join('')}
        </div>
    `;
};

const renderSeasons = () => {
    const data = {
        Winter: { icons: '❄️', months: ['December', 'January', 'February'], cls: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
        Spring: { icons: '🌸', months: ['March', 'April', 'May'], cls: 'bg-green-500/10 text-green-500 border-green-500/20' },
        Summer: { icons: '☀️', months: ['June', 'July', 'August'], cls: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
        Autumn: { icons: '🍂', months: ['September', 'October', 'November'], cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
    };
    return `
        <div class="space-y-10 animate-fadeIn">
            ${Object.entries(data).map(([s, d]) => `
                <div class="space-y-4">
                    <h4 class="text-xl font-black italic flex items-center gap-3 ${d.cls.split(' ')[1]}">
                        <span>${s}</span>
                        ${d.icons}
                    </h4>
                    <div class="grid grid-cols-3 gap-3">
                        ${d.months.map(m => `
                            <button onclick="window.speakEn('${m}')" class="p-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 ${d.cls}">${m}</button>
                        `).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
};

export const renderBasics = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        activeModule: null, // null or key
        date: new Date().toISOString().split('T')[0],
        dateText: '',
        time: '03:10',
        period: 'AM',
        timeText: '',
        verbToBeIndex: 0,
        verbToBeImage: null,
        verbToBeLoading: false,
        qfIndex: 0,
        qfAnswer: '',
        qfFeedback: null,
        sbIndex: 0,
        sbWordPool: [],
        sbArea: [],
        sbFeedback: null
    };

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const fetchToBeImage = async (query) => {
        setState({ verbToBeLoading: true });
        try {
            const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
                headers: { Authorization: PEXELS_API_KEY }
            });
            const data = await res.json();
            setState({ verbToBeImage: data.photos?.[0]?.src?.large || null, verbToBeLoading: false });
        } catch {
            setState({ verbToBeImage: null, verbToBeLoading: false });
        }
    };

    const handleDateRead = () => {
        const d = new Date(state.date + 'T00:00:00');
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const getOrd = n => {
            if (n > 3 && n < 21) return n + 'th';
            switch (n % 10) {
                case 1: return n + "st";
                case 2: return n + "nd";
                case 3: return n + "rd";
                default: return n + "th";
            }
        };
        const txt = `It is the ${getOrd(d.getDate())} of ${months[d.getMonth()]}, ${d.getFullYear()}.`;
        setState({ dateText: txt });
        speak(txt);
    };

    const handleTimeRead = () => {
        const [hStr, mStr] = state.time.split(':');
        let h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        if (h === 0) h = 12;
        if (h > 12) h -= 12;
        const nums = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
        const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty'];
        const toW = n => n < 20 ? nums[n] : tens[Math.floor(n / 10)] + (n % 10 ? ' ' + nums[n % 10] : '');
        const hW = toW(h);
        const mW = m === 0 ? "o'clock" : (m < 10 ? `oh ${toW(m)}` : toW(m));
        const res = `It is ${hW} ${m === 0 ? '' : mW} ${state.period}.`.replace(" o'clock", "o'clock");
        setState({ timeText: res });
        speak(res);
    };

    const renderContents = () => {
        if (!state.activeModule) return '';
        switch (state.activeModule) {
            case 'colors': return renderColors();
            case 'numbers': return renderNumbers();
            case 'alphabet': return renderAlphabet();
            case 'days': return renderDays();
            case 'seasons': return renderSeasons();
            case 'dates': return `
                <div class="text-center space-y-8 animate-fadeIn">
                     <p class="text-xs font-black text-slate-400 uppercase tracking-widest">BİR TARİH SEÇİN</p>
                     <input type="date" id="date-input" value="${state.date}" class="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm focus:border-brand-primary outline-none shadow-inner">
                     <button id="read-date-btn" class="w-full bg-brand-primary text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">TARİHİ SESLENDİR 🔊</button>
                     ${state.dateText ? `<div class="p-6 bg-slate-900 text-brand-primary font-black rounded-3xl animate-slideUp italic">"${state.dateText}"</div>` : ''}
                </div>
            `;
            case 'time': return `
                <div class="text-center space-y-8 animate-fadeIn">
                     <p class="text-xs font-black text-slate-400 uppercase tracking-widest">SAAT AYARLAYIN</p>
                     <input type="time" id="time-input" value="${state.time}" class="w-full p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl font-black text-slate-900 dark:text-white uppercase tracking-widest text-3xl text-center focus:border-brand-primary outline-none shadow-inner">
                     <div class="flex justify-center gap-4">
                        <button class="period-btn px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${state.period === 'AM' ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400'}" data-p="AM">AM (Morning)</button>
                        <button class="period-btn px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${state.period === 'PM' ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-100 text-slate-400'}" data-p="PM">PM (Night)</button>
                     </div>
                     <button id="read-time-btn" class="w-full bg-brand-primary text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">SAATİ SESLENDİR 🔊</button>
                     ${state.timeText ? `<div class="p-6 bg-slate-900 text-brand-primary font-black rounded-3xl animate-slideUp italic">"${state.timeText}"</div>` : ''}
                </div>
            `;
            case 'verbToBe':
                const vt = verbToBeData[state.verbToBeIndex];
                return `
                    <div class="space-y-8 animate-fadeIn">
                        <div class="flex justify-center gap-2 overflow-x-auto pb-2">
                             ${verbToBeData.map((v, i) => `<button class="vt-tab-btn whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${state.verbToBeIndex === i ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-400'}" data-idx="${i}">${v.tense}</button>`).join('')}
                        </div>
                        <div class="text-center">
                            <h3 class="text-4xl font-black text-slate-900 dark:text-white italic uppercase">${vt.forms} ${vt.emoji}</h3>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">${vt.explanation}</p>
                        </div>
                        <div class="h-64 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden shadow-inner flex items-center justify-center relative">
                             ${state.verbToBeLoading ? '<div id="vt-loader"></div>' : state.verbToBeImage ? `<img src="${state.verbToBeImage}" class="w-full h-full object-cover">` : '<span class="text-8xl opacity-10">🖼️</span>'}
                        </div>
                        <div class="grid gap-4">
                             ${vt.usage.map(u => `
                                <div class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <h4 class="text-xs font-black text-brand-primary uppercase tracking-widest mb-1">${u.title}</h4>
                                    <p class="text-[10px] font-bold text-slate-400 mb-3 italic">${u.description}</p>
                                    <div class="flex items-center justify-between">
                                        <p class="text-sm font-black text-slate-800 dark:text-white capitalize">${u.example.en}</p>
                                        <button onclick="window.speakEn('${u.example.en.replace(/'/g, "\\'")}')" class="text-xl opacity-40 hover:opacity-100">🔊</button>
                                    </div>
                                    <p class="text-[10px] font-bold text-slate-400 mt-1">${u.example.tr}</p>
                                </div>
                             `).join('')}
                        </div>
                    </div>
                 `;
            case 'questionFormer':
                const exercises = [
                    { statement: 'I watch a film every night.', underlined: 'a film', ans: 'What do you watch every night?' },
                    { statement: 'She goes to the library on Mondays.', underlined: 'on Mondays', ans: 'How often does she go to the library?' },
                    { statement: 'He is playing in the garden.', underlined: 'in the garden', ans: 'Where is he playing?' }
                ];
                const qf = exercises[state.qfIndex];
                const qfStat = qf.statement.replace(qf.underlined, `<strong class="underline decoration-brand-primary decoration-4 underline-offset-8 text-black dark:text-white">${qf.underlined}</strong>`);
                return `
                    <div class="space-y-10 animate-fadeIn text-center">
                        <div class="p-10 bg-slate-50 dark:bg-slate-800 rounded-[3rem] shadow-inner">
                            <p class="text-lg font-bold text-slate-500 italic leading-relaxed">"${qfStat}"</p>
                        </div>
                        <input type="text" id="qf-input" value="${state.qfAnswer}" placeholder="Doğru soruyu yazın..." class="w-full p-6 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl font-black text-lg focus:border-brand-primary outline-none shadow-xl" ${state.qfFeedback ? 'disabled' : ''}>
                        
                        ${state.qfFeedback ? `
                            <div class="p-6 rounded-3xl font-black uppercase text-xs tracking-widest animate-zoomIn ${state.qfFeedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">
                                ${state.qfFeedback === 'correct' ? 'TEBRİKLER! DOĞRU CEVAP 🎉' : `YANLIŞ! DOĞRU CEVAP:<br><span class="text-sm mt-2 block italic">"${qf.ans}"</span>`}
                            </div>
                        ` : ''}

                        <button id="${state.qfFeedback ? 'qf-next-btn' : 'qf-check-btn'}" class="w-full bg-slate-900 text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">
                            ${state.qfFeedback ? 'SIRADAKİ SORU &rarr;' : 'KONTROL ET 🚀'}
                        </button>
                    </div>
                `;
            case 'sentenceBuilder':
                const sbData = [
                    { tr: 'Ben bir öğrenci değilim.', en: 'I am not a student .' },
                    { tr: 'Sen mutlu musun ?', en: 'Are you happy ?' },
                    { tr: 'O bir doktor.', en: 'He is a doctor .' }
                ];
                const sb = sbData[state.sbIndex];
                if (state.sbWordPool.length === 0 && state.sbArea.length === 0) {
                    state.sbWordPool = sb.en.split(' ').sort(() => Math.random() - 0.5);
                }
                return `
                    <div class="space-y-10 animate-fadeIn text-center">
                        <div class="bg-brand-primary/5 p-8 rounded-[2rem] border-2 border-brand-primary/10">
                            <h4 class="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-4">CÜMLE KUR</h4>
                            <p class="text-xl font-black text-slate-800 dark:text-white uppercase italic">"${sb.tr}"</p>
                        </div>

                        <div class="min-h-[100px] bg-slate-50 dark:bg-slate-800 p-6 rounded-[2.5rem] flex flex-wrap gap-4 items-center justify-center border-4 border-dashed border-slate-100 dark:border-slate-700 shadow-inner">
                            ${state.sbArea.map((w, i) => `<button class="sb-area-btn px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl font-black text-sm shadow-sm hover:scale-95 transition-all" data-idx="${i}">${w}</button>`).join('')}
                        </div>

                        <div class="flex flex-wrap gap-3 justify-center">
                            ${state.sbWordPool.map((w, i) => `<button class="sb-pool-btn px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-lg hover:-translate-y-1 hover:bg-brand-primary transition-all" data-idx="${i}">${w}</button>`).join('')}
                        </div>

                        ${state.sbFeedback ? `
                            <div class="p-6 rounded-3xl font-black uppercase text-xs tracking-widest animate-zoomIn ${state.sbFeedback === 'correct' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}">
                                ${state.sbFeedback === 'correct' ? 'HARİKA! CÜMLE DOĞRU 🎉' : 'HENÜZ DOĞRU DEĞİL, TEKRAR DENE! ❌'}
                            </div>
                        ` : ''}

                        <div class="flex gap-4">
                            <button id="sb-reset-btn" class="flex-1 bg-slate-100 text-slate-400 font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest">SIFIRLA</button>
                            <button id="${state.sbFeedback === 'correct' ? 'sb-next-btn' : 'sb-check-btn'}" class="flex-[2] bg-brand-primary text-white font-black py-5 rounded-[2rem] shadow-xl uppercase tracking-widest text-xs hover:-translate-y-1 transition-all">
                                ${state.sbFeedback === 'correct' ? 'SONRAKİ CÜMLE &rarr;' : 'KONTROL ET 🚀'}
                            </button>
                        </div>
                    </div>
                `;
        }
    };

    const render = () => {
        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🧱</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic flex items-center gap-4">
                        <span>Language Basics</span>
                        <div class="w-10 h-2 bg-brand-primary rounded-full"></div>
                    </h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium mb-10 max-w-2xl text-lg">İngilizcenin temel yapı taşlarını interaktif bir yolculukla keşfedin.</p>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${Object.entries(moduleData).map(([key, data]) => `
                            <button class="module-card bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] text-left border-4 ${state.activeModule === key ? 'border-brand-primary shadow-2xl scale-105' : 'border-transparent hover:border-brand-primary/20'} transition-all group" data-key="${key}">
                                <div class="text-5xl mb-6 group-hover:scale-110 transition-transform">${data.icon}</div>
                                <h3 class="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">${data.title}</h3>
                                <p class="text-xs font-bold text-slate-400 mt-2 italic leading-relaxed">${data.description}</p>
                            </button>
                        `).join('')}
                    </div>
                </div>

                ${state.activeModule ? `
                    <div id="module-container" class="bg-white dark:bg-slate-900 p-10 md:p-16 rounded-[4rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 animate-slideUp">
                         <div class="flex justify-between items-center mb-12">
                            <h2 class="text-2xl font-black text-brand-primary uppercase tracking-[0.3em]">${moduleData[state.activeModule].title}</h2>
                            <button id="close-btn" class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xl hover:rotate-90 transition-all font-black">&times;</button>
                         </div>
                         <div id="module-content">
                            ${renderContents()}
                         </div>
                    </div>
                ` : ''}
            </div>
        `;

        if (state.verbToBeLoading) container.querySelector('#vt-loader')?.appendChild(Loader());
        attachEvents();
    };

    const attachEvents = () => {
        container.querySelectorAll('.module-card').forEach(card => {
            card.onclick = () => {
                const key = card.dataset.key;
                setState({ activeModule: key });
                if (key === 'verbToBe') fetchToBeImage(verbToBeData[state.verbToBeIndex].pexelsQuery);
                window.scrollTo({ top: container.querySelector('#module-container')?.offsetTop - 20, behavior: 'smooth' });
            };
        });

        const closeBtn = container.querySelector('#close-btn');
        if (closeBtn) closeBtn.onclick = () => setState({ activeModule: null });

        // Dates
        const dateInput = container.querySelector('#date-input');
        if (dateInput) dateInput.onchange = (e) => state.date = e.target.value;
        const readDateBtn = container.querySelector('#read-date-btn');
        if (readDateBtn) readDateBtn.onclick = handleDateRead;

        // Time
        const timeInput = container.querySelector('#time-input');
        if (timeInput) timeInput.onchange = (e) => state.time = e.target.value;
        container.querySelectorAll('.period-btn').forEach(btn => btn.onclick = () => setState({ period: btn.dataset.p }));
        const readTimeBtn = container.querySelector('#read-time-btn');
        if (readTimeBtn) readTimeBtn.onclick = handleTimeRead;

        // Verb To Be
        container.querySelectorAll('.vt-tab-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                setState({ verbToBeIndex: idx });
                fetchToBeImage(verbToBeData[idx].pexelsQuery);
            };
        });

        // Question Former
        const qfInput = container.querySelector('#qf-input');
        if (qfInput) qfInput.oninput = (e) => state.qfAnswer = e.target.value;
        const qfCheck = container.querySelector('#qf-check-btn');
        if (qfCheck) qfCheck.onclick = () => {
            const exercises = [
                { ans: 'What do you watch every night?' },
                { ans: 'How often does she go to the library?' },
                { ans: 'Where is he playing?' }
            ];
            const correct = exercises[state.qfIndex].ans.toLowerCase().replace(/\?$/, '');
            const user = state.qfAnswer.toLowerCase().trim().replace(/\?$/, '');
            setState({ qfFeedback: user === correct ? 'correct' : 'incorrect' });
        };
        const qfNext = container.querySelector('#qf-next-btn');
        if (qfNext) qfNext.onclick = () => setState({ qfIndex: (state.qfIndex + 1) % 3, qfAnswer: '', qfFeedback: null });

        // Sentence Builder
        container.querySelectorAll('.sb-pool-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                const w = state.sbWordPool[idx];
                state.sbWordPool.splice(idx, 1);
                state.sbArea.push(w);
                render();
            };
        });
        container.querySelectorAll('.sb-area-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.idx);
                const w = state.sbArea[idx];
                state.sbArea.splice(idx, 1);
                state.sbWordPool.push(w);
                render();
            };
        });
        const sbCheck = container.querySelector('#sb-check-btn');
        if (sbCheck) sbCheck.onclick = () => {
            const sentences = ['I am not a student .', 'Are you happy ?', 'He is a doctor .'];
            const correct = sentences[state.sbIndex];
            setState({ sbFeedback: state.sbArea.join(' ') === correct ? 'correct' : 'incorrect' });
        };
        const sbNext = container.querySelector('#sb-next-btn');
        if (sbNext) sbNext.onclick = () => setState({ sbIndex: (state.sbIndex + 1) % 3, sbArea: [], sbWordPool: [], sbFeedback: null });
        const sbReset = container.querySelector('#sb-reset-btn');
        if (sbReset) sbReset.onclick = () => setState({ sbArea: [], sbWordPool: [], sbFeedback: null });
    };

    render();
    return container;
};
