let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();
let lambda = new AWS.Lambda();

let pickJudge = require('./pickJudge');

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
    let cards = JSON.parse((await lambda.invoke(params).promise()).Payload);

    params = {
        FunctionName: 'marmosad_serverless_draw',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
            "boardId": board.boardId,
            "cardType": "blackCard",
            "numCards": 1
        })
    };
    let blackCard = JSON.parse((await lambda.invoke(params).promise()).Payload);
    console.log(cards);

    for (let player in board.players) {
        if (board.players.hasOwnProperty(player) && board.players[player].hand.length < 7 && board.display.score[player].isCurrentJudge === false)
            board.players[player].hand.push(cards.pop());
        board.display.score[player].isCurrentJudge = false;
        board.players[player].played = false;
    }

    let [i, nextJudge] = pickJudge(board.players, board.currentJudge);
    console.log(board.players[nextJudge]);
    board.display.score[nextJudge].isCurrentJudge = true;



    params = {
        TableName: 'boards',
        Key: {
            "boardId": board.boardId
        },

        UpdateExpression: "set #d.#b = :b, #d.#w = :w, #p = :p, #s = :s, #c = :c",
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
            ":s": board.display.score,
            ":b": blackCard[0],
            ":w": [],
            ":c": nextJudge
        },
        ReturnValues: "UPDATED_NEW"
    };

    await docClient.update(params).promise();
};
