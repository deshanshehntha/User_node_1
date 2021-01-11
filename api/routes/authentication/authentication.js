/**
 *
 * Authentication routes
 * Authentication related request handler
 *
 * **/

const express = require('express');
const router = express.Router();

const authenticateUser = require('../../util/auth-util');
const keyHolder = require("../../util/dataStores/keyHolder")

const url = "https://flask-deploy-cdap.herokuapp.com";

router.get("/ping", function (req, res) {
    return res.status(200).send("Ping successfull !");
})

router.post("/authenticate", async function (req, res) {
    const user = req.body;
    console.log(user);
    keyHolder.setUserId(user.electionId)
    /**Todo @pasindu fix this for login errors**/
    const result = await authenticateUser(user)
        .then(res=>{
            console.log(res);
            return res.status(200).send(true);
        })
        .catch(err=>{
            return res.status(200).send(true);
        })
});

router.get("/user/category/", async (req, res) => {
    res.send(global.globalString).status(200);
});

module.exports = router;
