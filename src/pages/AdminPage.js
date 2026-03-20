import store from '../store/index';
import { 
    getAllUsers, 
    activateUserSubscription, 
    deactivateUserSubscription 
} from '../services/adminService';

export const renderAdminPage = () => {
    const container = document.createElement('div');
    container.className = 'max-w-[1440px] mx-auto space-y-10';

    let state = {
        users: [],
        selectedUser: null,
        userData: null,
        isLoading: false
    };

    const loadUsers = async () => {
        const users = await getAllUsers();
        setState({ users });
    };

    loadUsers();

    const setState = (newState) => {
        state = { ...state, ...newState };
        render();
    };

    const loadUserData = (uid) => {
        setState({ isLoading: true });
        try {
            const historyRaw = localStorage.getItem(`yds-analysis-history-${uid}`);
            const examsRaw = localStorage.getItem(`yds-exam-history-${uid}`);
            const vocRaw = localStorage.getItem(`vocabulary-list-${uid}`);
            const chalRaw = localStorage.getItem(`challenge-state-${uid}`);

            setState({
                userData: {
                    history: historyRaw ? JSON.parse(historyRaw) : [],
                    exams: examsRaw ? JSON.parse(examsRaw) : [],
                    vocabulary: vocRaw ? JSON.parse(vocRaw) : [],
                    challenge: chalRaw ? JSON.parse(chalRaw) : null,
                },
                isLoading: false
            });
        } catch (e) {
            console.error(e);
            setState({ isLoading: false, userData: null });
        }
    };

    const render = () => {
        const { user: currentUser } = store.getState();
        const users = state.users;
        const selectedUserData = users.find(u => u.uid === state.selectedUser);
        const email = currentUser?.email?.toLowerCase();
        if (email !== 'admin@adai.com' && email !== 'onurtosuner@gmail.com' && currentUser?.uid !== 'admin') {
            container.innerHTML = `
                <div class="text-center py-20 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border-4 border-red-500/10">
                    <span class="text-8xl block mb-8">🚫</span>
                    <h2 class="text-3xl font-black text-red-500 mb-2 uppercase italic tracking-tight">Erişim Engellendi</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Bu sayfaya sadece yöneticiler erişebilir. Lütfen yetkili hesabı ile giriş yapın.</p>
                </div>
            `;
            return;
        }

        const otherUsers = (users || []).filter(u => u.uid !== 'admin');

        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">👑</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic flex items-center gap-4">
                        <span>Admin Console</span>
                        <div class="w-10 h-2 bg-brand-primary rounded-full"></div>
                    </h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium mb-8">Tüm kullanıcıların verilerini ve ilerlemelerini buradan takip edebilirsiniz.</p>

                        <select id="user-select" class="w-full max-w-sm p-6 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-[2rem] focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary focus:outline-none font-black text-slate-900 dark:text-white transition-all shadow-inner uppercase tracking-widest text-xs">
                            <option value="">KULLANICI SEÇİN...</option>
                            ${users.map(u => `<option value="${u.uid}" ${state.selectedUser === u.uid ? 'selected' : ''}>${u.email} (${u.uid.slice(0, 6)})</option>`).join('')}
                        </select>
                        ${state.isLoading ? '<span class="text-xs font-black text-brand-primary animate-pulse uppercase tracking-[0.2em]">VERİLER ALINIYOR...</span>' : ''}
                    </div>

                    ${selectedUserData ? `
                         <div class="mt-10 p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                             <h4 class="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6">🔑 ABONELİK YÖNETİMİ</h4>
                             <div class="flex flex-wrap items-center gap-4">
                                 <div class="px-6 py-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                                     <span class="block text-[10px] font-black text-zinc-400 uppercase mb-1">DURUM</span>
                                     <span class="text-sm font-black ${selectedUserData.subscription?.status === 'active' ? 'text-green-500' : 'text-red-500'} uppercase italic">${selectedUserData.subscription?.status || 'Bilinmiyor'}</span>
                                 </div>
                                 <div class="px-6 py-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                                     <span class="block text-[10px] font-black text-zinc-400 uppercase mb-1">PLAN</span>
                                     <span class="text-sm font-black text-zinc-700 dark:text-zinc-200 uppercase italic">${selectedUserData.subscription?.plan || 'YOK'}</span>
                                 </div>
                                 ${selectedUserData.subscription?.endDate ? `
                                     <div class="px-6 py-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800">
                                         <span class="block text-[10px] font-black text-zinc-400 uppercase mb-1">BİTİŞ</span>
                                         <span class="text-sm font-black text-zinc-700 dark:text-zinc-200 italic">${selectedUserData.subscription.endDate.toDate().toLocaleDateString('tr-TR')}</span>
                                     </div>
                                 ` : ''}
                             </div>
                             
                             <div class="flex flex-wrap gap-2 mt-6">
                                 <button class="sub-action-btn bg-brand-primary hover:bg-brand-secondary text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all" data-uid="${selectedUserData.uid}" data-action="1">1 AY SÜRE EKLE</button>
                                 <button class="sub-action-btn bg-brand-primary hover:bg-brand-secondary text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all" data-uid="${selectedUserData.uid}" data-action="3">3 AY SÜRE EKLE</button>
                                 <button class="sub-action-btn bg-brand-primary hover:bg-brand-secondary text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all" data-uid="${selectedUserData.uid}" data-action="12">1 YIL SÜRE EKLE</button>
                                 <button class="sub-action-btn bg-red-500 hover:bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all" data-uid="${selectedUserData.uid}" data-action="0">DONDUR/İPTAL</button>
                             </div>
                         </div>
                    ` : ''}
                </div>

                ${state.selectedUser && state.userData && !state.isLoading ? `
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slideUp">
                         <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                             <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-8">🔥 CHALLENGE STATUS</h3>
                             ${state.userData.challenge ? `
                                <div class="grid grid-cols-2 gap-4">
                                    <div class="bg-orange-500 text-white p-6 rounded-3xl text-center">
                                        <span class="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">STREAK</span>
                                        <p class="text-4xl font-black">${state.userData.challenge.streak}</p>
                                    </div>
                                    <div class="bg-slate-900 text-white p-6 rounded-3xl text-center">
                                        <span class="block text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">SON TAMAMLANMA</span>
                                        <p class="text-sm font-black mt-2">${state.userData.challenge.lastCompletedDate || 'YOK'}</p>
                                    </div>
                                    ${state.userData.challenge.currentChallenge ? `
                                        <div class="col-span-2 bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                                            <span class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">AKTİF HEDEF</span>
                                            <p class="text-sm font-black text-slate-800 dark:text-white uppercase italic">${state.userData.challenge.currentChallenge.description}</p>
                                            <p class="text-2xl font-black text-brand-primary tracking-tighter mt-2">${state.userData.challenge.currentChallenge.progress} / ${state.userData.challenge.currentChallenge.target}</p>
                                        </div>
                                    ` : ''}
                                </div>
                             ` : '<p class="text-slate-400 font-bold italic">Challenge verisi bulunamadı.</p>'}
                         </div>

                         <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                             <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-8">💾 KAYDEDİLEN KELİMELER (${state.userData.vocabulary.length})</h3>
                             <div class="space-y-2 max-h-80 overflow-y-auto scrollbar-thin pr-2">
                                ${state.userData.vocabulary.map(v => `
                                    <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
                                        <div>
                                            <span class="font-black text-slate-800 dark:text-white capitalize">${v.word}</span>
                                            <p class="text-[10px] font-bold text-slate-400 mt-1 italic">${v.meaning}</p>
                                        </div>
                                    </div>
                                `).join('')}
                                ${state.userData.vocabulary.length === 0 ? '<p class="text-slate-400 font-bold italic">Kelime listesi boş.</p>' : ''}
                             </div>
                         </div>

                         <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                             <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-8">📊 SORU ANALİZ GEÇMİŞİ (${state.userData.history.length})</h3>
                             <div class="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                                ${state.userData.history.map(item => `
                                    <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <p class="text-[10px] font-black text-slate-400 uppercase mb-1">${item.timestamp}</p>
                                        <p class="text-sm font-black text-slate-800 dark:text-white truncate">${item.question}</p>
                                        <p class="text-[8px] font-black text-brand-primary uppercase tracking-widest mt-2">${item.analysis.soruTipi || 'GENEL'}</p>
                                    </div>
                                `).join('')}
                                ${state.userData.history.length === 0 ? '<p class="text-slate-400 font-bold italic">Analiz geçmişi boş.</p>' : ''}
                             </div>
                         </div>

                         <div class="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-xl border-2 border-slate-50 dark:border-slate-800">
                             <h3 class="text-xs font-black text-brand-primary uppercase tracking-[0.4em] mb-8">📝 DENEME SINAVLARI (${state.userData.exams.length})</h3>
                             <div class="space-y-3 max-h-96 overflow-y-auto scrollbar-thin pr-2">
                                ${state.userData.exams.map(exam => `
                                    <div class="bg-slate-50 dark:bg-slate-800 p-5 rounded-3xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                        <div>
                                            <p class="text-[10px] font-black text-slate-400 uppercase mb-1">${exam.timestamp}</p>
                                            <p class="text-sm font-black italic">PDF Deneme Sınavı</p>
                                        </div>
                                        <span class="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">${exam.score} / ${exam.totalQuestions}</span>
                                    </div>
                                `).join('')}
                                ${state.userData.exams.length === 0 ? '<p class="text-slate-400 font-bold italic">Sınav geçmişi boş.</p>' : ''}
                             </div>
                         </div>
                    </div>
                ` : !state.selectedUser ? `
                    <div class="text-center py-20">
                        <p class="text-slate-400 font-black uppercase tracking-[0.3em] animate-pulse">VERİLERİNİ GÖRMEK İÇİN BİR KULLANICI SEÇİN</p>
                    </div>
                ` : ''}
            </div>
        `;

        attachEvents();
    };

    const attachEvents = () => {
        const select = container.querySelector('#user-select');
        if (select) {
            select.onchange = (e) => {
                const uid = e.target.value;
                setState({ selectedUser: uid });
                if (uid) loadUserData(uid);
                else setState({ userData: null });
            };
        }

        container.querySelectorAll('.sub-action-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const { uid, action } = btn.dataset;
                const months = parseInt(action);
                
                if (months > 0) {
                    const ok = await activateUserSubscription(uid, months);
                    if (ok) {
                        alert("Kullanıcı başarıyla aktif edildi!");
                        loadUsers(); // Refresh list to update status in UI
                    } else {
                        alert("Aktivasyon başarısız oldu.");
                    }
                } else {
                    const ok = await deactivateUserSubscription(uid);
                    if (ok) {
                        alert("Kullanıcı aboneliği iptal edildi.");
                        loadUsers();
                    }
                }
            });
        });
    };

    render();
    return container;
};
