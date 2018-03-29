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

@observer export default class Group extends Component {
  propTypes = {
    group: PropTypes.object.isRequired,
    groups: PropTypes.array.isRequired,
    tasks: PropTypes.array.isRequired,
    collections: PropTypes.array.isRequired,
    onRemoveGroup: PropTypes.func.isRequired,
    onEditGroup: PropTypes.func.isRequired,
    elementKey: PropTypes.number.isRequired
  };

  @observable bodyVisible = false;
  @observable invalidInput = false;
  @observable deleteModalVisible = false;

  @action toggleBodyVisibility = () => { this.bodyVisible = !(this.bodyVisible); }
  @action setInputValidity = (valid) => { this.invalidInput = valid; }
  @action openDeleteModal = () => { this.deleteModalVisible = true; }
  @action closeDeleteModal = () => { this.deleteModalVisible = false; }

  editGroupBtn;

  shouldComponentUpdate = () => true

  hideEditGroupButton = (e) => {
    e.preventDefault();
    this.setInputValidity(false);
    this.editGroupBtn.hide();
  }

  handleEditGroup = (e) => {
    e.preventDefault();
    if (e.target[0].form[0].value === '') {
      this.setInputValidity(true);
      return;
    }

    var otherGroups = this.props.groups.filter(group => group.id !== this.props.group.id);

    if (otherGroups.some(group => group.id === e.target[0].form[0].value)) {
      this.setInputValidity(true);
      return;
    }
    var selectedTasks = [];
    var selectedCollections = [];
    var tasksIndex = 0;
    this.props.tasks.forEach((task, index) => {
      tasksIndex++;
      for (var i = 0; i < e.target[0].form[index + 2].value; i++) {
        selectedTasks.push(task.id);
      }
    });
    this.props.collections.forEach((collection, index) => {
      for (var i = 0; i < e.target[0].form[tasksIndex + index + 2].value; i++) {
        selectedCollections.push(collection.id);
      }
    });
    var newGroup = {
      id: e.target[0].form[0].value,
      n: e.target[0].form[1].value,
      tasks: selectedTasks,
      collections: selectedCollections
    };

    var nextGroups = this.props.groups;
    nextGroups[this.props.elementKey] = newGroup;

    this.editGroupBtn.hide();
    this.props.onEditGroup(nextGroups);
  }

  handleRemoveGroup = () => {
    this.closeDeleteModal();
    this.props.onRemoveGroup(this.props.elementKey);
  }

  render() {
    var TaskCheckboxes = [];
    var CollectionCheckboxes = [];

    this.props.tasks.forEach((task, i) => {
      var count = 0;
      this.props.group.tasks.forEach(currentTask => {
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

    this.props.collections.forEach((collection, i) => {
      var count = 0;
      this.props.group.collections.forEach(currentCollection => {
        if (collection.id === currentCollection) {
          count++;
        }
      });
      CollectionCheckboxes.push(
        <div className="ct-box ct-box-collection" key={'c-box' + i}>
          <div className="element-name" title={collection.id}>{collection.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
          </FormGroup>
        </div>
      );
    });

    return (
      <div className="group">
        <h5>
          <span className="glyphicon glyphicon-tasks"></span>
          {this.props.group.id}
          <span
            className={this.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
            title={this.bodyVisible ? 'hide' : 'show'}
            onClick={this.toggleBodyVisibility}>
          </span>

          <span className="glyphicon glyphicon-trash" title="remove" onClick={this.openDeleteModal}></span>
          <Modal show={this.deleteModalVisible} onHide={this.closeDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Delete <strong>{this.props.group.id}</strong>?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete the group <strong>{this.props.group.id}?</strong></p>
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="danger" onClick={this.handleRemoveGroup}>Delete</Button>
              <Button onClick={this.closeDeleteModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>

          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.editGroupBtn = el} onClick={() => this.setInputValidity(false)} overlay={
            <Popover className="add-cg-popover group-popover" title="edit group" id={this.props.group.id}>
              <form onSubmit={this.handleEditGroup}>
                <InputGroup>
                  <InputGroup.Addon>id</InputGroup.Addon>
                  <FormControl type="text" onFocus={() => this.setInputValidity(false)} className={this.invalidInput ? 'invalid-input' : ''} defaultValue={this.props.group.id} />
                </InputGroup>
                <div className="row">
                  <div className="col-xs-6">
                    <InputGroup>
                      <InputGroup.Addon>n</InputGroup.Addon>
                      <FormGroup>
                        <FormControl className="add-cg-tc-counter" type="text" defaultValue={this.props.group.n} />
                      </FormGroup>
                    </InputGroup>
                  </div>
                </div>
                <p>Tasks in this group:</p>
                {TaskCheckboxes}
                <p>Collections in this group:</p>
                {CollectionCheckboxes}
                <div className="row">
                  <div className="col-xs-12">
                    <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">edit</Button>
                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditGroupButton}>cancel</Button>
                  </div>
                </div>
              </form>
            </Popover>
          }>
            <span className="glyphicon glyphicon-edit" title="edit"></span>
          </OverlayTrigger>
        </h5>
        <div className={this.bodyVisible ? 'visible-container' : 'invisible-container'}>
          <div><strong> n: </strong><span className="plain">{this.props.group.n}</span></div>
          <hr />
          <div className="group-tasks">
            {this.props.group.tasks.map((task, i) => {
              return <span key={i}>{task}</span>;
            })}
          </div>
          <div className="group-collections">
            {this.props.group.collections.map((collection, i) => {
              return <span key={i}>{collection}</span>;
            })}
          </div>
        </div>
      </div>
    );
  }
}
