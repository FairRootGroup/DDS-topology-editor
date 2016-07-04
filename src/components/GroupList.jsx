/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React from 'react';

import Group from './Group';

var GroupList = React.createClass({
    propTypes: {
        groups: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        collections: React.PropTypes.array.isRequired,
        onRemoveGroup: React.PropTypes.func.isRequired,
        onEditGroup: React.PropTypes.func.isRequired
    },

    render() {
        var self = this;
        return (
            <div>
                {this.props.groups.map(function(group, index) {
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
});

export default GroupList;
