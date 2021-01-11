/**
 *
 * Network Service
 * Network related firebase read/write handler
 *
 * **/

const firebaseService = require("../firebase");
const {v4: uuidv4} = require('uuid');

module.exports = {

    createUserSessionOnFirebase : async () => {
        const userSessionCollection = firebaseService.getUserSessionCollection();
        const _key = userSessionCollection.push().getKey();

        return new Promise(resolve => {
            const sessionToken = uuidv4();
            userSessionCollection.child(_key).set({token: sessionToken}, (error) => {
                if (error)
                    console.log("Error" + error);
                else
                    console.log("Saved");
            })
            resolve(sessionToken);
        })
    },

    validateUserSession:  async (session) => {
        const userSessionCollectionRef = await firebaseService.getUserSessionCollection();
        var auth;

        return new Promise(resolve => {
            const query = userSessionCollectionRef.orderByChild("token").equalTo(session);

            query.on('value', (snapshot) => {
                auth = snapshot.val();
                if (auth !== null) {
                    console.log("Auth request")
                    resolve(true)
                } else {
                    console.log("Unauthorized request")
                    resolve(false)
                }
            })

        })

    }

}
