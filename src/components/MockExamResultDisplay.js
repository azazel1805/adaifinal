const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}dk ${secs}sn`;
};

export const renderMockExamResultDisplay = (result, onAskTutor) => {
    const el = document.createElement('div');
    el.className = 'space-y-6';

    let html = `
        <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
            <h3 class="text-xl font-bold text-brand-primary mb-3">Sınav Sonucu</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Doğru Sayısı</p>
                    <p class="text-2xl font-bold text-green-600">${result.score}</p>
                </div>
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Toplam Soru</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">${result.totalQuestions}</p>
                </div>
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Başarı</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">${((result.score / result.totalQuestions) * 100).toFixed(1)}%</p>
                </div>
                <div>
                    <p class="text-sm text-slate-500 dark:text-slate-400">Süre</p>
                    <p class="text-2xl font-bold text-slate-800 dark:text-slate-200">${formatTime(result.timeTaken)}</p>
                </div>
            </div>
        </div>

        <div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Konu Analizi</h3>
            <div class="space-y-3">
                ${Object.entries(result.performanceByType).map(([type, stats]) => `
                    <div class="bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
                        <div class="flex justify-between items-center text-sm mb-1">
                            <span class="font-semibold text-slate-700 dark:text-slate-300">${type}</span>
                            <span class="text-slate-500 dark:text-slate-400">${stats.correct} / ${stats.total}</span>
                        </div>
                        <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                            <div class="bg-brand-primary h-2.5 rounded-full" style="width: ${(stats.correct / stats.total) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div>
            <h3 class="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Soru Detayları</h3>
            <div id="questions-review" class="space-y-4"></div>
        </div>
    `;

    el.innerHTML = html;
    const reviewContainer = el.querySelector('#questions-review');

    result.questions.forEach((q, index) => {
        const userAnswer = result.userAnswers[q.questionNumber];
        const isCorrect = userAnswer === q.correctAnswer;
        const qEl = document.createElement('div');
        qEl.className = `p-4 rounded-lg border-l-4 ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`;

        qEl.innerHTML = `
            <p class="font-semibold text-slate-900 dark:text-slate-200 mb-2">
                <span class="${isCorrect ? 'text-green-600' : 'text-red-600'}">${q.questionNumber}.</span> ${q.questionText}
            </p>
            <div class="space-y-2 text-sm">
                ${q.options.map(opt => {
            const isUserAnswer = opt.key === userAnswer;
            const isCorrectAnswer = opt.key === q.correctAnswer;
            let classes = "text-slate-600 dark:text-slate-400";
            if (isCorrectAnswer) classes = "font-bold text-green-700 dark:text-green-300";
            if (isUserAnswer && !isCorrect) classes = "font-bold text-red-700 dark:text-red-300 line-through";
            return `<p class="${classes}">${opt.key}) ${opt.value}${isCorrectAnswer ? ' (Doğru Cevap)' : ''}${isUserAnswer && !isCorrect ? ' (Senin Cevabın)' : ''}</p>`;
        }).join('')}
                ${!userAnswer ? '<p class="text-slate-500 dark:text-slate-400 italic">Boş bırakıldı.</p>' : ''}
            </div>
        `;

        if (!isCorrect) {
            const footer = document.createElement('div');
            footer.className = "mt-3 text-right";
            const btn = document.createElement('button');
            btn.className = "text-sm text-sky-600 dark:text-sky-400 hover:underline";
            btn.innerText = "Neden yanlış yaptığımı Onur'a sor";
            btn.addEventListener('click', () => {
                const optionsText = q.options.map(opt => `${opt.key}) ${opt.value}`).join('\n');
                const context = `Merhaba Onur, deneme sınavındaki bu soruyu yanlış yaptım. Bana nedenini açıklayabilir misin?\n\n---SORU---\nSoru ${q.questionNumber}: ${q.questionText}\n\nSeçenekler:\n${optionsText}\n\n---CEVAPLARIM---\nBenim Cevabım: ${userAnswer || 'Boş'}\nDoğru Cevap: ${q.correctAnswer}`;
                onAskTutor(context);
            });
            footer.appendChild(btn);
            qEl.appendChild(footer);
        }
        reviewContainer.appendChild(qEl);
    });

    return el;
};
