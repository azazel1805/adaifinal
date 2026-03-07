import store from '../store/index';

/**
 * Daily Challenge Widget
 */
export function renderDailyChallengeWidget() {
    const container = document.createElement('div');
    container.className = 'bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full transition-all duration-300 hover:shadow-adai-primary/20 hover:-translate-y-1';

    const updateUI = () => {
        const state = store.getState();
        const challenge = state.currentChallenge;
        const streak = state.streak || 0;

        container.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🎯</span>
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200">Günlük Hedef</h3>
        </div>
        <div class="flex items-center gap-1 text-orange-500 bg-orange-400/20 px-2 py-1 rounded-full">
          <span>🔥</span>
          <span class="font-bold text-sm">${streak}</span>
        </div>
      </div>
      
      ${!challenge ? `
          <div class="text-center mt-4 flex flex-col items-center justify-center h-full">
              <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">Bugün için bir hedef belirlemedin. Hadi başlayalım!</p>
              <button id="set-goal-btn" class="w-full px-6 py-3 bg-adai-primary hover:bg-adai-secondary text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  Hedef Belirle
              </button>
          </div>
      ` : challenge.completed ? `
        <div class="text-center bg-green-100 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 rounded-lg mt-4 flex flex-col items-center justify-center h-full">
          <p class="text-2xl mb-2">🎉</p>
          <p class="font-bold text-green-700 dark:text-green-300">Harika! Bugünkü görevi tamamladın.</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${challenge.description}</p>
        </div>
      ` : `
        <div class="mt-4 flex flex-col justify-between h-full">
          <p class="text-slate-600 dark:text-slate-400 text-sm mb-3">${challenge.description}</p>
          <div>
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
              <div 
                class="bg-adai-primary h-2.5 rounded-full transition-all duration-500" 
                style="width: ${Math.min((challenge.progress / challenge.target) * 100, 100)}%"
              ></div>
            </div>
            <p class="text-right text-xs text-slate-500 dark:text-slate-400 mt-1">${challenge.progress} / ${challenge.target}</p>
            <button id="start-challenge-btn" class="w-full mt-3 px-4 py-2 bg-adai-secondary text-white rounded-lg hover:bg-adai-primary transition-all duration-200 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Hemen Başla
            </button>
          </div>
        </div>
      `}
    `;

        const setGoalBtn = container.querySelector('#set-goal-btn');
        if (setGoalBtn) {
            setGoalBtn.addEventListener('click', () => {
                // Open modal logic (to be implemented)
                console.log('Set goal clicked');
            });
        }

        const startBtn = container.querySelector('#start-challenge-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                window.location.hash = challenge.type === 'analyze' ? 'analyzer' : challenge.type;
            });
        }
    };

    store.subscribe(updateUI);
    updateUI();
    return container;
}
