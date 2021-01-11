const ClientDataStore = require("../util/dataStores/clientDataStore");
const {CLIENT_CONNECTION_KEPT_VALUE} = require("../util/constants");

module.exports = {

    /**
     *Run the leadership selection algorithm
     *
     * Controls the authentication node flow
     *
     * @returns oldest node
     *
     * */
    runLeadershipSelectionAlgorithm: async (socketId) => {
        return new Promise(resolve => {
            console.log("Leadership selection algorithm")

            if (ClientDataStore.getAll().length <= 2) {
                console.log("Kept the connection" + ClientDataStore.getAll().length);
                resolve(CLIENT_CONNECTION_KEPT_VALUE)
            } else {
                ClientDataStore.remove(socketId);
                var byDate = ClientDataStore.getAll().slice(0);
                byDate.sort(function (a, b) {
                    return a.timestamp - b.timestamp;
                });
                console.log('by date:');
                console.log(byDate);

                byDate[0].timestamp = Date.now();
                console.log(byDate[0].url);
                resolve(byDate[0].url);
            }
        })

    }
}
