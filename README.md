# Storefront Example

This rise project is an example of how to implement an app for a store front.

This project includes:

-   add a store
-   add a store manager
-   add store staff
-   cashier can submit order payment to existing service in AWS account external
-   cashier can recieve payment completion status from existing service in AWS acount external
-   barista can receive orders
-   barista can start an order
-   barista can complete an order
-   customer wait times are recorded in cloudwatch

This project demonstrates

-   how to create modules
-   how to add custom actions with lambda functions
-   how to configure permissions on lambda functions
-   how to emit events for existing systems to act on
-   how to receive events from existing systems

## Note on syntax

Syntax in this project is a work in progress.

-   all input form graphql input is added to a "stash" object which is available to all actions
-   accessing any values on this stash is done with the $ symbol.
-   the add action will add values to the stash
-   ! symbol is a way to reference values on the jwt
-   @ symbol represents utility functions, such as:
    -   @id generates a random id
    -   @now represents a timestamp in milliseconds
-   injecting one of the above variables into a string is done with {} syntax, similiar to template strings in js, example
    -   'one\_{@id}\_two' = 'one_2323423423rf3r_two'
    -   'one\_{$myInput}\_two' = 'one_myInputFromgraphQLInput_two'
