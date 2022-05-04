document.addEventListener('DOMContentLoaded',init);


//Variables locales au script
let message_container;
let input;
let sendM;
let listeBot;
let refresh;
let listeIDBot;
let comLinks;
let choice;

//Fonctions

function init(){
    message_container = document.getElementById("messages");
    input = document.getElementById("input");
    sendM = document.getElementById("sendMessageButton");
    listeBot = document.getElementById("listeBot");
    refresh = document.getElementById("refreshBot")

    //Lors de l'initialisation de la page, on récupère la liste des bots une première fois de manière automatique
    recupBots();
    //Récupérer la liste des bots lorsqu'on appuie sur le boutton et met à jour la liste déroulante des bots disponibles
    refresh.addEventListener('click', recupBots);

    //Ajouter un eventListener au cas ou l'utilisateur modifie le bot auquel il parle
    listeBot.addEventListener('change', changeBot);//à faire

    //Si l'utilisateur soumet un nouveau message
    sendM.addEventListener('click', newUserMessage);
    input.addEventListener('keydown', ifEnter);

    //Si l'utilisateur quitte la page, on envoie ferme les chatbots
    document.addEventListener('beforeunload', closeBots);
}





/**
 * Envoie une requête GET au serveur pour récupérer la liste des bots disponibles.
 * Puis utilise la liste pour remplir l'onglet déroulant de choix de bot
 */
function recupBots()
{
    //On commence en vidant la liste déroulante (pour ne pas avoir de doublons)
    listeBot.innerHTML = "<option></option>";
    listeIDBot = [];
    comLinks = [];

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
                if(bot.interface=="local")//On ne récupère que les bots compatiblent avec nous.
                {
                    listeBot.innerHTML += `<option>${bot.name}</option>`;//On ajoute un nouveau bot à la liste défilante
                    listeIDBot.push(bot.id);
                    comLinks.push(-1);
                }
            }
        })
        .catch((err)=>{
            console.log(`ERROR : ${err}`);
        })
    listeBot.selectedIndex = 0;
}


/**
 * Fonction appellée lorsque l'utilisateur modifie le bot auquel il parle (liste déroulante change de valeur)
 * Il faut récupérer l'ID du nouveau bot et le mettre dans la variable idBot
 */
function changeBot()
{
    console.log("Changement de bot");
    choice = listeBot.selectedIndex;
    console.log(`Valeur de choice : ${choice}$`);
    if (choice > 0)//Si un bot est sélectionné
    {
        
        if (comLinks[choice-1] == -1)//Si un chatBot avec ce bot n'existe pas encore, on le crée
        {
            console.log("on crée un nouveau chatbot");
            let idBot = listeIDBot[choice-1];
            console.log(`L'id du nouveau bot sélectionné est :${idBot}`) ;

            //On crée la communication avec le chatBot sélectionné
            //Create the request
            let myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/json');
            let payload = {
                login: "user" //modifier le login
            };
            let myBody = JSON.stringify(payload);
            let myInit = { 
                method: 'POST',
                headers: myHeaders,
                credentials: 'same-origin',
                mode: 'cors',
                cache: 'no-store', 
                body : myBody
            };

            let myURL = `http://localhost:3001/${idBot}`;//URL pour obtenir la liste des bots
            console.log("tfefef")
            fetch(myURL,myInit)
                .then((httpResponse)=>{
                    return httpResponse.json()
                })
                .then((responseBody)=>{
                    console.log(`response is ${responseBody}`);
                    console.log(`response is ${responseBody.link}`);
                    comLinks[choice-1]=responseBody.link;//Récupération du lien permettant de communiquer avec le bot
                })
                .catch((err)=>{
                    console.log(`ERROR : ${err}`);
                })
            console.log("tfefef")
        }
        else//Si un chatBot avec ce bot existe déjà, on le continue
        {
            console.log("On reprend la communication avec un bot");
        }
    }
    //Si aucun bot n'est sélectionné (choix blanc)
}



/**
 * Affiche dans la fenêtre de chat le message de l'utilisateur.
 * Puis envoie le message au serveur avant de réceptionner la réponse.
 */
function ifEnter(event)
{
    var key = event.which;
    if(key==13)
    {
        newUserMessage();
    }
}

function newUserMessage()
{
    console.log("Event 'submit' détecté");
    
    
    if (choice>0)
    {
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
        let myURL = comLinks[choice-1];//On utilise le lien reçu lors de la création du chatBot
        console.log(`comLinks[choice-1] = ${comLinks[choice-1]}`);
        //launch the request
        fetch(myURL,myInit)
        .then((httpResponse)=>{
            return httpResponse.json();
        })
        .then((responseBody)=>{//Que fait on avec la réponse du serveur.
            //On affiche la réponse du bot
            message_container.innerHTML += `<div class="bot">${responseBody}</div>`;
        })
        .catch((err)=>{
            console.log(`ERROR : ${err}`);
        })
    }
    else
    {
        alert("Veuillez sélectionner un bot pour communiquer.");
    }
    //On efface le texte écrit dans l'input
    input.value='';
}

/**
 * Ferme tous les chatBots ouvert
 */
function closeBots()
{
//à faire
}

/**
 * Ferme un chat bot particulier
 */
function close1Bot(id)
{
//à faire
}