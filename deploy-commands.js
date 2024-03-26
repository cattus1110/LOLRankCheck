const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// 這取決於你的目錄結構，但一般而言，你可以使用以下的方法來抓取命令目錄
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// 從之前創建的命令目錄中提取所有的命令文件。
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// 提取每個命令的數據的 SlashCommandBuilder#toJSON() 輸出，以進行部署。
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}
		else {
			console.log(`【警告】位於 ${filePath} 的命令缺少必需的 "data" 或 "execute" 屬性。`);
		}
	}
}

// 建構並準備 REST 模組的一個實例。
const rest = new REST().setToken(token);

// 然後部署你的命令！
(async () => {
	try {
		console.log(`開始刷新 ${commands.length} 個應用程式 (/) 命令。`);

		rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] })
			.then(() => console.log('Successfully deleted all guild commands.'))
			.catch(console.error);

		// for global commands
		rest.put(Routes.applicationCommands(clientId), { body: [] })
			.then(() => console.log('Successfully deleted all application commands.'))
			.catch(console.error);

		// put 方法用於使用當前設置完全刷新伺服器中的所有命令。
		const data = await rest.put(
			// Routes.applicationCommands(clientId),
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`成功重新載入 ${data.length} 個應用程式 (/) 命令`);
	}
	catch (error) {
		// 當然，請確保捕獲並記錄任何錯誤！
		console.error(error);
	}
})();