import globalStore from '../store';

const SKILL_CATEGORIES = {
    'Okuma Becerileri': ['Okuma Anlama Analizi', 'Paragraf Sorusu', 'Paragraf Tamamlama Sorusu', 'Akışı Bozan Cümle Sorusu', 'Restatement (Yeniden Yazma) Sorusu'],
    'Dilbilgisi & Yapı': ['Gramer Kütüphanesi', 'Cümle Sıralama', 'Dil Bilgisi Sorusu', 'Cümle Tamamlama Sorusu', 'Cloze Test Sorusu'],
    'Kelime Bilgisi': ['Word Sprint', 'Adam Asmaca', 'Kelime Sorusu', 'Dictionary', 'Visual Dictionary'],
    'Diyalog & Konuşma': ['Diyalog Kurucu', 'Diyalog Tamamlama Sorusu', 'Speaking Simulator'],
    'Dinleme Becerileri': ['Dinleme Pratiği'],
    'Yazma & Analiz': ['Creative Writing', 'Essay Outliner', 'Paragraph Cohesion', 'Handwriting Converter']
};

export const renderSkillTree = () => {
    const container = document.createElement('div');
    container.className = 'max-w-7xl mx-auto space-y-10';

    let state = {
        selectedSkill: null
    };

    const aggregated = () => {
        const stats = globalStore.getState().performanceStats || {};
        const res = {};
        for (const cat in SKILL_CATEGORIES) {
            res[cat] = { correct: 0, total: 0 };
            SKILL_CATEGORIES[cat].forEach(t => {
                if (stats[t]) {
                    res[cat].correct += stats[t].correct;
                    res[cat].total += stats[t].total;
                }
            });
        }
        return res;
    };

    const getStyle = (name, data) => {
        if (!data || data.total === 0) return { level: 'Locked', cls: 'opacity-40 grayscale', p: 0, color: 'slate' };
        const p = (data.correct / data.total) * 100;
        let level = 'Novice';
        if (data.total > 50) level = 'Grandmaster';
        else if (data.total > 20) level = 'Expert';
        else if (data.total > 5) level = 'Adept';

        if (p >= 80) return { level, cls: 'border-green-500 shadow-green-500/10', p, color: 'green', desc: 'Bu beceride kusursuz bir hakimiyetin var. Zirvedesin!' };
        if (p >= 50) return { level, cls: 'border-brand-primary shadow-brand-primary/10', p, color: 'brand-primary', desc: 'Güçlü bir temel oluşturdun, uzmanlığa çok yakınsın.' };
        return { level, cls: 'border-orange-500 shadow-orange-500/10', p, color: 'orange', desc: 'Potansiyelin yüksek, daha fazla pratikle seviye atlayabilirsin.' };
    };

    const render = () => {
        const stats = aggregated();
        const hasData = Object.values(stats).some(s => s.total > 0);

        if (!hasData) {
            container.innerHTML = `
                <div class="animate-fadeIn py-20 bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 text-center space-y-8">
                    <div class="text-8xl select-none">🌳</div>
                    <div class="space-y-4">
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Yetenek Ağacı Boş</h2>
                        <p class="text-slate-500 dark:text-slate-400 font-medium max-w-md mx-auto">Henüz performans verisi toplanmadı. Sınavları çözerek veya pratik araçlarını kullanarak yeteneklerini keşfet.</p>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="animate-fadeIn space-y-10">
                <div class="bg-white dark:bg-slate-900 p-10 md:p-14 rounded-[3.5rem] shadow-2xl border-4 border-slate-50 dark:border-slate-800 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-10 text-8xl opacity-10 select-none grayscale">🧬</div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic underline underline-offset-8 decoration-brand-primary">Neural Skill Tree</h2>
                    <p class="text-slate-500 dark:text-slate-400 font-medium max-w-xl mt-6">Dil yolculuğundaki evrimini takip et. Çözdüğün her soru, yaptığın her analiz bu ağacı besleyerek seni daha ileriye taşır.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    ${Object.keys(SKILL_CATEGORIES).map(cat => {
            const style = getStyle(cat, stats[cat]);
            if (stats[cat].total === 0) return '';
            return `
                            <div class="skill-card bg-white dark:bg-slate-900 p-8 rounded-[3rem] shadow-xl border-t-8 ${style.cls} cursor-pointer hover:-translate-y-2 transition-all group" data-cat="${cat}">
                                <div class="flex justify-between items-start mb-6">
                                    <h3 class="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">${cat}</h3>
                                    <span class="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all">${style.level}</span>
                                </div>
                                <div class="flex items-end gap-3 mb-6">
                                    <span class="text-5xl font-black text-slate-900 dark:text-white italic">${stats[cat].correct}</span>
                                    <span class="text-xl font-bold text-slate-400 mb-1">/ ${stats[cat].total}</span>
                                </div>
                                <div class="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                    <div class="h-full rounded-full transition-all duration-1000 ${style.color === 'green' ? 'bg-green-500' : style.color === 'orange' ? 'bg-orange-500' : 'bg-brand-primary'}" style="width: ${style.p}%"></div>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>

            <!-- Detail Modal -->
            <div id="modal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] hidden items-center justify-center p-6 animate-fadeIn">
                <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[4rem] shadow-2xl overflow-hidden border-4 border-white/10">
                    <div id="modal-header" class="p-10 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <h3 id="modal-title" class="text-3xl font-black text-slate-900 dark:text-white uppercase italic"></h3>
                        <button id="close-modal" class="w-12 h-12 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-400 text-3xl">&times;</button>
                    </div>
                    <div class="p-10 space-y-10">
                        <div id="modal-desc" class="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 text-brand-primary font-bold italic text-center"></div>
                        
                        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                            <div class="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl">
                                <span class="text-[10px] font-black text-slate-400 block mb-2">TOTAL</span>
                                <p id="m-total" class="text-3xl font-black italic"></p>
                            </div>
                            <div class="p-6 bg-green-50 rounded-3xl">
                                <span class="text-[10px] font-black text-green-600 block mb-2">CORRECT</span>
                                <p id="m-correct" class="text-3xl font-black text-green-600 italic"></p>
                            </div>
                            <div class="p-6 bg-red-50 rounded-3xl">
                                <span class="text-[10px] font-black text-red-600 block mb-2">WRONG</span>
                                <p id="m-wrong" class="text-3xl font-black text-red-600 italic"></p>
                            </div>
                            <div class="p-6 bg-slate-900 rounded-3xl">
                                <span class="text-[10px] font-black text-brand-primary block mb-2">RATIO</span>
                                <p id="m-p" class="text-3xl font-black text-white italic"></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        attachEvents();
    };

    const attachEvents = () => {
        const modal = container.querySelector('#modal');
        const mTitle = container.querySelector('#modal-title');
        const mDesc = container.querySelector('#modal-desc');
        const mTotal = container.querySelector('#m-total');
        const mCorrect = container.querySelector('#m-correct');
        const mWrong = container.querySelector('#m-wrong');
        const mP = container.querySelector('#m-p');

        container.querySelectorAll('.skill-card').forEach(card => {
            card.onclick = () => {
                const cat = card.dataset.cat;
                const stats = aggregated()[cat];
                const style = getStyle(cat, stats);

                mTitle.textContent = cat;
                mDesc.textContent = style.desc;
                mTotal.textContent = stats.total;
                mCorrect.textContent = stats.correct;
                mWrong.textContent = stats.total - stats.correct;
                mP.textContent = `${style.p.toFixed(1)}%`;

                modal.classList.remove('hidden');
                modal.classList.add('flex');
            };
        });

        container.querySelector('#close-modal')?.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

        modal?.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });
    };

    render();
    return container;
};
