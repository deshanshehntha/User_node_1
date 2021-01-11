/***
 *
 * This class will hold the client connections
 * Which this node is serving
 *
 * */

class ClientDataStore {

    _clients = [];

    constructor() {
        this._clients = [];
    }

    add(socketId, id, url, timestamp, cluster) {
        let obj = {
            socketId: socketId,
            id: id,
            url: url,
            timestamp: timestamp,
            cluster: cluster
        }
        this._clients.push(obj);
        console.log(this._clients)
    }

    getAll() {
        return this._clients;
    }

    remove(socketId) {
        this._clients = this._clients.filter(function (obj) {
            return obj.socketId !== socketId;
        });
        console.log("Client data after deleted" + this._clients)
    }

    removeAll() {
        this._clients = []
    }

    getOldestNode() {
        return this._clients[0].url
    }
}

const instance = new ClientDataStore();

module.exports = instance;
