import store from '../store/index';
import { logout } from '../store/auth';

const MENU_STRUCTURE = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: '🏠' },
  {
    id: 'yds_ydt',
    label: 'Uzman Analizleri',
    icon: '📊',
    items: [
      { id: 'deconstruction', label: 'Metin Deşifresi', icon: '🔍' },
      { id: 'diagrammer', label: 'Cümle Görselleştirici', icon: '📈' },
      { id: 'reading', label: 'Okuma Analizi', icon: '📖' },
      { id: 'translation_analyst', label: 'Çeviri Analizci', icon: '🔄' },
      { id: 'pragmatic_analyzer', label: 'Pragmatik Analizci', icon: '🎭' },
      { id: 'cohesion_analyzer', label: 'Bağlam Analizci', icon: '🔗' }
    ]
  },
  {
    id: 'gen_english',
    label: 'Dil Çekirdeği',
    icon: '🧠',
    items: [
      { id: 'grammar_library', label: 'Gramer Kütüphanesi', icon: '📚' },
      { id: 'basics', label: 'Temel Yapılar', icon: '🧱' },
      { id: 'tenses', label: 'Zamanlar', icon: '⏳' },
      { id: 'vocabulary', label: 'Kelime Antrenörü', icon: '🏋️' },
      { id: 'oxford_trainer', label: 'Oxford 5000', icon: '🎓' },
      { id: 'dictionary', label: 'Sözlük', icon: '📕' },
      { id: 'writing', label: 'Yazma Pratiği', icon: '✍️' },
      { id: 'listening', label: 'Dinleme Pratiği', icon: '🎧' }
    ]
  },
  {
    id: 'ai_tools',
    label: 'Bilişsel Lab',
    icon: '🧪',
    items: [
      { id: 'tutor', label: 'AI Tutor', icon: '🤖' },
      { id: 'placement_test', label: 'Seviye Tespit', icon: '🎯' },
      { id: 'podcast_maker', label: 'Podcast Oluşturucu', icon: '🎙️' },
      { id: 'essay_outliner', label: 'Essay Taslak', icon: '📄' },
      { id: 'speaking_simulator', label: 'Konuşma Simülatörü', icon: '🗣️' },
      { id: 'shadowing_lab', label: 'Shadowing Lab', icon: '👥' },
      { id: 'visual_dictionary', label: 'Görsel Sözlük', icon: '📸' }
    ]
  },
  {
    id: 'games',
    label: 'Oyunlar',
    icon: '🎮',
    items: [
      { id: 'crossword', label: 'Bulmaca', icon: '🧩' },
      { id: 'hangman', label: 'Adam Asmaca', icon: '🪢' },
      { id: 'word_sprint', label: 'Kelime Koşusu', icon: '🏃' },
      { id: 'concept_weaver', label: 'Kavram Örücü', icon: '🕸️' }
    ]
  },
  {
    id: 'community',
    label: 'Topluluk',
    icon: '🌍',
    items: [
      { id: 'word_duel', label: 'Kelime Düellosu', icon: '⚔️' },
      { id: 'global_chat', label: 'Küresel Sohbet', icon: '💬' }
    ]
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: '👤',
    items: [
      { id: 'profile', label: 'Genel Profil', icon: '📋' },
      { id: 'skill_tree', label: 'Yetenek Ağacı', icon: '🌲' },
      { id: 'planner', label: 'Çalışma Planı', icon: '📅' },
      { id: 'history', label: 'Geçmiş', icon: '🕒' },
      { id: 'admin', label: 'Yönetim', icon: '⚙️' },
      { id: 'logout', label: 'Çıkış Yap', icon: '🚪' }
    ]
  }
];

