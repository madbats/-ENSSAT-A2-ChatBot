document.addEventListener('DOMContentLoaded',init);


//Variables locales au script
let message_container;
let input;
let form;

//Fonctions

function init(){
    message_container = document.getElementById("messages");
    input = document.getElementById("input");
    form = document.getElementById("form");

    form.addEventListener('submit', (e)=>{
        console.log("Event 'submit' détecté");
        console.log(message_container);
        //On ajoute le message de l'utilisateur dans la "file" des messages
        e.preventDefault();
        message_container.innerHTML += `<div class="self">${input.value}</div>`;
        location.href='#edge';
        
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
			method: 'POST',
       		headers: myHeaders,
       		mode: 'cors',
       		cache: 'default',
       		body:myBody
       	};
       	let myURL = ""; // URL à définir
       	//launch the request
		fetch(myURL,myInit)
        .then((httpResponse)=>{
            return httpResponse.text();
        })
        .then((responseBody)=>{//Que fait on avec la réponse du serveur.
            
        })
		.catch((err)=>{
			console.log(`ERROR : ${err}`);
		})	

        //On efface le texte écrit dans l'input
        input.value='';
    })
}


