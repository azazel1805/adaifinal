export const parseGeneratedQuestions = (text) => {
    const questions = [];
    let context = null;

    const normalizedText = text.trim().replace(/\r\n/g, '\n');

    const potentialBlocks = normalizedText.split(/(?=^\s*\d+\.\s*)/m).filter(Boolean);

    if (potentialBlocks.length > 0 && !/^\s*\d+\./.test(potentialBlocks[0])) {
        context = potentialBlocks.shift()?.trim() || null;
    }

    for (const block of potentialBlocks) {
        const cleanedBlock = block.trim();
        if (!cleanedBlock) continue;

        const answerMatch = cleanedBlock.match(/(?:Correct answer|Answer is|Correct option|Doğru cevap)\s*:?\s*([A-E])/i);
        const correctAnswer = answerMatch ? answerMatch[1].toUpperCase() : '';

        const blockToParse = answerMatch ? cleanedBlock.substring(0, answerMatch.index).trim() : cleanedBlock;

        const optionsStartIndex = blockToParse.search(/\s*[A-E]\)/);
        if (optionsStartIndex === -1) continue;

        const questionTextWithNumber = blockToParse.substring(0, optionsStartIndex).trim();
        const questionText = questionTextWithNumber.replace(/^\d+\.\s*/, '');
        const optionsBlock = blockToParse.substring(optionsStartIndex);

        const optionRegex = /([A-E])\)(.*?)(?=\s*[A-E]\)|$)/gs;
        const options = [];
        let match;
        while ((match = optionRegex.exec(optionsBlock)) !== null) {
            const key = match[1].toUpperCase();
            const value = match[2].trim();
            if (value) {
                options.push({ key, value });
            }
        }

        if (options.length >= 2) {
            const fullTextForAnalysis = `${context ? context + '\n\n' : ''}${questionTextWithNumber}\n${options.map(o => `${o.key}) ${o.value}`).join('\n')}`;

            questions.push({
                id: questions.length,
                fullText: fullTextForAnalysis,
                questionText: questionText,
                options: options,
                correctAnswer: correctAnswer,
            });
        }
    }

    return { context, questions };
};

export const parseClozeTestJsonResponse = (data) => {
    const allQuestions = [];
    const allPassages = [];
    let questionIdCounter = 0;

    if (!data.clozeTests) {
        return { context: null, questions: [] };
    }

    data.clozeTests.forEach((test, passageIndex) => {
        const passageTitle = data.clozeTests.length > 1 ? `--- Passage ${passageIndex + 1} ---\n` : '';
        allPassages.push(`${passageTitle}${test.passage}`);

        test.questions.sort((a, b) => a.blankNumber - b.blankNumber).forEach((q) => {
            const optionLetters = ['A', 'B', 'C', 'D', 'E'];
            const correctIndex = q.options.findIndex(opt => opt.toLowerCase() === q.correctAnswer.toLowerCase());
            const correctAnswerLetter = correctIndex !== -1 ? optionLetters[correctIndex] : '';

            const question = {
                id: questionIdCounter++,
                fullText: `${test.passage}\n\nQuestion for blank (${q.blankNumber}). Options:\n${q.options.map((o, i) => `${optionLetters[i]}) ${o}`).join('\n')}`,
                questionText: `Blank (${q.blankNumber}) - ${q.questionType}`,
                options: q.options.slice(0, 5).map((opt, i) => ({
                    key: optionLetters[i],
                    value: opt,
                })),
                correctAnswer: correctAnswerLetter,
            };
            allQuestions.push(question);
        });
    });

    return {
        context: allPassages.join('\n\n'),
        questions: allQuestions,
    };
}
