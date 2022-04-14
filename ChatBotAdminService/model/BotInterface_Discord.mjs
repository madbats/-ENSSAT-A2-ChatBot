import {
	BotInterface_Basic
} from './BotInterface.mjs';
import {
	Client,
	Intents
} from 'discord.js';

class BotInterface extends BotInterface_Basic {
	constructor(botProfile, userLogin) {
		super(botProfile, userLogin);
	}


	async loadBot() {
		super.loadBot();
		this.client = new Client({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
		});
		// When the client is ready, run this code (only once)
		this.client.once('ready', () => {
			console.log('Ready!');
		});

		this.client.on('messageCreate', async interaction => {

			if (interaction.author.bot) return;
			if (interaction.content.toLowerCase().startsWith(interaction.client.user.username)) {
				this.reply(interaction.content.replace(interaction.client.user.username,'')).then((res) => {
					interaction.reply(res);
				}).catch((res) => {
					interaction.channel.send('Something went wrong, try again in a bit!');
					console.error(`[${interaction.guild.name}]` + res);
				});
			} else if (interaction.content.toLowerCase().startsWith(`<@!${interaction.client.user.id}>`) || interaction.content.toLowerCase().startsWith(`<@${interaction.client.user.id}>`)) {
				this.reply(interaction.content.replace(`<@!${interaction.client.user.id}>`,'').replace(`<@${interaction.client.user.id}>`,'')).then((res) => {
					interaction.reply(res);
				}).catch((res) => {
					interaction.channel.send('Something went wrong, try again in a bit!');
					console.error(`[${interaction.guild.name}]` + res);
				});
			}
		});
		// Login to Discord with your client's token
		this.client.login(this.botProfile.token);
	}

	async close() {
		this.client.destroy();
	}
}

export {
	BotInterface
};