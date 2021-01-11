/**
 *
 * Election routes
 * Election related request handler
 *
 * **/

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const electionController =  require("../../controller/election/election")

const router = express.Router();
router.use(bodyParser.json());
router.use(cors());

router.get("/", (req, res) => {
    res.send({response: "I am alive"}).status(200);
});

router.get("/contract", (req, res) => {
    electionController.getAllElections(true).then(electionList => {
        res.send({ response: electionList}).status(200);
    })
});

router.get("/contract/running", (req, res) => {
    electionController.getAllElections(false).then(electionList => {
        res.send({ response: electionList}).status(200);
    })
});

router.get("/contract/:id", (req, res) => {
    const election = electionController.getElectionById(req.params.id);
    res.send({response: election}).status(200);
});

router.get("/result", (req, res) => {
    const electionResults = electionController.getAllElectionResults();
    res.send(electionResults).status(200);
});

router.get("/contract/:id/amendments/", (req, res) => {
    const amendments = electionController.getAmendmentsByElectionId(req.params.id)
    res.send(amendments).status(200);
});


router.get("/contract/amendments/", (req, res) => {
    const amendments = electionController.getAllAmendments();
    res.send(amendments).status(200);
});

router.patch("/contract/amendments/", async (req, res) => {

    const validatedAmendment = await electionController.validateAmendment(req.body.id, req.body.acceptance, req.body.contractId);
    validatedAmendment.voted = false
    if (electionController.isAmendmentInactive(validatedAmendment)) {
        console.log("Going to remove amendment");
        global.clientSocket.emit('remove_rejected_amendment', validatedAmendment);
    } else {
        console.log("validated amendment sent");
        global.clientSocket.emit('update_active_amendment', validatedAmendment);
    }
    res.send("Amendment Successfully Validated").status(200);
});

router.get("/user/:id", (req, res) => {
    electionController.getUserDetailsById(req.params.id).then(user => {
        res.send(user).status(200);
    })
});


module.exports = router;

