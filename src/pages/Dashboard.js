import store from '../store/index';
import { setDailyChallenge } from '../store/challenge';
import { allAchievements } from '../achievements';
import {
  renderTimeAndWeatherWidget,
  renderDailyChallengeWidget,
  renderPhrasalVerbWidget,
  renderVocabularyWidget
} from '../components/DashboardWidgets';

export const renderDashboard = () => {
  const container = document.createElement('div');
  container.className = 'space-y-8';

  const onNavigate = (path) => {
    store.setState({ activeTab: path });
  };

  const renderSetGoalModal = () => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4';

    let modalState = {
      tab: 'activity', // 'activity' | 'topic'
      topic: 'analyzer',
      target: 3
    };

    const activityGoals = [
      { description: '1 konuşma pratiği yap', type: 'chat', target: 1 },
      { description: '1 cümle sıralama alıştırması çöz', type: 'sentence_ordering', target: 1 },
      { description: '3 yeni kelime ara', type: 'dictionary', target: 3 },
      { description: '1 okuma pratiği tamamla', type: 'reading', target: 1 },
    ];

    const topicGoals = [
      { label: 'Metin Analizi Yap', type: 'analyzer' },
      { label: 'Bağlam Analizci', type: 'cohesion_analyzer' },
    ];

    const renderContent = () => {
      modal.innerHTML = `
                <div class="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-lg border-2 border-slate-200 dark:border-slate-800">
                    <div class="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-200">Günlük Hedefini Belirle</h3>
                        <button id="close-modal" class="text-slate-500 dark:text-slate-400 text-2xl hover:text-slate-900 dark:hover:text-slate-50">&times;</button>
                    </div>
                    
                    <div class="p-2 bg-slate-100 dark:bg-slate-800 m-4 rounded-lg flex gap-1">
                        <button id="tab-activity" class="flex-1 p-2 text-sm font-semibold rounded-md transition-colors ${modalState.tab === 'activity' ? 'bg-brand-primary text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}">Aktiviteye Göre</button>
                        <button id="tab-topic" class="flex-1 p-2 text-sm font-semibold rounded-md transition-colors ${modalState.tab === 'topic' ? 'bg-brand-primary text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}">Konuya Göre</button>
                    </div>

                    <div class="p-6 pt-2">
                        ${modalState.tab === 'activity' ? `
                            <div class="space-y-3">
                                <h4 class="text-slate-600 dark:text-slate-400 mb-2">Bir aktivite hedefi seç:</h4>
                                ${activityGoals.map(goal => `
                                    <button class="activity-goal-btn w-full text-left p-4 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-brand-primary/20 transition-colors duration-200 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-primary" data-type="${goal.type}" data-target="${goal.target}" data-desc="${goal.description}">
                                        ${goal.description}
                                    </button>
                                `).join('')}
                            </div>
                        ` : `
                            <div class="space-y-4">
                                <h4 class="text-slate-600 dark:text-slate-400 mb-2">Belirli bir araca odaklan:</h4>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Araç Tipi</label>
                                    <select id="topic-select" class="w-full p-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none text-slate-800 dark:text-slate-200">
                                      ${topicGoals.map(opt => `<option value="${opt.type}" ${modalState.topic === opt.type ? 'selected' : ''}>${opt.label}</option>`).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Hedef Sayısı</label>
                                    <input type="number" id="target-input" min="1" max="10" value="${modalState.target}" class="w-full p-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-brand-primary focus:outline-none text-slate-800 dark:text-slate-200" />
                                </div>
                                <button id="set-goal-btn" class="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                    Hedefi Ayarla
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            `;

      modal.querySelector('#close-modal').addEventListener('click', () => modal.remove());
      modal.querySelector('#tab-activity').addEventListener('click', () => { modalState.tab = 'activity'; renderContent(); });
      modal.querySelector('#tab-topic').addEventListener('click', () => { modalState.tab = 'topic'; renderContent(); });

      if (modalState.tab === 'activity') {
        modal.querySelectorAll('.activity-goal-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const { type, target, desc } = btn.dataset;
            setDailyChallenge({ type, target: parseInt(target), description: desc });
            modal.remove();
            render(); // Re-render dashboard
          });
        });
      } else {
        modal.querySelector('#topic-select').addEventListener('change', (e) => { modalState.topic = e.target.value; });
        modal.querySelector('#target-input').addEventListener('input', (e) => { modalState.target = parseInt(e.target.value); });
        modal.querySelector('#set-goal-btn').addEventListener('click', () => {
          const selected = topicGoals.find(g => g.type === modalState.topic);
          setDailyChallenge({
            description: `${modalState.target} adet "${selected.label}" hedefi`,
            type: modalState.topic,
            target: modalState.target
          });
          modal.remove();
          render();
        });
      }
    };

    renderContent();
    document.body.appendChild(modal);
  };

  const render = () => {
    const { user, history, vocabularyList, challengeState } = store.getState();
    const displayName = user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı';

    container.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-50">Hoşgeldin, ${displayName}!</h2>
                    <p class="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Welcome back to your English journey.</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="lg:col-span-2" id="time-weather-slot"></div>
                <div class="lg:col-span-1" id="challenge-slot"></div>
                <div class="lg:col-span-1" id="vocab-slot"></div>
                <div class="lg:col-span-1" id="phrasal-slot"></div>
                <div class="lg:col-span-1" id="achievements-slot"></div>
            </div>
        `;

    container.querySelector('#time-weather-slot').appendChild(renderTimeAndWeatherWidget());

    const challengeWidget = renderDailyChallengeWidget(onNavigate);
    const setTargetBtn = challengeWidget.querySelector('#set-target-btn');
    if (setTargetBtn) setTargetBtn.addEventListener('click', renderSetGoalModal);
    container.querySelector('#challenge-slot').appendChild(challengeWidget);

    container.querySelector('#vocab-slot').appendChild(renderVocabularyWidget(onNavigate));
    container.querySelector('#phrasal-slot').appendChild(renderPhrasalVerbWidget());

    const achievementsSlot = container.querySelector('#achievements-slot');
    const unlocked = allAchievements.filter(ach => ach.isUnlocked(history, vocabularyList, challengeState));

    const achWidget = document.createElement('div');
    achWidget.className = 'bg-white dark:bg-slate-900 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-800 h-full';
    achWidget.innerHTML = `
            <h3 class="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Başarımlar (${unlocked.length}/${allAchievements.length})</h3>
            ${unlocked.length > 0 ? `
                <div class="flex flex-wrap gap-4">
                    ${unlocked.slice(0, 4).map(ach => `
                        <div title="${ach.description}" class="flex flex-col items-center text-center w-20">
                            <div class="relative w-16 h-16 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-brand-primary">
                                <span class="text-3xl">${ach.icon}</span>
                            </div>
                            <p class="text-[10px] font-bold mt-2 leading-tight text-slate-700 dark:text-slate-300">${ach.title}</p>
                        </div>
                    `).join('')}
                </div>
            ` : '<p class="text-slate-500 dark:text-slate-400 text-sm italic">Henüz bir başarım kazanmadın. Çalışmaya devam et!</p>'}
        `;
    achievementsSlot.appendChild(achWidget);
  };

  render();

  // Subscribe to store changes to keep widgets updated (e.g. daily goal progress)
  store.subscribe(() => {
    if (store.getState().activeTab === 'dashboard') {
      // Minimal approach: re-render the whole dashboard. Optimized approach would re-render only specific widgets.
      render();
    }
  });

  return container;
};
