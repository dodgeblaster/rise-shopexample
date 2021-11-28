module.exports = {
    schema: `
        input AddStoreInput {
            storeName: String
        }

        input AddStoreManagerInput {
            email: String
            storeId: String
        }

        input AddStaffInput {
            storeId: String
            email: String
            name: String
        }

        type Store {
            pk: String
            sk: String
            storeName: String
        }

        type Role {
            pk: String
            sk: String
        }
     
        type Staff {
            pk: String
            sk: String
            name: String
        }

        type Query {
            stores: [Store]
        }

        type Mutation {
            addStore(input: AddStoreInput): Store
            addStoreManager(input: AddStoreManagerInput): Role
            addStaff(input: AddStaffInput): Staff
        }
    `,
    resolvers: {
        Query: {
            stores: [
                {
                    type: 'db',
                    action: 'list',
                    input: {
                        pk: 'stores',
                        sk: 'store_'
                    }
                }
            ]
        },
        Mutation: {
            addStore: [
                {
                    type: 'guard',
                    pk: 'admins',
                    sk: '!sub'
                },
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: 'stores',
                        sk: 'store_{@id}',
                        storeName: '$storeName'
                    }
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
                    action: 'add',
                    email: '$email'
                },
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: '$storeId',
                        sk: 'manager_{$userId}'
                    }
                },
                {
                    type: 'function',
                    name: 'sendEmail',
                    input: {
                        email: '$email',
                        temporaryPassword: '$temporaryPassword'
                    }
                }
            ],
            addStaff: [
                {
                    type: 'guard',
                    pk: '$storeId',
                    sk: 'manager_{!sub}'
                },
                {
                    type: 'users',
                    action: 'add',
                    email: '$email'
                },
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: '$storeId',
                        sk: 'staff_{$userId}',
                        name: '$name'
                    }
                },
                {
                    type: 'function',
                    name: 'sendEmail',
                    input: {
                        email: '$email',
                        temporaryPassword: '$temporaryPassword'
                    }
                }
            ]
        }
    }
}
