import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

async function askDeepSeek(message) {
  try {
    console.log('📤 Sending direct request to DeepSeek API...');
    
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log('📥 DeepSeek response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ DeepSeek API error:', response.status, errorText);
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ DeepSeek response received');
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('❌ Direct DeepSeek request error:', error);
    return '⚠️ Произошла ошибка. Попробуйте позже.';
  }
}

bot.start((ctx) => {
  ctx.reply('🤖 Привет! Я бот с искусственным интеллектом. Задайте мне любой вопрос!');
});

bot.on('text', async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    const response = await askDeepSeek(ctx.message.text);
    await ctx.reply(response);
  } catch (error) {
    console.error('Bot error:', error);
    await ctx.reply('❌ Произошла ошибка при обработке запроса');
  }
});

bot.catch((error) => {
  console.error('Global bot error:', error);
});

export default async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).send('OK');
  }
};


