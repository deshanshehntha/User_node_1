/**
 *
 * Network controller
 * Controls all network related tasks
 *
 * **/

const networkService = require("../../service/network/network");
const algorithms = require("../../service/algorithms")
const ClientDataStore = require("../../util/dataStores/clientDataStore");
const AllConnectionsTestStore = require("../../util/dataStores/allConnectionsStore");

module.exports = {

    initializeUserSession: async () => {
        return new Promise(resolve => {
            const session = networkService.createUserSessionOnFirebase();
            resolve(session)
        })

    },

    authenticateNodeConnectionRequest: async (request) => {

        return new Promise(resolve => {
            const key = request.token;
            console.log(key);
            const isValid = networkService.validateUserSession(key)
            resolve(isValid)
        })

    },

    processClientConnectionRequest : async (socketId, customId, ip, datestamp, cluster) => {
        return new Promise(resolve => {
            ClientDataStore.add(socketId, customId,ip, datestamp, cluster);
            AllConnectionsTestStore.add(socketId, customId, ip,datestamp);
            algorithms.runLeadershipSelectionAlgorithm(socketId).then(redirectURL => {
                resolve(redirectURL);
            })
        })
    },

    removeFromClientDataStore : (socketId) => {
        ClientDataStore.remove(socketId);
    },

    getClientsFromClientDataStore : () => {
        return ClientDataStore.getAll();
    }

}
