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
            id: String
            amount: String
            cashier: String
            time: String
            storeId: String
            products: [String]
        }

         type PaymentStatus @aws_iam @aws_cognito_user_pools  {
            pk: String
            sk: String
            id: String
            status: String
            time: String
            statusDetails: String
        }

        input PaymentCompletedInput {
            storeId: String
            id: String
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
        Mutation: {
            submitPayment: [
                {
                    type: 'guard',
                    pk: '$storeId',
                    sk: 'staff_{!sub}'
                },
                {
                    type: 'add',
                    id: '@id'
                },
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: '$storeId',
                        sk: 'payment_{$id}',
                        id: '$id',
                        amount: '$amount',
                        cashier: '!sub',
                        time: '@now',
                        products: '$products'
                    }
                },
                {
                    type: 'emit-event',
                    event: 'paymentStarted',
                    input: {
                        storeId: '$storeId',
                        id: '@output.id',
                        amount: '@output.amount',
                        products: '@output.products',
                        cashier: '@output.cashier',
                        status: 'started'
                    }
                }
            ],
            paymentCompleted: [
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: '$storeId',
                        sk: 'payment_{$id}_status',
                        id: '$id',
                        status: '$status',
                        time: '@now',
                        statusDetails: '$statusDetails'
                    }
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
                                id
                                status
                                statusDetails
                                time
                            }
                        }
                    `,

                    variables: {
                        storeId: 'detail.storeId',
                        id: 'detail.id',
                        status: 'detail.status',
                        statusDetails: 'detail.statusDetails'
                    }
                }
            ]
        }
    }
}
