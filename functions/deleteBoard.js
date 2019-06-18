const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const input = event;
    const  delItem = {
        TableName: "boards", Key: {
            "boardId": input.boardId
        }
    };
    console.log("delete request for: ", input)
    const board = await docClient.get(delItem).promise();
    console.log("verifying delete on: ", board)
    if (board.Item && board.Item.numberOfPlayers <= 0) {
        await docClient.delete(delItem).promise();
    }
    return {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {},
        "body": JSON.stringify(board)
    }

};
