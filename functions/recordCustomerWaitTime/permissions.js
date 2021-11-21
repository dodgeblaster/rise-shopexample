module.exports.permissions = [
    {
        Action: ['cloudwatch:PutMetricData'],
        Resource: '*'
    },
    {
        Action: ['dynamodb:Query'],
        Resource: '*'
    }
]
