/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import Group from './Group';

export default class GroupList extends Component {
  static propTypes = {
    groups: PropTypes.array.isRequired,
    tasks: PropTypes.array.isRequired,
    collections: PropTypes.array.isRequired,
    onRemoveGroup: PropTypes.func.isRequired,
    onEditGroup: PropTypes.func.isRequired
  };

  render() {
    return (
      <Fragment>
        {this.props.groups.map((group, index) => {
          return <Group group={group}
            groups={this.props.groups}
            tasks={this.props.tasks}
            collections={this.props.collections}
            onRemoveGroup={this.props.onRemoveGroup}
            onEditGroup={this.props.onEditGroup}
            key={index}
            elementKey={index}
          />;
        })}
      </Fragment>
    );
  }
}
