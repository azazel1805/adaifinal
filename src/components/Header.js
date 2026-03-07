import store from '../store/index';
import { renderSidebar } from './Sidebar';

const PAGE_TITLES = {
  dashboard: 'Ana Sayfa', tutor: 'AI Tutor', placement_test: 'Seviye Tespit',
  skill_tree: 'Yetenek Ağacı', planner: 'Çalışma Planı', grammar_library: 'Dilbilgisi Kütüphanesi',
  basics: 'Temel Yapılar', tenses: 'Zamanlar', writing: 'Yazma Pratiği',
  creative_writing: 'Yaratıcı Yazma', essay_outliner: 'Essay Taslak',
  listening: 'Dinleme Pratiği', speaking_simulator: 'Konuşma Simülatörü',
  podcast_maker: 'Podcast Oluşturucu', physical_description: 'Fiziksel Tasvir',
  handwriting_converter: 'El Yazısı Dönüştürücü', visual_reading: 'Görsel Okuma',
  crossword: 'Bulmaca', grammar_gaps: 'Dilbilgisi Boşlukları', hangman: 'Adam Asmaca',
  word_sprint: 'Kelime Koşusu', concept_weaver: 'Kavram Örücü', dictionary: 'Sözlük',
  visual_dictionary: 'Görsel Sözlük', vocabulary: 'Kelime Antrenörü',
  vocabulary_story_weaver: 'Kelime Hikayeleştirici', phrasal_verb_deconstructor: 'Phrasal Verb Analizci',
  news_reader: 'Haberler', deconstruction: 'Metin Deşifresi', diagrammer: 'Cümle Görselleştirici',
  translation_analyst: 'Çeviri Analizci', pragmatic_analyzer: 'Pragmatik Analizci',
  analyzer: 'Metin Analizci', reading: 'Okuma Analizi', cohesion_analyzer: 'Bağlam Analizci',
  sentence_ordering: 'Cümle Sıralama', dialogue_completion: 'Diyalog Tamamlama',
  pdf_importer: 'PDF Aktarıcı', history: 'Geçmiş', admin: 'Yönetim',
};

export function renderHeader() {
  const header = document.createElement('header');
  header.style.cssText = 'position:sticky;top:0;z-index:30;display:flex;height:3.5rem;width:100%;align-items:center;justify-content:space-between;border-bottom:1px solid #e4e4e7;background:rgba(255,255,255,0.95);backdrop-filter:blur(10px);padding:0 1rem;';

  let drawerEl = null;

  function ensureDrawer(isOpen) {
    const existing = document.getElementById('mobile-drawer-root');
    if (existing) existing.remove();
    drawerEl = null;
    if (!isOpen) return;

    const root = document.createElement('div');
    root.id = 'mobile-drawer-root';
    root.className = 'fixed inset-0 z-50 md:hidden';
    root.innerHTML = `
      <div id="drawer-backdrop" class="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"></div>
      <div id="drawer-panel" class="absolute left-0 top-0 h-full w-72 shadow-2xl animate-slide-in-left overflow-hidden bg-white"></div>`;

    document.body.appendChild(root);
    drawerEl = root;
    root.querySelector('#drawer-panel').appendChild(renderSidebar());
    root.querySelector('#drawer-backdrop').addEventListener('click', () => {
      store.setState({ isMenuOpen: false });
    });
  }

  function update() {
    const state = store.getState();
    const isOpen = !!state.isMenuOpen;
    const title = PAGE_TITLES[state.activeTab] || state.activeTab || 'ADAI';

    header.innerHTML = `
      <div class="flex items-center gap-3">
        <button id="menu-toggle" class="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-all" aria-label="Menü">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
        <div class="flex items-center gap-1 md:hidden">
          <span class="text-sm font-black text-zinc-900">ADA<span class="special-glow">I</span></span>
        </div>
        <span class="hidden md:block text-sm font-semibold text-zinc-500">${title}</span>
      </div>`;

    ensureDrawer(isOpen);

    header.querySelector('#menu-toggle')?.addEventListener('click', () => {
      store.setState({ isMenuOpen: !store.getState().isMenuOpen });
    });
  }

  store.subscribe(update);
  update();
  return header;
}
