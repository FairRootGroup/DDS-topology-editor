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
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

@observer export default class Collection extends Component {
  static propTypes = {
    collection: PropTypes.object.isRequired,
    requirements: PropTypes.array.isRequired,
    collections: PropTypes.array.isRequired,
    tasks: PropTypes.array.isRequired,
    onRemoveCollection: PropTypes.func.isRequired,
    onEditCollection: PropTypes.func.isRequired,
    elementKey: PropTypes.number.isRequired
  };

  @observable bodyVisible = false;
  @observable inputValid = true;
  @observable deleteModalVisible = false;

  @action toggleBodyVisibility = () => { this.bodyVisible = !(this.bodyVisible); }
  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action openDeleteModal = () => { this.deleteModalVisible = true; }
  @action closeDeleteModal = () => { this.deleteModalVisible = false; }

  editCollectionBtn;

  shouldComponentUpdate = () => true

  hideEditCollectionButton = (e) => {
    e.preventDefault();
    this.setInputValidity(true);
    this.editCollectionBtn.hide();
  }

  handleEditCollection = (e) => {
    e.preventDefault();
    var self = this;
    if (e.target[0].form[0].value === '') {
      this.setInputValidity(false);
      return;
    }

    var otherCollections = this.props.collections.filter(collection => collection.id !== self.props.collection.id);

    if (otherCollections.some(collection => collection.id === e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    var selectedTasks = [];
    this.props.tasks.forEach((task, index) => {
      for (var i = 0; i < e.target[0].form[index + 1].value; i++) {
        selectedTasks.push(task.id);
      }
    });
    var updatedCollection = {
      id: e.target[0].form[0].value,
      tasks: selectedTasks,
      requirements: []
    };

    if (e.target[0].form['requirements'].value !== '') {
      updatedCollection.requirements.push(e.target[0].form['requirements'].value);
    }

    this.editCollectionBtn.hide();
    this.props.onEditCollection(this.props.elementKey, updatedCollection);
  }

  handleRemoveCollection = () => {
    this.closeDeleteModal();
    this.props.onRemoveCollection(this.props.elementKey);
  }

  render() {
    var TaskCheckboxes = [];
    let requirementOptions = [];
    let currentRequirement = '';
    let requirementContainers = [];

    this.props.tasks.forEach((task, i) => {
      var count = 0;
      this.props.collection.tasks.forEach(currentTask => {
        if (task.id === currentTask) {
          count++;
        }
      });
      TaskCheckboxes.push(
        <div className="ct-box ct-box-task" key={'t-box' + i}>
          <div className="element-name" title={task.id}>{task.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
          </FormGroup>
        </div>
      );
    });

    this.props.requirements.forEach((requirement, i) => {
      requirementOptions.push(
        <option value={requirement.id} key={'option' + i}>{requirement.id}</option>
      );
    });

    this.props.collection.requirements.forEach((requirement, i) => {
      let el = this.props.requirements.find(r => r.id === requirement);
      if (el !== undefined) {
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
      <div className="collection">
        <h5>
          <span className="glyphicon glyphicon-tasks"></span>
          {this.props.collection.id}
          <span
            className={this.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
            title={this.bodyVisible ? 'hide' : 'show'}
            onClick={this.toggleBodyVisibility}>
          </span>

          <span className="glyphicon glyphicon-trash" title="remove" onClick={this.openDeleteModal}></span>
          <Modal show={this.deleteModalVisible} onHide={this.closeDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Delete <strong>{this.props.collection.id}</strong>?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete the collection <strong>{this.props.collection.id}?</strong></p>
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="danger" onClick={this.handleRemoveCollection}>Delete</Button>
              <Button onClick={this.closeDeleteModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>

          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.editCollectionBtn = el} onClick={() => this.setInputValidity(true)} overlay={
            <Popover className="add-cg-popover collection-popover" title="edit collection" id={this.props.collection.id}>
              <form onSubmit={this.handleEditCollection}>
                <InputGroup>
                  <InputGroup.Addon>id</InputGroup.Addon>
                  <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} defaultValue={this.props.collection.id} />
                </InputGroup>

                <p>Tasks in this collection:</p>
                {TaskCheckboxes}

                <p>Requirement for this collection (optional):</p>
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
                    <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">edit</Button>
                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditCollectionButton}>cancel</Button>
                  </div>
                </div>
              </form>
            </Popover>
          }>
            <span className="glyphicon glyphicon-edit" title="edit"></span>
          </OverlayTrigger>
        </h5>
        <div className={this.bodyVisible ? 'visible-container' : 'invisible-container'}>
          {this.props.collection.tasks.map((task, i) => {
            return <span key={i}>{task}</span>;
          })}
          {requirementContainers}
        </div>
      </div>
    );
  }
}
