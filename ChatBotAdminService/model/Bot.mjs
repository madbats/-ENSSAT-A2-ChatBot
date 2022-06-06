class Bot {
	static id = 0;

	constructor(data) {
		console.log(JSON.stringify(data));
		if (data.id != undefined) {
			this.id = data.id;
			Bot.id = (Bot.id > this.id) ? Bot.id : this.id;
		} else {
			this.id = Bot.id;
		}
		Bot.id += 1;
		if (data.name != undefined) {
			this.name = data.name;
		} else {
			this.name = 'Sans Nom';
		}
		if (data.template != undefined) {
			this.template = data.template;
		} else {
			this.template = 'standard';
		}
		if (data.option != undefined) {
			this.option = data.option;
		} else {
			this.option = {};
		}
		if (data.interface != undefined) {
			this.interface = data.interface;
		} else {
			this.interface = 'local';
		}
		if (data.interface == 'discord') {
			if (data.option.token != undefined) {
				this.option.token = data.option.token;
			} else {
				throw new Error('Discord interface requested without a token');
			}
		}
		if (data.userProfiles != undefined) {
			this.userProfiles = data.profiles;
		} else {
			this.userProfiles = {};
		}
	}

	static isBot(anObject) {
		// check if mandatory fields are there
		let hasMandatoryProperties = Object.keys(this).every(key => anObject.hasOwnProperty(key));
		if (hasMandatoryProperties) {
			return Object.keys(this).every(key => typeof anObject[key] == typeof this[key]);
		}
		return false;
	}

	static isValidProperty(aBot, propertyName, propertyValue) {
		// eslint-disable-next-line no-prototype-builtins
		if (!aBot.hasOwnProperty(propertyName)) {
			console.log('1.');
			return false;
		}
		if (!(typeof aBot[propertyName] == typeof propertyValue)) {
			console.log('2.');
			return false;
		}
		console.log('3.');
		return true;
	}
}

export {
	Bot
};