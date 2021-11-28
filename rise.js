module.exports = {
    schema: `     
        input AddAdminInput {
            email: String
        }

        type Admin {
            pk: String
            sk: String
        }

        type Mutation {
            addAdmin(input: AddAdminInput): Admin           
        }
    `,
    resolvers: {
        Mutation: {
            addAdmin: [
                {
                    type: 'users',
                    action: 'add',
                    email: '$email'
                },
                {
                    type: 'db',
                    action: 'set',
                    input: {
                        pk: 'admins',
                        sk: '$userId'
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
    },
    config: {
        name: 'usertest',
        auth: true,
        eventBus: 'default'
    }
}
