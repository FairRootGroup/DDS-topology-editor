/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

import store, { MTask } from '../Store';

@observer export default class Task extends Component {
  static propTypes = {
    task: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
  };

  @observable bodyVisible = false;
  @observable inputValid = true;
  @observable deleteModalVisible = false;

  @action toggleBodyVisibility = () => { this.bodyVisible = !(this.bodyVisible); }
  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action openDeleteModal = () => { this.deleteModalVisible = true; }
  @action closeDeleteModal = () => { this.deleteModalVisible = false; }

  editTaskBtn;

  shouldComponentUpdate = () => true

  hideEditTaskButton = (e) => {
    e.preventDefault();
    this.setInputValidity(true);
    this.editTaskBtn.hide();
  }

  handleEditTask = (e) => {
    e.preventDefault();

    // cancel if ID or exe is empty
    if (e.target[0].form[0].value === '' || e.target[0].form[1].value === '') {
      this.setInputValidity(false);
      return;
    }

    // cancel if ID already exists (except its own ID)
    const otherTasks = store.tasks.filter(t => t.id !== this.props.task.id);
    if (otherTasks.some(t => t.id === e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const task = new MTask;
    task.id = e.target[0].form[0].value;
    task.exeValue = e.target[0].form[1].value;

    if (e.target[0].form[2].checked === true) {
      task.exeReachable = 'true';
    }

    if (e.target[0].form[3].value !== '') {
      task.envValue = e.target[0].form[3].value;
      if (e.target[0].form[4].checked == true) {
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

    if (e.target[0].form['requirements'].value !== '') { // TODO: use this 'name' approach to replace dumb indexes everywhere
      task.requirements.push(e.target[0].form['requirements'].value);
    }

    store.editTask(this.props.index, task);

    this.editTaskBtn.hide();
  }

  handleRemoveTask = () => {
    store.removeTask(this.props.index);
    this.closeDeleteModal();
  }

  render() {
    var propertyCheckboxes = [];
    let requirementOptions = [];
    var currentRequirement = '';
    var requirementContainers = [];
    var exeReachable;
    var envValue;
    var exeReachableCheckbox = false;
    var envReachableCheckbox = false;
    var envPresent = false;

    store.properties.forEach((property, i) => {
      var access = '';
      this.props.task.properties.forEach(currentProperty => {
        if (property.id === currentProperty.id) {
          access = currentProperty.access;
        }
      });
      propertyCheckboxes.push(
        <div className="ct-box ct-box-property" key={'t-box' + i}>
          <div className="element-name" title={property.id}>{property.id}</div>
          <FormGroup>
            <FormControl componentClass="select" placeholder="" defaultValue={access} className="accessSelect">
              <option value="">-</option>
              <option value="read">read</option>
              <option value="write">write</option>
              <option value="readwrite">readwrite</option>
            </FormControl>
          </FormGroup>
        </div>
      );
    });

    store.requirements.forEach((requirement, i) => {
      requirementOptions.push(
        <option value={requirement.id} key={'option' + i}>{requirement.id}</option>
      );
    });

    if (this.props.task.exeReachable) {
      if (this.props.task.exeReachable === 'true') {
        exeReachable = <span className="reachable" title="executable is available on worker nodes">(reachable)</span>;
        exeReachableCheckbox = true;
      } else if (this.props.task.exeReachable === 'false') {
        exeReachable = <span className="reachable" title="executable is not available on worker nodes">(unreachable)</span>;
      }
    }

    if (this.props.task.env) {
      envPresent = true;
      if (this.props.task.envReachable) {
        if (this.props.task.envReachable === 'true') {
          envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.envValue}></input><span className="reachable" title="executable is available on worker nodes">(reachable)</span></li>;
          envReachableCheckbox = true;
        } else if (this.props.task.envReachable === 'false') {
          envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.envValue}></input><span className="reachable" title="executable is not available on worker nodes">(unreachable)</span></li>;
        }
      } else {
        envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.envValue}></input></li>;
      }
    }

    this.props.task.requirements.forEach((requirement, i) => { // TODO: handle multiple
      let el = store.requirements.find(r => r.id === requirement);
      if (el !== undefined)
      {
        currentRequirement = requirement;
        requirementContainers.push(
          <div key={'requirement' + i}>
            <span className="requirement-child">
              &nbsp;
              <span className="prop-access" title={(el.type === 'hostname') ? 'host name' : ''}>{(el.type === 'hostname') ? 'HN ' : ''}</span>
              <span className="prop-access" title={(el.type === 'wnname') ? 'SSH worker node name' : ''}>{(el.type === 'wnname') ? 'WN ' : ''}</span>
              {requirement}
            </span>
          </div>
        );
      }
    });

    return (
      <div className="task">
        <h5>
          <span className="glyphicon glyphicon-tasks"></span>
          <span className="element-title" title={this.props.task.id}>{this.props.task.id}</span>
          <span
            className={this.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
            title={this.bodyVisible ? 'hide' : 'show'}
            onClick={this.toggleBodyVisibility}>
          </span>

          <span className="glyphicon glyphicon-trash" title="delete" onClick={this.openDeleteModal}></span>
          <Modal show={this.deleteModalVisible} onHide={this.closeDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Delete <strong>{this.props.task.id}</strong>?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete the task <strong>{this.props.task.id}?</strong></p>
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="danger" onClick={this.handleRemoveTask}>Delete</Button>
              <Button onClick={this.closeDeleteModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>

          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.editTaskBtn = el} onClick={() => this.setInputValidity(true)} overlay={
            <Popover className="add-cg-popover task-popover" title="edit task" id={this.props.task.id}>
              <form onSubmit={this.handleEditTask}>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>id</InputGroup.Addon>
                    <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} defaultValue={this.props.task.id} />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>exe</InputGroup.Addon>
                    <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? 'mono' : 'mono invalid-input'} defaultValue={this.props.task.exeValue || ''} />
                  </InputGroup>
                </FormGroup>
                <Checkbox defaultChecked={exeReachableCheckbox}>exe reachable (optional)</Checkbox>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>env</InputGroup.Addon>
                    <FormControl type="text" onFocus={() => this.setInputValidity(true)} className="mono" defaultValue={envPresent ? this.props.task.envValue || '' : ''} />
                  </InputGroup>
                </FormGroup>
                <Checkbox defaultChecked={envReachableCheckbox}>env reachable (optional)</Checkbox>

                <p>Properties in this task:</p>
                {propertyCheckboxes}

                <p>Requirement for this task (optional):</p>
                <div className="ct-box ct-box-requirement">
                  <div className="element-name">Requirement</div>
                  <FormGroup>
                    <FormControl componentClass="select" name="requirements" placeholder="" defaultValue={currentRequirement} className="accessSelect">
                      <option value="">-</option>
                      {requirementOptions}
                    </FormControl>
                  </FormGroup>
                </div>

                <div className="row">
                  <div className="col-xs-12">
                    <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">save</Button>
                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditTaskButton}>cancel</Button>
                  </div>
                </div>
              </form>
            </Popover>
          }>
            <span className="glyphicon glyphicon-edit" title="edit task"></span>
          </OverlayTrigger>
        </h5>
        <ul className={this.bodyVisible ? 'visible-container' : 'invisible-container'}>
          <li>
            <span><strong>exe:</strong></span>
            <input className="code" readOnly value={this.props.task.exeValue} title={this.props.task.exeValue}></input>
            {exeReachable}
          </li>
          {envValue}
          <div>
            {this.props.task.properties.map(property => {
              return (<span title={property.id} key={property.id}>
                &nbsp;
                <span className="prop-access" title={(property.access === 'write') ? 'write' : ''}>{(property.access === 'write') ? 'W ' : ''}</span>
                <span className="prop-access" title={(property.access === 'read') ? 'read' : ''}>{(property.access === 'read') ? 'R ' : ''}</span>
                <span className="prop-access" title={(property.access === 'readwrite') ? 'read & write' : ''}>{(property.access === 'readwrite') ? 'RW ' : ''}</span>
                {property.id}
              </span>);
            })}
          </div>
          {requirementContainers}
        </ul>
      </div>
    );
  }
}
