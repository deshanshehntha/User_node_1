const electionController = require("../../../../api/controller/election/election")

describe("Election controller Tests", () => {

    let creator = "DUMMY_USER"
    let electionId = "11111-11111"

    const electionObj = {
        electionCategory: ["ALL"],
        creator: creator,
        electionName: "Election 1",
        candidates: [{_name: "Yes"}, {_name: "No"}],
        electionDescription: "Description 1",
        electionStartDate: "2010.01.01T21.10",
        electionEndDate: "2010.01.05T21.10",
        electionContractId: electionId,
        clusterLeaderNode: "192.10.10.1",
        blockchainFileName: "new_file.json",
        electionCoin: null
    }

    const blockchainHash = {
        id: electionId,
        hash: "aasdawadk82jlknkadaso2q2q2"
    }

    beforeAll(async () => {
        electionController.addElectionToDataStore(electionObj);
        electionController.saveBlockchainHash(blockchainHash);
    });

    it("Check wheather the amendment is active", () => {
        const validatedAmendment = {
            status: true
        }
        expect(electionController.isAmendmentInactive(validatedAmendment)).toEqual(false);
    });

    it("Get election by id", () => {
        const election = electionController.getElectionById(electionObj)
        expect(election.electionId).toEqual(electionId);
    });

    it("Get all elections", () => {
        const elections = electionController.getAllElections();
        expect(elections.length).toEqual(1);
    });

    it("Get blockchain hash by contract Id", () => {

        expect(electionController.getBlockchainHashByContractId(electionId).hash).toEqual(blockchainHash.hash);
    });

});
