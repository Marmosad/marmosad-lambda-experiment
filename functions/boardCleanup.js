const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    // const  delItem = {
    //     ExpressionAttributeNames: {
    //     "#n": 'numberOfPlayers',
    //     },
    //     ExpressionAttributeValues: {
    //     ":n": 0
    //     },
    //     FilterExpression: '#n <= :n',
    //     TableName: "boards"
    // };

    const delItem = {
        TableName: 'boards',
        IndexName: 'numberOfPlayers-index',
        KeyConditionExpression: 'numberOfPlayers = :n',
        ExpressionAttributeValues: { ':n': 0}
    }


    console.log("delete request for all empty boards")
    const toDel = (await docClient.query(delItem).promise()).Items;
    for(const board of toDel) {
        await docClient.delete({
            TableName: "boards", Key: {
                "boardId": board.boardId
            }
        }).promise();
    }
    return;
};
