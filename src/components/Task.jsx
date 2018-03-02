/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

class Task extends Component {
  constructor() {
    super();

    this.editTaskBtn;

    this.state = {
      bodyVisible: false,
      invalidInput: false,
      showDeleteModal: false
    };

    this.closeDeleteModal = this.closeDeleteModal.bind(this);
    this.openDeleteModal = this.openDeleteModal.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.hideEditTaskButton = this.hideEditTaskButton.bind(this);
    this.toggleBodyVisibility = this.toggleBodyVisibility.bind(this);
    this.handleEditTask = this.handleEditTask.bind(this);
    this.handleRemoveTask = this.handleRemoveTask.bind(this);
  }

  closeDeleteModal() {
    this.setState({ showDeleteModal: false });
  }

  openDeleteModal() {
    this.setState({ showDeleteModal: true });
  }

  handleInputChange(e) {
    e.preventDefault();
    this.setState({ invalidInput: false });
  }

  hideEditTaskButton(e) {
    e.preventDefault();
    this.setState({ invalidInput: false });
    this.editTaskBtn.hide();
  }

  toggleBodyVisibility() {
    this.setState({ bodyVisible: !this.state.bodyVisible });
  }

  handleEditTask(e) {
    e.preventDefault();
    var self = this;
    if (e.target[0].form[0].value === '' || e.target[0].form[1].value === '') {
      this.setState({
        invalidInput: true
      });
      return;
    }
    var otherTasks = this.props.tasks.filter(task => task.id !== self.props.task.id);
    if (otherTasks.some( task => task.id === e.target[0].form[0].value )) {
      this.setState({
        invalidInput: true
      });
      return;
    }

    var selectedProperties = [];
    this.props.properties.forEach(function (property, index) {
      if (e.target[0].form[index + 5].value === 'read') {
        selectedProperties.push({ id: property.id, access: 'read' });
      } else if (e.target[0].form[index + 5].value === 'write') {
        selectedProperties.push({ id: property.id, access: 'write' });
      } else if (e.target[0].form[index + 5].value === 'readwrite') {
        selectedProperties.push({ id: property.id, access: 'readwrite' });
      }
    });
    var updatedTask = {
      id: e.target[0].form[0].value,
      exe: {
        valueText: e.target[0].form[1].value
      },
      properties: selectedProperties
    };

    if (e.target[0].form['requirements'].value !== '') {
      updatedTask.requirement = e.target[0].form['requirements'].value;
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

  handleRemoveTask() {
    this.setState({ showDeleteModal: false });
    this.props.onRemoveTask(this.props.elementKey);
  }

  render() {
    var propertyCheckboxes = [];
    let requirementOptions = [];
    var requirement = '';
    var requirementContainer;
    var exeReachable;
    var envValue;
    var exeReachableCheckbox = false;
    var envReachableCheckbox = false;
    var envPresent = false;
    var self = this;

    this.props.properties.forEach(function (property, i) {
      var access = '';
      self.props.task.properties.forEach(function (currentProperty) {
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

    this.props.requirements.forEach(function (requirement, i) {
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

    if ('requirement' in this.props.task) {
      requirement = this.props.task.requirement;
      let el = this.props.requirements.find(requirement => requirement.id === self.props.task.requirement);
      requirementContainer =
        <div>
          <span className="requirement-child">
            &nbsp;
                        <span className="prop-access" title={(el.type === 'hostname') ? 'host name' : ''}>{(el.type === 'hostname') ? 'HN ' : ''}</span>
            <span className="prop-access" title={(el.type === 'wnname') ? 'SSH worker node name' : ''}>{(el.type === 'wnname') ? 'WN ' : ''}</span>
            {this.props.task.requirement}
          </span>
        </div>;
    }

    return (
      <div className="task">
        <h5>
          <span className="glyphicon glyphicon-tasks"></span>
          <span className="element-title" title={this.props.task.id}>{this.props.task.id}</span>
          <span
            className={this.state.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
            title={this.state.bodyVisible ? 'hide' : 'show'}
            onClick={this.toggleBodyVisibility}>
          </span>

          <span className="glyphicon glyphicon-trash" title="delete" onClick={this.openDeleteModal}></span>
          <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
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

          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.editTaskBtn = el} onClick={this.handleInputChange} overlay={
            <Popover className="add-cg-popover task-popover" title="edit task" id={this.props.task.id}>
              <form onSubmit={this.handleEditTask}>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>id</InputGroup.Addon>
                    <FormControl type="text" onFocus={this.handleInputChange} className={this.state.invalidInput ? 'invalid-input' : ''} defaultValue={this.props.task.id} />
                  </InputGroup>
                </FormGroup>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>exe</InputGroup.Addon>
                    <FormControl type="text" onFocus={this.handleInputChange} className={this.state.invalidInput ? 'mono invalid-input' : 'mono'} defaultValue={this.props.task.exe.valueText || ''} />
                  </InputGroup>
                </FormGroup>
                <Checkbox defaultChecked={exeReachableCheckbox}>exe reachable (optional)</Checkbox>
                <FormGroup>
                  <InputGroup>
                    <InputGroup.Addon>env</InputGroup.Addon>
                    <FormControl type="text" onFocus={this.handleInputChange} className="mono" defaultValue={envPresent ? this.props.task.env.valueText || '' : ''} />
                  </InputGroup>
                </FormGroup>
                <Checkbox defaultChecked={envReachableCheckbox}>env reachable (optional)</Checkbox>

                <p>Properties in this task:</p>
                {propertyCheckboxes}

                <p>Requirement for this task (optional):</p>
                <div className="ct-box ct-box-requirement">
                  <div className="element-name">Requirement</div>
                  <FormGroup>
                    <FormControl componentClass="select" name="requirements" placeholder="" defaultValue={requirement} className="accessSelect">
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
        <ul className={this.state.bodyVisible ? 'visible-container' : 'invisible-container'}>
          <li>
            <span><strong>exe:</strong></span>
            <input className="code" readOnly value={this.props.task.exe.valueText} title={this.props.task.exe.valueText}></input>
            {exeReachable}
          </li>
          {envValue}
          <div>
            {this.props.task.properties.map(function (property) {
              return (<span title={property.id} key={property.id}>
                &nbsp;
                                <span className="prop-access" title={(property.access === 'write') ? 'write' : ''}>{(property.access === 'write') ? 'W ' : ''}</span>
                <span className="prop-access" title={(property.access === 'read') ? 'read' : ''}>{(property.access === 'read') ? 'R ' : ''}</span>
                <span className="prop-access" title={(property.access === 'readwrite') ? 'read & write' : ''}>{(property.access === 'readwrite') ? 'RW ' : ''}</span>
                {property.id}
              </span>);
            })}
          </div>
          {requirementContainer}
        </ul>
      </div>
    );
  }
}

Task.propTypes = {
  task: PropTypes.object.isRequired,
  properties: PropTypes.array.isRequired,
  requirements: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  onRemoveTask: PropTypes.func.isRequired,
  onEditTask: PropTypes.func.isRequired,
  elementKey: PropTypes.number.isRequired
};

export default Task;
