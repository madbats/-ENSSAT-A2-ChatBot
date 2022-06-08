document.addEventListener('DOMContentLoaded', init);


//Variables locales au script
let message_container; //Zone d'affichage des messages échangés
let input; //Réaction en cas d'utilisation du retour charriot pour l'envoi d'un message
let sendM; //Bouton d'envoie du message au chatbot
let listeBot; //Liste déroulante avec les noms des bots
let refresh; //Bouton pour rafraichir la liste des chatbots
let listeIDBot = []; //Liste contenant les id des bots. L'index de l'id et l'index du bot associé ầ celui ci correspondent.
let comLinks; //Liste des liens permettant de communique avec les chatbots
let choice; //Index du bot sélectionné dans la liste déroulante
let chat;

//Fonctions

function init() {
    message_container = document.getElementById("messages");
    input = document.getElementById("input");
    sendM = document.getElementById("sendMessageButton");
    listeBot = document.getElementById("listeBot");
    refresh = document.getElementById("refreshBot");
    chat = document.getElementById("chat");

    //Lors de l'initialisation de la page, on récupère la liste des bots une première fois de manière automatique
    recupBots();
    //Récupérer la liste des bots lorsqu'on appuie sur le boutton et met à jour la liste déroulante des bots disponibles
    refresh.addEventListener('click', recupBots);

    //Ajouter un eventListener au cas ou l'utilisateur modifie le bot auquel il parle
    listeBot.addEventListener('change', changeBot); //à faire

    //Si l'utilisateur soumet un nouveau message
    sendM.addEventListener('click', newUserMessage);
    input.addEventListener('keydown', ifEnter);

    //Si l'utilisateur quitte la page, on envoie ferme les chatbots
    window.addEventListener('unload', supprBots);

}





/**
 * Envoie une requête GET au serveur pour récupérer la liste des bots disponibles.
 * Puis utilise la liste pour remplir l'onglet déroulant de choix de bot
 */
function recupBots() {
    /*On commence par supprimer les chatbots existant pour ne pas causer de problème 
    quand on sélectionnera un bot avec lequel communiquer.*/
    /*for (let i of listeIDBot)
    {
        supprBot(i);
    }
    console.log("fin de la suppression des communications actives");*/
    supprBots();

    //On vide ensuite la liste déroulante (pour ne pas avoir de doublons)
    listeBot.innerHTML = "<option></option>";
    listeIDBot = [];
    comLinks = [];
    document.getElementById("login").disabled = false
    document.getElementById("listeBot").disabled = false
    //On demande au serveur la liste des bots disponibles
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

    let myURL = `http://localhost:3001/`; //URL pour obtenir la liste des bots

    fetch(myURL, myInit)
        .then((httpResponse) => {
            if(httpResponse.ok)
            {
                for (let field of httpResponse.headers) {
                console.log(`raw = ${field}`);
                }
                return httpResponse.json()
            }
            else
            {
                console.log("Mauvaise réponse du réseau");
            }
        })
        .then((myArrayOfBots) => {
            for (let bot of myArrayOfBots) { //Pour chaque bot disponible
                if (bot.interface == "local") //On ne récupère que les bots compatibles.
                {
                    listeBot.innerHTML += `<option>${bot.name}</option>`;
                    //On ajoute un nouveau bot à la liste défilante
                    listeIDBot.push(bot.id);
                    comLinks.push(-1);
                }
            }
        })
        .catch((err) => {
            console.log(`ERROR : ${err}`);
        })
    listeBot.selectedIndex = 0;
}


/**
 * Fonction appellée lorsque l'utilisateur modifie le bot auquel il parle (liste déroulante change de valeur)
 * Il faut récupérer l'ID du nouveau bot et le mettre dans la variable idBot
 */
function changeBot() {
    //Suppression des anciens messages
    message_container.innerHTML = '';
    document.getElementById("sendMessageButton").disabled = true
    document.getElementById("input").disabled = true
    /**Alternative pour supprimer les anciens messages
     *       while (message_container.firstChild) {
            message_container.removeChild(message_container.firstChild);
        }
     */
    inLogin = document.getElementById("login")
    console.log("Changement de bot");
    choice = listeBot.selectedIndex;
    console.log(`Valeur de choice : ${choice} ${inLogin.value}`);

    if (choice > 0 && inLogin.value != "") //Si un bot est sélectionné
    {
        if (comLinks[choice - 1] == -1) //Si un chatBot avec ce bot n'existe pas déjà, on le crée
        {
            console.log("on crée un nouveau chatbot");
            let idBot = listeIDBot[choice - 1];
            console.log(`L'id du nouveau bot sélectionné est :${idBot}`);

            //On crée la communication avec le chatBot sélectionné
            //Create the request
            let myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/json');
            let payload = {
                login: inLogin.value //modifier le login (à faire)
            };
            let myBody = JSON.stringify(payload);
            let myInit = {
                method: 'POST',
                headers: myHeaders,
                credentials: 'same-origin',
                mode: 'cors',
                cache: 'no-store',
                body: myBody
            };

            let myURL = `http://localhost:3001/${idBot}`; //URL pour obtenir la liste des bots
            fetch(myURL, myInit)
                .then((httpResponse) => {
                    /*if(httpResponse.ok)
                    {*/
                        return httpResponse.json();
                   /* }
                    else
                    {
                        console.log("Mauvaise réponse du réseau");
                    }*/
                })
                .then((responseBody) => {
                    console.log(`response is ${responseBody}`);
                    console.log(`response is ${responseBody.link}`);
                    comLinks[choice - 1] = responseBody.link;
                    document.getElementById("sendMessageButton").disabled = false
                    document.getElementById("input").disabled = false
                    document.getElementById("login").disabled = true
                    document.getElementById("listeBot").disabled = true
                    //Récupération du lien permettant de communiquer avec le bot
                })
                .catch((err) => {
                    console.log(`ERROR : ${err}`);
                })
        } else //Si un chatBot avec ce bot existe déjà, on le continue
        {
            console.log("On reprend la communication avec un bot");
            document.getElementById("sendMessageButton").disabled = false
            document.getElementById("input").disabled = false
            document.getElementById("login").disabled = true
            document.getElementById("listeBot").disabled = true
        }

    }
    //Si aucun bot n'est sélectionné (choix blanc)
}



