import './index.css';
import store from './store/index';
import Router from './router';
import { renderDashboard } from './pages/Dashboard';
import { renderNavbar } from './components/Navbar';
import { renderAITutor } from './pages/AITutor';
import { renderQuestionAnalyzer } from './pages/QuestionAnalyzer';
import { renderPassageDeconstruction } from './pages/PassageDeconstruction';
import { renderReadingPractice } from './pages/ReadingPractice';
import { renderWritingAssistant } from './pages/WritingAssistant';
import { renderVocabularyTrainer } from './pages/VocabularyTrainer';
import { renderSkillTree } from './pages/SkillTree';
import { renderStudyPlanner } from './pages/StudyPlanner';
import { renderPlacementTest } from './pages/PlacementTest';
import { renderGrammarLibrary } from './pages/GrammarLibrary';
import { renderExamPage } from './pages/ExamPage';
import { renderListeningPractice } from './pages/ListeningPractice';
import { renderSpeakingSimulator } from './pages/SpeakingSimulator';
import { renderSentenceOrdering } from './pages/SentenceOrdering';
import { renderDialogueCompletion } from './pages/DialogueCompletion';
import { renderWordSprint } from './pages/WordSprint';
import { renderHangman } from './pages/Hangman';
import { renderPhrasalVerbDeconstructor } from './pages/PhrasalVerbDeconstructor';
import { renderCrossword } from './pages/Crossword';
import { renderVocabularyStoryWeaver } from './pages/VocabularyStoryWeaver';
import { renderDictionary } from './pages/Dictionary';
import { renderVisualDictionary } from './pages/VisualDictionary';
import { renderParagraphCohesionAnalyzer } from './pages/ParagraphCohesionAnalyzer';
import { renderHistory } from './pages/History';
import { renderAdminPage } from './pages/AdminPage';
import { renderNewsReader } from './pages/NewsReader';
import { renderConceptWeaver } from './pages/ConceptWeaver';
import { renderPodcastMaker } from './pages/PodcastMaker';
import { renderPragmaticAnalyzer } from './pages/PragmaticAnalyzer';
import { renderSentenceDiagrammer } from './pages/SentenceDiagrammer';
import { renderTranslationAnalyst } from './pages/TranslationAnalyst';
import { renderBasics } from './pages/Basics';
import { renderPhysicalDescription } from './pages/PhysicalDescription';
import { renderTenses } from './pages/Tenses';
import { renderVisualReading } from './pages/VisualReading';
import { renderCreativeWriting } from './pages/CreativeWriting';
import { renderEssayOutliner } from './pages/EssayOutliner';
import { renderProfile } from './pages/Profile';
import { renderGlobalChat } from './pages/GlobalChat';
import { renderShadowingLab } from './pages/ShadowingLab';
import { renderWordDuel } from './pages/WordDuel';
import { renderLoginPage } from './pages/LoginPage';
import { renderSignUpPage } from './pages/SignUpPage';
import { initPerformanceStats } from './utils/performance';
import { listenToFriendships, listenToPendingRequests } from './services/socialService';
import { initAuth } from './store/auth';

import { initHistory } from './store/history';
import { initChallenge } from './store/challenge';
import { initVocabulary } from './store/vocabulary';
import { initExamHistory } from './store/examHistory';
import { initPdfExam } from './store/pdfExam';

