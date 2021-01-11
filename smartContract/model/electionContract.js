/***
 *
 *  ElectionContract
 *  This will act as the smart contract
 *  Contains attributes as well as methods
 *
 * */

var Candidate = require("./candidate");
var SmartContractInterface = require("../core/smartContractInterface");

class ElectionContract extends SmartContractInterface {

    constructor(electionCategory,
                creator,
                electionName,
                voters,
                candidates,
                description,
                startDate,
                endDate,
                id,
                clusterLeaderNode,
                chainFileName,
                coin,
                isActive,
                electionStatus) {
        super(creator);
        this._contractId = id;
        this._electionCategory = electionCategory;
        this._voters = voters;
        this._candidates = candidates;
        this._electionName = electionName;
        this._description = description;
        this._startDate = startDate;
        this._endDate = endDate;
        this._clusterLeaderNode = clusterLeaderNode;
        this._chainFileName = chainFileName;
        this._electionCoin = coin;
        this._isActive = isActive;
        this._electionStatus = electionStatus;
        this._allowVote = true;
        this._amendments = [];
    }

    addCandidate(name) {
        const candidate = new Candidate(name)
        this._candidates.push(candidate);
    }

    addPermissionToVoters(voter) {
        if(this._voters.includes(voter)) {
            voter._weight = 1;
        } else {
            voter._weight = 0;
        }
    }

    vote(voter, candidate) {
    }

    getContractId() {
        return this._contractId;
    }

    setElectionStatus(status) {
        this._electionStatus = status;
    }

    setAllowVoting(isAllowVoting) {
        this._allowVote = isAllowVoting;
    }

    addNewAmendments(amendment) {
        const isExists = this._amendments.filter(obj => (obj.id === amendment.id));
        console.log(isExists);

        if (isExists === undefined || isExists.length < 1) {
            console.log("Pushed new");
            this._amendments.push(amendment);
        } else {
            const objIndex = this._amendments.findIndex((obj => obj.id === amendment.id));
            console.log("Amendments to be updated")
            console.log(this._amendments[objIndex])
            this._amendments[objIndex] = amendment;
            console.log("Amendments update complete")
            console.log(this._amendments)
        }
    }

    removeAmendment(acceptance) {
        console.log("removed")
        this._amendments = this._amendments.filter(function (item) {
            return item.id !== acceptance.id
        })
    }

    getAmendmentsList() {
        return this._amendments;
    }

    validateAmendment(amendmentId, acceptance, updatedBy) {
        let amendment = this._amendments.find(amendments => amendments.id === amendmentId);
        let votedKeys = amendment.votedBy;
        votedKeys.push(updatedBy);
        amendment.votedBy = votedKeys;
        amendment = this.calculateAcceptance(amendment, acceptance);
        this._amendments = this._amendments.filter(function (item) {
            return item.id !== amendmentId
        })
        return amendment;
    }

    calculateAcceptance(amendment, acceptance) {

        if (acceptance === "Yes") {
            amendment.accepted = amendment.accepted + 1;
        } else if (acceptance === "No") {
            amendment.rejected = amendment.rejected + 1;
        }
        amendment.rate = this.calculateRate(amendment.accepted, amendment.limit);
        if (amendment.limit === amendment.accepted + amendment.rejected) {
            amendment.status = "Inactive"
        }
        amendment.rate = amendment.rate.toFixed(1);
        return amendment;
    }

    calculateRate(acceptance, limit) {
        return (acceptance / (limit)) * 100
    }

}

module.exports = ElectionContract;
