/**
 * In this project, we are defining all schema and resolvers
 * in modules rather than this root module.
 */
module.exports = {
    schema: `
        type Example {
            id: String
        }
    `,
    resolvers: {
        Query: {},
        Mutation: {}
    },
    config: {
        name: 'usertest',
        auth: true,
        eventBus: 'default'
    }
}
