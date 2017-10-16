var hookWindow = false;

$(function() {
    'use strict';

    // parse id in URL
    var userId = '';
    var sid = null;
    var parameters = window.location.search.substring(1);
    if (parameters.length > 0) {
        userId = parameters.split('=')[1];
        sid = userId.substring(4);
    }
    if (userId.length < 5 || userId.length > 8 || !userId.startsWith('ucla') || isNaN(sid)) {
        $('body').empty();
        return;
    }
    sid = parseInt(sid);

    // prevent closing window
    window.onbeforeunload = function() {
        if (hookWindow) {
            return 'Do you want to leave this page? Your progress will not be saved.';
        }
    }

    // initialize firebase
    var config = {
        apiKey: "AIzaSyD1x_G62LDh16lIhg--xKt69N79TgH--l8",
        authDomain: "network-editor.firebaseapp.com",
        databaseURL: "https://network-editor.firebaseio.com",
        projectId: "network-editor",
        storageBucket: "network-editor.appspot.com",
        messagingSenderId: "208552070855"
    };
    firebase.initializeApp(config);

    // construct network
    var IMG_DIR = 'img/'
    var nodes = null;
    var edges = null;
    var network = null;

    var data = {nodes: [], edges: []}
    for (var i = 0; i < subject_imgs[sid].length; ++i) {
        data.nodes.push({
            id: i,
            label: i.toString(),
            image: IMG_DIR + subject_imgs[sid][i],
            shape: 'image'
        });
    }

    function destroy() {
        if (network !== null) {
            network.destroy();
            network = null;
        }
    }

    function draw() {
        destroy();
        nodes = [];
        edges = [];

        // create a network
        var container = document.getElementById('network-wrapper');
        var options = {
            manipulation: {
                enabled: true,
                initiallyActive: true,
                addNode: false,
                deleteNode: false,
                controlNodeStyle: {
                    size: 7,
                    color: {
                        background: '#ffc107',
                        border: '#007bff',
                        highlight: {
                            background: '#007bff',
                            border: '#ffc107'
                        },
                    },
                    borderWidth: 3,
                },
                addEdge: function(data, callback) {
                    if (data.from != data.to  && 
                        network.getConnectedNodes(data.from).indexOf(data.to) == -1) {
                        // not the same node and the two nodes are not connected
                        callback(data);
                        $('#submit').removeClass('disabled');
                    }
                },
                editEdge: function(data, callback) {
                    var original_nodes = network.getConnectedNodes(data.id);
                    var same_nodes = original_nodes.indexOf(data.from) != -1 &&
                                     original_nodes.indexOf(data.to) != -1;
                    var connected = network.getConnectedNodes(data.from).indexOf(data.to) != -1;
                    if (data.from != data.to && (same_nodes || !connected)) {
                        callback(data);  // connect
                    } else {
                        // forbid connecting a node to itself or connecting two nodes that are already connected
                        callback(null);  // cancel
                        network.selectEdges([data.id]);
                        network.editEdgeMode();
                    }
                }
            },
            nodes: {
                shadow: {
                    enabled: true,
                    size: 5,
                    x: 0,
                    y: 0
                },
                chosen: {
                    node: function(values, id, selected, hovering) {
                        values.shadow = true;
                        values.shadowColor = "rgba(0, 0, 0, 0.8)";
                        values.shadowSize = 15;
                        values.shadowX = 0;
                        values.shadowY = 0;
                    }
                },
                font: {  // transparent labels
                    color: 'rgba(255, 255, 255, 0.0)',
                    strokeWidth: 10,
                    strokeColor: 'rgba(0, 0, 0, 0.0)',
                    size: 32,
                    vadjust: -55
                }
            },
            edges: {
                color: {
                    color: '#007bff'
                },
                width: 2,
                chosen: {
                    edge: function(values, id, selected, hovering) {
                        values.color = '#46b8da';
                        values.width = 2.5;
                        values.shadow = true;
                        values.shadowColor = '#007bff';
                        values.shadowX = 0;
                        values.shadowY = 0;
                    }
                }
            },
            physics: {
                forceAtlas2Based: {
                    gravitationalConstant: -40,
                    centralGravity: 0.005,
                    springLength: 200,
                    springConstant: 0.05,
                    avoidOverlap: 0
                },
                solver: 'forceAtlas2Based',
                timestep: 0.75,
                stabilization: {
                    enabled: true,
                    iterations: 1000,
                    updateInterval: 25
                }
            }
        }
        network = new vis.Network(container, data, options);
        network.on('stabilized', function(params) {
            network.fit({ animation: {duration: 500} });
        });
    }

    // set up buttons
    $('#reset').click(function() {
        draw();
        $('#submit').addClass('disabled');
    });

    $('#submit').click(function() {
        if ($(this).hasClass('disabled')) {
            return;
        }
        var endTime = new Date();

        // showing node IDs
        network.setOptions({
            nodes: {
                font: {
                    color: 'rgba(255, 255, 255, 1.0)',
                    strokeColor: 'rgba(0, 0, 0, 1.0)'
                }
            }
        });

        // send data
        firebase.auth().signInAnonymously().then(function(user) {
            var firebaseUid = user.uid;
            console.log('Signed in as ' + firebaseUid);

            // get network data
            var positions = network.getPositions();
            var nodes = Object.keys(positions).map(function (key) {
                positions[key].id = key;
                return positions[key];
            });
            nodes.forEach(function(elem, index) {
                elem.connections = network.getConnectedNodes(index);
            });

            var data = {
                firebase_uid: firebaseUid,
                start_time: startTime.toString(),
                end_time: endTime.toString(),
                duration: endTime.getTime() - startTime.getTime(),
                data: nodes
            };
            var userRef = firebase.database().ref(userId).push();
            userRef.set(data).then(function() {
                // success
                // save a network image
                var canvas = $('.vis-network canvas')[0];
                canvas.toBlob(function(blob) {
                    var storageRef = firebase.storage().ref();
                    var path = userId + '/' + userId + '_' + startTime.toString() + '.png';
                    storageRef.child(path).put(blob).then(function() {
                        hookWindow = false;
                        firebase.auth().currentUser.delete();
                        $('body').empty();
                        $('body').append($('<p>', {
                            text: 'Your response has been recorded. Thank you!',
                            id: 'end-instr'
                        }));
                    }, function() {
                        hookWindow = false;
                        firebase.auth().currentUser.delete();
                        alert('The response has been recorded, but the image failed to save. Please right click on the image to save it, or find the experimenter. Thank you!');
                    });
                });
            }, function() {
                alert('Error: cannot connect to Firebase');
            });

        }, function() {
            alert('Error: cannot connect to Firebase');
        });
    });

    draw();

    hookWindow = true;
    var startTime = new Date();
});
