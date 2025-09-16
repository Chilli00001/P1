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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // Таймаут 8 секунд

    const response = await axios.post(
      'https://api.deepseek.com/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: message }],
        temperature: 0.7,
        max_tokens: 1000, // Уменьшим на всякий случай
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal // Добавляем signal для прерывания
      }
    );

    clearTimeout(timeoutId);
    console.log('DeepSeek API response received');
    return response.data.choices[0].message.content;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('DeepSeek API timeout: Request took too long');
      return 'Извините, ответ занял слишком много времени ⏳';
    }
    
    console.error('DeepSeek API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data));
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