const PAGE_TITLES = {
    dashboard: 'Ana Sayfa | ADAI',
    index: 'Ana Sayfa | ADAI',
    tutor: 'AI Tutor | ADAI',
    placement_test: 'Seviye Tespit | ADAI',
    skill_tree: 'Yetenek Ağacı | ADAI',
    planner: 'Çalışma Planı | ADAI',
    grammar_library: 'Dilbilgisi Kütüphanesi | ADAI',
    basics: 'Temel Yapılar | ADAI',
    tenses: 'Zamanlar | ADAI',
    writing: 'Yazma Pratiği | ADAI',
    creative_writing: 'Yaratıcı Yazma | ADAI',
    essay_outliner: 'Essay Taslak | ADAI',
    listening: 'Dinleme Pratiği | ADAI',
    speaking_simulator: 'Konuşma Simülatörü | ADAI',
    podcast_maker: 'Podcast Oluşturucu | ADAI',
    crossword: 'Bulmaca | ADAI',
    hangman: 'Adam Asmaca | ADAI',
    word_sprint: 'Kelime Koşusu | ADAI',
    concept_weaver: 'Kavram Örücü | ADAI',
    dictionary: 'Sözlük | ADAI',
    vocabulary: 'Kelime Antrenörü | ADAI',
    news_reader: 'Haberler | ADAI',
    deconstruction: 'Metin Deşifresi | ADAI',
    diagrammer: 'Cümle Görselleştirici | ADAI',
    translation_analyst: 'Çeviri Analizci | ADAI',
    pragmatic_analyzer: 'Pragmatik Analizci | ADAI',
    analyzer: 'Metin Analizci | ADAI',
    reading: 'Okuma Analizi | ADAI',
    cohesion_analyzer: 'Bağlam Analizci | ADAI',
    sentence_ordering: 'Cümle Sıralama | ADAI',
    dialogue_completion: 'Diyalog Tamamlama | ADAI',
    history: 'Geçmiş | ADAI',
    profile: 'Profil | ADAI',
    global_chat: 'Global Chat | ADAI',
    admin: 'Yönetim | ADAI',
};

// ─── Init ─────────────────────────────────────────────────────────
initAuth();
initHistory();
initChallenge();
initPdfExam();
initVocabulary();
initExamHistory();
initPerformanceStats();

const { user } = store.getState();
const weakWords = JSON.parse(localStorage.getItem(`weak-words-list-${user?.uid || 'guest'}`)) || [];
store.setState({ weakWords });

// Social Listeners
listenToFriendships((friends) => store.setState({ friends }));
listenToPendingRequests((pendingRequests) => store.setState({ pendingRequests }));

// Apply theme
const currentTheme = store.getState().theme || 'light';
document.documentElement.classList.toggle('dark', currentTheme === 'dark');
if (!store.getState().theme) store.setState({ theme: currentTheme });

// ─── Routes ───────────────────────────────────────────────────────
const routes = [
    { path: 'dashboard' }, { path: 'index' }, { path: 'placement_test' },
    { path: 'chat' }, { path: 'analyzer' }, { path: 'deconstruction' },
    { path: 'reading' }, { path: 'writing' }, { path: 'vocabulary' },
    { path: 'visual_dictionary' }, { path: 'dictionary' }, { path: 'cohesion_analyzer' },
    { path: 'listening' }, { path: 'speaking_simulator' }, { path: 'sentence_ordering' },
    { path: 'dialogue_completion' }, { path: 'exams' }, { path: 'history' },
    { path: 'admin' }, { path: 'news_reader' }, { path: 'grammar_library' },
    { path: 'basics' }, { path: 'physical_description' }, { path: 'handwriting_converter' },
    { path: 'tenses' }, { path: 'visual_reading' }, { path: 'creative_writing' },
    { path: 'essay_outliner' }, { path: 'podcast_maker' }, { path: 'crossword' },
    { path: 'grammar_gaps' }, { path: 'hangman' }, { path: 'word_sprint' },
    { path: 'concept_weaver' }, { path: 'vocabulary_story_weaver' },
    { path: 'phrasal_verb_deconstructor' }, { path: 'diagrammer' },
    { path: 'translation_analyst' }, { path: 'pragmatic_analyzer' },
    { path: 'pdf_importer' }, { path: 'skill_tree' }, { path: 'planner' }, { path: 'tutor' },
    { path: 'profile' }, { path: 'global_chat' }, { path: 'shadowing_lab' }, { path: 'word_duel' },
    { path: 'login' }, { path: 'signup' }
];

