import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import store from '../store/index';

export function renderSignUpPage() {
    const container = document.createElement('div');
    container.className = 'flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 py-12';

    let email = '';
    let password = '';
    let activationCode = '';
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
            <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">Hesap Oluştur</h1>
            <p class="text-slate-500 dark:text-slate-400 mt-2">ADAI dünyasına katıl ve öğrenmeye başla!</p>
          </div>
          <form id="signup-form" class="space-y-6">
            <div>
              <label for="email" class="text-sm font-medium text-slate-700 dark:text-slate-300">E-posta Adresi</label>
              <input id="email" type="email" required value="${email}" class="mt-2 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-adai-primary focus:outline-none transition" />
            </div>
            <div>
              <label for="password" class="text-sm font-medium text-slate-700 dark:text-slate-300">Şifre Belirle</label>
              <input id="password" type="password" required value="${password}" class="mt-2 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-adai-primary focus:outline-none transition" />
            </div>
            <div>
              <label for="activationCode" class="text-sm font-medium text-slate-700 dark:text-slate-300">Aktivasyon Kodu</label>
              <input id="activationCode" type="text" required value="${activationCode}" placeholder="E-postanıza gelen kodu girin" class="mt-2 block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-adai-primary focus:outline-none transition" />
               <div class="text-center mt-3">
                    <a href="https://www.shopier.com/onurtosuner" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-adai-primary hover:text-adai-secondary transition-colors">
                        Aktivasyon kodun yok mu? Hemen satın al!
                    </a>
                </div>
            </div>
            ${error ? `<p class="text-sm text-red-500 text-center font-medium">${error}</p>` : ''}
            <div>
              <button type="submit" ${loading ? 'disabled' : ''} class="w-full flex justify-center rounded-lg bg-adai-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-adai-secondary disabled:opacity-70">
                ${loading ? 'Hesap Oluşturuluyor...' : 'Kayıt Ol ve Başla'}
              </button>
            </div>
          </form>
          <div class="text-center mt-6">
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Zaten bir hesabın var mı? <button id="to-login" class="font-semibold text-adai-primary hover:text-adai-secondary">Giriş Yap</button>
            </p>
          </div>
        </div>
      </div>
    `;

        // Re-attach event listeners
        const form = container.querySelector('#signup-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            email = container.querySelector('#email').value;
            password = container.querySelector('#password').value;
            activationCode = container.querySelector('#activationCode').value;

            loading = true;
            error = '';
            updateUI();

            const formattedCode = activationCode.trim();
            if (!formattedCode) {
                error = 'Lütfen bir aktivasyon kodu giriniz.';
                loading = false;
                updateUI();
                return;
            }

            try {
                const codeRef = doc(db, "activationCodes", formattedCode);
                const codeSnap = await getDoc(codeRef);

                if (!codeSnap.exists() || codeSnap.data().status !== 'unused') {
                    error = 'Geçersiz veya daha önce kullanılmış bir aktivasyon kodu girdiniz.';
                    loading = false;
                    updateUI();
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                const batch = writeBatch(db);
                const userProfileRef = doc(db, "users", user.uid);
                const subscriptionEndDate = new Date();
                subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

                batch.set(userProfileRef, {
                    email: user.email,
                    createdAt: new Date(),
                    subscription: {
                        status: "active",
                        endDate: subscriptionEndDate,
                    }
                });

                batch.update(codeRef, {
                    status: "used",
                    usedBy: user.uid,
                    usedAt: new Date()
                });

                await batch.commit();
                // Redirect will happen via store change in auth listener
            } catch (err) {
                if (err.code === 'auth/email-already-in-use') {
                    error = 'Bu e-posta adresi zaten kullanılıyor.';
                } else if (err.code === 'auth/weak-password') {
                    error = 'Şifre en az 6 karakter olmalıdır.';
                } else {
                    error = 'Kayıt sırasında bir hata oluştu.';
                }
                loading = false;
                updateUI();
            }
        });

        container.querySelector('#to-login').addEventListener('click', () => {
            store.setState({ activeTab: 'login' });
            window.location.hash = 'login';
        });
    };

    updateUI();
    return container;
}
