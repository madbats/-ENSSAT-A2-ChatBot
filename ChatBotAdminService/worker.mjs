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


const app = express();


//// Enable ALL CORS request
app.use(cors());
////

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

const id = workerData.id;

var botService = await BotService.create();
var basicBot = botService.getBot(id);
const login = (basicBot.interface == 'discord') ? 'user' : workerData.login;
var bot;
const {
	BotInterface
} = (basicBot.interface == 'discord') ? await import('./model/BotInterface_Discord.mjs') : await import('./model/BotInterface_Standard.mjs');
	
bot = new BotInterface(basicBot, login);



function isInt(value) {
	let x = parseFloat(value);
	return !isNaN(value) && (x | 0) === x;
}

function isString(myVar) {
	return (typeof myVar === 'string' || myVar instanceof String);
}


bot.loadBot();
var port = 4000 + id * 100 + encode(login);
if (basicBot.interface == 'local') {
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

}
app.get('/', async (req, res) => {
	res.status(200).json(bot);
});

app.delete('/', async (req, res) => {
	console.log('Closing BotInterface');
	bot.getUservars().then((vars) => {
		console.log(JSON.stringify(vars));
		botService.updateUserProfiles(id, login, vars).then(async () => {
			await bot.close();
			res.status(200).send('DONE');
			console.log('And out !');
			process.exit();
		});
	});

});


app.listen(port, () => {
	console.log(`Bot listening at http://localhost:${port}`);
});
parentPort.postMessage(port);

parentPort.on('message',(msg)=>{
	if (msg == 'close'){
		console.log('Closing BotInterface');
		bot.getUservars().then((vars) => {
			console.log(JSON.stringify(vars));
			botService.updateUserProfiles(id, login, vars).then(async () => {
				await bot.close();
				console.log('And out !');
				process.exit();
			});
		});
	}
	else if (msg == 'update'){		
		console.log('Updating BotInterface');
		bot.getUservars().then((vars) => {
			console.log(JSON.stringify(vars));
			botService.updateUserProfiles(id, login, vars).then(async () => {
				await bot.close();
				console.log('And out !');
				var basicBot = botService.getBot(id);
				
				bot = new BotInterface(basicBot,login);
				
				bot.loadBot();
			});
		});
		
	}
});
