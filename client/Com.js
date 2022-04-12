document.addEventListener('DOMContentLoaded',init);


//Variables locales au script
let message_container;
let input;
let form;
let listeBot;
let refresh;
let idBot;

//Fonctions

function init(){
    message_container = document.getElementById("messages");
    input = document.getElementById("input");
    form = document.getElementById("form");
    listeBot = document.getElementById("listeBot");
    refresh = document.getElementById("refreshBot")

    //Lors de l'initialisation de la page, on récupère la liste des bots une première fois de manière automatique
    recupBots();
    //Récupérer la liste des bots lorsqu'on appuie sur le boutton et met à jour la liste déroulante des bots disponibles
    refresh.addEventListener('click', recupBots);

    //Ajouter un eventListener au cas ou l'utilisateur modifie le bot auquel il parle
    listeBot.addEventListener('change', changeBot);//à faire

    //Si l'utilisateur soumet un nouveau message
    form.addEventListener('submit', newUserMessage);
}





/**
 * Envoie une requête GET au serveur pour récupérer la liste des bots disponibles.
 * Puis utilise la liste pour remplir l'onglet déroulant de choix de bot
 */
function recupBots()
{
    //On commence en vidant la liste déroulante (pour ne pas avoir de doublons)
    listeBot.innerHTML = "";

    //On demande au serveur la liste des bots disponible
    //On crée la requête
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Set-Cookie', 'passPhrase=Hop');
    let myInit = { 
        method: 'GET',
           headers: myHeaders,
           credentials: 'same-origin',
           mode: 'cors',
           cache: 'no-store' 
    };

    let myURL = `http://localhost:3001/`;//URL pour obtenir la liste des bots
    
    fetch(myURL,myInit)
        .then((httpResponse)=>{
            for(let field of httpResponse.headers){
                console.log(`raw = ${field}`);
            }	
            return httpResponse.json()
        })
        .then((myArrayOfBots)=>{
            for(let bot of myArrayOfBots){//Pour chaque bot disponible
                listeBot.innerHTML += `<option>${bot.name}</option>`;//On ajoute un nouveau bot à la liste défilante
            }
        })
        .catch((err)=>{
            console.log(`ERROR : ${err}`);
        })
}


/**
 * Fonction appellée lorsque l'utilisateur modifie le bot auquel il parle (liste déroulante change de valeur)
 * Il faut récupérer l'ID du nouveau bot et le mettre dans la variable idBot
 */
function changeBot()//à faire
{

}



/**
 * Affiche dans la fenêtre de chat le message de l'utilisateur.
 * Puis envoie le message au serveur avant de réceptionner la réponse.
 */
function newUserMessage()
{
    console.log("Event 'submit' détecté");
    console.log(message_container);
    //On ajoute le message de l'utilisateur dans la "file" des messages
    message_container.innerHTML += `<div class="self">${input.value}</div>`;
    
    //On envoie au serveur le message de l'utilisateur
    //Create the request
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    let payload = {
               message:input.value,
       };
    console.log(`La tâche est assignée à :${payload.assignement}`);
    let myBody = JSON.stringify(payload);
    let myInit = { 
        method: 'PATCH',
           headers: myHeaders,
           mode: 'cors',
           cache: 'default',
           body:myBody
       };
    let myURL = "http://localhost:3001/:";//à faire: spécifier l'id du bot à qui l'on envoie le message
       //launch the request
    fetch(myURL,myInit)
    .then((httpResponse)=>{
        return httpResponse.text();
    })
    .then((responseBody)=>{//Que fait on avec la réponse du serveur.
        //à faire
    })
    .catch((err)=>{
        console.log(`ERROR : ${err}`);
    })	

    //On efface le texte écrit dans l'input
    input.value='';
}