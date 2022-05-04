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

// let w = new Worker('./worker.mjs',{workerData:{id:0,login:'matt'}})
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
	req.headers['Content-Type'] = 'application/json';
	var id = req.params.id;
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
	req.headers['Content-Type'] = 'application/json';
	var id = req.params.id;
	if (!isInt(id)) { //Should I propagate a bad parameter to the model?
		//not the expected parameter
		res.status(400).send('BAD REQUEST');
	} else {
		let newValues = req.body; //the client is responsible for formating its request with proper syntax.
		botServiceInstance
			.updateBot(id, newValues)
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

// Crée un un chatBot pour parler
app.post('/:id', async (req, res) => {
	req.headers['Content-Type'] = 'application/json';
	let id = req.params.id;
	let login = req.body.login;
	// let login = 'matt';
	if (!isInt(id) || !isString(login)) {
		//not the expected parameter
		console.log(`Bad Request: id is not interger=${!isInt(id)} || login is not String=${!isString(login)} request body=${JSON.stringify(req.body)}`);
		res.status(400).send('BAD REQUEST');
	} else {
		try {
			botServiceInstance.getBot(id);
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
		} catch (err) {
			console.log(`Bot not found : ${id}`);
			res.status(400).send('BAD REQUEST');
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
