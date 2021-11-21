const AWS = require('aws-sdk')
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
})

/**
 * Example function representing an emailer.
 * This function just saves an item to the db for this demo project,
 * but is meant to demonstrate adding custom functionality via a lambda
 * function and implementing it in a workflow
 */
module.exports.handler = async (e) => {
    const params = {
        TableName: 'usertest',
        Item: {
            pk: 'sentEmails',
            sk: e.email,
            message: `Your Login is: Email: ${e.email}, Password: ${e.temporaryPassword}`
        }
    }

    await dynamoDb.put(params).promise()
}
