document.addEventListener('DOMContentLoaded',init);


//Variables locales au script
let message_container;
let input_box;
let form;

//Fonctions

function init(){
    message_container = document.getElementById("messages");
    input_box = document.getElementById("input");
    form = document.getElementById("form");

    form.addEventListener('submit', (e)=>{
        console.log("Event 'submit' détecté");
        console.log(message_container);
        //On ajoute le message de l'utilisateur dans la "file" des messages
        e.preventDefault();
        message_container.innerHTML += `<div class="self">${input_box.value}</div>`;
        location.href='#edge';
        //On envoie au serveur le message de l'utilisateur
    
        //On efface le texte écrit dans l'input
        input_box.value='';
    })
}


