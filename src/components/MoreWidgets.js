import store from '../store/index';

/**
 * Vocabulary Widget
 */
export function renderVocabularyWidget() {
    const container = document.createElement('div');
    container.className = 'bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full transition-all duration-300 hover:shadow-adai-primary/20 hover:-translate-y-1';

    const updateUI = () => {
        const state = store.getState();
        const vocabularyList = state.vocabularyList || [];

        container.innerHTML = `
      <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">📖</span>
          <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">Kelime Hazinesi</h3>
      </div>
      <div class="text-center">
        <p class="text-5xl font-bold text-adai-primary">${vocabularyList.length}</p>
        <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">kayıtlı kelime</p>
        <button id="practice-btn" class="w-full px-6 py-2 bg-adai-secondary text-white rounded-lg hover:bg-adai-primary transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5">
          ${vocabularyList.length > 0 ? 'Pratik Yap' : 'Kelime Ekle'}
        </button>
      </div>
    `;

        container.querySelector('#practice-btn').addEventListener('click', () => {
            window.location.hash = vocabularyList.length > 0 ? 'vocabulary' : 'dictionary';
        });
    };

    store.subscribe(updateUI);
    updateUI();
    return container;
}

/**
 * Achievements Widget
 */
export function renderAchievementsWidget() {
    const container = document.createElement('div');
    container.className = 'bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full';

    const updateUI = () => {
        const state = store.getState();
        const achievements = state.unlockedAchievements || [];
        const totalCount = 10; // Placeholder for total achievements count

        container.innerHTML = `
      <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Başarımlar (${achievements.length}/${totalCount})</h3>
      ${achievements.length > 0 ? `
        <div class="flex flex-wrap gap-4">
          ${achievements.slice(0, 8).map(ach => `
            <div title="${ach.description}" class="flex flex-col items-center text-center w-24">
              <div class="relative w-20 h-20">
                <svg viewBox="0 0 100 100" class="w-full h-full">
                  <path d="M50 2.5 L95.5 26.25 V73.75 L50 97.5 L4.5 73.75 V26.25 Z" class="fill-slate-200 dark:fill-slate-700" />
                  <path d="M50 5 L93 27.5 V72.5 L50 95 L7 72.5 V27.5 Z" class="fill-none stroke-adai-primary stroke-2" />
                </svg>
                <div class="absolute inset-0 flex items-center justify-center text-4xl">
                  ${ach.icon}
                </div>
              </div>
              <p class="text-xs font-bold mt-2 h-8 leading-tight text-slate-700 dark:text-slate-300">${ach.title}</p>
            </div>
          `).join('')}
        </div>
      ` : `
        <p class="text-slate-500 dark:text-slate-400 text-sm">Henüz bir başarım kazanmadın. Çalışmaya devam et!</p>
      `}
    `;
    };

    store.subscribe(updateUI);
    updateUI();
    return container;
}
