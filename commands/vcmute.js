// commands/vcmute.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vcmute')
    .setDescription('今いるボイスチャンネルの全員をサーバーミュートします')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // ★ 管理者権限必須
    .setDMPermission(false), // DMでは使えないようにする

  async execute(interaction) {
    const member = interaction.member;

    // VCにいない場合は即返信
    if (!member.voice.channel) {
      return interaction.reply({ 
        content: 'まずボイスチャンネルに参加してください。', 
        ephemeral: true 
      });
    }

    const channel = member.voice.channel;

    try {
      // 先に応答（タイムアウト防止）
      await interaction.reply(`🔇 ${channel.name} 内の全員をミュートしています…`);

      // VC内の全員をサーバーミュート
      for (const [id, vcMember] of channel.members) {
        try {
          await vcMember.voice.setMute(true, 'vcmuteコマンド実行');
        } catch (error) {
          console.error(`ミュート失敗: ${vcMember.user.tag}`, error);
        }
      }

      // 完了報告
      await interaction.editReply(`✅ ${channel.name} 内の全員をサーバーミュートしました！`);

    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
    }
  },
};


