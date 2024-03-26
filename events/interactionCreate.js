const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`找不到符合 ${interaction.commandName} 的任何命令。`);
			return;
		}

		try {
			await command.execute(interaction);
		}
		catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: '執行此命令時發生錯誤！', ephemeral: true });
			}
			else {
				await interaction.reply({ content: '執行此命令時發生錯誤！', ephemeral: true });
			}
		}
	},
};