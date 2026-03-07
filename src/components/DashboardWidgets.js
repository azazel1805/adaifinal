import store from '../store/index';
import { getWeatherForLocation, getPhrasalVerbOfTheDay } from '../services/geminiService';
import { Loader, ErrorMessage } from './Common';

const LocationIcon = (className = "w-6 h-6") => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${className}"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>`;
const FireIcon = (className = "w-5 h-5") => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${className}"><path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>`;
const TargetIcon = (className = "w-6 h-6 text-brand-primary") => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${className}"><path stroke-linecap="round" stroke-linejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" /></svg>`;
const PhrasalVerbIcon = (className = "w-6 h-6 text-brand-primary") => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${className}"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>`;
const VocabularyIcon = (className = "w-6 h-6 text-brand-primary") => `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="${className}"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>`;


export const Widget = (content, className = '') => {
    const el = document.createElement('div');
    el.className = `bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full transition-all duration-300 hover:shadow-brand-primary/20 hover:-translate-y-1 ${className}`;
    if (typeof content === 'string') el.innerHTML = content;
    else el.appendChild(content);
    return el;
};

export const renderTimeAndWeatherWidget = () => {
    const container = document.createElement('div');
    container.className = 'bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 w-full flex flex-col sm:flex-row justify-between items-center gap-4';

    const updateTime = () => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });

        const timeEl = container.querySelector('#current-time');
        const dateEl = container.querySelector('#current-date');
        if (timeEl) timeEl.innerText = timeStr;
        if (dateEl) dateEl.innerText = dateStr;
    };

    container.innerHTML = `
        <div class="flex items-center gap-3 text-slate-800 dark:text-slate-200">
            ${LocationIcon()}
            <div>
                <h3 id="location-name" class="text-lg font-bold">Konum alınıyor...</h3>
                <p id="location-error" class="text-xs text-red-500 hidden"></p>
            </div>
        </div>
        <div class="flex items-center gap-6">
            <div id="weather-area" class="flex items-center gap-2 text-center hidden">
                <span id="weather-icon" class="text-4xl"></span>
                <div>
                    <p id="weather-temp" class="text-2xl font-bold text-slate-800 dark:text-slate-200"></p>
                    <p id="weather-desc" class="text-xs text-slate-500 dark:text-slate-400"></p>
                </div>
            </div>
            <div class="text-center sm:text-right">
                <p id="current-time" class="text-4xl font-bold font-mono text-brand-primary"></p>
                <p id="current-date" class="text-xs text-slate-500 dark:text-slate-400"></p>
            </div>
        </div>
    `;

    setInterval(updateTime, 1000);
    updateTime();

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const weatherRaw = await getWeatherForLocation(pos.coords.latitude, pos.coords.longitude);
                const w = JSON.parse(weatherRaw);
                container.querySelector('#location-name').innerText = w.city || 'Yerel Zaman';
                container.querySelector('#weather-area').classList.remove('hidden');
                container.querySelector('#weather-icon').innerText = w.icon;
                container.querySelector('#weather-temp').innerText = `${w.temperature}°C`;
                container.querySelector('#weather-desc').innerText = w.description;
            } catch (e) {
                container.querySelector('#location-error').innerText = "Hava durumu alınamadı.";
                container.querySelector('#location-error').classList.remove('hidden');
            }
        }, () => {
            container.querySelector('#location-name').innerText = 'Yerel Zaman';
        });
    }

    return container;
};

