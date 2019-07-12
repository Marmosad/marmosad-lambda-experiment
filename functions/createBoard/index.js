const uuid4 = require('/opt/node_modules/uuid/v4');
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient();
exports.handler = async(event) => {
    const input = event;
    console.log("board create request: ", input)
    if (input.playerLimit >= 3 && input.playerLimit <= 6) {
        return {
            "isBase64Encoded": false,
            "statusCode": 500,
            "headers": {},
            "body": "Player Limit must be between 3 and 6 inclusive"
        }
    }
    const board = {
        display: { score: [], blackCard: {}, whiteCards: []},
        boardId: String(uuid4()),
        state: 0,
        cardPacks: docClient.createSet(input.cardPacks),
        numberOfPlayers: 0,
        playerLimit: input.playerLimit,
        players: {},
        drawnCards: {},
        currentJudge: 'placeholder'
    };

    for (let cp of input.cardPacks) {
        board['drawnCards'][cp] = { whiteCards: docClient.createSet([0]), blackCards: docClient.createSet([0]) }
    }

    await docClient.put({ TableName: "boards", Item: JSON.parse(JSON.stringify(board)) }).promise();


    return {
        'headers': {
            'access-control-allow-headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'access-control-allow-methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
            'access-control-allow-origin': '*'
        },
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {},
        "body": board
    }

};
