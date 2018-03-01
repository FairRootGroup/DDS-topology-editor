/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Group from './Group';

class GroupList extends Component {
  render() {
    var self = this;
    return (
      <div>
        {this.props.groups.map(function (group, index) {
          return <Group group={group}
            groups={self.props.groups}
            tasks={self.props.tasks}
            collections={self.props.collections}
            onRemoveGroup={self.props.onRemoveGroup}
            onEditGroup={self.props.onEditGroup}
            key={index}
            elementKey={index}
          />;
        })}
      </div>
    );
  }
}

GroupList.propTypes = {
  groups: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  collections: PropTypes.array.isRequired,
  onRemoveGroup: PropTypes.func.isRequired,
  onEditGroup: PropTypes.func.isRequired
};

export default GroupList;
