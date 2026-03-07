import store from '../store/index';

const MENU = {
  pinned: ['dashboard', 'tutor', 'placement_test'],
  groups: [
    {
      key: 'practice',
      label: 'Pratik Araçları',
      tabs: [
        'grammar_library', 'basics', 'tenses', 'writing', 'creative_writing',
        'essay_outliner', 'listening', 'speaking_simulator', 'podcast_maker',
        'physical_description', 'visual_reading',
      ],
    },
    {
      key: 'games',
      label: 'Oyunlar & Alıştırmalar',
      tabs: ['crossword', 'hangman', 'word_sprint', 'concept_weaver'],
    },
    {
      key: 'vocab',
      label: 'Kelime & Okuma',
      tabs: [
        'dictionary', 'visual_dictionary', 'vocabulary',
        'vocabulary_story_weaver', 'phrasal_verb_deconstructor', 'news_reader',
      ],
    },
    {
      key: 'analysis',
      label: 'Dil Analizi',
      tabs: [
        'deconstruction', 'diagrammer', 'translation_analyst', 'pragmatic_analyzer',
        'analyzer', 'reading', 'cohesion_analyzer', 'sentence_ordering',
        'dialogue_completion',
      ],
    },
  ],
  footer: ['skill_tree', 'planner', 'history', 'admin'],
};

const TABS = {
  dashboard: { label: 'Ana Sayfa', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
  tutor: { label: 'AI Tutor', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>` },
  placement_test: { label: 'Seviye Tespit', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>` },
  skill_tree: { label: 'Yetenek Ağacı', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 20V4m-7 7l7-7 7 7"/></svg>` },
  planner: { label: 'Çalışma Planı', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>` },
  history: { label: 'Geçmiş', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>` },
  admin: { label: 'Yönetim', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>` },
  grammar_library: { label: 'Dilbilgisi Kütüphanesi' },
  basics: { label: 'Temel Yapılar' },
  physical_description: { label: 'Fiziksel Tasvir' },
  tenses: { label: 'Zamanlar' },
  visual_reading: { label: 'Görsel Okuma' },
  writing: { label: 'Yazma Pratiği' },
  creative_writing: { label: 'Yaratıcı Yazma' },
  essay_outliner: { label: 'Essay Taslak' },
  listening: { label: 'Dinleme Pratiği' },
  speaking_simulator: { label: 'Konuşma Simülatörü' },
  podcast_maker: { label: 'Podcast Oluşturucu' },
  crossword: { label: 'Bulmaca' },
  hangman: { label: 'Adam Asmaca' },
  word_sprint: { label: 'Kelime Koşusu' },
  concept_weaver: { label: 'Kavram Örücü' },
  dictionary: { label: 'Sözlük' },
  visual_dictionary: { label: 'Görsel Sözlük' },
  vocabulary: { label: 'Kelime Antrenörü' },
  vocabulary_story_weaver: { label: 'Kelime Hikayeleştirici' },
  phrasal_verb_deconstructor: { label: 'Phrasal Verb Analizci' },
  news_reader: { label: 'Haberler' },
  deconstruction: { label: 'Metin Deşifresi' },
  diagrammer: { label: 'Cümle Görselleştirici' },
  translation_analyst: { label: 'Çeviri Analizci' },
  pragmatic_analyzer: { label: 'Pragmatik Analizci' },
  analyzer: { label: 'Metin Analizci' },
  reading: { label: 'Okuma Analizi' },
  cohesion_analyzer: { label: 'Bağlam Analizci' },
  sentence_ordering: { label: 'Cümle Sıralama' },
  dialogue_completion: { label: 'Diyalog Tamamlama' },
};

function buildSidebarHTML(state) {
  const active = state.activeTab;
  const open = state.openAccordions || [];

  const navBtn = (id, extraCls = '') => {
    const t = TABS[id] || {};
    const isActive = active === id;
    return `
      <button data-tab="${id}" class="nav-btn group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
        ${isActive ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}
        ${extraCls}">
        ${t.icon ? `<span class="shrink-0 ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'}">${t.icon}</span>`
        : `<span class="w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : 'bg-zinc-300 group-hover:bg-zinc-500'}"></span>`}
        <span class="truncate">${t.label || id}</span>
      </button>`;
  };

  const groupsHTML = MENU.groups.map(g => {
    const isOpen = open.includes(g.key);
    const hasActive = g.tabs.includes(active);
    return `
      <div>
        <button data-accordion="${g.key}" class="acc-toggle w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-150
          ${hasActive ? 'text-brand-primary' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50'}">
          <span>${g.label}</span>
          <svg class="w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>
        ${isOpen ? `<div class="mt-1 ml-2 space-y-0.5 border-l-2 border-zinc-100 pl-3">${g.tabs.map(id => navBtn(id)).join('')}</div>` : ''}
      </div>`;
  }).join('');

  return `
    <div class="flex flex-col h-full bg-white text-zinc-900" style="border-right:1px solid #e4e4e7;">
      <div class="flex items-center gap-2 px-5 h-16 shrink-0" style="border-bottom:1px solid #e4e4e7;">
        <div>
          <span class="text-base font-black tracking-tight text-zinc-900">ADA<span class="special-glow">I</span></span>
          <p class="text-[9px] text-zinc-400 uppercase tracking-widest font-medium leading-none mt-0.5">AI English Platform</p>
        </div>
      </div>

      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        <div class="space-y-0.5">${MENU.pinned.map(id => navBtn(id)).join('')}</div>
        <div style="border-top:1px solid #e4e4e7;"></div>
        <div class="space-y-2">${groupsHTML}</div>
      </nav>

      <div class="px-3 pb-3 pt-2 space-y-0.5" style="border-top:1px solid #e4e4e7;">
        ${MENU.footer.map(id => navBtn(id, 'text-xs')).join('')}
        <div class="px-3 pt-3 flex items-center gap-2">
          <div class="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-600">G</div>
          <span class="text-xs text-zinc-400 truncate">${state.user?.email || 'guest@adai.ai'}</span>
        </div>
      </div>
    </div>`;
}

export function renderSidebar() {
  const container = document.createElement('div');
  container.className = 'flex flex-col h-full';

  function update() {
    const state = store.getState();
    container.innerHTML = buildSidebarHTML(state);

    container.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.hash = btn.dataset.tab;
        store.setState({ isMenuOpen: false });
      });
    });

    container.querySelectorAll('.acc-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.accordion;
        const current = store.getState().openAccordions || [];
        const next = current.includes(key) ? current.filter(k => k !== key) : [...current, key];
        store.setState({ openAccordions: next });
        localStorage.setItem('open-accordions', JSON.stringify(next));
      });
    });
  }

  store.subscribe(update);
  update();
  return container;
}
