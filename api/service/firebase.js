/**
 *
 * Firebase Service
 * Handle all the firebase collections
 *
 * **/

const firebase_app = require('../util/firebase.config');

module.exports = {

    getVoterAmendmentCollection : () => {
        const amendmentsCollection = firebase_app.database().ref("/voterAmendments/");
        return amendmentsCollection
    },

    getAmendmentCollectionForGeneralization : ()=>{
        const generalizationAmendments = firebase_app.database().ref("/amendment")
        return generalizationAmendments;
    },

    getUserSessionCollection: () => {
        const userSessionCollection = firebase_app.database().ref("/sessions/");
        return userSessionCollection;
    },


    getSmartContractCollectionReference: async () => {
        const smartContractRef = firebase_app.database().ref("/smartContract/");
        return smartContractRef;
    },

    getUserCollection: async () => {
        const keyRef = await firebase_app.database().ref("/user/");
        return new Promise(resolve => {
            resolve(keyRef);
        })
    }
}




