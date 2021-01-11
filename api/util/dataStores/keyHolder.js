/**
 *
 *  Key holder class holds private and public keys with the blockchain hash
 *
 * **/

class KeyHolder {

    _privateKey = "";
    _publicKey = "";
    _cluster = "";
    _blockchainHashArr = [];
    _userId = "";

    constructor() {
        this._privateKey = "";
        this._publicKey = "";
        this._cluster = "";
        this._userId = "";
    }

    add(privateKey, publicKey, cluster) {
        this._privateKey = privateKey;
        this._publicKey = publicKey;
        this._cluster = cluster;
    }

    clear() {
        this._privateKey = "";
        this._publicKey = "";
        this._cluster = "";
    }

    setUserId(id) {
        this._userId = id;
    }

    getUserId() {
        return this._userId;
    }

    getPrivateKey() {
        return this._privateKey;
    }

    getPublicKey() {
        return this._publicKey;
    }

    setElectionBlockchainHash(hashObj) {
        const isExists = this._blockchainHashArr.filter(obj => (obj.conId === hashObj.id));
        if((isExists === undefined || isExists.length < 1)){
            this._blockchainHashArr.push(hashObj);
        } else {
            const objIndex = this._blockchainHashArr.findIndex((obj => obj.conId === hashObj.id));
            this._blockchainHashArr[objIndex] = hashObj;

        }
        console.log(this._blockchainHashArr)
    }

    getElectionBlockchainHashByContractId(contractId) {

        var found = this._blockchainHashArr.find((element) =>  {
            return element.conId === contractId;
        });
        return found;
    }

    getCategory() {
        return this._cluster;
    }
}

const instance = new KeyHolder();

module.exports = instance;
