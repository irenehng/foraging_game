

console.log("index.js loaded")
// // Import the functions you need from the SDKs you need
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
// // import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyeb8xZ2uA6jZxaukBxTo0XWEWGyrOALQ",
  authDomain: "foraging-game-4b625.firebaseapp.com",
  databaseURL: "https://foraging-game-4b625-default-rtdb.firebaseio.com",
  projectId: "foraging-game-4b625",
  storageBucket: "foraging-game-4b625.appspot.com",
  messagingSenderId: "548525895337",
  appId: "1:548525895337:web:bc17cbdb856ec96638c3b8",
  measurementId: "G-DZ2577L4CE"
};

const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
console.log(db)


// Function to switch between HTML pages
function show(shown, hidden) {
    document.getElementById(shown).style.display = 'block';
    document.getElementById(hidden).style.display = 'none';
    return false;
}
//variables to record:
//1. number of apples harvested, or if varying, substitute with number of harvests/tree
//2. time per trial (which is time spent per tree)
//3. number of key presses/trial
//4. timing of apples appearing & each key press


// Important variables for coding
var long_travel = 3;
var short_travel = 1;
var num_trials = 20;
var trialCount = 0;
var score = 0;
var requiredPresses = 1; // Number of space bar presses required to harvest
var currentPresses = 0; // Current number of presses
var svgNS = "http://www.w3.org/2000/svg"; 
const svgCanvas = document.getElementById("basket_svg");
const shapeElement = document.getElementById("basket");

//gameState variables
var gameState = 0;
var NEWTREE = 0;
var SHOWAPPLES = 1;
var IDLE = 2;
var PRESS =3;
var HARVEST = 4;
var END = 5;

function logGameState() {
    setInterval(() => {
        console.log('Game state: ', gameState);
        // Get the current timestamp
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        // Add gameState to Firestore
        db.collection('gameStateLog').add({
            state: gameState,
            timestamp: timestamp
        }).then(docRef => {
            console.log('Game state logged with ID: ', docRef.id);
        }).catch(error => {
            console.error('Error logging game state: ', error);
        });
    }, 200);
}
logGameState();

function createApples(){
    gameState = SHOWAPPLES;
    setTimeout(function(){
        gameState = IDLE;
    },500);
	appleDiv = document.getElementById("Apples");
	
		if (!appleDiv.firstChild){
		console.log("Creating Apples")
		console.log(appleDiv.firstChild);
		var angles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, 
			(7 * Math.PI) / 4, 0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
		var centerX = 75;
		var centerY = 0;
		var branch_dist = 7.5;
		var radius = 1.5;

	    angles.forEach(function(angle) {
	  
			rand_X_add = Math.random() * 6- 3;
			rand_Y_add = Math.random() * 6 - 3;
	      	var x = centerX + branch_dist * Math.cos(angle) + rand_X_add;
	      	var y = centerY + branch_dist * Math.sin(angle) + rand_Y_add;

	      	var circle = document.createElementNS(svgNS, "circle");
	      	circle.setAttribute("cx", x);
	     	circle.setAttribute("cy", y);
	     	circle.setAttribute("r", radius);
	     	circle.setAttribute("fill", "red");

	      	appleDiv.appendChild(circle);
		});
	
		for (let i = 0; i< 2; i++){
			rand_X_add = Math.random() * 4- 2;
			rand_Y_add = Math.random() * 4 -2;
			var x = centerX +rand_X_add;
			var y = centerY + rand_Y_add;

			var circle = document.createElementNS(svgNS, "circle");
			circle.setAttribute("cx", x);
			circle.setAttribute("cy", y);
			circle.setAttribute("r", radius);
			circle.setAttribute("fill", "red");
			appleDiv.appendChild(circle);
		}
	}
}

function createTree(){
// thanks ChatGPT
   // Define the angles for each circle
	treeDiv = document.getElementById("Tree");
    var angles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3];

    // Create SVG circle elements
	var trunk = document.createElementNS(svgNS, "rect");
	trunk.setAttribute('x', 70);
	trunk.setAttribute('y', 0);
	trunk.setAttribute('width', 10);
	trunk.setAttribute('height', 30);
	trunk.setAttribute('fill', "brown");
	treeDiv.appendChild(trunk);
	
	var centerX = 75;
	var centerY = 0;
	var radius = 7.5;
    angles.forEach(function(angle) {
      var x = centerX + radius * Math.cos(angle);
      var y = centerY + radius * Math.sin(angle);

      var circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", radius);  
      circle.setAttribute("fill", "green");

      treeDiv.appendChild(circle);
  });
  

  createApples();
}


function removeApples(){
	var appleContainer = document.getElementById("Apples");
	while (appleContainer.firstChild){
		appleContainer.removeChild(appleContainer.firstChild);
	}
}

