import { Telegraf } from 'telegraf';
import axios from 'axios';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Добавьте этот код в api/bot.js
bot.command('test', async (ctx) => {
  try {
    await ctx.sendChatAction('typing');
    
    // Тестовый запрос
    const testResponse = await axios.get('https://api.deepseek.com/models', {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      timeout: 5000
    });
    
    await ctx.reply(`API доступен! Статус: ${testResponse.status}`);
  } catch (error) {
    await ctx.reply(`Ошибка доступа к API: ${error.message}`);
  }
});

// Функция для запроса к DeepSeek
async function askDeepSeek(message) {
  try {
    console.log('Sending request to DeepSeek API...');
    console.log('Message:', message);
    console.log('API Key exists:', !!process.env.DEEPSEEK_API_KEY);
    
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
        timeout: 10000 // 10 секунд таймаут
      }
    );
    
    console.log('DeepSeek API response received');
    return response.data.choices[0].message.content;
    
  } catch (error) {
    console.error('DeepSeek API Error:');
    console.error('Error message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return 'Извините, произошла ошибка при обработке запроса 😢';
  }
}

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  try {
    console.log('Received message from user:', ctx.message.text);
    
    // Показываем статус "печатает"
    await ctx.sendChatAction('typing');
    
    // Получаем ответ от DeepSeek
    const response = await askDeepSeek(ctx.message.text);
    
    console.log('Sending response to user:', response);
    
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


