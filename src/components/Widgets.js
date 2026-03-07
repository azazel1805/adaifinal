import store from '../store/index';
import { getWeatherForLocation, getPhrasalVerbOfTheDay } from '../services/geminiService';

/**
 * Weather and Time Widget
 */
export function renderWeatherWidget() {
    const container = document.createElement('div');
    container.className = 'bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 w-full flex flex-col sm:flex-row justify-between items-center gap-4';

    let time = new Date();
    let weather = null;
    let isLoading = true;

    const updateUI = () => {
        container.innerHTML = `
      <div class="flex items-center gap-3">
        <span class="text-2xl">📍</span>
        <div>
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">
            ${isLoading ? 'Konum alınıyor...' : (weather?.city || 'Yerel Zaman')}
          </h3>
        </div>
      </div>
      <div class="flex items-center gap-6">
        ${weather ? `
          <div class="flex items-center gap-2 text-center">
            <span class="text-4xl">${weather.icon}</span>
            <div>
              <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">${weather.temperature}°C</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">${weather.description}</p>
            </div>
          </div>
        ` : ''}
        <div class="text-center sm:text-right">
          <p class="text-4xl font-bold font-mono text-adai-primary">
            ${time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            ${time.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>
    `;
    };

    setInterval(() => {
        time = new Date();
        updateUI();
    }, 60000);

    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const { latitude, longitude } = pos.coords;
                const res = await getWeatherForLocation(latitude, longitude);
                weather = JSON.parse(res);
            } catch (e) {
                console.error(e);
            } finally {
                isLoading = false;
                updateUI();
            }
        }, () => {
            isLoading = false;
            updateUI();
        });
    }

    updateUI();
    return container;
}

/**
 * Phrasal Verb Widget
 */
export function renderPhrasalVerbWidget() {
    const container = document.createElement('div');
    container.className = 'bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full';

    let data = null;
    let isLoading = true;

    const updateUI = () => {
        container.innerHTML = `
      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl">📚</span>
        <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">Her Güne Bir Kelime</h3>
      </div>
      ${isLoading ? '<div class="animate-pulse flex space-y-4 flex-col"><div class="h-4 bg-slate-200 rounded w-3/4"></div><div class="h-4 bg-slate-200 rounded"></div></div>' : ''}
      ${data ? `
        <div class="space-y-3">
          <div>
            <h4 class="text-xl font-bold text-adai-primary capitalize">${data.phrasalVerb}</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400 italic">${data.meaning}</p>
          </div>
          <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            ${data.examples.map(ex => `
              <div class="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-sm">
                <p class="text-slate-800 dark:text-slate-200">${ex.en}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 italic mt-1">${ex.tr}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
    };

    const fetchVerb = async () => {
        try {
            const res = await getPhrasalVerbOfTheDay();
            data = JSON.parse(res);
        } catch (e) {
            console.error(e);
        } finally {
            isLoading = false;
            updateUI();
        }
    };

    fetchVerb();
    updateUI();
    return container;
}
