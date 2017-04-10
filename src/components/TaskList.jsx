/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Task from './Task';

class TaskList extends Component {
    render() {
        var self = this;
        return (
            <div>
                {this.props.tasks.map(function(task, index) {
                    return <Task task={task}
                        properties={self.props.properties}
                        requirements={self.props.requirements}
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
}

TaskList.propTypes = {
    properties: PropTypes.array.isRequired,
    requirements: PropTypes.array.isRequired,
    tasks: PropTypes.array.isRequired,
    onRemoveTask: PropTypes.func.isRequired,
    onEditTask: PropTypes.func.isRequired
};

export default TaskList;
