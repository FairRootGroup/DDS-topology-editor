/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, PropTypes } from 'react';

import Task from './Task';

export default class TaskList extends Component {
    static propTypes = {
        properties: PropTypes.array.isRequired,
        requirements: PropTypes.array.isRequired,
        tasks: PropTypes.array.isRequired,
        onRemoveTask: PropTypes.func.isRequired,
        onEditTask: PropTypes.func.isRequired
    };

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
