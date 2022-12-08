const https = require("https");

const game = {}
// const game_template = {
//     prompt: {
//         category: "",
//         answers: "",
//         question: "",
//         createdAt: "",
//         correctAnswer: "",
//     },
//     roundStatus: {
//         submissions: [],
//         round: 0,
//         isRoundOver: false,
//         round_score: {
//             liberals: 0,
//             conservatives: 0,
//         }
//     },
//     gameStatus: {
//         round_score: {
//             liberals: 0,
//             conservatives: 0,
//         },
//         maxQuestions: 10,
//     },
// };

const updateGame = ((room, path, value) => {
    let schema = {}
    if (typeof game[room] !== 'undefined') {
        schema = game[room];
    } else {
        const game_template = {
            prompt: {
                category: "",
                answers: "",
                question: "",
                createdAt: "",
                correctAnswer: "",
            },
            roundStatus: {
                submissions: [],
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
        schema = game_template;
        game[room] = game_template;
    }
    const pList = path.split('.'); //['prompt','question']
    const len = pList.length; //2

    for(var i = 0; i < len-1; i++) {
        var elem = pList[i]; // '1'
        if( !schema[elem] ) {
            schema[elem] = {} // schema = {'1': {}}
        }
        schema = schema[elem]; // schema = {}
    }
    schema[pList[len-1]] = value; // schema = {'question': 'aewafe'}
    game[room][pList[0]] = schema; // game = {'question': 'aewafe'}

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