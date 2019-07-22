let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();
let lambda = new AWS.Lambda();
let pickJudge = require('./utils');
module.exports = async function handleStart(board) {
    let players = board['Item']['players'];
    let updatePromises = [];

    if (board['Item'].state !== 0) {
        return {};
    }

    for (let player in players) {
        if (players.hasOwnProperty(player)) {
            let params = {
                FunctionName: 'marmosad_serverless_draw',
                InvocationType: 'RequestResponse',
                Payload: JSON.stringify({
                    "boardId": board['Item'].boardId,
                    "cardType": "whiteCard",
                    "numCards": 7
                })
            };
            updatePromises.push(lambda.invoke(params, async function (err, data) {
                if (err) {
                    throw err;
                } else {
                    console.log(data);
                    players[player].hand = JSON.parse(data.Payload);

                    let params = {
                        TableName: 'boards',
                        Key: {
                            "boardId": board.Item.boardId
                        },
                        ExpressionAttributeNames: {
                            '#a': 'players',
                            '#b': player,
                            '#c': "hand"
                        },
                        UpdateExpression: "set #a.#b.#c = :p",
                        ExpressionAttributeValues: {
                            ":p": players[player].hand
                        },
                        ReturnValues: "UPDATED_NEW"
                    };

                    return docClient.update(params).promise();
                }
            }));
        }
    }

    let params = {
        FunctionName: 'marmosad_serverless_draw',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify({
            "boardId": board['Item'].boardId,
            "cardType": "blackCard",
            "numCards": 1
        })
    };

    updatePromises.push(lambda.invoke(params, async function (err, data) {
        if (err) {
            throw err;
        } else {
            let [i, nextJudge] = pickJudge(board.Item.players, board.Item.currentJudge);
            console.log("black card drawn:", JSON.parse(data.Payload));
            let params = {
                TableName: 'boards',
                Key: {
                    "boardId": board.Item.boardId
                },
                ExpressionAttributeNames: {
                    '#a': 'display',
                    '#b': "blackCard",
                    '#s': 'state',
                    '#j': 'currentJudge',
                    '#sc': 'score',
                    "#i": "isCurrentJudge",
                    "#nj": nextJudge
                },
                UpdateExpression: "set #a.#b = :c, #s = :s, #j = :j, #a.#sc.#nj.#i = :true",
                ExpressionAttributeValues: {
                    ":c": JSON.parse(data.Payload)[0],
                    ":true": true,
                    ":s": 1,
                    ":j": nextJudge
                },
                ReturnValues: "UPDATED_NEW"
            };

            console.log('new player object on board', board, players);
            await docClient.update(params).promise();
        }
    }).promise());

    await Promise.all(updatePromises);

    console.log('new player object on board', board, players)
};


