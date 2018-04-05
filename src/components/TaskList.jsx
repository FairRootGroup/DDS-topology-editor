/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

import Task from './Task';

import store, { MTask } from '../Store';

@observer export default class TaskList extends Component {
  static propTypes = {
    propertyCheckboxes: PropTypes.array.isRequired,
    requirementOptions: PropTypes.array.isRequired
  };

  @observable inputValid = false;
  @observable tasksVisible = true;

  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action toggleTasksVisibility = () => { this.tasksVisible = !this.tasksVisible; }

  shouldComponentUpdate = () => true

  addTaskBtn;

  handleAddTask = (e) => {
    e.preventDefault();

    // cancel if ID or exe is empty, or if ID already exists
    if (e.target[0].form[0].value === '' || e.target[0].form[1].value === '' || store.hasTask(e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const task = new MTask;
    task.id = e.target[0].form[0].value;

    task.exeValue = e.target[0].form[1].value;
    if (e.target[0].form[2].checked) {
      task.exeReachable = 'true';
    }

    if (e.target[0].form[3].value !== '') {
      task.envValue = e.target[0].form[3].value;
      if (e.target[0].form[4].checked) {
        task.envReachable = 'true';
      }
    }

    store.properties.forEach((p, i) => {
      if (e.target[0].form[i + 5].value === 'read') {
        task.properties.push({ id: p.id, access: 'read' });
      } else if (e.target[0].form[i + 5].value === 'write') {
        task.properties.push({ id: p.id, access: 'write' });
      } else if (e.target[0].form[i + 5].value === 'readwrite') {
        task.properties.push({ id: p.id, access: 'readwrite' });
      }
    });

    if (e.target[0].form['requirements'].value !== '') { // TODO: handle multiple
      task.requirements.push(e.target[0].form['requirements'].value);
    }

    store.addTask(task);
    this.addTaskBtn.hide();
  }

  render() {
    return (
      <Fragment>
        <li className="list-group-item tasks-header">
          tasks
          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addTaskBtn = el} onClick={() => this.setInputValidity(true)} overlay={
            <Popover className="add-cg-popover task-popover" title="add new task" id="addnewtask">
              <form onSubmit={this.handleAddTask}>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>id&nbsp;</InputGroup.Addon>
                    <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>exe</InputGroup.Addon>
                    <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? 'mono' : 'mono invalid-input'} />
                  </InputGroup>
                </FormGroup>
                <Checkbox>exe reachable (optional)</Checkbox>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>env</InputGroup.Addon>
                    <FormControl type="text" className="mono" />
                  </InputGroup>
                </FormGroup>
                <Checkbox>env reachable (optional)</Checkbox>

                <p>Properties in this task:</p>
                {this.props.propertyCheckboxes}

                <p>Requirement for this task (optional):</p>
                <div className="ct-box ct-box-requirement">
                  <div className="element-name">Requirement</div>
                  <FormGroup>
                    <FormControl componentClass="select" name="requirements" placeholder="" defaultValue="" className="accessSelect">
                      <option value="">-</option>
                      {this.props.requirementOptions}
                    </FormControl>
                  </FormGroup>
                </div>

                <div className="row">
                  <div className="col-xs-12">
                    <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => { this.setInputValidity(true); this.addTaskBtn.hide(); }}>cancel</Button>
                  </div>
                </div>
              </form>
            </Popover>
          }>
            <span className="glyphicon glyphicon-plus add-task-btn" title="add new task"></span>
          </OverlayTrigger>
          <span
            className={this.tasksVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
            title={this.tasksVisible ? 'hide' : 'show'}
            onClick={this.toggleTasksVisibility}>
          </span>
        </li>
        <li className={this.tasksVisible ? 'visible-container list-group-item tasks' : 'invisible-container list-group-item tasks'}>
          {store.tasks.map((t, i) => {
            return <Task task={t} key={i} index={i} />;
          })}
        </li>
      </Fragment>
    );
  }
}
