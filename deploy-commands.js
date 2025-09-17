// deploy-commands.js
const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// 環境変数から読み込む
const { CLIENT_ID, GUILD_ID, DISCORD_TOKEN } = process.env;

// commands フォルダにある全コマンドを読み込み
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

// REST API を使って Discord に登録
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log(`開始: ${commands.length} 件のスラッシュコマンドを ${GUILD_ID} に登録します。`);

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log('✅ 登録完了！');
  } catch (error) {
    console.error(error);
  }
})();
