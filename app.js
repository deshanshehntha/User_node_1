"use strict";

/***
 *
 *  App.js
 *  Entry point to the application
 *  Main socket conection halnding class
 *
 * */

require('dotenv').config();
const express = require("express");
const http = require("http");
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const ngrok = require('ngrok');
const open = require('open');
const pino = require('pino');
const axios = require('axios');
const expressPino = require('express-pino-logger');
const constants = require("./api/util/constants")
const config = require('./api/config/init')
const port = 5000

var mainConnectionURL;
var mainServerConnectionURL;
var isElectionRunning = false;
global.connectionStatus = "NOT_CONNECTED";


process.argv.forEach(function (val, index, array) {
    if (index === 2) {
        global.globalString = val;
    }
    console.log(index + ': ' + val);
});

const server = http.createServer(app);
server.listen(port, () => console.log(`Create Listening on port ${server.address().port}`));

const logger = pino({level: process.env.LOG_LEVEL || 'info'});
const expressLogger = expressPino({logger});
config.logger().then(r => console.log("Logger initiated......"));

app.use(cors());
app.use(config.cors);
app.use(bodyParser.json());
app.use(expressLogger);

const networkController = require("./api/controller/network/network");
const electionController = require("./api/controller/election/election");


const electionRoutes = require('./api/routes/election/election');
const authenticationRoutes = require('./api/routes/authentication/authentication');

app.use('/election/', electionRoutes);
app.use('/auth/', authenticationRoutes);

