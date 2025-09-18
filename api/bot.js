import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

async function askDeepSeek(message) {
  try {
    // ДОБАВЬТЕ https:// к URL!
    const apiUrl = `https://${process.env.VERCEL_URL}/api/deepseek`;
    
    console.log('Sending request to:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('DeepSeek proxy error:', response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek request error:', error);
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
