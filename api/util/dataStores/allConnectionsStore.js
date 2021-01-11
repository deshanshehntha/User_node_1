/**
 *
 *All connection data store all the nodes data which are connected and revcieved from
 * Other nodes to this particular node
 *
 * **/

class AllConnectionsStore {

    _connections = [];

    constructor() {
        this._connections = [];
    }

    add(socketId, id, url, timestamp) {
        let obj = {
            socketId: socketId,
            id: id,
            url: url,
            timestamp : timestamp
        }
        this._connections.push(obj);
    }

    getAll() {
        return this._connections;
    }

    remove(socketId) {
        this._connections = this._connections.filter(function (obj) {
            return obj.socketId !== socketId;
        });
        console.log("Connections after removing a connection" + this._connections)

    }
}

const instance = new AllConnectionsStore();

module.exports = instance;
