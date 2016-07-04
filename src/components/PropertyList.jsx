/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React from 'react';

import Property from './Property';

var PropertyList = React.createClass({
    propTypes: {
        properties: React.PropTypes.array.isRequired,
        onRemoveProperty: React.PropTypes.func.isRequired,
        onEditProperty: React.PropTypes.func.isRequired
    },

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
});

export default PropertyList;
