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

@observer export default class Task extends Component {
  propTypes = {
    task: PropTypes.object.isRequired,
    properties: PropTypes.array.isRequired,
    requirements: PropTypes.array.isRequired,
    tasks: PropTypes.array.isRequired,
    onRemoveTask: PropTypes.func.isRequired,
    onEditTask: PropTypes.func.isRequired,
    elementKey: PropTypes.number.isRequired
  };

  @observable bodyVisible = false;
  @observable invalidInput = false;
  @observable deleteModalVisible = false;

  @action toggleBodyVisibility = () => { this.bodyVisible = !(this.bodyVisible); }
  @action setInputValidity = (valid) => { this.invalidInput = valid; }
  @action openDeleteModal = () => { this.deleteModalVisible = true; }
  @action closeDeleteModal = () => { this.deleteModalVisible = false; }

  editTaskBtn;

  shouldComponentUpdate = () => true

  hideEditTaskButton = (e) => {
    e.preventDefault();
    this.setInputValidity(false);
    this.editTaskBtn.hide();
  }

  handleEditTask = (e) => {
    e.preventDefault();
    if (e.target[0].form[0].value === '' || e.target[0].form[1].value === '') {
      this.setInputValidity(true);
      return;
    }
    var otherTasks = this.props.tasks.filter(task => task.id !== this.props.task.id);
    if (otherTasks.some( task => task.id === e.target[0].form[0].value )) {
      this.setInputValidity(true);
      return;
    }

    var selectedProperties = [];
    this.props.properties.forEach((property, i) => {
      if (e.target[0].form[i + 5].value === 'read') {
        selectedProperties.push({ id: property.id, access: 'read' });
      } else if (e.target[0].form[i + 5].value === 'write') {
        selectedProperties.push({ id: property.id, access: 'write' });
      } else if (e.target[0].form[i + 5].value === 'readwrite') {
        selectedProperties.push({ id: property.id, access: 'readwrite' });
      }
    });
    var updatedTask = {
      id: e.target[0].form[0].value,
      exe: {
        valueText: e.target[0].form[1].value
      },
      requirements: [],
      properties: selectedProperties
    };

    if (e.target[0].form['requirements'].value !== '') {
      updatedTask.requirements.push(e.target[0].form['requirements'].value);
    }

    if (e.target[0].form[2].checked === true) {
      updatedTask.exe.reachable = 'true';
    }

    if (e.target[0].form[3].value !== '') {
      updatedTask.env = {};
      updatedTask.env.valueText = e.target[0].form[3].value;
      if (e.target[0].form[4].checked == true) {
        updatedTask.env.reachable = 'true';
      }
    }

    this.editTaskBtn.hide();
    this.props.onEditTask(this.props.elementKey, updatedTask);
  }

  handleRemoveTask = () => {
    this.closeDeleteModal();
    this.props.onRemoveTask(this.props.elementKey);
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

    this.props.properties.forEach((property, i) => {
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

    this.props.requirements.forEach((requirement, i) => {
      requirementOptions.push(
        <option value={requirement.id} key={'option' + i}>{requirement.id}</option>
      );
    });

    if (this.props.task.exe.reachable) {
      if (this.props.task.exe.reachable === 'true') {
        exeReachable = <span className="reachable" title="executable is available on worker nodes">(reachable)</span>;
        exeReachableCheckbox = true;
      } else if (this.props.task.exe.reachable === 'false') {
        exeReachable = <span className="reachable" title="executable is not available on worker nodes">(unreachable)</span>;
      }
    }

    if (this.props.task.env) {
      envPresent = true;
      if (this.props.task.env.reachable) {
        if (this.props.task.env.reachable === 'true') {
          envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input><span className="reachable" title="executable is available on worker nodes">(reachable)</span></li>;
          envReachableCheckbox = true;
        } else if (this.props.task.env.reachable === 'false') {
          envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input><span className="reachable" title="executable is not available on worker nodes">(unreachable)</span></li>;
        }
      } else {
        envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input></li>;
      }
    }

    this.props.task.requirements.forEach((requirement, i) => { // TODO: handle multiple
      let el = this.props.requirements.find(r => r.id === requirement);
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

          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.editTaskBtn = el} onClick={() => this.setInputValidity(false)} overlay={
            <Popover className="add-cg-popover task-popover" title="edit task" id={this.props.task.id}>
              <form onSubmit={this.handleEditTask}>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>id</InputGroup.Addon>
                    <FormControl type="text" onFocus={() => this.setInputValidity(false)} className={this.invalidInput ? 'invalid-input' : ''} defaultValue={this.props.task.id} />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>exe</InputGroup.Addon>
                    <FormControl type="text" onFocus={() => this.setInputValidity(false)} className={this.invalidInput ? 'mono invalid-input' : 'mono'} defaultValue={this.props.task.exe.valueText || ''} />
                  </InputGroup>
                </FormGroup>
                <Checkbox defaultChecked={exeReachableCheckbox}>exe reachable (optional)</Checkbox>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>env</InputGroup.Addon>
                    <FormControl type="text" onFocus={() => this.setInputValidity(false)} className="mono" defaultValue={envPresent ? this.props.task.env.valueText || '' : ''} />
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
            <input className="code" readOnly value={this.props.task.exe.valueText} title={this.props.task.exe.valueText}></input>
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
