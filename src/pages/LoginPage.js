import { loginWithGoogle } from '../store/auth';
import store from '../store/index';

export function renderLoginPage() {
  const container = document.createElement('div');
  container.className = 'flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12';

  let loading = false;
  let error = '';

  const updateUI = () => {
    container.innerHTML = `
      <div class="w-full max-w-sm mx-auto">
        <div class="text-center mb-8">
          <div class="inline-block p-4 bg-slate-900 dark:bg-slate-800 rounded-full shadow-lg">
            <h1 class="text-2xl font-bold text-white">ADAI</h1>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 space-y-8 border-4 border-slate-50 dark:border-slate-800 text-center">
          <div>
            <h1 class="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Hoş Geldin!</h1>
            <p class="text-slate-500 dark:text-slate-400 mt-3 font-medium">Öğrenmeye başlamak veya kaldığın yerden devam etmek için giriş yap.</p>
          </div>
          
          ${error ? `<p class="text-sm border border-red-500/20 bg-red-500/10 p-3 rounded-2xl text-red-500 text-center font-bold">${error}</p>` : ''}
          
          <div>
            <button id="google-login-btn" ${loading ? 'disabled' : ''} class="w-full flex items-center justify-center gap-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-brand-primary dark:hover:border-brand-primary hover:bg-slate-50 dark:hover:bg-slate-800/80 px-4 py-4 text-sm font-bold text-slate-700 dark:text-slate-200 shadow-sm transition-all shadow-xl disabled:opacity-50">
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              ${loading ? 'Oturum Açılıyor...' : 'Google ile Giriş Yap'}
            </button>
          </div>
        </div>
      </div>
    `;

    const loginBtn = container.querySelector('#google-login-btn');
    loginBtn?.addEventListener('click', async () => {
      loading = true;
      error = '';
      updateUI();
      try {
        await loginWithGoogle();
        // Store will react automatically 
      } catch (err) {
        error = 'Google ile giriş iptal edildi veya bir hata oluştu.';
        loading = false;
        updateUI();
      }
    });
  };

  updateUI();
  return container;
}
