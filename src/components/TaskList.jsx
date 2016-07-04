/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React from 'react';

import Task from './Task';

var TaskList = React.createClass({
    propTypes: {
        properties: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        onRemoveTask: React.PropTypes.func.isRequired,
        onEditTask: React.PropTypes.func.isRequired
    },

    render() {
        var self = this;
        return (
            <div>
                {this.props.tasks.map(function(task, index) {
                    return <Task task={task}
                        properties={self.props.properties}
                        tasks={self.props.tasks}
                        onRemoveTask={self.props.onRemoveTask}
                        onEditTask={self.props.onEditTask}
                        key={index}
                        elementKey={index}
                        />;
                })}
            </div>
        );
    }
});

export default TaskList;
