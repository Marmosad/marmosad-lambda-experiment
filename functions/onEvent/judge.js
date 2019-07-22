let AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports = async function handleJudge(board, card, player) {
    if (board.currentJudge !== player.connectionId || card.owner === board.currentJudge) {
        console.log('None judge tried to judge', board.currentJudge !== player.connectionId, card.owner === board.currentJudge);
        return;
    }

    if (board.state !== 1) {
        console.log("not the right phase")
    }

    if (!(card.owner in board.players)) {
        console.log("a phantom played this card")
    }

    console.log(card.owner);

    let params = {
        TableName: 'boards',
        Key: {
            "boardId": board.boardId
        },

        UpdateExpression: "set #d.#s.#b.#s = #d.#s.#b.#s + :i",
        ExpressionAttributeNames: {
            '#b': card.owner,
            '#d': "display",
            '#s': "score"
        },
        ExpressionAttributeValues: {
            ":i": 1
        },
        ReturnValues: "UPDATED_NEW"
    };

    await docClient.update(params).promise();

};
