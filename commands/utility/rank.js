const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { riotkey } = require('../../config.json');

module.exports = {
	cooldown: 60,
	data: new SlashCommandBuilder()
		.setName('rank')
		.setDescription('提供LOL牌位的資訊。')
		.addStringOption(option => option.setName('gamename').setDescription('遊戲名稱'))
		.addStringOption(option => option.setName('tagline').setDescription('標籤(請去掉#)')),

	async execute(interaction) {
		// interaction.guild 是代表執行命令的伺服器的物件。
		const gamename = interaction.options.getString('gamename');
		const tagline = interaction.options.getString('tagline');
		try {
			let str = '請填入參數 ';
			if (!gamename) { str += ' \\`gamename\\` '; }
			if (!tagline) { str += ' \\`tagline\\` '; }
			if (!gamename || !tagline) { return await interaction.reply(`${str}`); }

			const gamenameStr = gamename.trim();
			const taglineStr = tagline.trim();
			if (!gamename || !tagline) {
				console.log('gamename 或 tagline 為空值或未定義');
			}
			const response = await fetch(`https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gamenameStr}/${taglineStr}`, {
				headers: {
					'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
					'Accept-Language': 'zh-TW,zh;q=0.9',
					'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
					'Origin': 'https://developer.riotgames.com',
					'X-Riot-Token': riotkey,
				},
			});

			if (!response.ok) {
				switch (response.status) {
				case 404:
					return await interaction.reply(`查無此人 ${gamenameStr}#${taglineStr}`);
				case 400:
					throw new Error('錯誤的請求');
				case 401:
					throw new Error('未經授權');
				case 403:
					return await interaction.reply(`${gamenameStr}#${taglineStr} 為無效查詢`);
				case 405:
					throw new Error('不允許的方法');
				case 415:
					throw new Error('不支援的媒體類型');
				case 429:
					throw new Error('超過速率限制');
				case 500:
					throw new Error('內部伺服器錯誤');
				case 502:
					throw new Error('壞的網關');
				case 503:
					throw new Error('服務不可用');
				case 504:
					throw new Error('網關超時');
				default:
					throw new Error('無法獲取資料，HTTP 狀態碼： ' + response.status);
				}
			}

			const data1 = await response.json();
			try {
				const response = await fetch(`https://tw2.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${data1.puuid}`, {
					headers: {
						'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
						'Accept-Language': 'zh-TW,zh;q=0.9',
						'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
						'Origin': 'https://developer.riotgames.com',
						'X-Riot-Token': riotkey,
					},
				});

				if (!response.ok) {
					await interaction.reply(`拿取 ${gamenameStr}#${taglineStr} 資料發生錯誤\n請稍後再嘗試一次`);
					throw new Error('無法獲取資料，HTTP 狀態碼： ' + response.status);
				}

				const data2 = await response.json();
				try {
					const response = await fetch(`https://tw2.api.riotgames.com/lol/league/v4/entries/by-summoner/${data2.id}`, {
						headers: {
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
							'Accept-Language': 'zh-TW,zh;q=0.9',
							'Accept-Charset': 'application/x-www-form-urlencoded; charset=UTF-8',
							'Origin': 'https://developer.riotgames.com',
							'X-Riot-Token': riotkey,
						},
					});

					if (!response.ok) {
						throw new Error('無法獲取資料，HTTP 狀態碼： ' + response.status);
					}

					const data3 = await response.json();

					const tierImages = {
						'BRONZE': 'https://media.discordapp.net/attachments/1007978814460133426/1222132303233286164/BRONZE.png?ex=66151a67&is=6602a567&hm=7a45e221191acb9c8286d018c49c6e2eec8b78b58732d8e5dac03746b6ca0610&=&format=webp&quality=lossless&width=578&height=578',
						'CHALLENGER': 'https://media.discordapp.net/attachments/1007978814460133426/1222132303690731592/CHALLENGER.png?ex=66151a67&is=6602a567&hm=49a60d2faec12a3e7532e490ea786cfe51f17501e379263908a8ca7405e0c81d&=&format=webp&quality=lossless&width=578&height=578',
						'DIAMOND': 'https://media.discordapp.net/attachments/1007978814460133426/1222132304017756261/DIAMOND.png?ex=66151a67&is=6602a567&hm=d3750dfe7182f33ea5cb80b650a7efa196d2080728e66d840b94145f2e506997&=&format=webp&quality=lossless&width=578&height=578',
						'EMERALD': 'https://media.discordapp.net/attachments/1007978814460133426/1222132304302833736/EMERALD.png?ex=66151a67&is=6602a567&hm=a1f1e83c5367b968e335a05faac585c6ce4bc2eab0209616002f88d68d05e2de&=&format=webp&quality=lossless&width=578&height=578',
						'GOLD': 'https://media.discordapp.net/attachments/1007978814460133426/1222132304651227218/GOLD.png?ex=66151a67&is=6602a567&hm=b2e32ea2e8ab2d312da770d0df7603c1c13f0500d9b0e74ff5f46016014b3704&=&format=webp&quality=lossless&width=578&height=578',
						'GRANDMASTER': 'https://media.discordapp.net/attachments/1007978814460133426/1222132305246687363/GRANDMASTER.png?ex=66151a67&is=6602a567&hm=b4dc7c518be554be0d38a021f0b540f6fda0b22811f5eb3a00bf76dcc155d8b8&=&format=webp&quality=lossless&width=578&height=578',
						'IRON': 'https://media.discordapp.net/attachments/1007978814460133426/1222132305540153344/IRON.png?ex=66151a67&is=6602a567&hm=0d0ac27d62d67b98e2e4b8ca07c0b58edaf7cf299ef1f60bd9900911e791cc4f&=&format=webp&quality=lossless&width=578&height=578',
						'MASTER': 'https://media.discordapp.net/attachments/1007978814460133426/1222132305834020874/MASTER.png?ex=66151a67&is=6602a567&hm=155d3007301e44671da93fad25e099474ec420a6c4cbc3ad65beb9aeeb6b0baa&=&format=webp&quality=lossless&width=578&height=578',
						'PLATINUM': 'https://media.discordapp.net/attachments/1007978814460133426/1222132306123296858/PLATINUM.png?ex=66151a67&is=6602a567&hm=00898a491aabea56baf5647b57980950f0249d98c86873aacd50ea0e597df280&=&format=webp&quality=lossless&width=578&height=578',
						'SILVER': 'https://media.discordapp.net/attachments/1007978814460133426/1222132306429345812/SILVER.png?ex=66151a67&is=6602a567&hm=00ee83c8041904596a7559616a81ccacd0644ec230f0ad13069abcf75e3fa8fd&=&format=webp&quality=lossless&width=578&height=578',
					};
					const filteredData = data3.filter(item => item.queueType === 'RANKED_SOLO_5x5');
					// console.log(filteredData);
					if (filteredData.length > 0) {
						// 如果是，則引用相應的圖片路徑
						const imagePath = tierImages[filteredData[0].tier];
						const winRate = (filteredData[0].wins / (filteredData[0].wins + filteredData[0].losses)) * 100;
						const exampleEmbed = new EmbedBuilder()
							.setTitle(`${filteredData[0].summonerName}#${taglineStr}`)
							.setDescription(`**牌位: ** ${filteredData[0].tier}\n**階級: ** ${filteredData[0].rank}(${filteredData[0].leaguePoints})
						**勝場: ** ${filteredData[0].wins},**敗場: ** ${filteredData[0].losses},**勝率:** ${winRate.toFixed(2)} %
						`)
							.setThumbnail(imagePath);

						return await interaction.reply({ embeds: [exampleEmbed] });
					}
					else {
						return await interaction.reply(`**${gamenameStr}#${taglineStr}** 目前未完成單雙定位`);
					}

				}
				catch (error) {
					console.error('發生錯誤：', error);
					// message.channel.send('無法獲取資料，發生錯誤：' + error.message);
				}
			}
			catch (error) {
				console.error('發生錯誤：', error);
				// message.channel.send('無法獲取資料，發生錯誤：' + error.message);
			}
		}
		catch (error) {
			console.error('發生錯誤：', error);
			// await interaction.reply(`這個伺服器是 ${interaction.guild.name}，目前有 ${interaction.guild.memberCount} 名成員。`);
		}

	},
};