// This file is meant to be hidden
//add this file to .gitignore
//The information below includes a Google API ID and Secret, used for authentification
//There is a link to the database through Mongo
//There is a cookie key used for controlling session cookies

module.exports = {
        google: {
            clientID: '440772211828-t27jfq6nq5sa75aueb7e4uknd67lhrin.apps.googleusercontent.com',
            clientSecret: 'bBEqhXddTWBjYRZ1QJp7DwJe'
        },
        mongodb: {
            dbURI: 'mongodb://awolste:test@oauth-shard-00-00-j4kf3.mongodb.net:27017,oauth-shard-00-01-j4kf3.mongodb.net:27017,oauth-shard-00-02-j4kf3.mongodb.net:27017/test?ssl=true&replicaSet=OAuth-shard-0&authSource=admin&retryWrites=true'
        },
        session: {
            cookieKey: 'begintoreasonsummer2019'
        }
};
