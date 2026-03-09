import { loginWithGoogle, loginWithEmail } from '../store/auth';
import store from '../store/index';

export function renderLoginPage() {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden';

  let state = {
    email: '',
    password: '',
    isLoading: false,
    error: ''
  };

  const render = () => {
    container.innerHTML = `
      <!-- Background Shapes -->
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px] -z-10"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-[120px] -z-10"></div>

      <div class="w-full max-w-md animate-fadeIn">
        <!-- Logo Section -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-900 rounded-3xl shadow-2xl mb-6 transform rotate-3 hover:rotate-0 transition-all duration-500">
            <span class="text-3xl font-black text-white italic">A</span>
          </div>
          <h1 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic mb-2">ADAI</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Kişisel Yapay Zeka Dil Platformu</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 p-10 space-y-8 relative">
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight italic">Giriş Yap</h2>
            <p class="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Maceraya kaldığın yerden devam et</p>
          </div>

          ${state.error ? `
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                <p class="text-xs font-bold text-red-500 text-center">${state.error}</p>
            </div>
          ` : ''}

          <form id="login-form" class="space-y-5">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">E-POSTA</label>
              <input type="email" id="email" value="${state.email}" required placeholder="email@ornek.com" 
                class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary/20 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner focus:ring-4 focus:ring-brand-primary/5">
            </div>

            <div class="space-y-2">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">ŞİFRE</label>
              <input type="password" id="password" value="${state.password}" required placeholder="••••••••" 
                class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary/20 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner focus:ring-4 focus:ring-brand-primary/5">
            </div>

            <button type="submit" ${state.isLoading ? 'disabled' : ''} 
                class="w-full py-5 bg-slate-900 dark:bg-black text-white font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50">
                ${state.isLoading ? '<div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> GİRİŞ YAPILIYOR...' : 'SİSTEME GİRİŞ YAP 🚀'}
            </button>
          </form>

          <div class="relative py-4 flex items-center">
            <div class="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            <span class="flex-shrink mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">VEYA</span>
            <div class="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
          </div>

          <button id="google-login-btn" ${state.isLoading ? 'disabled' : ''} 
            class="w-full py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 hover:border-brand-primary/30 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-4 group">
            <svg class="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span class="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">GOOGLE İLE DEVAM ET</span>
          </button>
        </div>

        <div class="mt-10 text-center">
          <p class="text-sm font-bold text-slate-500 dark:text-slate-400">
            Henüz hesabın yok mu? 
            <button id="to-signup" class="text-brand-primary hover:underline ml-1">Ücretsiz Hesap Oluştur</button>
          </p>
        </div>
      </div>
    `;

    attachEvents();
  };

  const attachEvents = () => {
    const form = container.querySelector('#login-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      state.email = container.querySelector('#email').value;
      state.password = container.querySelector('#password').value;
      state.isLoading = true;
      state.error = '';
      render();

      try {
        await loginWithEmail(state.email, state.password);
      } catch (err) {
        state.error = 'Hatalı e-posta veya şifre girdiniz.';
        state.isLoading = false;
        render();
      }
    });

    container.querySelector('#google-login-btn')?.addEventListener('click', async () => {
      state.isLoading = true;
      state.error = '';
      render();
      try {
        await loginWithGoogle();
      } catch (err) {
        state.error = 'Google girişi başarısız oldu.';
        state.isLoading = false;
        render();
      }
    });

    container.querySelector('#to-signup')?.addEventListener('click', () => {
      store.setState({ activeTab: 'signup' });
      window.location.hash = 'signup';
    });
  };

  render();
  return container;
}
