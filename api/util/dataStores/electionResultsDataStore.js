/***
 *
 * This class holds realtime election results received from signalling node
 *
 * */

class ElectionResultsDataStore {

    _results = [];

    constructor() {
        this._results = [];
    }

    add(resultList) {
        this._results = resultList;
    }

    getAll() {
        return this._results;
    }
}

const instance = new ElectionResultsDataStore();

module.exports = instance;