function drawFallenApples(numApples) {
    var fallenApplesSVG = document.getElementById("FallenApples");
    var trunkCenterX = 75;
    var trunkCenterY = 50;
    var maxDistance = 50;

    for (var i = 0; i < numApples; i++) {
        var appleRadius = 1.5;
        var angle = Math.random() * Math.PI; // Random angle (0 to PI, to ensure below the tree)
        var distance = Math.random() * maxDistance; // Random distance within the maximum distance
        var x = trunkCenterX + distance * Math.cos(angle); // Calculate x-coordinate
        var y = trunkCenterY + distance * Math.sin(angle); // Calculate y-coordinate

        var circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", appleRadius);
        circle.setAttribute("fill", "red");

        fallenApplesSVG.appendChild(circle);
    }
}

function clearFallenApples() {
	var fallenApplesSVG = document.getElementById("FallenApples");
    while (fallenApplesSVG.firstChild) {
        fallenApplesSVG.removeChild(fallenApplesSVG.firstChild);
    }
    // fallenApples = [];
	}

function updateScoreDisplay(){
	document.getElementById("scoreValue").innerText = score;
}

function showAdditionalScoreText(additionalScore) {
    const additionalScoreElement = document.getElementById('additionalScore');
    additionalScoreElement.textContent = `+${additionalScore}`;
    additionalScoreElement.style.display = 'block'; // Show the additional score text

    // Hide the additional score text after 2 seconds
    setTimeout(() => {
        additionalScoreElement.style.display = 'none';
    }, 2000);
	}

// Function to increment the required presses after each successful harvest
function incrementRequiredPresses() {
    requiredPresses+=2;
}

// Function to check if enough presses have been made to harvest
function checkPresses() {
    if (currentPresses >= requiredPresses) {
        return true;
    } else {
        return false;
    }
}

// Function to handle spacebar press
function handleSpacebarPress(event) {
    if (event.key === " ") {
        currentPresses++;
        if (checkPresses()) {
            gameState = HARVEST;
            // Harvest the apple
            additionalScore = Math.floor(Math.random() * 3) + 9;
            score += additionalScore;
            removeApples();   
            showAdditionalScoreText(additionalScore);
            updateScoreDisplay();
            // Draw a random number of fallen apples (5 to 10)
            const numApples = Math.floor(Math.random() * 6) + 5;
            drawFallenApples(numApples);
            setTimeout(createApples, 1000);
            updateProgressBar();
            incrementRequiredPresses(); // Increase required presses for next harvest
            currentPresses = 0; // Reset current presses
        } else {
            gameState = PRESS;
            setTimeout(()=>{
                gameState = IDLE;
            },500)
            updateProgressBar();
        }
}}

// Function to reset the trial
function resetTrial(travelTime) {
    score = 0;
    requiredPresses = 1;
    currentPresses = 0;
    gameState = NEWTREE;
    removeApples();
    clearFallenApples();
    show('next', 'blinking');

    document.getElementById("next").style.display = "block";

    setTimeout(function() {
        document.getElementById("next").style.display = "none";
        show('blinking', 'next');
        if (trialCount < num_trials) {
            createTree();
        }
    }, travelTime * 1000);

    if (trialCount < num_trials) {
        updateScoreDisplay();
        createTree();
        monitorBasket();
    } else {
        gameState = END;
    }
}

// Function to monitor the basket
function monitorBasket() {
    // Create apples immediately
    createApples();
    var appleContainer = document.getElementById("Apples");
    console.log(appleContainer.firstChild);
    document.addEventListener("keypress", handleKeyEvents);
}

// Function to handle Enter key press
function handleEnterKey(event) {
    if (event.key === "Enter") {
        resetTrial(chooseTravelTime()); // Start a new trial
        trialCount++;
    }
}

// Function to choose travel time
function chooseTravelTime() {
    return Math.random() < 0.5 ? long_travel : short_travel;
}

// Function to run the trial logic
function runTrialLogic() {
    console.log('start trial')
    show('blinking', 'container-instructions1');
    resetTrial(0);
    document.addEventListener("keypress", handleKeyEvents);
    return false;
}

const runTrialButton = document.getElementById("runTrialButton");
runTrialButton.addEventListener("click", runTrialLogic);

// Function to handle key events
function handleKeyEvents(event) {
    handleSpacebarPress(event);
    handleEnterKey(event);
}

// Function to update the progress bar based on current presses and required presses
function updateProgressBar() {
    var progressBar = document.getElementById("progress-bar");
    var progressBarContainer = document.getElementById("progress-bar-container");
    var containerHeight = progressBarContainer.clientHeight;
    var currentHeight = currentPresses / requiredPresses * containerHeight;
    var currentTop = containerHeight - currentHeight;
    progressBar.style.top = currentTop + "px";
    progressBar.style.height = currentHeight + "px";
    if (currentPresses == requiredPresses) {
       setTimeout(resetProgressBar, 1000);
    }
}    

//function to reset progress bar
function resetProgressBar() {
    var progressBar = document.getElementById("progress-bar");
    progressBar.style.height = "0px";
    var resetText = document.getElementById("reset-instruction");
    resetText.textContent = "You can now harvest again!"
    setTimeout(function() {
        resetText.textContent = "";
    }, 1000);
}
