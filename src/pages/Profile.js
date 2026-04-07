import store from '../store/index';
import { allAchievements } from '../achievements';
// Social and Auth removed

export const renderProfile = () => {
    const container = document.createElement('div');
    container.className = 'max-w-5xl mx-auto space-y-10 animate-fadeIn';

    const render = () => {
        const { user, history, vocabularyList, challengeState, performanceStats, friends, pendingRequests } = store.getState();
        const stats = performanceStats || {};

        let totalCorrect = 0;
        let totalQuestions = 0;
        Object.values(stats).forEach(s => {
            totalCorrect += (s.correct || 0);
            totalQuestions += (s.total || 0);
        });

        const successRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
        const unlocked = allAchievements.filter(ach => ach.isUnlocked(history, vocabularyList, challengeState));

        container.innerHTML = `
            <!-- Profile Header -->
            <div class="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 flex flex-col md:flex-row items-center gap-10">
                <div class="relative group cursor-pointer" id="avatar-container">
                    <div class="w-32 h-32 rounded-full border-4 border-brand-primary shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <img id="profile-img-preview" src="${user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'G'}&size=256&background=f0f9ff&color=0ea5e9&bold=true`}" class="w-full h-full object-cover">
                        <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span class="text-white text-xs font-black uppercase">Değiştir</span>
                        </div>
                    </div>
                    <div class="absolute -bottom-2 -right-2 bg-brand-primary text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg">
                        <span class="text-lg">✨</span>
                    </div>
                    <input type="file" id="photo-input" class="hidden" accept="image/*">
                </div>
                
                <div class="text-center md:text-left flex-1 space-y-4">
                    <div class="flex flex-col md:flex-row md:items-center gap-4">
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">${user?.displayName || 'Guest User'}</h2>
                        <span class="hidden md:inline-block px-4 py-1.5 bg-brand-primary/10 text-brand-primary rounded-full text-[10px] font-black uppercase tracking-widest border border-brand-primary/20">Alpha Member</span>
                    </div>
                    <p class="text-slate-500 font-bold italic">${user?.email || 'No email connected'}</p>
                    
                    <div class="flex flex-wrap gap-4 pt-2 justify-center md:justify-start">
                        <div class="px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-3">
                            <span class="text-xl">🔥</span>
                            <div>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">STREAK</p>
                                <p class="text-lg font-black text-slate-900 dark:text-white">${challengeState?.streak || 0} GÜN</p>
                            </div>
                        </div>
                        <div class="px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-3">
                            <span class="text-xl">🎯</span>
                            <div>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">SUCCESS RATE</p>
                                <p class="text-lg font-black text-slate-900 dark:text-white">%${successRate}</p>
                            </div>
                        </div>
                        <div class="px-5 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-3">
                            <span class="text-xl">🏆</span>
                            <div>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">LEVEL</p>
                                <p class="text-lg font-black text-slate-900 dark:text-white">${Math.floor(totalCorrect / 10) + 1}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Stats & Settings Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <!-- Left: Stats Breakdown -->
                <div class="lg:col-span-2 space-y-10">
                    <div class="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800">
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-10 border-b border-slate-50 dark:border-slate-800 pb-4">DETAYLI ANALİZ</h3>
                        
                        <div class="grid gap-8">
                            ${Object.keys(stats).length > 0 ? Object.entries(stats).map(([key, value]) => `
                                <div class="space-y-4">
                                    <div class="flex justify-between items-end">
                                        <h4 class="font-black text-slate-700 dark:text-white text-sm uppercase tracking-tight italic">${key}</h4>
                                        <p class="text-xs font-bold text-slate-400">${value.correct} / ${value.total} Doğru</p>
                                    </div>
                                    <div class="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div class="h-full bg-brand-primary rounded-full" style="width: ${(value.correct / value.total) * 100}%"></div>
                                    </div>
                                </div>
                            `).join('') : `
                                <div class="py-10 text-center space-y-4">
                                    <p class="text-4xl">🌵</p>
                                    <p class="text-slate-400 font-bold italic">Henüz yeterli verin yok. Biraz pratik yap!</p>
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Friends section removed -->
                </div>

                <!-- Right: Achievements & Settings -->
                <div class="space-y-10">
                    <!-- Achievements -->
                    <div class="bg-slate-950 p-10 rounded-[3.5rem] shadow-2xl border-4 border-white/5 space-y-8">
                        <div class="flex justify-between items-center border-b border-white/10 pb-4">
                            <h3 class="text-xs font-black text-brand-primary uppercase tracking-widest">AWARDS</h3>
                            <span class="text-xs font-black text-white">${unlocked.length} / ${allAchievements.length}</span>
                        </div>
                        <div class="grid grid-cols-3 gap-4">
                            ${allAchievements.map(ach => {
            const isUnlocked = unlocked.some(ua => ua.id === ach.id);
            return `
                                    <div title="${ach.title}: ${ach.description}" class="aspect-square rounded-2xl ${isUnlocked ? 'bg-white/10 border-white/20' : 'bg-white/5 opacity-20'} border flex items-center justify-center text-2xl filter grayscale-${isUnlocked ? '0' : '1'} transition-all hover:scale-110">
                                        ${ach.icon}
                                    </div>
                                `;
        }).slice(0, 9).join('')}
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 space-y-4">
                        <h3 class="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-4">SETTINGS</h3>
                        <button id="edit-name-btn" class="w-full text-left p-6 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between">
                            İsim Değiştir <span>📝</span>
                        </button>
                        <button id="edit-photo-btn" class="w-full text-left p-6 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between">
                            Resim Değiştir <span>📸</span>
                        </button>
                        <button id="reset-data-btn" class="w-full text-left p-6 bg-red-500/5 hover:bg-red-500/10 rounded-2xl font-bold text-sm text-red-500 transition-all flex items-center justify-between">
                            Tüm Verileri Sıfırla <span>🔥</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        attachEvents();
    };

    const attachEvents = () => {
        container.querySelector('#edit-name-btn')?.addEventListener('click', () => {
            const newName = prompt('Yeni isminizi girin:', store.getState().user?.displayName);
            if (newName && newName.trim()) {
                const user = { ...store.getState().user, displayName: newName };
                store.setState({ user });
                localStorage.setItem('adai_user_name', newName);
            }
        });

        const handlePhotoLink = () => {
            const input = container.querySelector('#photo-input');
            input?.click();
        };

        container.querySelector('#avatar-container')?.addEventListener('click', handlePhotoLink);
        container.querySelector('#edit-photo-btn')?.addEventListener('click', handlePhotoLink);

        container.querySelector('#photo-input')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    alert('Resim boyutu 2MB dan küçük olmalıdır.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    const photoURL = event.target.result;
                    const user = { ...store.getState().user, photoURL };
                    store.setState({ user });
                    localStorage.setItem('adai_user_photo', photoURL);
                };
                reader.readAsDataURL(file);
            }
        });

        container.querySelector('#reset-data-btn')?.addEventListener('click', () => {
            if (confirm('DİKKAT! Tüm çalışma verileriniz ve başarımlarınız kalıcı olarak silinecek. Emin misiniz?')) {
                localStorage.clear();
                window.location.reload();
            }
        });

        // Friend Action Events removed
    };

    render();
    store.subscribe(() => {
        if (store.getState().activeTab === 'profile') render();
    });

    return container;
};
