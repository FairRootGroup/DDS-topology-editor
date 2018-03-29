/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import Requirement from './Requirement';

export default class RequirementList extends Component {
  static propTypes = {
    requirements: PropTypes.array.isRequired,
    onRemoveRequirement: PropTypes.func.isRequired,
    onEditRequirement: PropTypes.func.isRequired
  };

  render() {
    return (
      <Fragment>
        {this.props.requirements.map((requirement, i) => {
          return <Requirement requirement={requirement}
            requirements={this.props.requirements}
            onRemoveRequirement={this.props.onRemoveRequirement}
            onEditRequirement={this.props.onEditRequirement}
            key={i}
            elementKey={i}
          />;
        })}
      </Fragment>
    );
  }
}
