/**
 *
 * Auth util
 * External api connection for login
 *
 * **/

const axios = require('axios')
var jwtDecode = require('jwt-decode');
const url = "https://isay-flask.herokuapp.com/";
const keyHolder = require("./dataStores/keyHolder");

const firebase_app = require('./firebase.config');
const testRef = firebase_app.database().ref("/keys/");

module.exports = async function authenticateUser(user){

    //TODO - improve this and move to a seperate metod
    const res = await axios.post(url + '/user/login', user )
        .then(res=>{
            console.log(res.data)
            const token = res.data.token;
            const decode_token = jwtDecode(token);
            console.log("XXXXXXXXXXXX CATEGORY BELONGS XXXXXXXXXXXXXX");

            console.log( decode_token.job);
            console.log(decode_token);


            const output = {
                "private_key" : decode_token._private_key,
                "public_key" : decode_token._public_key,
                "jwt_token" : token,
                "job" : decode_token.job
            };

            //set the new global string
            global.globalString = decode_token.job;
            console.log("getting the global string");
            console.log(global.globalString);


            keyHolder.add(decode_token._private_key,
                decode_token._public_key,
                global.globalString);
            console.log("public key |" + decode_token._public_key);

            testRef.orderByChild("publicKey").equalTo(decode_token._public_key).once("value",snapshot => {
                console.log("XXXXXXXXXXXXXXXXX" + snapshot.exists())
                if (!snapshot.exists()){
                    const _key = testRef.push().getKey();
                    testRef.child(_key).set({ publicKey: decode_token._public_key }, function (error) {
                        if(error)
                            console.log("Error syncing public key " + error);
                        else
                            console.log("Saved public key");
                    })
                }
            });
            return output;
        })
        .catch(err=>{
            console.log(err);
            return err;
        })

    return res;
}
