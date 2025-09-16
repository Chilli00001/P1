import { Telegraf } from 'telegraf';
import axios from 'axios';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Функция для запроса к DeepSeek
async function askDeepSeek(message) {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    return 'Извините, произошла ошибка при обработке запроса 😢';
  }
}

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
    await ctx.reply('Произошла ошибка, попробуйте позже.');
  }
});

// Обработка команды /start
bot.start((ctx) => {
  ctx.reply('Привет! Я бот с интеллектом DeepSeek. Задайте мне любой вопрос!');
});

// Обработка ошибок
bot.catch((error) => {
  console.error('Global bot error:', error);
});

// Экспорт обработчика для Vercel
export default async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).send('OK');
  }
};
