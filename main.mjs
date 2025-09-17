// main.mjs - Discord Botのメインプログラム

import { Client, GatewayIntentBits, Collection } from 'discord.js';
import dotenv from 'dotenv';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// .envファイルから環境変数を読み込み
dotenv.config();

// パス関連の準備（ESMでは __dirname がないので自作）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Discord Botクライアントを作成
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, // ← VC状態を扱うので追加！
    ],
});

// コマンドを保存する Collection
client.commands = new Collection();

// commands フォルダのコマンドを読み込み
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    client.commands.set(command.default?.data?.name || command.data.name, command.default || command);
}

// Botが起動完了したとき
client.once('ready', () => {
    console.log(`🎉 ${client.user.tag} が正常に起動しました！`);
    console.log(`📊 ${client.guilds.cache.size} つのサーバーに参加中`);

    //ステータス
    client.user.setPresence({
        activities: [
            { name: 'いーてぃー', type: 5 }
        ],
        status: 'online',
    });
});

// スラッシュコマンドを処理
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    console.log(`受信したコマンド: ${interaction.commandName}`);

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.log("❌ コマンドが見つかりませんでした");
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "エラーが発生しました。", ephemeral: true });
        } else {
            await interaction.reply({ content: "エラーが発生しました。", ephemeral: true });
        }
    }
});

// 旧テキストコマンド (ping)
client.on('messageCreate', (message) => {
    if (message.author.bot) return;
    if (message.content.toLowerCase() === 'ping') {
        message.reply('🏓 pong!');
        console.log(`📝 ${message.author.tag} が ping コマンドを使用`);
    }
});

// エラーハンドリング
client.on('error', (error) => {
    console.error('❌ Discord クライアントエラー:', error);
});

// プロセス終了時
process.on('SIGINT', () => {
    console.log('🛑 Botを終了しています...');
    client.destroy();
    process.exit(0);
});

// Discord にログイン
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN が .env ファイルに設定されていません！');
    process.exit(1);
}

console.log('🔄 Discord に接続中...');
client.login(process.env.DISCORD_TOKEN)
    .catch(error => {
        console.error('❌ ログインに失敗しました:', error);
        process.exit(1);
    });

// Express Webサーバー (Render用)
const app = express();
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.json({
        status: 'Bot is running! 🤖',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});
app.listen(port, () => {
    console.log(`🌐 Web サーバーがポート ${port} で起動しました`);
});
