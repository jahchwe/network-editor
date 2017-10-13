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
                addEdge: function (data, callback) {
                    if (data.from != data.to  && network.getConnectedNodes(data.from).indexOf(data.to) == -1) {
                        // not the same node and the two nodes are not connected
                        callback(data);
                        $('#submit').removeClass('disabled');
                    }
                }
            },
            edges: {
                color: {
                    color: 'black',
                    highlight:'#f0ad4e'
                },
                width: 2,
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

    });

    draw();

    hookWindow = true;
    var startTime = (new Date()).toUTCString();
});
