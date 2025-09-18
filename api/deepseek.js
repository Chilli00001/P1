export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  console.log('=== DEEPSEEK EDGE FUNCTION CALLED ===');
  
  try {
    // Логируем заголовки для отладки
    console.log('Headers:', Object.fromEntries(request.headers));
    
    const apiKey = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('API Key present:', !!apiKey);
    
    if (!apiKey) {
      console.error('❌ API key missing in headers');
      return new Response(JSON.stringify({ error: 'API key missing' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { message } = await request.json();
    console.log('Received message:', message);

    if (!message) {
      console.error('❌ No message provided');
      return new Response(JSON.stringify({ error: 'No message provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Sending request to DeepSeek API...');
    
    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log('DeepSeek response status:', deepseekResponse.status);
    
    if (!deepseekResponse.ok) {
      const errorText = await deepseekResponse.text();
      console.error('❌ DeepSeek API error:', deepseekResponse.status, errorText);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const data = await deepseekResponse.json();
    console.log('✅ DeepSeek response received');

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ DeepSeek edge function error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
