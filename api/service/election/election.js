/**
 *
 * Election Service
 * Election related firebase read/write handler
 *
 * **/
const firebaseService = require("../firebase");
const keyHolder = require("../../util/dataStores/keyHolder")

module.exports = {

    addUserAmendmentToPermanantRecord: async (amendment) => {

        return new Promise(resolve => {
            const userAmendmentCollection =
                firebaseService.getVoterAmendmentCollection();

            const amendmentsForAnalysisCollection =
                firebaseService.getAmendmentCollectionForGeneralization();

            const electionId = amendment.conId
            const comments = amendment.amendments

            userAmendmentCollection.child(electionId).push(comments, function (error) {
                if (error) {
                    console.log("Error" + error);
                    resolve(false);
                } else{
                    console.log("Amendment saved to firebase");
                    //record the second set of amendment record to aid the analysis
                    amendmentsForAnalysisCollection.child(electionId).child("data").push( comments, function (error) {
                        if( error ){
                            console.log("Error in amendment analysis recording " + error );
                            resolve(false);
                        } else{
                            console.log("Amendment data for analysis recorded");
                            resolve(true);
                        }
                    } );
                    resolve(true);
                }

            })


        })
    },

    addUserVotedElection: async (conId) => {
        return new Promise(resolve => {
            const thisUser = keyHolder.getUserId();
            firebaseService.getUserCollection().then(userCollection => {
                var user = userCollection.child(thisUser);
                const obj = {
                    contractId: conId
                }
                user.child("contribution").push(obj);
                resolve(true)
            });


        })

    },

    getElections: async (isActive) => {
        return new Promise(resolve => {
            let electionList = []
            firebaseService.getSmartContractCollectionReference().then(smartContract => {
                smartContract.orderByChild("isActive").equalTo(isActive).once("value", snapshot => {
                    snapshot.forEach(childSnapshot => {
                        electionList.push(childSnapshot.val())
                    })
                    resolve(electionList);
                });
            })

        });
    },

    fetchUserDetails: (id) => {
        return new Promise(resolve => {
            firebaseService.getUserCollection().then(userCollection => {
                if (id !== "") {
                    var user = userCollection.child(id);

                    let votedArray = []
                    user.child('contribution').on('value', function (snapshot) {
                        snapshot.forEach(function (child) {
                            votedArray.push(child.val());
                        })
                        resolve(votedArray);
                    });

                }
            })
        })
    },

    mapElectionContractProperties: (contract) => {

        const obj = {
            electionContractId: contract._contractId,
            electionName: contract._electionName,
            electionStartDate: contract._startDate,
            electionEndDate: contract._endDate,
            electionCoin: contract._electionCoin,
            totalVoters: contract._noOfVoters,
            electionDescription: contract._description,
            electionCategory: contract._electionCategory,
            electionCoinBalance: contract._coinBalance,
            blockchainFileName: contract._blockChainFileName,
            approvedAmendments: contract._approvedAmendments,
            finalResults: contract._finalElectionResults,
            clusterLeaderNode: contract._clusterLeaderNode,
            candidates: contract._candidates,
            creator: contract._creator,
            deploydTime: contract._startTime,
            electionStatus: contract._electionStatus,
            isActive: contract._isActive,
            isAllowVote : contract._allowVote
        };
        return obj;

    },
}