export const renderPhrasalVerbWidget = () => {
    const el = Widget('', 'min-h-[200px]');
    el.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
            ${PhrasalVerbIcon()}
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">Her Güne Bir Kelime</h3>
        </div>
        <div id="phrasal-content"></div>
    `;

    const content = el.querySelector('#phrasal-content');
    content.appendChild(Loader());

    const fetchPhrase = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const cached = localStorage.getItem('phrasalVerbOfTheDay');
            let data;
            if (cached) {
                const parsed = JSON.parse(cached);
                if (parsed.date === today) data = parsed.phrasalVerb;
            }

            if (!data) {
                const raw = await getPhrasalVerbOfTheDay();
                data = JSON.parse(raw);
                localStorage.setItem('phrasalVerbOfTheDay', JSON.stringify({ date: today, phrasalVerb: data }));
            }

            content.innerHTML = `
                <div class="space-y-3">
                    <div>
                        <h4 class="text-xl font-bold text-brand-primary capitalize">${data.phrasalVerb}</h4>
                        <p class="text-sm text-slate-500 dark:text-slate-400 italic">${data.meaning}</p>
                    </div>
                    <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        ${data.examples.map(ex => `
                            <div class="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm">
                                <p class="text-slate-800 dark:text-slate-200 font-medium">${ex.en}</p>
                                <p class="text-xs text-slate-500 dark:text-slate-400 italic mt-1">${ex.tr}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        } catch (e) {
            content.innerHTML = ErrorMessage("Günün Deyimi alınamadı.").outerHTML;
        }
    };
    fetchPhrase();

    return el;
};

export const renderVocabularyWidget = (onNavigate) => {
    const { vocabularyList } = store.getState();
    const count = vocabularyList.length;
    const el = Widget(`
        <div class="flex items-center gap-3 mb-4">
            ${VocabularyIcon()}
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">Kelime Hazinesi</h3>
        </div>
        <div class="text-center">
            <p class="text-5xl font-bold text-brand-primary">${count}</p>
            <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">kayıtlı kelime</p>
            <button id="vocab-btn" class="w-full px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5">
                ${count > 0 ? 'Pratik Yap' : 'Kelime Ekle'}
            </button>
        </div>
    `);
    el.querySelector('#vocab-btn').addEventListener('click', () => onNavigate(count > 0 ? 'vocabulary' : 'dictionary'));
    return el;
};

export const renderDailyChallengeWidget = (onNavigate) => {
    const { challengeState } = store.getState();
    const { currentChallenge, streak } = challengeState;

    const el = Widget(`
        <div class="flex justify-between items-start">
            <div class="flex items-center gap-3 mb-2">
                ${TargetIcon()}
                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">Günlük Hedef</h3>
            </div>
            <div class="flex items-center gap-1 text-orange-500 bg-orange-400/20 px-2 py-1 rounded-full">
                ${FireIcon()}
                <span class="font-bold text-sm">${streak}</span>
            </div>
        </div>
        <div id="challenge-content" class="mt-4 flex flex-col h-full"></div>
    `);

    const content = el.querySelector('#challenge-content');
    if (!currentChallenge) {
        content.innerHTML = `
            <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Bugün için bir hedef belirlemedin.</p>
            <button id="set-target-btn" class="w-full px-6 py-3 bg-brand-primary text-white font-bold rounded-lg transition-all shadow-md">Hedef Belirle</button>
        `;
        content.querySelector('#set-target-btn').addEventListener('click', () => onNavigate('dashboard')); // We'll open modal in dashboard
    } else if (currentChallenge.completed) {
        content.innerHTML = `
            <div class="text-center bg-green-100 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 rounded-lg flex flex-col items-center">
                <p class="text-2xl mb-2">🎉</p>
                <p class="font-bold text-green-700 dark:text-green-300">Görevi tamamladın!</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${currentChallenge.description}</p>
            </div>
        `;
    } else {
        const progress = Math.min((currentChallenge.progress / currentChallenge.target) * 100, 100);
        content.innerHTML = `
            <p class="text-slate-600 dark:text-slate-400 text-sm mb-3">${currentChallenge.description}</p>
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                <div class="bg-brand-primary h-2.5 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
            </div>
            <p class="text-right text-xs text-slate-500 dark:text-slate-400 mt-1">${currentChallenge.progress} / ${currentChallenge.target}</p>
            <button id="go-btn" class="w-full mt-3 px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-all font-bold shadow-md">Hemen Başla</button>
        `;
        content.querySelector('#go-btn').addEventListener('click', () => onNavigate(currentChallenge.type));
    }

    return el;
};
