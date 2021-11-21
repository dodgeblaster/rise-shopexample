module.exports = {
    schema: `
        input AddStoreInput {
            storeName: String
        }

        input RemoveUserInput {
            storeId: String
            managerId: String
            email: String
        }

        input AddStoreManagerInput {
            email: String
            storeId: String
        }

        input AddAdminInput {
            email: String
        }

        type Store {
            pk: String
            sk: String
            name: String
            owner: String
        }

        type Query {
            stores: [Store]
        }

        type Mutation {
            addStore(input: AddStoreInput): String
            addStoreManager(input: AddStoreManagerInput): String
            addAdmin(input: AddAdminInput): String
           
        }
    `,
    resolvers: {
        Query: {
            stores: [
                {
                    type: 'add',
                    pk: 'stores',
                    sk: 'store_'
                },
                {
                    type: 'db',
                    action: 'list'
                }
            ]
        },
        Mutation: {
            addAdmin: [
                {
                    type: 'users',
                    action: 'add'
                },
                {
                    type: 'add',
                    pk: 'admins',
                    sk: '#userId'
                },
                {
                    type: 'db',
                    action: 'set'
                },
                {
                    type: 'add',
                    temporaryPassword: '#userPassword'
                },
                {
                    type: 'function',
                    id: 'sendEmail'
                }
            ],
            addStore: [
                {
                    type: 'guard',
                    pk: 'admins',
                    sk: '!sub'
                },
                {
                    type: 'add',
                    pk: 'stores',
                    sk: 'store_@id',
                    storeName: '$storeName'
                },
                {
                    type: 'db',
                    action: 'set'
                }
            ],
            addStoreManager: [
                {
                    type: 'guard',
                    pk: 'admins',
                    sk: '!sub'
                },
                {
                    type: 'users',
                    action: 'add'
                },
                {
                    type: 'add',
                    pk: '$storeId',
                    sk: 'manager_${#userId}'
                },
                {
                    type: 'db',
                    action: 'set'
                },
                {
                    type: 'add',
                    temporaryPassword: '#userPassword'
                },
                {
                    type: 'function',
                    id: 'sendEmail'
                }
            ]
        }
    }
}
