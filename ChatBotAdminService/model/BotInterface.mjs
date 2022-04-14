import RiveScript from 'rivescript';

class BotInterface_Basic {
	constructor(botProfile, userLogin) {
		this.botProfile = botProfile;
		this.userProfile = userLogin;
	}

	async loadBot() {
		var riveBot = new RiveScript();
		// console.log(`./bot-templates/${this.botProfile.template}.rive`);
		await riveBot.loadFile(`./bot-templates/${this.botProfile.template}.rive`);
		await riveBot.sortReplies();
		this.bot = riveBot;
		if (this.botProfile.userProfiles[this.userProfile] != undefined) {
			await this.bot.setUservars(this.userProfile, this.botProfile.userProfiles[this.userProfile]);
		}
	}

	async reply(message) {
		// var reply = await ;
		console.log(`Repling to :${message.replace(/[^a-zA-Z0-9 !?.]/g, '').toLowerCase()}`);
		return this.bot.reply(this.userProfile, message.replace(/[^a-zA-Z0-9 !?.]/g, '').toLowerCase());
	}

	async getUservars(){
		return this.bot.getUservars(this.userProfile);
	}

	
	async close(){
	}
}

export {BotInterface_Basic};