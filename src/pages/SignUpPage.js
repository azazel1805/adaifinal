import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, writeBatch } from 'firebase/firestore';
import store from '../store/index';

export function renderSignUpPage() {
  const container = document.createElement('div');
  container.className = 'min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden';

  let state = {
    name: '',
    email: '',
    password: '',
    activationCode: '',
    isLoading: false,
    error: ''
  };

  const render = () => {
    container.innerHTML = `
      <!-- Background Shapes -->
      <div class="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-primary/5 rounded-full blur-[120px] -z-10"></div>
      <div class="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 rounded-full blur-[120px] -z-10"></div>

      <div class="w-full max-w-lg animate-fadeIn">
        <!-- Logo Section -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl shadow-2xl mb-4 transform -rotate-3 hover:rotate-0 transition-all duration-500">
            <span class="text-2xl font-black text-white italic">A</span>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Yeni Hesap</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium text-sm">ADAI ailesine katılın</p>
        </div>

        <!-- Signup Card -->
        <div class="bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 p-10 space-y-8">
          <div class="text-center space-y-2">
            <h2 class="text-2xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight italic">Kayıt Ol</h2>
            <p class="text-[10px] font-black text-brand-secondary uppercase tracking-[0.3em]">Hemen öğrenmeye başla</p>
          </div>

          ${state.error ? `
            <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                <p class="text-xs font-bold text-red-500 text-center">${state.error}</p>
            </div>
          ` : ''}

          <form id="signup-form" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2 col-span-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">AD SOYAD</label>
              <input type="text" id="name" value="${state.name}" required placeholder="John Doe" 
                class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary/20 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner">
            </div>

            <div class="space-y-2 col-span-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">E-POSTA</label>
              <input type="email" id="email" value="${state.email}" required placeholder="email@ornek.com" 
                class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary/20 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner">
            </div>

            <div class="space-y-2 col-span-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">ŞİFRE</label>
              <input type="password" id="password" value="${state.password}" required placeholder="••••••••" 
                class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-primary/20 rounded-2xl outline-none font-bold text-sm transition-all shadow-inner">
            </div>

            <div class="space-y-2 col-span-1">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-4">AKTİVASYON KODU</label>
              <input type="text" id="activationCode" value="${state.activationCode}" required placeholder="CODE-123" 
                class="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-brand-secondary/20 rounded-2xl outline-none font-black text-sm transition-all shadow-inner text-brand-secondary">
            </div>

            <div class="col-span-full pt-2">
                <a href="https://www.shopier.com/onurtosuner" target="_blank" class="block p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-center group hover:border-brand-primary transition-all">
                    <span class="text-[10px] font-bold text-slate-400 group-hover:text-brand-primary">Kodunuz yok mu?</span>
                    <span class="text-xs font-black text-slate-600 dark:text-slate-300 block mt-1 uppercase tracking-widest">BURADAN SATIN ALIN 💳</span>
                </a>
            </div>

            <button type="submit" ${state.isLoading ? 'disabled' : ''} 
                class="col-span-full py-5 bg-brand-primary text-white font-black rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-xs flex items-center justify-center gap-3 disabled:opacity-50">
                ${state.isLoading ? '<div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> HESAP OLUŞTURULUYOR...' : 'KAYIT OL VE BAŞLA 🔥'}
            </button>
          </form>
        </div>

        <div class="mt-8 text-center">
          <p class="text-sm font-bold text-slate-500 dark:text-slate-400">
            Zaten bir hesabın var mı? 
            <button id="to-login" class="text-brand-primary hover:underline ml-1 font-black uppercase text-xs tracking-widest">Giriş Yap</button>
          </p>
        </div>
      </div>
    `;

    attachEvents();
  };

  const attachEvents = () => {
    const form = container.querySelector('#signup-form');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      state.name = container.querySelector('#name').value;
      state.email = container.querySelector('#email').value;
      state.password = container.querySelector('#password').value;
      state.activationCode = container.querySelector('#activationCode').value;

      state.isLoading = true;
      state.error = '';
      render();

      const formattedCode = state.activationCode.trim();

      try {
        // Verify activation code
        const codeRef = doc(db, "activationCodes", formattedCode);
        const codeSnap = await getDoc(codeRef);

        if (!codeSnap.exists() || codeSnap.data().status !== 'unused') {
          throw new Error('Geçersiz veya daha önce kullanılmış aktivasyon kodu.');
        }

        // Create user
        const userCredential = await createUserWithEmailAndPassword(auth, state.email, state.password);
        const user = userCredential.user;

        // Set display name
        await updateProfile(user, { displayName: state.name });

        // Provision account
        const batch = writeBatch(db);
        const userProfileRef = doc(db, "users", user.uid);

        // Set default 30 days subscription
        const subscriptionEndDate = new Date();
        subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30);

        batch.set(userProfileRef, {
          uid: user.uid,
          email: user.email,
          displayName: state.name,
          createdAt: new Date(),
          subscription: {
            status: "active",
            endDate: subscriptionEndDate,
            plan: "premium"
          }
        });

        batch.update(codeRef, {
          status: "used",
          usedBy: user.uid,
          usedAt: new Date()
        });

        await batch.commit();
        // Success - will redirect via store/main logic
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          state.error = 'Bu e-posta adresi zaten kullanılıyor.';
        } else if (err.code === 'auth/weak-password') {
          state.error = 'Şifre çok zayıf. En az 6 karakter kullanın.';
        } else {
          state.error = err.message || 'Kayıt sırasında bir hata oluştu.';
        }
        state.isLoading = false;
        render();
      }
    });

    container.querySelector('#to-login')?.addEventListener('click', () => {
      store.setState({ activeTab: 'login' });
      window.location.hash = 'login';
    });
  };

  render();
  return container;
}
