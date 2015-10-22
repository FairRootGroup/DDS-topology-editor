/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React from 'react';
import ReactDOM from 'react-dom';
import joint from 'jointjs';
import $ from 'jquery';

import { initiateDragging } from '../util';
import graphDraw from '../topology';

var TopologyGraph = React.createClass({
    propTypes: {
        tasks: React.PropTypes.array.isRequired,
        collections: React.PropTypes.array.isRequired,
        main: React.PropTypes.object.isRequired,
        interactive: React.PropTypes.bool.isRequired,
        onPaperChange: React.PropTypes.func.isRequired
    },

    getInitialState() {
        return {
            graph: new joint.dia.Graph,
            paper: null,
            oldHistTasks: "",
            oldHistCollections: "",
            oldHistGroups: "",
            oldInteractive: false,
            visibleProperties: {}
        };
    },

    render() {
        return <div></div>;
    },

    componentDidMount() {
        this.state.paper = new joint.dia.Paper({
            el: ReactDOM.findDOMNode(this),
            width: 100,
            height: 100,
            model: this.state.graph,
            gridSize: 1,
            interactive: this.props.interactive
        });
        /* event handlers */

        // deleting and redrawing links when in interactive
        this.state.paper.on('cell:pointerdown', this.deleteLinks);
        this.state.paper.on('cell:pointerup', this.redrawLinks);
        this.state.paper.on('blank:pointerdown', initiateDragging);

        this.state.graph.on('change:position', this.changePosition);

        this.state.paper.on('blank:pointerdown', initiateDragging);
        this.state.paper.fitToContent();

        var arrowMarker = joint.V('marker', {
            id: 'arrowMarker',
            viewBox: '0 0 10 10',
            refX: 1,
            refY: 5,
            markerUnits: 'strokeWidth',
            orient: 'auto',
            markerWidth: 4,
            markerHeight:4
        });
        var polyline = joint.V('polyline', {
            points: '0,0 10,5 0,10 1,5',
            fill: 'darkblue'
        })
        arrowMarker.prepend(polyline);
        joint.V(this.state.paper.viewport).append(arrowMarker);
        this.state.oldHistTasks = JSON.stringify(this.props.tasks);
        this.state.oldHistCollections = JSON.stringify(this.props.collections);
        this.state.oldHistGroups = JSON.stringify(this.props.main.groups);
        this.state.interactive = this.props.interactive;
        this.props.onPaperChange(this.state.paper);
    },

    deleteLinks(cellView, evt, x, y) {
        var cell = cellView.model;
        var cellQueue = [];
        cellQueue.push(cell.getEmbeddedCells({deep: true}));
        cellQueue[0].push(cell);
        for (var i = 0; i < cellQueue[0].length; i ++) {
            if (cellQueue[0][i].get('properties') !== undefined) {
                var cellOrigin = cellQueue[0][i].getBBox().origin();
                var cellCorner = cellQueue[0][i].getBBox().corner();
                var lines = joint.V(this.state.paper.viewport).find('line');
                for (var j = 0; j < lines.length; j++) {
                    if (((lines[j].node.x1.baseVal.value >= cellOrigin.x && lines[j].node.x1.baseVal.value <= cellCorner.x)
                        && (lines[j].node.y1.baseVal.value >= cellOrigin.y && lines[j].node.y1.baseVal.value <= cellCorner.y))
                        || ((lines[j].node.x2.baseVal.value >= cellOrigin.x && lines[j].node.x2.baseVal.value <= cellCorner.x)
                        && (lines[j].node.y2.baseVal.value >= cellOrigin.y - 6 && lines[j].node.y2.baseVal.value <= cellCorner.y + 6))) {
                        if (joint.V(lines[j]).attr('visibility') == 'hidden') {
                            this.state.visibleProperties[joint.V(lines[j]).attr('title')] = false;
                        } else {
                            this.state.visibleProperties[joint.V(lines[j]).attr('title')] = true;
                        }
                        lines[j].remove();
                    }
                }
            }
        }
    },

    redrawLinks(cellView, evt, x, y) {
        var cell = cellView.model;
        var cellQueue = [];
        cellQueue.push(cell.getEmbeddedCells({deep: true}));
        cellQueue[0].push(cell);
        for (var i = 0; i < cellQueue[0].length; i ++) {
            if (cellQueue[0][i].get('properties') !== undefined) {
                var links = graphDraw.mapLinksForTask(this.state.graph, cellQueue[0][i]);
                links.forEach(function (link, i) {
                    if (this.state.visibleProperties[link.attr('title')] === false) {
                        link.attr('visibility', 'hidden');
                    }
                    joint.V(this.state.paper.viewport).append(link);
                }.bind(this));
            }
        }
        this.state.visibleProperties = {};
        this.state.paper.fitToContent();
    },

    changePosition(cell) {
        var parentId = cell.get('parent');
        if (!parentId) return;

        var parent = this.state.graph.getCell(parentId);
        var parentBbox = parent.getBBox();
        var cellBbox = cell.getBBox();

        if ((parentBbox.containsPoint(cellBbox.origin()) &&
        parentBbox.containsPoint(cellBbox.topRight()) &&
        parentBbox.containsPoint(cellBbox.corner()) &&
        parentBbox.containsPoint(cellBbox.bottomLeft())) ||
        cell.get('angle') === -90) {

            // All the four corners of the child are inside
            // the parent area or the cell is a rotated title
            return;
        }

        // Revert the child position.
        cell.set('position', cell.previous('position'));
    },

    shouldComponentUpdate(nextProps) {
        var noDataChange = ( JSON.stringify(nextProps.main) === JSON.stringify(this.props.main) 
                && JSON.stringify(nextProps.tasks) === this.state.oldHistTasks
                && JSON.stringify(nextProps.collections) === this.state.oldHistCollections 
                && JSON.stringify(nextProps.main.groups) === this.state.oldHistGroups
                && this.props.interactive === nextProps.interactive
            )
        if (noDataChange) {
            return false;
        }
        this.state.oldHistTasks = JSON.stringify(nextProps.tasks);
        this.state.oldHistCollections = JSON.stringify(nextProps.collections);
        this.state.oldHistGroups = JSON.stringify(nextProps.main.groups);
        this.state.oldInteractive = nextProps.interactive;

        this.state.paper.options.interactive = nextProps.interactive;
        var previousLines = joint.V(this.state.paper.viewport).find('line');
        for(var i = 0; i < previousLines.length; i ++) {
            previousLines[i].remove();
        }
        this.state.graph.getElements().forEach( function (element) {
            element.remove();
        });
        var visCollections = $.extend(true, [], nextProps.collections);
        visCollections.forEach( (function (collection, i) {
            collection.tasks = [];
            collection.tasks = nextProps.collections[i].tasks.map( (function (collectionTask) {
                return nextProps.tasks.filter( function (task) {
                    if (collectionTask === task.id) {
                        return task;
                    }
                })[0];
            }).bind(this));
        }).bind(this));
        var visMain = $.extend(true, {}, nextProps.main);
        visMain.tasks = nextProps.main.tasks.map( (function (mainTask, i) {
            return nextProps.tasks.filter( function (task) {
                if (mainTask === task.id) {
                    return $.extend(true, {},task);
                }
            })[0];
        }).bind(this));
        visMain.collections = nextProps.main.collections.map( (function (mainCollection, i) {
            return visCollections.filter( function (collection) {
                if (mainCollection === collection.id) {
                    return $.extend(true, {}, collection);
                }
            })[0];
        }).bind(this));
        visMain.groups.forEach( (function (group, i) {
            group.collections = nextProps.main.groups[i].collections.map( (function (groupCollection, i) {
                return visCollections.filter( function (collection) {
                    if (groupCollection === collection.id) {
                        return $.extend(true, {}, collection);
                    }
                })[0];
            }).bind(this));
            group.tasks = nextProps.main.groups[i].tasks.map( (function (groupTask, i) {
                return nextProps.tasks.filter( function (task) {
                    if (groupTask === task.id) {
                        return $.extend(true, {}, task);
                    }
                })[0];
            }).bind(this));
            group.multiplicity = nextProps.main.groups[i].n;
        }).bind(this));
        graphDraw.mapTemplate(visMain, this.state.graph);
        var links = graphDraw.mapLinks(this.state.graph, this.state.paper);
        links.forEach( function (link, i) {
            joint.V(this.state.paper.viewport).append(link);
        }.bind(this));

        this.state.paper.fitToContent();
        this.props.onPaperChange(this.state.paper);
        return false;
    }
});

export default TopologyGraph;
