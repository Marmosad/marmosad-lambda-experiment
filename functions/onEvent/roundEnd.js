let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();
let lambda = new AWS.Lambda();

let pickJudge = require('./utils');

module.exports = async function roundEnd(board) {
    let params = {
        FunctionName: 'marmosad_serverless_draw',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
            "boardId": board.boardId,
            "cardType": "whiteCard",
            "numCards": board.numberOfPlayers - 1
        })
    };
    let cards = await lambda.invoke(params, async function (err, data) {
        if (err)
            throw err;
        console.log(data);
        return data
    }).promise();
    console.log(cards);

    for (let player in board.players) {
        if (board.players.hasOwnProperty(player) && board.players[player].hand.length < 7 && board.display.score[player].isCurrentJudge === false)
            board.players[player].hand.push(cards.pop());
        board.players[player].isCurrentJudge = false;
    }

    let [i, nextJudge] = pickJudge(board.players, board.currentJudge);

    board.display.score[nextJudge].isCurrentJudge = true;

    params = {
        TableName: 'boards',
        Key: {
            "boardId": board.boardId
        },

        UpdateExpression: "set #d.#b = :b #d.#w = :w #p = :p #s = :score #c = :c",
        ExpressionAttributeNames: {
            '#p': "players",
            '#d': "display",
            '#s': "score",
            '#b': "blackCard",
            '#w': "whiteCards",
            '#c': ':c'
        },
        ExpressionAttributeValues: {
            ":p": board.players,
            ":score": board.score,
            ":b": {},
            ":w": [],
            ":c": nextJudge
        },
        ReturnValues: "UPDATED_NEW"
    };

    await docClient.update(params).promise();
};
