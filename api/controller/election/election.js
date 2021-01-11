/**
 *
 * Election controller
 * Controls all election related tasks
 *
 * **/

const ElectionContractDataStore = require("../../util/dataStores/electionContractDataStore");
const ElectionResultsDataStore = require("../../util/dataStores/electionResultsDataStore");
const AmendmentsDataStore = require("../../util/dataStores/amendmentsDataStore");
const KeyHolder = require("../../util/dataStores/keyHolder");

const electionService = require("../../service/election/election");
const constants = require("../../util/constants");
const Blockchain = require("izigma-blockchain");
const ElectionContract = require("../../../smartContract/model/electionContract");
const chain = new Blockchain();
const {v4: uuidv4} = require('uuid');


module.exports = {

    getAllElections: (isWithFinishedElections) => {
        let electionObjList = []
        return new Promise(resolve => {
            const contracts = ElectionContractDataStore.getAll();
            contracts.forEach(contract => {
                console.log(contract);
                const electionObj = electionService.mapElectionContractProperties(contract);
                electionObjList.push(electionObj);
            })
            if (isWithFinishedElections) {
                electionService.getElections(false).then(finishedElections => {
                    if (finishedElections.length !== 0) {
                        const elections = [...electionObjList, ...finishedElections]
                        resolve(elections)
                    } else {
                        resolve(electionObjList)
                    }

                })
            } else {
                resolve(electionObjList)
            }

        })
    },

    getElectionById: (id) => {
        return ElectionContractDataStore.getContractById(id);
    },

    getAllElectionResults: () => {
        return ElectionResultsDataStore.getAll();
    },

    getAmendmentsByElectionId: (id) => {
        const contract = ElectionContractDataStore.getContractById(id);
        return contract.getAmendmentsList();
    },


    validateAmendment: async (amendmentId, acceptance, contractId) => {
        const contract = ElectionContractDataStore.getContractById(contractId);
        const updatedBy = KeyHolder.getPublicKey();
        const validatedAmendment = contract.validateAmendment(amendmentId, acceptance, updatedBy)
        // if ((validatedAmendment.limit === validatedAmendment.accepted + validatedAmendment.rejected) && validatedAmendment.rate >= 10.00) {
        //     if (validatedAmendment.rate >= 10.00) {

        electionService.addUserAmendmentToPermanantRecord(validatedAmendment).then(result =>
            console.log(result)
        )
        // }
        return validatedAmendment;
    },


    isAmendmentInactive: (validatedAmendment) => {
        return validatedAmendment.status === constants.AMENDMENT_STATUS_INACTIVE;
    },

    processUserAmendments: (data) => {
        if (data.amendments !== "") {
            const amendmentObj = {
                id: uuidv4(),
                conId: data.conId,
                amendments: data.amendments,
                user: KeyHolder.getPublicKey(),
                accepted: 0,
                rejected: 0,
                rate: 0,
                limit: 3,
                status: "Active",
                voted: false,
                votedBy: []
            }
            // module.exports.executeAmendmentActions(amendmentObj, constants.AMENDMENT_CREATE);
            return amendmentObj;
        }
        return null;
    },

    processUserVote: async (data) => {
        var record;
        const voteObj = {
            conId: data.conId,
            vote: data.vote
        };
        await chain.createWallet(KeyHolder.getPublicKey(), KeyHolder.getPrivateKey(), "secp256k1").then(async () => {
            record = await chain.createRecord(voteObj);

        })
        return new Promise(resolve => {

            const contract = ElectionContractDataStore.getContractById(data.conId)

            const electionVoteObj = {
                record: record,
                publicKey: KeyHolder.getPublicKey(),
                coin: contract._electionCoin
            }
            console.log(electionVoteObj)
            console.log("Public Key Used and record created.")
            resolve(electionVoteObj);

        })
    },

    mineRecordIfValidationSuccessful: async (message, conId) => {
        if (message === constants.START_MINIG_MESSAGE) {
            await chain.mineRecords();
            const election = ElectionContractDataStore.getContractById(conId);
            election.setAllowVoting(false);
            await electionService.addUserVotedElection(conId, []);
            return (message);
        } else {
            console.log(message);
        }
    },

    executeAmendmentActions: (amendment, action) => {
        if (action === constants.AMENDMENT_CREATE || action === constants.AMENDMENT_UPDATE) {
            const contract = ElectionContractDataStore.getContractById(amendment.conId);
            const thisNodesPublicKey = KeyHolder.getPublicKey();
            const votedKeys = amendment.votedBy;
            const isExists = votedKeys.includes(thisNodesPublicKey);
            if (isExists) {
                amendment.voted = true
            } else {
                amendment.voted = false
            }
            contract.addNewAmendments(amendment);
        } else if (action === constants.AMENDMENT_REMOVE) {
            const contract = ElectionContractDataStore.getContractById(amendment.conId);
            contract.removeAmendment(amendment)
        }
    },

    addElectionsToElectionDataStore: (electionContracts) => {
        electionContracts.forEach(obj => {
            module.exports.addElectionToDataStore(obj);
        });
    },

    addElectionToDataStore: (data) => {
        const electionCategory = data.electionCategory[0];

        if (electionCategory === global.globalString || electionCategory === "ALL") {
            const contract = new ElectionContract(data.electionCategory,
                data.creator,
                data.electionName,
                data.electionCategory,
                data.candidates,
                data.electionDescription,
                data.electionStartDate,
                data.electionEndDate,
                data.electionContractId,
                data.clusterLeaderNode,
                data.blockchainFileName,
                data.electionCoin,
                data.isActive,
                data.electionStatus
            )

            ElectionContractDataStore.add(contract);
        }
    },

    addElectionResultsToElectionResultsDataStore: (data) => {
        ElectionResultsDataStore.add(data);
    },

    saveBlockchainHash: (hashObj) => {
        KeyHolder.setElectionBlockchainHash(hashObj)
    },

    getBlockchainHashByContractId: (contractId) => {
        return KeyHolder.getElectionBlockchainHashByContractId(contractId);
    },

    removeElectionFromSmartContractRunner: (electionId) => {
        ElectionContractDataStore.removeElectionById(electionId);
    },

    getUserDetailsById: (id) => {
        return new Promise(resolve => {
            electionService.fetchUserDetails(id).then(user => {
                resolve(user);
            })
        })
    }
}
