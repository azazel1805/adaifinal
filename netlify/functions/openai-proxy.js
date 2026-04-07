export const handler = async (event) => {
    // CORS Headers
    const headers = {
        'Access-Control-Allow-Origin': '*', // Android/iOS için gereklidir
        'Access-Control-Allow-Headers': 'Content-Type, X-Adai-Secret',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle OPTIONS (Preflight) requests
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed', headers };
    }

    // -- GÜVENLİK KONTROLÜ --
    // Netlify Environment Variables kısmına ADAI_APP_SECRET eklemelisiniz.
    const ADAI_APP_SECRET = process.env.ADAI_APP_SECRET || 'adai-default-secret-2024';
    const clientSecret = event.headers['x-adai-secret'];

    if (clientSecret !== ADAI_APP_SECRET) {
        return { 
            statusCode: 403, 
            headers,
            body: JSON.stringify({ error: 'Erişim Engellendi: Geçersiz Uygulama Anahtarı' }) 
        };
    }

    try {
        const { path, body } = JSON.parse(event.body);
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return { statusCode: 500, body: 'OPENAI_API_KEY is missing in Netlify environment', headers };
        }

        const response = await fetch(`https://api.openai.com/v1/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return {
            statusCode: response.status,
            headers,
            body: JSON.stringify(data),
        };
    } catch (error) {
        return { 
            statusCode: 500, 
            headers,
            body: JSON.stringify({ error: error.message }) 
        };
    }
};
