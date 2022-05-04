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
		if(data.option != undefined){
			this.option = data.option;
		}else{
			this.option = {};
		}
		if (data.interface != undefined) {
			this.interface = data.interface;
		} else {
			this.interface = 'local';
		}
		if (data.interface == 'discord') {
			if (data.option.token != undefined) {
				this.option.token = data.token;
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

	static isValidProperty(aBot,propertyName, propertyValue) {
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


function isInt(value) {
	let x = parseFloat(value);
	return !isNaN(value) && (x | 0) === x;
}

function isString(myVar) {
	return (typeof myVar === 'string' || myVar instanceof String);
}

function isDate(x) {
	return (null != x) && !isNaN(x) && ('undefined' !== typeof x.getDate);
}

function isArrayOfStrings(value) {
	if (!Array.isArray(value)) return false;
	for (let item of value) {
		if (!isString(item)) return false;
	}
	return true;
}

export {
	Bot
};