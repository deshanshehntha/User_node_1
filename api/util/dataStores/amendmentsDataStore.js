// /**
//  *
//  * This class stores amendments temporary
//  *
//  * It will store and when the acceptance rate is met accepted amendments will be removed
//  *
//  * **/
// class AmendmentsDataStore {
//
//     _amendments = [];
//
//     constructor() {
//         this._amendments = [];
//     }
//
//     addNewAmendments(amendment) {
//         const isExists = this._amendments.filter(obj => (obj.id === amendment.id));
//         console.log(isExists);
//
//         if (isExists === undefined || isExists.length < 1) {
//             console.log("Pushed new");
//             this._amendments.push(amendment);
//         } else {
//             const objIndex = this._amendments.findIndex((obj => obj.id === amendment.id));
//             console.log("Amendments to be updated")
//             console.log(this._amendments[objIndex])
//             this._amendments[objIndex] = amendment;
//             console.log("Amendments update complete")
//             console.log(this._amendments)
//
//         }
//
//     }
//
//     getAllAmendmentsByElectionId(contractId) {
//         return this._amendments.filter(obj => (obj.conId === contractId));
//
//     }
//
//     validateAmendment(amendmentId, acceptance) {
//         let amendment = this._amendments.find(amendments => amendments.id === amendmentId);
//         amendment = this.calculateAcceptance(amendment, acceptance);
//         this._amendments = this._amendments.filter(function (item) {
//             return item.id !== amendmentId
//         })
//         return amendment;
//     }
//
//     acceptAmendment(id, acceptance) {
//         const respondedAmendmentObj = this.validateAmendment(id, acceptance);
//         return respondedAmendmentObj;
//     }
//
//
//     calculateAcceptance(amendment, acceptance) {
//
//         if (acceptance === "Yes") {
//             amendment.accepted = amendment.accepted + 1;
//         } else if (acceptance === "No") {
//             amendment.rejected = amendment.rejected + 1;
//         }
//         amendment.rate = this.calculateRate(amendment.accepted, amendment.rejected);
//         if (amendment.limit === amendment.accepted + amendment.rejected) {
//             amendment.status = "Inactive"
//         }
//
//         return amendment;
//     }
//
//     calculateRate(acceptance, rejected) {
//         return (acceptance / (acceptance + rejected)) * 100
//     }
//
//     removeAmendment(acceptance) {
//         console.log("removed")
//         this._amendments = this._amendments.filter(function (item) {
//             return item.id !== acceptance.id
//         })
//     }
//
//     getAllAmendments() {
//         return this._amendments;
//     }
//
// }
//
// const instance = new AmendmentsDataStore();
//
// module.exports = instance;
