let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();
let lambda = new AWS.Lambda();

module.exports = async function handleStart(board) {
    let players = board['Item']['players'];
    let updatePromises = [];

    if (board['Item'].state !== 0) {
        return {};
    }

    for (let player in players) {
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

                console.log('new player object on board', board, players);
                await docClient.update(params).promise();
            }
        }).promise());
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
            let [i, nextJudge] = pickJudge(board.Item.players, board.Item.currentJudge)
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
                    "#i": "isCurrentJudge"
                },
                UpdateExpression: "set #a.#b = :c, #s = :s, #j = :j, #a.#sc["+ i +"].#i = :true",
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


function pickJudge(players, currentJudge) {
    console.log(players);
    let playerIterator = Object.keys(players);
    let nextJudge;
    let i = 0;
    while (currentJudge !== players[playerIterator[i]] && i < playerIterator.length) {
        i++;
    }

    if (i === playerIterator.length)
        i = 0;
    else
        i = i + 1;
    nextJudge = playerIterator[i];
    console.log(playerIterator, nextJudge);
    return [i, nextJudge]
}