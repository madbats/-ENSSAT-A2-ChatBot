import {
	BotInterface_Basic
} from './BotInterface.mjs';
import {
	Client,
	Intents
} from 'discord.js';

// Interface de de com avec bot discord
class BotInterface extends BotInterface_Basic {
	constructor(botProfile, userLogin) {
		super(botProfile, userLogin);
	}


	async loadBot() {
		console.log('Loading...');
		super.loadBot();
		console.log('...Loading...');
		this.client = new Client({
			intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
		});

		// When the client is ready, run this code (only once)
		this.client.once('ready', () => {
			console.log('Ready!');
		});

		console.log('...Messages...');
		this.client.on('messageCreate', async interaction => {
			// Si l'interaction provient du bot lui même
			if (interaction.author.bot) return;
			// Si l'interaction contient le nom du bot
			if (interaction.content.toLowerCase().startsWith(interaction.client.user.username)) {
				this.reply(interaction.content.replace(interaction.client.user.username, '')).then((res) => {
					interaction.reply(res);
				}).catch((res) => {
					interaction.channel.send('Something went wrong, try again in a bit!');
					console.error(`[${interaction.guild.name}]` + res);
				});
				// Si l'interaction mentionne le bot
			} else if (interaction.content.toLowerCase().startsWith(`<@!${interaction.client.user.id}>`) || interaction.content.toLowerCase().startsWith(`<@${interaction.client.user.id}>`)) {
				// Supprime la mention et calcule la réponse du bot
				this.reply(interaction.content.replace(`<@!${interaction.client.user.id}>`, '').replace(`<@${interaction.client.user.id}>`, '')).then((res) => {
					interaction.reply(res);
				}).catch((res) => {
					interaction.channel.send('Something went wrong, try again in a bit!');
					console.error(`[${interaction.guild.name}]` + res);
				});
			}
		});

		// Login a discord avec le token
		
		this.client.login(this.botProfile.option.token);
		
	}

	async close() {
		this.client.destroy();
	}
}

export {
	BotInterface
};