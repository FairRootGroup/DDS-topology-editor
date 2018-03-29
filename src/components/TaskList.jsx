/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

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
    return (
      <Fragment>
        {this.props.tasks.map((task, index) => {
          return <Task task={task}
            properties={this.props.properties}
            requirements={this.props.requirements}
            tasks={this.props.tasks}
            onRemoveTask={this.props.onRemoveTask}
            onEditTask={this.props.onEditTask}
            key={index}
            elementKey={index}
          />;
        })}
      </Fragment>
    );
  }
}
