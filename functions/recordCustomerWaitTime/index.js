const AWS = require('aws-sdk')
const cloudwatch = new AWS.CloudWatch()
const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: 'us-east-1'
})

const getEventTime = (list, event) =>
    Number(list.find((x) => x.sk.includes(event)).time)

/**
 * This function will:
 * - get all events for a given order (added, started, completed)
 * - determine the time in minutes between when order was added and completed
 * - record custom metric into cloudwatch
 */
module.exports.handler = async (e) => {
    const dbParams = {
        TableName: 'usertest',
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
            ':pk': e.storeId,
            ':sk': e.orderId
        }
    }
    const { Items } = await dynamoDb.query(dbParams).promise()
    const start = getEventTime(Items, 'started')
    const end = getEventTime(Items, 'completed')

    const metricParams = {
        MetricData: [
            {
                MetricName: 'Customer',
                Dimensions: [
                    {
                        Name: 'Metric',
                        Value: 'WaitTime'
                    }
                ],
                Unit: 'Count',
                Value: (end - start) / (1000 * 60)
            }
        ],
        Namespace: e.storeId
    }

    await cloudwatch.putMetricData(metricParams).promise()
}
