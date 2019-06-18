const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const connectionId = event['requestContext']['connectionId']
    let connection = await docClient.delete({ TableName: "connections", Key: {"connectionId": connectionId}, ReturnValues: "ALL_OLD"}).promise();
    console.log(connection);
    let board = await docClient.get({ TableName: "boards", Key: {"boardId": connection.Attributes.boardId} }).promise();
    let players = board['Item']['players'];
    let count = board['Item']['numberOfPlayers'] - 1;


    if(count > 0){
        delete players[connectionId];
        //update params
        let params = {
            TableName:'boards',
            Key:{
                "boardId": board.Item.boardId
            },
            //     --update-expression "SET RelatedItems[1] = :ri" \

            UpdateExpression: "set players = :p, numberOfPlayers = :c",
            ExpressionAttributeValues:{
                ":p": players,
                ":c": count

            },
            ReturnValues:"UPDATED_NEW"
        };

        console.log('removed player', board, players)
        await docClient.update(params).promise();
        return
    }
    await docClient.delete({ TableName: "boards", Key: {"boardId": connection.Attributes.boardId}}).promise();
    return;
};
