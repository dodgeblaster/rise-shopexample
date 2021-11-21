module.exports = {
    schema: `
        input PaymentStartedInput {
            storeId: String
            amount: Int
            products: [String]
        }


        input PaymentCompletedInput {
            storeId: String
            paymentId: String
            status: String
            statusDetails: String
        }

        type Mutation {
            submitPayment(input: PaymentStartedInput): String
            paymentCompleted(input: PaymentCompletedInput): String
            @aws_iam 
        }
    `,
    resolvers: {
        Query: {},
        Mutation: {
            // loginToCashierRegister: [
            //     {
            //         type: 'guard',
            //         pk: '$storeId',
            //         sk: 'staff_${!sub}'
            //     },
            //     {
            //         type: 'add',
            //         pk: '$storeId',
            //         sk: 'cashierStatus_${!sub}',
            //         status: 'active'
            //     },
            //     {
            //         type: 'db',
            //         action: 'set'
            //     }
            // ],
            // logoutOfCashierRegister: [
            //     {
            //         type: 'guard',
            //         pk: '$storeId',
            //         sk: 'staff_${!sub}'
            //     },
            //     {
            //         type: 'add',
            //         pk: '$storeId',
            //         sk: 'cashierStatus_${!sub}',
            //         status: 'inactive'
            //     },
            //     {
            //         type: 'db',
            //         action: 'set'
            //     }
            // ],
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
                            paymentCompleted(input: $input)
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
