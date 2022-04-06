import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();


//// Enable ALL CORS request
app.use(cors())
////


const port = 3001

app.use(bodyParser.json()) 
app.use(bodyParser.urlencoded({ extended: true })) 


// TODO: Créer un chatbot
// TODO: Supprimer un chatbot
// TODO: Modifier un chatbot
// TODO: consulter etat d'un chatbot