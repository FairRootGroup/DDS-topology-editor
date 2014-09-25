/** @jsx React.DOM */

/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var MainEditor = React.createClass({
    render: function() {
        return (
            <MainTask tasks={this.props.tasks} />
        );
    }
});

var MainTask = React.createClass({
    componentDidMount: function() {
        var topologyNodes = this.props.tasks.map(function(task, index) {
            return {
                name: task.name,
                width: 60,
                height: 40
            };
        });
        var topologyLinks = [];
        var topologyGroups = [];

        var width = 500;
        var height = 500;

        var color = d3.scale.category20();

        var d3cola = cola.d3adaptor()
            .linkDistance(100)
            .avoidOverlaps(true)
            .handleDisconnected(false)
            .size([width, height]);

        var svg = d3.select('div#main-editor-body').append('svg')
            .attr('width', width)
            .attr('height', height);

        d3cola
            .nodes(topologyNodes)
            .links(topologyLinks)
            .groups(topologyGroups);

    },

    render: function() {
        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <p className="panel-title">Topology</p>
                </div>
                <div id="main-editor-body" className="panel-body">
                </div>
            </div>
        );
    }
});
