module.exports = {
    schema: `
        input AddOrderInput {
            storeId: String
            paymentId: String
            statusDetails: String
        }

        input OrderInput {
              storeId: String
            paymentId: String
        }

        input OrdersInput {
            storeId: String
        }

        type Order {
            pk: String
            sk: String
            products: String
            time: String
        }

        type Query {
            orders(input: OrdersInput): [Order]
        }

        type Mutation {
            addOrder(input: AddOrderInput): String
            @aws_iam

            startOrder(input:OrderInput ):String
            completeOrder(input: OrderInput): String
        }

        type Subscription {
            orderAdded: String
            @aws_subscribe(mutations: ["addOrder"])
        }
    `,
    resolvers: {
        Query: {
            orders: [
                {
                    type: 'add',
                    pk: '$storeId',
                    sk: 'order_'
                },
                {
                    type: 'db',
                    action: 'list'
                }
            ]
        },
        Mutation: {
            addOrder: [
                {
                    type: 'add',
                    pk: 'example'
                },
                {
                    type: 'add',
                    pk: '$storeId',
                    sk: 'order_${$paymentId}_status_added',
                    time: '@now',
                    products: 'Products...'
                },
                {
                    type: 'db',
                    action: 'set'
                }
            ],

            startOrder: [
                {
                    type: 'guard',
                    pk: '$storeId',
                    sk: 'staff_${!sub}'
                },
                {
                    type: 'add',
                    pk: '$storeId',
                    sk: 'order_${$paymentId}_status_started',
                    time: '@now'
                },
                {
                    type: 'db',
                    action: 'set'
                }
            ],
            completeOrder: [
                {
                    type: 'guard',
                    pk: '$storeId',
                    sk: 'staff_${!sub}'
                },
                {
                    type: 'add',
                    pk: '$storeId',
                    sk: 'order_${$paymentId}_status_completed',
                    time: '@now'
                },
                {
                    type: 'db',
                    action: 'set'
                },
                {
                    type: 'function',
                    id: 'recordCustomerWaitTime'
                }
            ]
        },
        Events: {
            addOrder: [
                {
                    type: 'receive-event',
                    source: 'coffee-core',
                    event: 'paymentCompleted',
                    query: `
                        mutation addOrder($input: AddOrderInput) {
                            addOrder(input: $input)
                        }
                    `,
                    variables: {
                        storeId: 'detail.storeId',
                        paymentId: 'detail.paymentId',
                        products: 'detail.products'
                    }
                }
            ]
        }
    }
}
