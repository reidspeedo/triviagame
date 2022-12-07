const https = require("https");
const { getAllPlayers } = require("./players.js");

const game = {
    prompt: {
        category: "",
        answers: "",
        question: "",
        createdAt: "",
        correctAnswer: "",
    },
    roundStatus: {
        submissions: {},
        round: 0,
        isRoundOver: false,
        round_score: {
            liberals: 0,
            conservatives: 0,
        }
    },
    gameStatus: {
        round_score: {
            liberals: 0,
            conservatives: 0,
        },
        maxQuestions: 10,
    },
};


const updateGame = ((path, value) => {
    var schema = game;  // a moving reference to internal objects within obj
    var pList = path.split('.');
    var len = pList.length;

    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !schema[elem] ) {
            schema[elem] = {}
        }
        schema = schema[elem];
    }
    schema[pList[len-1]] = value;
    game[pList[0]] = schema;
})

const getQuestion = ((callback) => {
    const url = 'https://the-trivia-api.com/api/questions?limit=1&region=US&difficulty=hard';

    const request = https.request(url, (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data = data + chunk.toString();
        });
      
        response.on('end', () => {
            const body = JSON.parse(data);
            callback(null, body);
        });
    })
      
    request.on('error', (error) => {
        callback(error);
    });
      
    request.end() 

    
    });



module.exports = {
    getQuestion,
    updateGame,
    game,
  };