(async function () {

    getMainSignallingServerUrl().then(response => {
        mainServerConnectionURL = response
    })

    const ngrokConnectionURL = await ngrok.connect({
        addr: server.address().port,
        host_header: 'http://usernode.s3-website-us-east-1.amazonaws.com/'
    });

    console.log("This nodes ngrok connection tunnel url is |" + ngrokConnectionURL);
    /** create socket io server */

    //open the web browser
    open(constants.CLIENT_URL + ngrokConnectionURL);


    global.io = require('socket.io')(server);
    /** create socket io server */

    const sessionToken = await networkController.initializeUserSession();
    console.log("User session generated" + sessionToken);
    await createNewPeerConnection(mainServerConnectionURL);

    global.io.on('connection', (socket) => {
        console.log("Connected Socket | " + socket.id);

        socket.on('authenticate', (data, callback) => {
            networkController.authenticateNodeConnectionRequest(data).then(isValidUser => {
                console.log("isvalid user")
                console.log(isValidUser)
                if (isValidUser) {
                    callback("authenticated")
                    socket.emit('authenticated');
                } else {
                    callback("unauthorized")
                    socket.emit('unauthorized', "Unauthorized Token");
                    socket.disconnect()
                }
            })
        });

        socket.on('own_client', () => {
            console.log("Connected this nodes own client |");
            electionController.getAllElections(true).then(elections => {
                socket.emit("election_contracts_for_own_Client", elections);
            })
        });

        socket.on('get_connection_status', () => {
            console.log(global.connectionStatus);
            socket.emit("receive_connection_status", global.connectionStatus);
        });


        socket.on('client_connection_request', (data) => {
            console.log("Client is requesting to connect | URL" + data.ip +
                "| Client id | " + data.customId + "Client type |" + data.cluster);
            networkController.processClientConnectionRequest(socket.id,
                data.customId, data.ip, Date.now(), data.cluster).then(redirectURL => {
                socket.emit('redirect_url', redirectURL);
            })
        });

        socket.on('disconnect', () => {
            console.log("Disconnected Socket |" + socket.id);
            networkController.removeFromClientDataStore(socket.id)
        });

        socket.on('getting_connected_node_details', (data) => {
            console.log("Node connection details | url : " + data.url + " Connection Data : " + data.childNodes);
            global.clientSocket.emit('getting_connected_node_details', data);
        });

        socket.on('connected_to_directed_node', () => {
            global.clientSocket.emit('connected_to_directed_node');
        });

        socket.on('eventToEmit', (data, callback) => {
            global.clientSocket.emit('eventToEmit', data, (error, message) => {
                callback(error, message);
            });
        });


        socket.on('client_voted', async (data, callback) => {
            const amendment = electionController.processUserAmendments(data);
            if (amendment !== null) {
                global.clientSocket.emit('new_amendment_added_by_a_user_send_to_signalling_node', amendment);
            }

            electionController.processUserVote(data).then(electionVoteObj => {
                global.clientSocket.emit('client_voted_event', electionVoteObj, (error, message) => {
                    electionController.mineRecordIfValidationSuccessful(message, data.conId).then(processedMessage => {
                        callback(error, processedMessage);
                    })
                    // global.clientSocket.disconnect()
                    // getMainSignallingServerUrl().then(response => {
                    //     mainServerConnectionURL = response
                    // });
                    // createNewPeerConnection(mainServerConnectionURL).then(result => {
                    //     console.log("Voting Process Completed......");
                    // });

                });
            })
        });

        socket.on('client_voted_event', async (data, callback) => {
            global.clientSocket.emit('client_voted_event', data, (error, message) => {
                callback(error, message);
            })
        });

        socket.on('connect_to_the_cluster', async (data, callback) => {
            const contract = electionController.getElectionById(data);
            const clusterLeaderNode = contract._clusterLeaderNode;
            console.log("success connecting to cluster starts");
            global.clientSocket.disconnect()
            mainConnectionURL = clusterLeaderNode
            console.log(mainConnectionURL);
            createNewPeerConnection(mainConnectionURL).then(status => {
                callback("error", status);
            })
        });


        socket.on('new_amendment_added_by_a_user_send_to_signalling_node', (data) => {
            global.clientSocket.emit('new_amendment_added_by_a_user_send_to_signalling_node', data);
        })

        socket.on('remove_rejected_amendment', (data) => {
            global.clientSocket.emit('remove_rejected_amendment',data);
            // console.log("Removing rejected validations");
            // electionController.executeAmendmentActions(data, constants.AMENDMENT_REMOVE);
        });

        socket.on('update_active_amendment', (data) => {
            global.clientSocket.emit('update_active_amendment', data);
            // console.log("Update amendment validations");
            // electionController.executeAmendmentActions(data, constants.AMENDMENT_UPDATE)
        });

        socket.on('receiving_election_hash', (data) => {
            global.clientSocket.emit('receiving_election_hash', data);
        });

    });

    function createNewPeerConnection(data) {

        return new Promise(resolve => {
            console.log(data);

            var socket2 = require('socket.io-client')("" + data + "", {
                forceNew: true
            });

            global.clientSocket = socket2;

            socket2.on('connect', (data) => {
                console.log("Server connection met....Intializing connection");
            });

            socket2.emit('authenticate', {token: sessionToken}, (data) => {
                console.log("callback data")
                console.log(data)
            });

            socket2.on('authenticated', () => {
                console.log("authenticated");
                socket2.emit('client_connection_request', {
                    customId: "XXXX",
                    ip: ngrokConnectionURL,
                    cluster: global.globalString
                });
                console.log("Connect to parent server node |");
            })

            socket2.on('unauthorized', (msg) => {
                console.log("unauthorized: " + msg);
            })


            socket2.on('disconnect', async () => {
                console.log("Disconnected from |" + socket2.io.uri);
                console.log(mainConnectionURL + "...Comparing..." + socket2.io.uri);
                var currentConnectionUri = socket2.io.uri;
                if (mainConnectionURL === currentConnectionUri && !isElectionRunning) {
                    console.log("Connect to main")
                    await createNewPeerConnection(mainServerConnectionURL);
                }
                isElectionRunning = false;
            });

            socket2.on("redirect_url", async (data) => {
                console.log(data)
                if (data !== constants.CLIENT_CONNECTION_KEPT_VALUE) {
                    mainConnectionURL = data;
                    console.log("Main connection URL setted |" + mainConnectionURL);
                    console.log("Redirect params from the redirected nodes |" + data);
                    console.log("Disconnecting with the main server");
                    console.log("redirect url" + data);
                    socket2.disconnect()
                    await createNewPeerConnection(data)
                } else {
                    socket2.emit("connected_to_directed_node");
                    global.connectionStatus = constants.SUCCESSFULLY_CONNECTED;
                    global.io.emit("receive_connection_status", global.connectionStatus);
                    resolve(global.connectionStatus);
                }
            });


            socket2.emit('from_child', "test");

            socket2.on('requesting_connection_details', () => {
                const clients = networkController.getClientsFromClientDataStore();
                console.log("Getting connection nodes.....");
                io.emit('requesting_connection_details');
                console.log("Getting connected nodes from a peer node|");
                socket2.emit('getting_connected_node_details', {
                    "url": ngrokConnectionURL,
                    "childNodes": clients,
                    "cluster": global.globalString
                });
                console.log("sent**********************************");
            });

            socket2.on('new_election_created', (data) => {
                console.log("Recieving new election contract details");
                console.log(Date.now())
                electionController.addElectionToDataStore(data);
                isElectionRunning = true;
                io.emit('new_election_created', data);
                electionController.getAllElections().then(elections => {
                    io.emit("election_contracts_for_own_Client", elections);
                })
            });

            socket2.on("get_all_election_contracts", (electionContracts) => {
                electionController.addElectionsToElectionDataStore(electionContracts)
                console.log("Elections Recieved from the server");
            });


            socket2.on('getVotes', function () {
                io.emit("getVotes");
                const data = uuidv4();
                socket2.emit('eventToEmit', {"data": data}, function (error, message) {
                    if (message === data) {
                        console.log("callaback retuned and identified");
                        console.log(message);
                    } else {
                        console.log("try again");
                        console.log(error);
                    }

                });
            });

            socket2.on('all_election_results', function (data) {
                io.emit('all_election_results', data);
                console.log("Receiving all election results");
                electionController.addElectionResultsToElectionResultsDataStore(data)
            });

            socket2.on('new_amendment_added_by_a_user', function (data) {
                console.log("Syncing user amendments");
                io.emit('new_amendment_added_by_a_user', data);
                electionController.executeAmendmentActions(data, constants.AMENDMENT_CREATE);
            })

            socket2.on('remove_rejected_amendment_by_user', function (data) {
                io.emit('remove_rejected_amendment_by_user', data);
                electionController.executeAmendmentActions(data, constants.AMENDMENT_REMOVE);
            });

            socket2.on('update_active_amendment_by_user', function (data) {
                io.emit('update_active_amendment', data);
                console.log("Update amendment validations");
                electionController.executeAmendmentActions(data, constants.AMENDMENT_UPDATE);
            });

            socket2.on('current_blockchain_hash', function (data) {
                io.emit('current_blockchain_hash', data);
                console.log("Current blockchain hash received");
                electionController.saveBlockchainHash(data);
            });

            socket2.on('requesting_election_hash', (electionId) => {
                io.emit('requesting_election_hash', electionId);
                console.log("Requesting blockchain hash")
                console.log(electionController.getBlockchainHashByContractId(electionId))
                socket2.emit('receiving_election_hash', electionController.getBlockchainHashByContractId(electionId))

            });

            socket2.on('election_completed_by_admin', (electionId) => {
                electionController.removeElectionFromSmartContractRunner(electionId);
                io.emit("election_completed_by_admin", electionId)
            });

        })

        return socket2;
    }

    async function getMainSignallingServerUrl() {
        return new Promise(resolve => {
            axios.get('https://isay-service-registry.herokuapp.com/service?type=SIGNALLING_SERVER')
                .then(res => {
                    console.log("recieved url");
                    console.log(res.data.url);
                    resolve(res.data.url)
                })
                .catch(error => {
                    console.error(error)
                })
        })

    }

})();


