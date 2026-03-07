export const Loader = () => {
    const el = document.createElement('div');
    el.className = 'flex flex-col items-center justify-center p-8';
    el.innerHTML = `
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
        <p class="mt-4 text-slate-600 dark:text-slate-400 font-medium">Lütfen bekleyin...</p>
    `;
    return el;
};

export const ErrorMessage = (message) => {
    if (!message) return null;
    const el = document.createElement('div');
    el.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mt-4 rounded shadow-sm';
    el.innerHTML = `
        <div class="flex items-center">
            <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="font-bold">Hata</p>
        </div>
        <p class="text-sm mt-1">${message}</p>
    `;
    return el;
};
