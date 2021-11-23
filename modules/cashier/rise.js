module.exports = {
    schema: `
        input PaymentStartedInput {
            storeId: String
            amount: Int
            products: [String]
        }

        type Payment {
            pk: String
            sk: String
            amount: String
            cashier: String
            time: String
            storeId: String
            products: String
        }

         type PaymentStatus @aws_iam @aws_cognito_user_pools  {
            pk: String
            sk: String
            status: String
            time: String
            statusDetails: String
        }

        input PaymentCompletedInput {
            storeId: String
            paymentId: String
            status: String
            statusDetails: String
        }

        type Mutation {
            submitPayment(input: PaymentStartedInput): Payment
            paymentCompleted(input: PaymentCompletedInput): PaymentStatus
            @aws_iam 
        }

         type Subscription {
            paymentCompletedSub(pk: String): PaymentStatus
            @aws_subscribe(mutations: ["paymentCompleted"])
        }
    `,
    resolvers: {
        Query: {},
        Mutation: {
            submitPayment: [
                {
                    type: 'guard',
                    pk: '$storeId',
                    sk: 'staff_${!sub}'
                },
                {
                    type: 'add',
                    pk: '$storeId',
                    sk: 'payment_@id',
                    amount: '$amount',
                    cashier: '!sub',
                    time: '@now',
                    products: '$products'
                },
                {
                    type: 'db',
                    action: 'set'
                },
                {
                    type: 'emit-event',
                    event: 'paymentStarted',
                    data: {
                        storeId: '$storeId',
                        paymentId: '$sk',
                        status: 'started',
                        amount: '$amount',
                        cashier: '!sub',
                        products: '$products'
                    }
                }
            ],
            paymentCompleted: [
                {
                    type: 'add',
                    pk: 'example'
                },
                {
                    type: 'add',
                    pk: '$storeId',
                    sk: '${$paymentId}_status',
                    status: '$status',
                    time: '@now',
                    statusDetails: '$statusDetails'
                },
                {
                    type: 'db',
                    action: 'set'
                }
            ]
        },
        Events: {
            processCompleted: [
                {
                    type: 'receive-event',
                    source: 'coffee-core',
                    event: 'paymentCompleted',
                    query: `
                        mutation paymentCompleted($input: PaymentCompletedInput) {
                            paymentCompleted(input: $input) {
                                pk
                                sk
                                status
                                statusDetails
                                time
                            }
                        }
                    `,

                    variables: {
                        storeId: 'detail.storeId',
                        paymentId: 'detail.paymentId',
                        status: 'detail.status',
                        statusDetails: 'detail.statusDetails'
                    }
                }
            ]
        }
    }
}
