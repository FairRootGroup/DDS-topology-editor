/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Property from './Property';

class PropertyList extends Component {
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

PropertyList.propTypes= {
    properties: PropTypes.array.isRequired,
    onRemoveProperty: PropTypes.func.isRequired,
    onEditProperty: PropTypes.func.isRequired
};

export default PropertyList;
