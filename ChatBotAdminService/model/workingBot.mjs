import RiveScript from 'rivescript';


class WorkingBot {
	constructor(botProfile, userLogin) {
		this.botProfile = botProfile;
		this.userProfile = userLogin;
	}

	loadBot() {
		this.bot = new RiveScript();
		console.log(`./bot-templates/${this.botProfile.template}.rive`);

		return new Promise((resolve, reject) => {
			this.bot.loadFile(`./bot-templates/${this.botProfile.template}.rive`).then(() => {
				this.bot.sortReplies();
				if (this.botProfile.userProfiles[this.userProfile] != undefined) {
					console.log('Setting user vars');
					this.bot.setUservars(this.userProfile, this.botProfile.userProfiles[this.userProfile]);
				}
				resolve(this);
			}).catch((err) => {
				console.log('Error on Bot load' + err);
				reject();
			});
		});
	}

	async reply(message) {
		return new Promise((resolve, reject) => {
			var reply;
			if (this.bot == undefined) {
				this.loadBot().then(() => {
					this.bot.reply(this.userProfile, message).then((r) => {
						reply = r;
						console.log(reply);
						this.bot.getUservars(this.userProfile).then((p) => this.botProfile[this.userProfile] = p);
						resolve(reply);
					}).catch((err) => reject(err));
					// update users profile with this bot

				}).catch((err) => reject(err));
			} else {
				console.log('Replying');
				reply = this.bot.reply(this.userProfile, message);
				// update users profile with this bot
				this.botProfile[this.userProfile] = this.bot.getUservars(this.userProfile);
				resolve(reply);
			}
		});
	}
}

export {
	WorkingBot
};