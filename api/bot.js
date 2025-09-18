import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Функция запроса к DeepSeek через Edge Function
async function askDeepSeek(message) {
  try {
    const response = await fetch(`${process.env.VERCEL_URL}/api/deepseek`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek request error:', error);
    return '⚠️ Произошла ошибка. Попробуйте позже.';
  }
}

// Обработка команды /start
bot.start((ctx) => {
  ctx.reply('🤖 Привет! Я бот с искусственным интеллектом. Задайте мне любой вопрос!');
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  try {
    // Показываем статус "печатает"
    await ctx.sendChatAction('typing');
    
    // Получаем ответ от DeepSeek
    const response = await askDeepSeek(ctx.message.text);
    
    // Отправляем ответ пользователю
    await ctx.reply(response);
  } catch (error) {
    console.error('Bot error:', error);
    await ctx.reply('❌ Произошла ошибка при обработке запроса');
  }
});

// Обработка ошибок
bot.catch((error) => {
  console.error('Global bot error:', error);
});

// Экспорт для Vercel
export default async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).send('OK');
  }
};
