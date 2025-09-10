// api/bot.js
const { Telegraf } = require('telegraf');

// Создаем экземпляр бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Обрабатываем команду /start
bot.start((ctx) => {
  ctx.reply(`Привет, ${ctx.from.first_name}! Я твой фитнес-ассистент.`);
});

// Обрабатываем любое текстовое сообщение
bot.on('text', (ctx) => {
  ctx.reply(`Пока я только повторюшка: "${ctx.message.text}"`);
});

// Обработчик для Vercel Serverless Function
module.exports = async (req, res) => {
  // Логируем запрос
  console.log('Received request:', req.method, req.url);
  
  try {
    // Важно: Telegraf ожидает body в чистом виде
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Error handling update:', error);
    return res.status(200).send('OK');
  }
};
