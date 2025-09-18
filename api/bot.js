// ВРЕМЕННО ОТКЛЮЧЕНО
export default async (req, res) => {
  console.log('Бот временно отключен');
  return res.status(200).send('Bot is paused');
};
