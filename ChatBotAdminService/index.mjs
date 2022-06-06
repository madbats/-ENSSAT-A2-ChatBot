import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
	BotService
} from './model/BotService_lowDB.mjs';
import {
	Worker
} from 'worker_threads';
const app = express();

//// Enable ALL CORS request
app.use(cors());
////

// dictionary of all bots currently in opperation
var botServiceInstance;
const port = 3001;

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


// Créer un chatbot
app.post('/', (req, res) => {
	req.headers['Content-Type'] = 'application/json';
	let theBotToAdd = req.body;
	botServiceInstance
		.addBot(theBotToAdd)
		.then((bot) => {
			console.log(`added bot of id ${bot.id}`);
			if (bot.interface == 'discord') {
				console.log('Launching discordBot');
				try {
					var worker = new Worker('./worker.mjs', {
						workerData: {
							id: bot.id
						}
					});
					worker.on('error', (err) => {
						console.log(`Error ${err} thrown... stack is : ${err.stack}`);
						throw err;
					});
					worker.once('message', (_port) => {
						// const port = 4000 + id * 100 + encode(login);
						console.log('Launched');
						discordBots[bot.id] = worker;
					});

				} catch (err) {
					console.log(`Error ${err} thrown... stack is : ${err.stack}`);
				}
			}
			res.status(201).send('All is OK');
		})
		.catch((err) => {
			console.log(`Error ${err} thrown... stack is : ${err.stack}`);
			res.status(400).send('BAD REQUEST');
		});
});

// Supprimer un chatbot
app.delete('/:id', (req, res) => {
	req.headers['Content-Type'] = 'application/json';
	var id = req.params.id;
	if (!isInt(id)) { //Should I propagate a bad parameter to the model?
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	} else {
		botServiceInstance.removeBot(id)
			.then((returnString) => {
				console.log(returnString);
				// si le bot est de type discord alors il doit être arreté
				if (botServiceInstance.getBot(id).interface == 'discord') {
					if (discordBots[id] != undefined) {
						discordBots[id].postMessage('close');
					}
				}
				res.status(201).send('All is OK');
			})
			.catch((err) => {
				console.log(`Error ${err} thrown... stack is : ${err.stack}`);
				res.status(400).send('BAD REQUEST');
			});
	}
});

// Modifier un chatbot
app.put('/:id', (req, res) => {
	req.headers['Content-Type'] = 'application/json';
	var id = req.params.id;
	if (!isInt(id)) {
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	} else {
		let newValues = req.body; //the client is responsible for formating its request with proper syntax.
		botServiceInstance
			.updateBot(id, newValues)
			.then((returnString) => {
				console.log(returnString);
				let bot = botServiceInstance.getBot(id);
				// Si le bot modifier est devenu ou est un discord bot alors il faut lancer/relancer l'interface de communication
				if (bot.interface == 'discord') {
					console.log('Launching discordBot');
					if (discordBots[id] != undefined) {
						discordBots[id].postMessage('update');
					} else {
						try {
							var worker = new Worker('./worker.mjs', {
								workerData: {
									id: bot.id
								}
							});
							worker.on('error', (err) => {
								console.log(`Error ${err} thrown... stack is : ${err.stack}`);
								throw err;
							});
							worker.once('message', (_port) => {
								discordBots[bot.id] = worker;
							});

						} catch (err) {
							console.log(`Error ${err} thrown... stack is : ${err.stack}`);
						}
					}
				}
				res.status(201).send('All is OK');
			})
			.catch((err) => {
				console.log(`Error ${err} thrown... stack is : ${err.stack}`);
				res.status(400).send('BAD REQUEST');
			});
	}
});

// consulter etat des chatbots
app.get('/', (_req, res) => {
	try {
		let myArrayOfBots;
		if (undefined == (myArrayOfBots = botServiceInstance.getBots())) {
			throw new Error('No bots to get');
		}
		res.status(200).json(myArrayOfBots);
	} catch (err) {
		console.log(`Error ${err} thrown... stack is : ${err.stack}`);
		res.status(404).send('NOT FOUND');
	}
});

// consulter etat d'un chatbot
app.get('/:id', (req, res) => {
	let id = req.params.id;
	if (!isInt(id)) {
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	} else {
		try {
			let myBot = botServiceInstance.getBot(id);

			res.status(200).json(myBot);
		} catch (err) {
			console.log(`Error ${err} thrown... stack is : ${err.stack}`);
			res.status(404).send('NOT FOUND');
		}
	}
});

// Crée un chatBot pour parler
app.post('/:id', async (req, res) => {
	req.headers['Content-Type'] = 'application/json';
	let id = req.params.id;
	let login = req.body.login;
	if (!isInt(id) || !isString(login)) {
		//not the expected parameter
		console.log(`Bad Request: id is not interger=${!isInt(id)} || login is not String=${!isString(login)} request body=${JSON.stringify(req.body)}`);
		res.status(400).send('BAD REQUEST');
	} else {
		try {
			// Seul les bot communiquant via l'interface local peuvent être lancer ce cette manière
			if (botServiceInstance.getBot(id).interface == 'local') {
				try {
					var worker = new Worker('./worker.mjs', {
						workerData: {
							id: id,
							login: login
						}
					});
					worker.on('error', (err) => {
						console.log(`Error ${err} thrown... stack is : ${err.stack}`);
						throw err;
					});
					worker.once('message', (port) => {
						// const port = 4000 + id * 100 + encode(login);
						res.status(200).json({
							link: `http://localhost:${port}`
						});
					});
				} catch (err) {
					console.log(`Error ${err} thrown... stack is : ${err.stack}`);
					res.status(404).send('NOT FOUND');
				}
			} else {
				console.log(`Bot is not local : ${id}`);
				res.status(400).send('BAD REQUEST');
			}
		} catch (err) {
			console.log(`Bot not found : ${id}`);
			res.status(400).send('BAD REQUEST');
		}
	}
});

let discordBots = {};

BotService.create().then(ts => {
	botServiceInstance = ts;
	// Lance les bots discord 
	let bots = ts.getBots();
	bots.forEach(bot => {
		if (bot.interface == 'discord') {
			console.log('Launching discordBot');
			try {
				var worker = new Worker('./worker.mjs', {
					workerData: {
						id: bot.id
					}
				});
				worker.on('error', (err) => {
					console.log(`Error ${err} thrown... stack is : ${err.stack}`);
					throw err;
				});
				worker.once('message', (_port) => {
					// const port = 4000 + id * 100 + encode(login);
					console.log('Launched');
					discordBots[bot.id] = worker;
				});

			} catch (err) {
				console.log(`Error ${err} thrown... stack is : ${err.stack}`);
			}
		}
	});
	app.listen(port, () => {
		console.log(`Example app listening at http://localhost:${port}`);
	});
});

function isInt(value) {
	let x = parseFloat(value);
	return !isNaN(value) && (x | 0) === x;
}

function isString(myVar) {
	return (typeof myVar === 'string' || myVar instanceof String);
}