/**
 * Affiche dans la fenêtre de chat le message de l'utilisateur.
 * Puis envoie le message au serveur avant de réceptionner la réponse.
 */
function ifEnter(event) {
    var key = event.which;
    if (key == 13) {
        newUserMessage();
    }
}

function newUserMessage() {
    console.log("Event 'submit' détecté");


    if (choice > 0) //Si un bot est sélectionné 
    {
        //On ajoute le message de l'utilisateur dans la "file" des messages
        message_container.innerHTML += `<div class="self">${input.value}</div>`;
        //On descend tout en bas de la barre déroulante
        chat.scrollBy(0, 1000);

        //On envoie au serveur le message de l'utilisateur
        //Create the request
        let myHeaders = new Headers();
        myHeaders.append('Content-Type', 'application/json');
        let payload = {
            message: input.value
        };
        console.log(`La tâche est assignée à :${payload.assignement}`);
        let myBody = JSON.stringify(payload);
        let myInit = {
            method: 'PATCH',
            headers: myHeaders,
            mode: 'cors',
            cache: 'default',
            body: myBody
        };
        let myURL = comLinks[choice - 1]; //On utilise le lien reçu lors de la création du chatBot
        console.log(`comLinks[choice-1] = ${comLinks[choice-1]}`);
        //launch the request
        fetch(myURL, myInit)
            .then((httpResponse) => {
                if(httpResponse.ok)
                {
                    return httpResponse.json();
                }
                else
                {
                    console.log("Mauvaise réponse du réseau");
                }
            })
            .then((responseBody) => { //Que fait on avec la réponse du serveur.
                //On affiche la réponse du bot
                message_container.innerHTML += `<div class="bot">${responseBody}</div>`;
                //On descend tout en bas de la barre déroulante
                chat.scrollBy(0, 1000);
            })
            .catch((err) => {
                console.log(`ERROR : ${err}`);
            })
    } else {
        alert("Veuillez sélectionner un bot pour communiquer.");
    }
    //On efface le texte écrit dans l'input
    input.value = '';
}



/**
 * Ferme la communication avec un chat bot particulier
 * L'utilisateur ne supprime pas directement le chatbot
 */
function supprBot(idBot) {
    //On commence par récupérer dans listeIDBot l'index correspondant
    index = listeIDBot.lastIndexOf(idBot); //Hypothèse: il n'y a pas de doublons dans la liste.

    //On commence par créer le message à envoyer
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    let myInit = {
        method: 'DELETE',
        headers: myHeaders,
        mode: 'cors',
        cache: 'default',
    };
    //On envoie la requête et on réagit à la réponse
    let myURL = comLinks[index]; //On utilise le lien reçu lors de la création du chatBot
    /*ATTENTION: il ne faut pas utiliser le lien du serveur, sinon on supprime le chat bot 
    au lieu de simplement couper la communication*/
    fetch(myURL, myInit)
        .then((httpResponse) => {
            if(httpResponse.ok)
            {
                return httpResponse.json();
            }
            else
            {
                console.log("Mauvaise réponse du réseau");
            }
            
        })
        .then((responseBody) => { //Que fait on avec la réponse du serveur.
            if (responseBody.ok) //Si la requête retourne un succès
            { //Alors la communication avec le bot a été supprimée.
                //On supprime de Comlink, listeIDBot et de listeBot le chatbot qui a été supprimé
                listeBot.splice(index, 1);
                listeIDBot.splice(index, 1);
                comLinks.splice(index, 1);
            }
        })
        .catch((err) => {
            console.log(`ERROR : ${err}`);
        })
}

/**
 * Cette fonction ferme toutes les communications avec les chatbots
 * Elle n'est appelée qu'à la fermeture de la page.
 * à faire
 */
function supprBots() {
    console.log("Début suppression des communications actives")
    //On supprime les communications existantes avec les chatbots.


    for (let i of listeIDBot) {
        supprBot(i);
    }
    console.log("fin de la suppression des communications actives");
}