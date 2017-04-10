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
        cy.json({elements: this.props.elements});
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