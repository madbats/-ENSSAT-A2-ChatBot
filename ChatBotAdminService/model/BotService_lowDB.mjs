import {
	Bot
} from "./Bot.mjs";
import {
	Low,
	JSONFile
} from 'lowdb';

class BotService {
	constructor() {
		this.db = {}
	}

	static async create() { //since I cannot return a promise in a constructor
		const service = new BotService();
		const adapter = new JSONFile("./model/db.json");
		service.db = new Low(adapter);
		await service.db.read();
		if (service.db.data.bots == undefined) {
			service.db.data.bots = []
		}
		service.db.data.bots.forEach(_ => {
			Bot.id += 1
		});
		return service;
	}


	async addBot(anObject) {
		let newBot;
		try {
			newBot = new Bot(anObject);
		} catch (err) {
			throw err; //throwing an error inside a Promise
		}
		this.db.data.bots.push(newBot);
		await this.db.write();
		return `added bot of id ${newBot.id}`;
	}


	//from PUT
	async replaceBot(id, anObject) {
		let index = this.db.data.bots.findIndex(e => e.id == id);
		if (index > -1) {
			//on s'assure que l'object est bien un Bot
			if (Bot.isBot(anObject)) {
				/// Just replace it already!
				this.db.data.bots.splice(index, 1, anObject);
				await this.db.write();
				return "Done REPLACING";
			}
			throw new Error(`given object is not a Bot : ${anObject}`);
		}
		throw new Error(`cannot find bot of id ${id}`);
	}

	async removeBot(id) {
		let index = this.db.data.bots.findIndex(e => e.id == id);
		if (index > -1) {
			this.db.data.bots.splice(index, 1);
			await this.db.write();
			return `removed bot of id ${id}`;
		}
		throw new Error(`cannot find bot of id ${id}`);
	}

	getBot(id) {
		let index = this.db.data.bots.findIndex(e => e.id == id);
		if (index > -1) {
			return (this.db.data.bots)[index];
		}
		throw new Error(`cannot find bot of id ${id}`);
	}

	getBots() {
		return this.db.data.bots;
	}
}

export {
	BotService,
	Bot
}