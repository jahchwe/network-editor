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
    var nodes = null;
    var edges = null;
    var network = null;
    var data = {
        nodes: [{id: 0, label: '1230'}, {id: 1, label: '1123'}, {id: 2, label: '1232'},
        {id: 10, label: '0'}, {id: 11, label: '1'}, {id: 12, label: '2'},
        {id: 20, label: '0'}, {id: 21, label: '1'}, {id: 22, label: '2'}],
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
                    if (data.from != data.to) {
                        callback(data);
                    }
                    $('#submit').removeClass('disabled');
                }
            }
        }
        network = new vis.Network(container, data, options);
    }

    // set up buttons
    $('#reset').click(draw);
    $('#submit').click(function() {

    });

    draw();
});