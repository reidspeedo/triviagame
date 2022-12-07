const socket = io();

// This section retrieves player name from URL and inserts it into the main header
const urlSearchParams = new URLSearchParams(window.location.search);


const playerName = urlSearchParams.get("playerName");
const room = urlSearchParams.get("room");
const team = urlSearchParams.get("team");
const teams = ['liberal', 'conservative'];
const opp_team = teams.filter(input => input != team)[0];

const mainHeadingTemplate = document.querySelector(
  "#main-heading-template"
).innerHTML;

const welcomeHeadingHTML = Handlebars.compile(mainHeadingTemplate);

document.querySelector("main").insertAdjacentHTML(
  "afterBegin",
  welcomeHeadingHTML({
    playerName,
    opp_team,
  })
);

socket.emit('join', { playerName, room, team }, error => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});


socket.on("message", ({playerName, text, createdAt}) => {

    const chatMessages = document.querySelector(".chat__messages");

    const messageTemplate = document.querySelector("#message-template").innerHTML;

    const template = Handlebars.compile(messageTemplate);

    const html = template({
        playerName,
        text,
        createdAt: moment(createdAt).format("h:mm a"),
    });
    
    chatMessages.insertAdjacentHTML("afterbegin", html);
});

socket.on("room", ({ room, players }) => {
    // target the container where we'll attach the info to
    const gameInfo = document.querySelector(".game-info");
  
    // target the Handlebars template we'll use to format the game info
    const sidebarTemplate = document.querySelector(
      "#game-info-template"
    ).innerHTML;
  
    // Compile the template into HTML by calling Handlebars.compile(), which returns a function
    const template = Handlebars.compile(sidebarTemplate);
  
    const lib_players = players.filter(player => player.team === 'liberal');
    const con_players = players.filter(player => player.team === 'conservative');

    const html = template({
      room,
      lib_players,
      con_players,
    });
  
    // set gameInfo container's html content to the new html
    gameInfo.innerHTML = html;
  });

const chatForm = document.querySelector(".chat__form");

chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
  
    const chatFormInput = chatForm.querySelector(".chat__message");
    const chatFormButton = chatForm.querySelector(".chat__submit-btn");
  
    chatFormButton.setAttribute("disabled", "disabled");
  
    const message = event.target.elements.message.value;
  
    socket.emit("sendMessage", message, (error) => {
      chatFormButton.removeAttribute("disabled");
      chatFormInput.value = "";
      chatFormInput.focus();
  
      if (error) return alert(error);
    });
  });

const triviaStartRoundButton = document.querySelector(".trivia__startround-btn");
triviaStartRoundButton.addEventListener("click", () => {
    triviaStartRoundButton.setAttribute("disabled", "disabled");

    socket.emit("startRound", room, (error) => {
        if (error) return alert(error);

    });
});

socket.on('gameDetails', ({game}) => {
  
  const triviaInfo = document.querySelector(".trivia__question");

  const triviaQuestions = document.querySelector("#trivia-question-template").innerHTML;
  // const triviaAnswers = document.querySelector(".trivia__answers");

  const { question, category, answers } = game.prompt;

  
  const template = Handlebars.compile(triviaQuestions);

  const html = template({
    question,
    category,
    answers,
  });


  triviaInfo.insertAdjacentHTML("afterbegin", html);
  
});


//socket.on("updategame details")

//socket.emit("anytime submissions are made - send back a message to update game object")

//eventListener when max submissions = numberofplayers -> socket.emit("getnextquetion")

//eventListener when currentRound = maxRounds emit gameover! (Smart contract pays out)