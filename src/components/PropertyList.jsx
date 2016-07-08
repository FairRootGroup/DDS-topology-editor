/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, PropTypes } from 'react';

import Property from './Property';

export default class PropertyList extends Component {
    static propTypes= {
        properties: PropTypes.array.isRequired,
        onRemoveProperty: PropTypes.func.isRequired,
        onEditProperty: PropTypes.func.isRequired
    };

    render() {
        var self = this;
        return (
            <div>
                {this.props.properties.map(function(property, index) {
                    return <Property property={property}
                        onRemoveProperty={self.props.onRemoveProperty}
                        onEditProperty={self.props.onEditProperty}
                        key={index}
                        elementKey={index}
                        />;
                })}
            </div>
        );
    }
}
