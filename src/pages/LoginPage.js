import { login } from '../store/auth';
import store from '../store/index';

export function renderLoginPage() {
    const container = document.createElement('div');
    container.className = 'flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12';

    let email = '';
    let password = '';
    let loading = false;
    let error = '';

    const updateUI = () => {
        container.innerHTML = `
      <div class="w-full max-w-md mx-auto">
        <div class="text-center mb-8">
          <div class="inline-block p-4 bg-slate-900 dark:bg-slate-800 rounded-full shadow-lg">
            <h1 class="text-2xl font-bold text-white">ADAI</h1>
          </div>
        </div>
        <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 space-y-6">
          <div class="text-center">
            <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Tekrar Hoş Geldin!</h1>
            <p class="text-slate-500 dark:text-slate-400 mt-2">İngilizce yolculuğuna devam etmeye hazır mısın?</p>
          </div>
          <form id="login-form" class="space-y-6">
            <div>
              <label for="email" class="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta Adresi</label>
              <input id="email" name="email" type="email" required value="${email}" class="mt-2 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-adai-primary focus:outline-none transition" />
            </div>
            <div>
              <label for="password" class="text-sm font-medium text-slate-700 dark:text-slate-300">Şifre</label>
              <input id="password" name="password" type="password" required value="${password}" class="mt-2 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-adai-primary focus:outline-none transition" />
            </div>
            ${error ? `<p class="text-sm text-red-500 text-center font-medium">${error}</p>` : ''}
            <div>
              <button type="submit" ${loading ? 'disabled' : ''} class="w-full flex justify-center rounded-lg bg-adai-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-adai-secondary disabled:opacity-70">
                ${loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </div>
          </form>
          <div class="text-center mt-6">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Hesabın yok mu? <button id="to-signup" class="font-semibold text-adai-primary hover:text-adai-secondary">Kayıt Ol</button>
            </p>
          </div>
        </div>
      </div>
    `;

        // Re-attach event listeners after innerHTML update
        const form = container.querySelector('#login-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            email = container.querySelector('#email').value;
            password = container.querySelector('#password').value;
            loading = true;
            error = '';
            updateUI();
            try {
                await login(email, password);
                // Auth state listener in auth.js will update store and trigger re-render in main.js
            } catch (err) {
                error = 'E-posta veya şifre hatalı.';
                loading = false;
                updateUI();
            }
        });

        container.querySelector('#to-signup').addEventListener('click', () => {
            store.setState({ activeTab: 'signup' });
        });
    };

    updateUI();
    return container;
}
