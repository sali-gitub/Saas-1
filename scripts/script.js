console.log("hello world")
let motTapeOk = true // Essayez de mettre false à la place de true

if (motTapeOk) {
    console.log("Bravo, vous avez correctement tapé le mot")
} else {
    console.log("Échec, le mot n'est pas correct")
}

//let motUtilisateur = prompt("Entrez un mot :")
//console.log(motUtilisateur)

let monBouton = document.getElementById("monBouton");
    monBouton.addEventListener("click", function () {
        console.log("Vous avez cliqué sur le bouton")
    });