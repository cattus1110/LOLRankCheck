const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`已就緒！以 ${client.user.tag} 登入。`);
	},
};