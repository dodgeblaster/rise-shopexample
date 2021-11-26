module.exports = {
    schema: `
        type Order {
            pk: String
            sk: String
            time: String
            products: [String]
        }
        
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
                    pk: '$storeId',
                    sk: 'order_${$id}_status_added',
                    id: '$id',
                    time: '@now',
                    products: '$products'
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
                    sk: 'order_${$id}_status_started',
                    id: '$id',
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
                    sk: 'order_${$id}_status_completed',
                    id: '$id',
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
