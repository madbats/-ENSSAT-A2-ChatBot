import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
	BotService
} from './model/BotService_lowDB.mjs';
import {
	WorkingBot
} from './model/workingBot.mjs';

const app = express();


//// Enable ALL CORS request
app.use(cors());
////

// dictionary of all bots currently in opperation
var workingBots = {};
var botServiceInstance;
const port = 3001;

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());


// Créer un chatbot
app.post('/', (req, res) => {
	let theBotToAdd = req.body;
	botServiceInstance
		.addBot(theBotToAdd)
		.then((returnString) => {
			console.log(returnString);
			res.status(201).send('All is OK');
		})
		.catch((err) => {
			console.log(`Error ${err} thrown... stack is : ${err.stack}`);
			res.status(400).send('BAD REQUEST');
		});
});
// Supprimer un chatbot
app.delete('/:id', (req, res) => {
	var id = res.params.id;
	if (!isInt(id)) { //Should I propagate a bad parameter to the model?
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	} else {
		botServiceInstance.removeBot(id)
			.then((returnString) => {
				console.log(returnString);
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
	var id = res.params.id;
	if (!isInt(id)) { //Should I propagate a bad parameter to the model?
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	} else {
		let newValues = req.body; //the client is responsible for formating its request with proper syntax.
		botServiceInstance
			.replaceBot(id, newValues)
			.then((returnString) => {
				console.log(returnString);
				res.status(201).send('All is OK');
			})
			.catch((err) => {
				console.log(`Error ${err} thrown... stack is : ${err.stack}`);
				res.status(400).send('BAD REQUEST');
			});
	}
});
// consulter etat des/d'un chatbot
app.get('/', (req, res) => {
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

// Envoyer un message à un chatBot
app.patch('/:id', async (req, res) => {
	let id = req.params.id;
	let message = req.body.message;
	if (!isInt(id) || message == undefined || !isString(message)) {
		console.log(`not the expected parameter ${typeof id} ${!isInt(id)} ${JSON.stringify(req.body)} ${!isString(message)}`);
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	} else {
		try {
			let bot = botServiceInstance.getBot(id);
			if (workingBots[id] == undefined) {
				let login = req.body.login;
				if (login != undefined && isString(login)) {
					workingBots[id] = new WorkingBot(bot, login);
					// workingBots[id].loadBot();
				} else {
					//not the expected parameter
					res.status(400).send('BAD REQUEST');
				}
			}
			try {
				workingBots[id].reply(message).then((reply) => {
					res.status(200).json(reply);
				});

			} catch (err) {
				console.log(`Error ${err} thrown... stack is : ${err.stack}`);
				res.status(500).send('Bot failed to load');
			}
		} catch (err) {
			console.log(`Error ${err} thrown... stack is : ${err.stack}`);
			res.status(404).send('NOT FOUND');
		}
	}
});

BotService.create().then(ts => {
	botServiceInstance = ts;
	// botServiceInstance
	// 	.addBot(['bob'])
	// 	.catch((err) => {
	// 		console.log(err);
	// 	});
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