export function renderNavbar() {
  const nav = document.createElement('nav');
  nav.className = 'bg-white border-b border-zinc-200 sticky top-0 z-50 w-full shadow-sm';

  function update() {
    const activeTab = store.getState().activeTab;

    nav.innerHTML = `
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20">
          <div class="flex items-center gap-4 lg:gap-6">
            <!-- Logo area -->
            <div class="flex flex-col cursor-pointer" onclick="window.location.hash='dashboard'">
              <span class="text-2xl font-black tracking-tighter text-zinc-900">ADA<span class="text-brand-primary">I</span></span>
              <span class="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.3em] -mt-1">Encyclopedia V3.0</span>
            </div>

            <!-- Desktop Nav -->
            <div class="hidden lg:flex items-center gap-1.5 xl:gap-3 h-full">
              ${MENU_STRUCTURE.map(group => {
      if (!group.items) {
        const isActive = activeTab === group.id;
        return `
                    <a href="#${group.id}" class="h-full flex items-center px-1 border-b-2 text-sm font-bold uppercase tracking-wider transition-all
                      ${isActive ? 'border-brand-primary text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'}">
                      <span class="mr-2">${group.icon}</span> ${group.label}
                    </a>
                  `;
      }

      const hasActiveChild = group.items.some(i => i.id === activeTab);
      return `
                  <div class="relative group h-full flex items-center">
                    <button class="h-full flex items-center gap-1.5 px-1 border-b-2 text-sm font-bold uppercase tracking-wider transition-all
                      ${hasActiveChild ? 'border-brand-primary text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'}">
                      <span class="mr-1">${group.icon}</span> ${group.label}
                      <svg class="w-4 h-4 opacity-50 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path d="M19 9l-7 7-7-7"/>
                      </svg>
                    </button>
                    
                    <!-- Dropdown -->
                    <div class="absolute top-full ${group.id === 'profile' || group.id === 'community' ? 'right-0' : 'left-0'} w-64 bg-white border border-zinc-100 shadow-2xl rounded-2xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all z-50">
                      ${group.items.map(item => `
                        <a href="#${item.id}" class="flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all
                          ${activeTab === item.id ? 'bg-zinc-50 text-brand-primary' : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'}">
                          <span class="mr-3 text-lg">${item.icon}</span> ${item.label}
                        </a>
                      `).join('')}
                    </div>
                  </div>
                `;
    }).join('')}
            </div>
          </div>

          <!-- Right side -->
          <div class="flex items-center gap-4">
             <div class="hidden sm:flex flex-col items-end mr-2 cursor-pointer" onclick="window.location.hash='profile'">
                <span class="text-xs font-bold text-zinc-900">${store.getState().user?.displayName || 'Guest'}</span>
                <span class="text-[10px] text-zinc-400">${store.getState().user?.email || ''}</span>
             </div>
             <div onclick="window.location.hash='profile'" class="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-brand-primary transition-all">
                <img src="${store.getState().user?.photoURL || `https://ui-avatars.com/api/?name=${store.getState().user?.displayName || 'G'}&background=f4f4f5&color=71717a`}" class="w-full h-full object-cover">
             </div>
             
             <!-- Mobile Menu Toggle (Simplified) -->
             <button id="mobile-menu-toggle" class="lg:hidden p-2 text-zinc-500">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
             </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Menu Overlay -->
      <div id="mobile-menu" class="hidden fixed inset-0 z-[60] bg-white p-6 animate-fadeIn">
         <div class="flex justify-between items-center mb-8">
            <span class="text-xl font-black">MENÜ</span>
            <button id="close-mobile-menu" class="p-2 text-zinc-500">
               <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
         </div>
         <div class="space-y-4 overflow-y-auto max-h-[80vh]">
            ${MENU_STRUCTURE.map(group => {
      if (!group.items) return `<a href="#${group.id}" class="flex items-center text-lg font-bold py-2 border-b border-zinc-50"><span class="mr-3 text-xl">${group.icon}</span> ${group.label}</a>`;
      return `
                <div class="space-y-2">
                   <h3 class="flex items-center text-xs font-black text-zinc-400 uppercase tracking-widest pt-4"><span class="mr-2">${group.icon}</span> ${group.label}</h3>
                   <div class="grid grid-cols-2 gap-2">
                      ${group.items.map(i => `<a href="#${i.id}" class="flex items-center text-sm font-bold p-3 bg-zinc-50 rounded-xl"><span class="mr-2 text-lg">${i.icon}</span> ${i.label}</a>`).join('')}
                   </div>
                </div>
              `;
    }).join('')}
         </div>
      </div>
    `;

    // Re-attach mobile menu events
    nav.querySelector('#mobile-menu-toggle')?.addEventListener('click', () => {
      nav.querySelector('#mobile-menu').classList.remove('hidden');
    });
    nav.querySelector('#close-mobile-menu')?.addEventListener('click', () => {
      nav.querySelector('#mobile-menu').classList.add('hidden');
    });
    nav.querySelectorAll('#mobile-menu a').forEach(a => {
      a.addEventListener('click', (e) => {
        if (a.getAttribute('href') === '#logout') {
          e.preventDefault();
          logout();
        } else {
          nav.querySelector('#mobile-menu').classList.add('hidden');
        }
      });
    });

    // Handle desktop logout separately since it's an <a> tag in the structure
    nav.querySelectorAll('a[href="#logout"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    });
  }

  store.subscribe(update);
  update();
  return nav;
}
