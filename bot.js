// api/bot.js
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply(`Привет, ${ctx.from.first_name}! Я твой фитнес-ассистент.`);
});

bot.on('text', (ctx) => {
  ctx.reply(`Пока я только повторюшка: "${ctx.message.text}"`);
});

module.exports = async (req, res) => {
  try {
    await bot.handleUpdate(req.body, res);
  } catch (error) {
    console.error('Error:', error);
    res.status(200).send('OK');
  }
};