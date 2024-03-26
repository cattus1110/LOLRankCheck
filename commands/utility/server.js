const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('提供有關伺服器的資訊。'),
	async execute(interaction) {
		// interaction.guild 是代表執行命令的伺服器的物件。
		await interaction.reply(`這個伺服器是 ${interaction.guild.name}，目前有 ${interaction.guild.memberCount} 名成員。`);
	},
};