export const renderAnalysisResultDisplay = (result) => {
    const el = document.createElement('div');
    el.className = 'space-y-4 mt-6 border-t-2 border-slate-200 dark:border-slate-800 pt-6';

    const renderValue = (value) => {
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return String(value);
    };

    let html = `
        <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <h4 class="text-lg font-bold text-brand-primary mb-3">Analiz Özeti</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><strong class="text-slate-500 dark:text-slate-400">Soru Tipi:</strong> <span class="text-slate-800 dark:text-slate-200">${result.soruTipi || 'Belirtilmemiş'}</span></div>
                <div><strong class="text-slate-500 dark:text-slate-400">Konu:</strong> <span class="text-slate-800 dark:text-slate-200">${result.konu || 'Belirtilmemiş'}</span></div>
                <div><strong class="text-slate-500 dark:text-slate-400">Zorluk Seviyesi:</strong> <span class="text-slate-800 dark:text-slate-200">${result.zorlukSeviyesi || 'Belirtilmemiş'}</span></div>
                <div class="sm:col-span-2"><strong class="text-slate-500 dark:text-slate-400">Doğru Cevap:</strong> <span class="font-bold text-green-600 text-base">${result.dogruCevap || 'Belirtilmemiş'}</span></div>
            </div>
        </div>
    `;

    if (result.analiz) {
        html += `
            <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <h4 class="text-md font-semibold text-brand-primary mb-2">Detaylı Analiz Adımları</h4>
                <ul class="space-y-2 text-sm text-slate-800 dark:text-slate-200">
                    ${Object.entries(result.analiz).map(([key, value]) => `
                        <li class="flex items-start">
                            <span class="text-brand-primary mr-2 mt-1">&#10148;</span>
                            <span><strong class="font-semibold capitalize text-slate-600 dark:text-slate-400">${key.replace(/_/g, ' ')}:</strong> ${renderValue(value)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    html += `
        <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <h4 class="text-md font-semibold text-brand-primary mb-2">Kapsamlı Açıklama</h4>
            <p class="text-sm text-slate-800 dark:text-slate-200">${result.detayliAciklama || 'Açıklama bulunamadı.'}</p>
        </div>
    `;

    if (result.digerSecenekler && result.digerSecenekler.length > 0) {
        html += `
            <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                <h4 class="text-md font-semibold text-brand-primary mb-2">Diğer Seçeneklerin Analizi</h4>
                <div class="space-y-3">
                    ${result.digerSecenekler.map((opt) => `
                        <div class="p-3 bg-white dark:bg-slate-700 rounded-md border-l-4 border-red-400">
                            <p class="text-sm text-slate-800 dark:text-slate-200"><strong class="font-bold text-red-600">${opt.secenek}:</strong> ${opt.aciklama}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    el.innerHTML = html;
    return el;
};
