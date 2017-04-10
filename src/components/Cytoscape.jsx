import React, { Component } from 'react';
import cytoscape from 'cytoscape';

let cyStyle = {
    height: '400px',
    display: 'block',
    border: '1px solid silver'
};

export default class Cytoscape extends Component {
    cy = null;

    componentDidMount() {
        let conf = {}
        conf.container = this.refs.cyelement;
        let cy = cytoscape(conf);

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
