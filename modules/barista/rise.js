module.exports = {
    schema: `
        input AddOrderInput {
            storeId: String
            id: String
            products: [String]
        }

        input OrderInput {
            storeId: String
            id: String
        }

        input OrdersInput {
            storeId: String
        }

        type Order {
            pk: String
            sk: String
            time: String
            products: [String]
        }
        
        type Order @aws_iam @aws_cognito_user_pools {
            pk: String
            sk: String
            id: String
            products: [String]
            time: String
        }

        type OrderStatus {
            pk: String
            sk: String
            id: String
            time: String
        }

        type Query {
            orders(input: OrdersInput): [Order]
        }

        type Mutation {
            addOrder(input: AddOrderInput): Order
            @aws_iam

            startOrder(input:OrderInput ):OrderStatus
            completeOrder(input: OrderInput): OrderStatus
        }

        type Subscription {
            orderAdded(pk: String): Order
            @aws_subscribe(mutations: ["addOrder"])
        }
    `,
    resolvers: {
        Query: {
            orders: [
                {
                    type: 'db',
                    action: 'list',
                    input: {
                        pk: '{$storeId}_{@today}',
                        sk: 'order_'
                    }
                }
            ]
        },
        Mutation: {
            addOrder: [
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: '{$storeId}_{@today}',
                        pk2: 'order_{$id}',
                        sk: 'order_{@now}_{$id}_added',
                        id: '$id',
                        time: '@now',
                        products: '$products'
                    }
                }
            ],
            startOrder: [
                {
                    type: 'guard',
                    pk: '$storeId',
                    sk: 'staff_{!sub}'
                },
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: '{$storeId}_{@today}',
                        pk2: 'order_{$id}',
                        sk: 'order_{@now}_{$id}_started',
                        id: '$id',
                        time: '@now'
                    }
                }
            ],
            completeOrder: [
                {
                    type: 'guard',
                    pk: '$storeId',
                    sk: 'staff_{!sub}'
                },
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: '{$storeId}_{@today}',
                        pk2: 'order_{$id}',
                        sk: 'order_{@now}_{$id}_completed',
                        id: '$id',
                        time: '@now'
                    }
                },
                {
                    type: 'function',
                    name: 'recordCustomerWaitTime',
                    input: {
                        storeId: '$storeId',
                        id: '$id'
                    }
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
                            addOrder(input: $input) {
                                pk
                                sk
                                id
                                products
                                time
                            }
                        }
                    `,
                    variables: {
                        storeId: 'detail.storeId',
                        id: 'detail.id',
                        products: 'detail.products'
                    }
                }
            ]
        }
    }
}
