import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {
	BotService
} from './model/BotService_lowDB.mjs';
import {
	workerData,
	parentPort
} from 'worker_threads';


function encode(str) {
	var sum = 0;
	for (var i = 0; i < str.length; i++) {
		sum += str[i].charCodeAt(0) % 100;
	}
	return sum;
}


// recupère les donnés passé au worker
const id = workerData.id; // id du bot


const botService = await BotService.create();
var basicBot = botService.getBot(id);
const login = (basicBot.interface == 'discord') ? 'user' : workerData.login; // login du user

// calcule le port sur le quel sera accessible le bot
const port = 4000 + id * 100 + encode(login);


const {
	BotInterface
} = (basicBot.interface == 'discord') ? await import('./model/BotInterface_Discord.mjs'): await import('./model/BotInterface_Standard.mjs');

// Créé le bot 
var bot = new BotInterface(basicBot, login);

function isString(myVar) {
	return (typeof myVar === 'string' || myVar instanceof String);
}

// Charge l'ensemble des données du bot
bot.loadBot().then(()=>{
	if (basicBot.interface == 'local') {
		const app = express();
		
		//// Enable ALL CORS request
		app.use(cors());
		////
		app.use(bodyParser.urlencoded({
			extended: true
		}));
		app.use(bodyParser.json());
		
		// PATCH un message et renvoie la reponse du bot
		app.patch('/', async (req, res) => {
			req.headers['content-type'] = 'application/json';
			let message = req.body.message;
			if (!isString(message)) {
				console.log(`not the expected parameter ${JSON.stringify(req.body)} ${!isString(message)}`);
				//not the expected parameter
				res.status(400).send('BAD REQUEST');
			} else {
				console.log(message);
				var reply = await bot.reply(message);
				console.log(reply);
				res.status(200).json(reply);
			}
		});
		
		
		// consulter etat du chatbot
		app.get('/', async (req, res) => {
			res.status(200).json(bot);
		});
		
		
		// ferme l'interface de communication
		app.delete('/', async (req, res) => {
			console.log('Closing BotInterface');
			bot.getUservars().then((vars) => {
				console.log(JSON.stringify(vars));
				botService.updateUserProfiles(id, login, vars).then(async () => {
					await bot.close();
					res.status(200).send('DONE');
					console.log('Interface bot ferme :' + id);
					process.exit();
				});
			});
		});
		
		app.listen(port, () => {
			console.log(`Bot listening at http://localhost:${port}`);
		});
	} else {
		// pour les bot discord
		
		parentPort.on('message', (msg) => {
			// ferme l'interface 
			if (msg == 'close') {
				console.log('Closing BotInterface :' + id);
				bot.getUservars().then((vars) => {
					console.log(JSON.stringify(vars));
					botService.updateUserProfiles(id, login, vars).then(async () => {
						await bot.close();
						console.log('Interface bot ferme :' + id);
						process.exit();
					});
				});
			} else if (msg == 'update') {
				// eteint et relance un bot ayant subit des modifications
				console.log('Updating BotInterface :' + id);
				bot.getUservars().then((vars) => {
					console.log(JSON.stringify(vars));
					botService.updateUserProfiles(id, login, vars).then(async () => {
						await bot.close();
						console.log('Interface bot ferme :' + id);
						var basicBot = botService.getBot(id);
		
						bot = new BotInterface(basicBot, login);
		
						bot.loadBot();
					});
				});
		
			}
		});
	}
	// Renvoi un message au processus principale pour indiquer que l'interface est en marche
	parentPort.postMessage(port);
}).catch(e =>{
	console.log('Error token');
	parentPort.postMessage('error');
});
