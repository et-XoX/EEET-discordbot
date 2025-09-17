// commands/vcunmute.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vcunmute')
    .setDescription('今いるボイスチャンネルの全員のサーバーミュートを解除します')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // ★ 管理者限定
    .setDMPermission(false), // DMでは使えない

  async execute(interaction) {
    const member = interaction.member;

    // VCにいない場合
    if (!member.voice.channel) {
      return interaction.reply({ 
        content: 'まずボイスチャンネルに参加してください。', 
        ephemeral: true 
      });
    }

    const channel = member.voice.channel;

    try {
      // 先に応答（タイムアウト防止）
      await interaction.reply(`🔊 ${channel.name} 内の全員のサーバーミュートを解除しています…`);

      // VC内の全員のサーバーミュートを解除
      for (const [id, vcMember] of channel.members) {
        try {
          await vcMember.voice.setMute(false, 'vcunmuteコマンド実行');
        } catch (error) {
          console.error(`ミュート解除失敗: ${vcMember.user.tag}`, error);
        }
      }

      // 完了報告
      await interaction.editReply(`✅ ${channel.name} 内の全員のサーバーミュートを解除しました！`);

    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
    }
  },
};
