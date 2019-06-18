const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async(event) => {
    let boards;
    await docClient.scan({
            "TableName": "boards"
        },

        function(err, data) {
            if (err) {
                console.log("Error", err);
            }
            else {
                console.log("Success", data);
                boards = {
                    "boards": data.Items
                }

            }
        }).promise();

    return {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {},
        "body": JSON.stringify(boards)
    }
};
