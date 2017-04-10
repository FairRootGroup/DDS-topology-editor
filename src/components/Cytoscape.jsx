import React, { Component } from 'react';
import jquery from 'jquery';
import cytoscape from 'cytoscape';

import graphConfig from './graphConfig';

let cyStyle = {
    height: '400px',
    display: 'block',
    border: '1px solid silver'
};

    // example how to register cytoscape plugin/jquery
// cytoscape.registerJquery(jquery);
// gridGuide(cytoscape, jquery);
// window.$ = window.jQuery = jquery;

class Cytoscape extends Component {
    cy = null;

    componentDidMount() {
        graphConfig.container = this.refs.cyelement;
        let cy = cytoscape(graphConfig);

        this.cy = cy;
        cy.json({ elements: this.props.elements});
        cy.layout({
            name: 'grid',

            fit: true, // whether to fit the viewport to the graph
            padding: 30, // padding used on fit
            avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
            avoidOverlapPadding: 10, // extra spacing around nodes when avoidOverlap: true
            condense: false, // uses all available space on false, uses minimal space on true
            rows: undefined, // force num of rows in the grid
            cols: undefined, // force num of columns in the grid
            position: function( node ){}, // returns { row, col } for element
            sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
        });
    }

    shouldComponentUpdate() {
        return false;
    }

    componentWillReceiveProps(nextProps) {
        this.cy.json(nextProps);
    }

    componentWillUnmount() {
        this.cy.destroy();
    }

    getCy() {
        return this.cy;
    }

    render() {
        return <div style={cyStyle} ref="cyelement" />
    }
}

export default Cytoscape;