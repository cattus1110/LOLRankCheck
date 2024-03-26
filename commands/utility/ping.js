const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('回覆是「乒乓球」!'),
	async execute(interaction) {
		await interaction.reply('乒乓球!');
	},
};