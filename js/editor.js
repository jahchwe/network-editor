var hookWindow = false;

$(function(){
    'use strict';

    // prevent closing window
    window.onbeforeunload = function() {
        if (hookWindow) {
            return 'Do you want to leave this page? Your progress will not be saved.';
        }
    }

    // construct network
    var IMG_DIR = 'img/'
    var nodes = null;
    var edges = null;
    var network = null;
    var data = {
        nodes: [{id: 0, image: IMG_DIR + 'F000.png', shape: 'image'},
                {id: 1, image: IMG_DIR + 'F001.png', shape: 'image'},
                {id: 2, image: IMG_DIR + 'F002.png', shape: 'image'}],
        edges: []
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
                    if (same_nodes || !connected) {
                        callback(data);  // connect
                    } else {
                        // forbid connecting two nodes that are already connected
                        callback(null);
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
    }

    // set up buttons
    $('#reset').click(function() {
        draw();
        $('#submit').addClass('disabled');
    });
    $('#submit').click(function() {

        hookWindow = false;
    });

    draw();

    hookWindow = true;
    var startTime = (new Date()).toUTCString();
});
