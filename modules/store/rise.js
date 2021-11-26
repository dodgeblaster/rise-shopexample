module.exports = {
    schema: `
        input AddStaffInput {
            storeId: String
            email: String
            name: String
        }

         input RemoveStaffInput {
            storeId: String
            email: String
            staffId: String
        }

        type Mutation {
            addStaff(input: AddStaffInput): String
            #removeStaff(input: RemoveStaffInput): String
        }
    `,
    resolvers: {
        Mutation: {
            addStaff: [
                {
                    type: 'guard',
                    pk: '$storeId',
                    sk: 'manager_${!sub}'
                },
                {
                    type: 'users',
                    action: 'add'
                },
                {
                    type: 'add',
                    pk: '$storeId',
                    sk: 'staff_${#userId}',
                    name: '$name'
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
            // removeStaff: [
            //     {
            //         type: 'guard',
            //         pk: '$storeId',
            //         sk: 'manager_${!sub}'
            //     },
            //     {
            //         type: 'users',
            //         action: 'remove'
            //     },
            //     {
            //         type: 'add',
            //         pk: '$storeId',
            //         sk: '$staffId'
            //     },
            //     {
            //         type: 'db',
            //         action: 'remove'
            //     }
            // ]
        }
    }
}
