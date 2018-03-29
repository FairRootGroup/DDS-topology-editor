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

export default class PropertyList extends Component {
  propTypes = {
    properties: PropTypes.array.isRequired,
    onRemoveProperty: PropTypes.func.isRequired,
    onEditProperty: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        {this.props.properties.map((property, index) => {
          return <Property property={property}
            onRemoveProperty={this.props.onRemoveProperty}
            onEditProperty={this.props.onEditProperty}
            key={index}
            elementKey={index}
          />;
        })}
      </div>
    );
  }
}
