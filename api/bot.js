import { Telegraf } from 'telegraf';
import axios from 'axios';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Функция запроса к DeepSeek API
async function askDeepSeek(message) {
  const url = 'https://api.deepseek.com/chat/completions';
  const apiKey = process.env.DEEPSEEK_API_KEY; // Добавьте ключ в переменные Vercel

  const response = await axios.post(
    url,
    {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: message }],
      temperature: 0.7,
      max_tokens: 2000,
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;

  try {
    // Отправляем запрос к DeepSeek
    const aiResponse = await askDeepSeek(userMessage);
    
    // Отправляем ответ пользователю
    await ctx.reply(aiResponse);
  } catch (error) {
    console.error('Ошибка при запросе к DeepSeek:', error);
    await ctx.reply('Произошла ошибка, попробуйте позже.');
  }
});

// Запуск бота
export default async (req, res) => {
  await bot.handleUpdate(req.body, res);
};
