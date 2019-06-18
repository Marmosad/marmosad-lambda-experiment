const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async(event) => {
    const input = event;
    console.log("connection request: ", input)
    const connection = {
        connectionId: input['requestContext']['connectionId']
    };

    await docClient.put({ TableName: "connections", Item: JSON.parse(JSON.stringify(connection)) }).promise();

    return {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {},
        "body": JSON.stringify(connection)
    };
};