new Router(routes);

// ─── Mobile bottom nav ────────────────────────────────────────────
function renderBottomNav(activeTab) {
    const nav = document.createElement('nav');
    nav.className = 'fixed bottom-0 left-0 right-0 z-20 md:hidden flex items-stretch bg-white border-t border-zinc-200 shadow-lg';

    const items = [
        { id: 'dashboard', label: 'Ana Sayfa', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
        { id: 'tutor', label: 'Tutor', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4m0-4h.01"/></svg>` },
        { id: 'dictionary', label: 'Sözlük', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>` },
        { id: 'vocabulary', label: 'Kelime', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>` },
        { id: 'grammar_library', label: 'Gramer', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>` },
    ];

    items.forEach(item => {
        const isActive = activeTab === item.id;
        const btn = document.createElement('button');
        btn.dataset.tab = item.id;
        btn.className = `flex-1 flex flex-col items-center justify-center py-2 gap-1 text-[10px] font-semibold uppercase tracking-wider transition-all
            ${isActive ? 'text-brand-primary' : 'text-zinc-400 hover:text-zinc-700'}`;
        btn.innerHTML = `${item.icon}<span>${item.label}</span>`;
        btn.addEventListener('click', () => { window.location.hash = item.id; });
        nav.appendChild(btn);
    });

    return nav;
}

// ─── Main Render ──────────────────────────────────────────────────
function render() {
    const state = store.getState();
    const root = document.getElementById('root');
    if (!root) return;

    if (state.loading) {
        root.innerHTML = '<div class="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><p class="font-black text-brand-primary animate-pulse">ADAI YÜKLENİYOR...</p></div>';
        return;
    }

    // Auth check
    if (!state.user && state.activeTab !== 'signup') {
        root.innerHTML = '';
        root.appendChild(renderLoginPage());
        return;
    }
    if (!state.user && state.activeTab === 'signup') {
        root.innerHTML = '';
        root.appendChild(renderSignUpPage());
        return;
    }

    root.innerHTML = '';

    // Update document title
    document.title = PAGE_TITLES[state.activeTab] || 'ADAI - Encyclopedia';

    const shell = document.createElement('div');
    shell.className = 'flex flex-col h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden';

    // Top Navbar
    shell.appendChild(renderNavbar());

    // Main area
    const mainArea = document.createElement('main');
    mainArea.className = 'flex-1 flex flex-col min-w-0 overflow-hidden';

    const scrollArea = document.createElement('div');
    scrollArea.className = 'flex-1 overflow-y-auto';

    const contentArea = document.createElement('div');
    contentArea.id = 'content-area';
    contentArea.className = 'p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 bg-zinc-50 min-h-full';
    scrollArea.appendChild(contentArea);
    mainArea.appendChild(scrollArea);
    shell.appendChild(mainArea);

    // Page content
    const onAskTutor = (ctx) => {
        window.location.hash = 'tutor';
        localStorage.setItem('adai_tutor_context', ctx);
    };

    switch (state.activeTab) {
        case 'dashboard':
        case 'index':
            contentArea.appendChild(renderDashboard()); break;
        case 'skill_tree':
            contentArea.appendChild(renderSkillTree()); break;
        case 'planner':
            contentArea.appendChild(renderStudyPlanner()); break;
        case 'dictionary':
            contentArea.appendChild(renderDictionary()); break;
        case 'reading_practice':
        case 'reading':
            contentArea.appendChild(renderReadingPractice(onAskTutor)); break;
        case 'vocabulary_trainer':
        case 'vocabulary':
            contentArea.appendChild(renderVocabularyTrainer()); break;
        case 'placement_test':
            contentArea.appendChild(renderPlacementTest()); break;
        case 'tutor':
        case 'chat':
            contentArea.appendChild(renderAITutor()); break;
        case 'analyzer':
            contentArea.appendChild(renderQuestionAnalyzer()); break;
        case 'deconstruction':
            contentArea.appendChild(renderPassageDeconstruction()); break;
        case 'writing':
            contentArea.appendChild(renderWritingAssistant()); break;
        case 'pdf_importer':
        case 'exams':
            contentArea.appendChild(renderExamPage()); break;
        case 'visual_dictionary':
            contentArea.appendChild(renderVisualDictionary()); break;
        case 'phrasal_verb_deconstructor':
            contentArea.appendChild(renderPhrasalVerbDeconstructor()); break;
        case 'vocabulary_story_weaver':
        case 'story_weaver':
            contentArea.appendChild(renderVocabularyStoryWeaver()); break;
        case 'crossword':
            contentArea.appendChild(renderCrossword()); break;
        case 'cohesion_analyzer':
            contentArea.appendChild(renderParagraphCohesionAnalyzer()); break;
        case 'grammar_library':
            contentArea.appendChild(renderGrammarLibrary({ onAskTutor })); break;
        case 'news_reader':
            contentArea.appendChild(renderNewsReader({ onAskTutor })); break;
        case 'listening':
            contentArea.appendChild(renderListeningPractice()); break;
        case 'speaking_simulator':
            contentArea.appendChild(renderSpeakingSimulator()); break;
        case 'sentence_ordering':
            contentArea.appendChild(renderSentenceOrdering()); break;
        case 'dialogue_completion':
            contentArea.appendChild(renderDialogueCompletion()); break;
        case 'word_sprint':
            contentArea.appendChild(renderWordSprint()); break;
        case 'hangman':
            contentArea.appendChild(renderHangman()); break;
        case 'history':
            contentArea.appendChild(renderHistory(onAskTutor)); break;
        case 'basics':
            contentArea.appendChild(renderBasics()); break;
        case 'physical_description':
            contentArea.appendChild(renderPhysicalDescription()); break;
        case 'tenses':
            contentArea.appendChild(renderTenses()); break;
        case 'visual_reading':
            contentArea.appendChild(renderVisualReading()); break;
        case 'creative_writing':
            contentArea.appendChild(renderCreativeWriting()); break;
        case 'essay_outliner':
            contentArea.appendChild(renderEssayOutliner()); break;
        case 'podcast_maker':
            contentArea.appendChild(renderPodcastMaker()); break;
        case 'concept_weaver':
            contentArea.appendChild(renderConceptWeaver()); break;
        case 'pragmatic_analyzer':
            contentArea.appendChild(renderPragmaticAnalyzer()); break;
        case 'diagrammer':
            contentArea.appendChild(renderSentenceDiagrammer()); break;
        case 'translation_analyst':
            contentArea.appendChild(renderTranslationAnalyst()); break;
        case 'admin':
            contentArea.appendChild(renderAdminPage()); break;
        case 'profile':
            contentArea.appendChild(renderProfile()); break;
        case 'global_chat':
            contentArea.appendChild(renderGlobalChat()); break;
        case 'shadowing_lab':
            contentArea.appendChild(renderShadowingLab()); break;
        case 'word_duel':
            contentArea.appendChild(renderWordDuel()); break;
        default:
            contentArea.innerHTML = `<div class="flex flex-col items-center justify-center py-24 text-center space-y-4">
                <div class="text-5xl opacity-30">🚧</div>
                <h2 class="text-xl font-bold text-zinc-700">Çok Yakında</h2>
                <p class="text-zinc-400 text-sm">${state.activeTab} sayfası geliştirme aşamasındadır.</p>
                <button onclick="window.location.hash='dashboard'" class="mt-2 text-brand-primary text-sm font-semibold hover:underline">Ana Sayfaya Dön</button>
            </div>`;
    }

    root.appendChild(shell);

    // Mobile bottom nav (appended after shell)
    root.appendChild(renderBottomNav(state.activeTab));
}

store.subscribe(render);
render();
