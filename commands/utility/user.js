const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('提供有關使用者的資訊。'),
	async execute(interaction) {
		// interaction.user 是代表執行命令的使用者的物件。
		// interaction.member 是 GuildMember 物件，代表在特定伺服器中的使用者。
		await interaction.reply(`這個命令是由 ${interaction.user.username} 執行的，該使用者於 ${interaction.member.joinedAt} 加入。`);
	},
};