// Direct fetch implementation for Groq API (browser-compatible)

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Lazy initialization - get API key when needed
const getApiKey = (): string => {
    return import.meta.env.VITE_GROQ_API_KEY || '';
};

export const isGroqAvailable = (): boolean => {
    const apiKey = getApiKey();
    const available = apiKey.length > 10;
    console.log('isGroqAvailable check:', available, 'key length:', apiKey.length);
    return available;
};

/**
 * Test the Groq API connection
 * Returns { success: true, message: string } or { success: false, error: string }
 */
export async function testGroqConnection(): Promise<{ success: boolean; message?: string; error?: string }> {
    const apiKey = getApiKey();

    if (!apiKey || apiKey.length < 10) {
        return { success: false, error: 'API key not configured. Add VITE_GROQ_API_KEY to .env file.' };
    }

    console.log('Testing Groq API connection...');

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'user', content: 'Say "API working" in 2 words only.' }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.1,
                max_completion_tokens: 10,
                top_p: 1,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API test failed:', response.status, errorData);

            if (response.status === 401) {
                return { success: false, error: 'Invalid API key. Check your VITE_GROQ_API_KEY.' };
            } else if (response.status === 429) {
                return { success: false, error: 'Rate limit exceeded. Try again later.' };
            } else if (response.status === 400) {
                return { success: false, error: `Bad request: ${errorData?.error?.message || 'Unknown error'}` };
            }

            return { success: false, error: `API error: ${response.status}` };
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (content) {
            console.log('Groq API test successful:', content);
            return { success: true, message: `Connected! Response: "${content}"` };
        }

        return { success: false, error: 'Empty response from API' };
    } catch (error: any) {
        console.error('Groq API test error:', error);
        return { success: false, error: error.message || 'Network error' };
    }
}

export async function getGroqChatCompletion(
    systemPrompt: string,
    userPrompt: string
): Promise<string> {
    const apiKey = getApiKey();

    if (!apiKey || apiKey.length < 10) {
        console.error('Groq API key not configured');
        throw new Error('Groq API Key is missing or invalid. Please add VITE_GROQ_API_KEY to your .env file.');
    }

    console.log('Sending request to Groq AI...');
    console.log('User prompt:', userPrompt.substring(0, 100) + '...');

    try {
        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                model: 'llama-3.3-70b-versatile',
                temperature: 0.7,
                max_completion_tokens: 1024,
                top_p: 1,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Groq API Error:', response.status, errorData);

            if (response.status === 401) {
                throw new Error('Invalid Groq API key. Please check your VITE_GROQ_API_KEY.');
            } else if (response.status === 429) {
                throw new Error('Rate limit exceeded. Please try again in a moment.');
            } else if (response.status === 503) {
                throw new Error('Groq service temporarily unavailable.');
            }

            throw new Error(`Groq API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            console.warn('Empty response from Groq');
            throw new Error('Empty response from AI');
        }

        console.log('Groq AI response received:', content.substring(0, 100) + '...');
        return content;
    } catch (error: any) {
        console.error('Groq request failed:', error);
        throw error;
    }
}
