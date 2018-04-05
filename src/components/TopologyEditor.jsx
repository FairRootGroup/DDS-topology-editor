/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import Button from 'react-bootstrap/lib/Button';
import Checkbox from 'react-bootstrap/lib/Checkbox';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Radio from 'react-bootstrap/lib/Radio';

import { hot } from 'react-hot-loader';

import localStorageMixin from 'react-localstorage';
import reactMixin from 'react-mixin';

import TopBar from './TopBar';
import FileActions from './FileActions';
import CollectionList from './CollectionList';
import GroupList from './GroupList';
import PropertyList from './PropertyList';
import RequirementList from './RequirementList';
import TaskList from './TaskList';
import MainEditor from './MainEditor';

import store, { MCollection, MGroup, MProperty, MRequirement, MTask } from '../Store';

@observer class TopologyEditor extends Component {
  @observable inputValid = false;
  @observable showResetModal = false;
  @observable propertiesVisible = true;
  @observable tasksVisible = true;
  @observable collectionsVisible = true;
  @observable groupsVisible = true;
  @observable requirementsVisible = true;

  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action openResetModal = () => { this.showResetModal = true; }
  @action closeResetModal = () => { this.showResetModal = false; }
  @action togglePropertiesVisibility = () => { this.propertiesVisible = !this.propertiesVisible; }
  @action toggleTasksVisibility = () => { this.tasksVisible = !this.tasksVisible; }
  @action toggleCollectionsVisibility = () => { this.collectionsVisible = !this.collectionsVisible; }
  @action toggleGroupsVisibility = () => { this.groupsVisible = !this.groupsVisible; }
  @action toggleRequirementsVisibility = () => { this.requirementsVisible = !this.requirementsVisible; }

  displayName = 'TopologyEditor';

  addPropertyBtn;
  addTaskBtn;
  addCollectionBtn;
  addGroupBtn;
  addRequirementBtn;

  handleAddProperty = (e) => {
    e.preventDefault();

    if (e.target[0].form[0].value === '') {
      this.setInputValidity(false);
      return;
    }
    if (store.hasProperty(e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }
    const property = new MProperty;
    property.id = e.target[0].form[0].value;

    store.addProperty(property);
    this.addPropertyBtn.hide();
  }

  handleAddRequirement = (e) => {
    e.preventDefault();

    // cancel if ID or value is empty
    if (e.target[0].form[0].value === '' || e.target[0].form[3].value === '') { // TODO: unify this two ifs
      this.setInputValidity(false);
      return;
    }
    // cancel if ID already exists
    if (store.hasRequirement(e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const requirement = new MRequirement;
    requirement.id = e.target[0].form[0].value;
    requirement.value = e.target[0].form[3].value;

    // set the type according to the radio button value
    e.target[0].form[1].checked ? requirement.type = 'hostname' : requirement.type = 'wnname';

    store.addRequirement(requirement);
    this.addRequirementBtn.hide();
  }

  handleAddTask = (e) => {
    e.preventDefault();

    // cancel if ID or exe is empty
    if (e.target[0].form[0].value === '' || e.target[0].form[1].value === '') {
      this.setInputValidity(false);
      return;
    }
    // cancel if ID already exists
    if (store.hasTask(e.target[0].form[0].value)) {
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
        task.properties.push({ id: p.id, access: 'read' }); // TODO: check if this works
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

  handleAddCollection = (e) => {
    e.preventDefault();

    if (e.target[0].form[0].value === '') {
      this.setInputValidity(false);
      return;
    }
    if (store.hasCollection(e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const collection = new MCollection;
    collection.id = e.target[0].form[0].value;

    store.tasks.forEach((t, j) => {
      for (let i = 0; i < e.target[0].form[j + 1].value; i++) {
        collection.tasks.push(t.id);
      }
    });

    if (e.target[0].form['requirements'].value !== '') { // TODO: handle multiple
      collection.requirements.push(e.target[0].form['requirements'].value);
    }

    store.addCollection(collection);
    this.addCollectionBtn.hide();
  }

  handleAddGroup = (e) => {
    e.preventDefault();

    if (e.target[0].form[0].value === '' || store.hasMainGroup(e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const group = new MGroup;
    group.id = e.target[0].form[0].value;
    group.n = e.target[0].form[1].value;

    let tasksIndex = 0;
    store.tasks.forEach((t, j) => {
      tasksIndex++;
      for (let i = 0; i < e.target[0].form[j + 2].value; i++) {
        group.tasks.push(t.id);
      }
    });
    store.collections.forEach((c, j) => {
      for (let i = 0; i < e.target[0].form[tasksIndex + j + 2].value; i++) {
        group.collections.push(c.id);
      }
    });

    store.addMainGroup(group);
    this.addGroupBtn.hide();
  }

  render() {
    let PropertyCheckboxes = [];
    let TaskCheckboxes = [];
    let CollectionCheckboxes = [];
    let requirementOptions = [];

    store.properties.forEach((property, i) => {
      PropertyCheckboxes.push(
        <div className="ct-box ct-box-property" key={'t-box' + i}>
          <div className="element-name" title={property.id}>{property.id}</div>
          <FormGroup>
            <FormControl componentClass="select" placeholder="" defaultValue="" className="accessSelect">
              <option value="">-</option>
              <option value="read">read</option>
              <option value="write">write</option>
              <option value="readwrite">readwrite</option>
            </FormControl>
          </FormGroup>
        </div>
      );
    });

    store.tasks.forEach((task, i) => {
      TaskCheckboxes.push(
        <div className="ct-box ct-box-task" key={'t-box' + i}>
          <div className="element-name" title={task.id}>{task.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
          </FormGroup>
        </div>
      );
    });

    store.collections.forEach((collection, i) => {
      CollectionCheckboxes.push(
        <div className="ct-box ct-box-collection" key={'c-box' + i}>
          <div className="element-name" title={collection.id}>{collection.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
          </FormGroup>
        </div>
      );
    });

    store.requirements.forEach((requirement, i) => { // TODO: handle multiple
      requirementOptions.push(
        <option value={requirement.id} key={'option' + i}>{requirement.id}</option>
      );
    });

    return (
      <Fragment>
        <TopBar />

        <div className={store.fluid ? 'container-fluid' : 'container'}>
          <div className="row">
            <div className="col-xs-3">
              <ul className="list-group left-pane">
                <FileActions />

                <li className="list-group-item properties-header">
                  properties
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addPropertyBtn = el} onClick={() => this.setInputValidity(true)} overlay={
                    <Popover className="add-cg-popover property-popover" title="add new property" id="addnewproperty">
                      <form onSubmit={this.handleAddProperty}>
                        <InputGroup>
                          <InputGroup.Addon>id&nbsp;</InputGroup.Addon>
                          <FormControl type="text" autoFocus onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} />
                        </InputGroup>
                        <div className="row">
                          <div className="col-xs-12">
                            <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => { this.setInputValidity(true); this.addPropertyBtn.hide(); }}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-property-btn" title="add new property"></span>
                  </OverlayTrigger>
                  <span
                    className={this.propertiesVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.propertiesVisible ? 'hide' : 'show'}
                    onClick={this.togglePropertiesVisibility}>
                  </span>
                </li>
                <li className={this.propertiesVisible ? 'visible-container list-group-item properties' : 'invisible-container list-group-item properties'}>
                  <PropertyList />
                </li>

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
                        {PropertyCheckboxes}

                        <p>Requirement for this task (optional):</p>
                        <div className="ct-box ct-box-requirement">
                          <div className="element-name">Requirement</div>
                          <FormGroup>
                            <FormControl componentClass="select" name="requirements" placeholder="" defaultValue="" className="accessSelect">
                              <option value="">-</option>
                              {requirementOptions}
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
                  <TaskList />
                </li>

                <li className="list-group-item collections-header">
                  collections
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addCollectionBtn = el} onClick={() => this.setInputValidity(true)} overlay={
                    <Popover className="add-cg-popover collection-popover" title="add new collection" id="addnewcollection">
                      <form onSubmit={this.handleAddCollection}>
                        <InputGroup>
                          <InputGroup.Addon>id</InputGroup.Addon>
                          <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} />
                        </InputGroup>

                        <p>Tasks in this collection:</p>
                        {TaskCheckboxes}

                        <p>Requirement for this collection (optional):</p>
                        <div className="ct-box ct-box-requirement">
                          <div className="element-name">Requirement</div>
                          <FormGroup>
                            <FormControl componentClass="select" name="requirements" placeholder="" defaultValue="" className="accessSelect">
                              <option value="">-</option>
                              {requirementOptions}
                            </FormControl>
                          </FormGroup>
                        </div>

                        <div className="row">
                          <div className="col-xs-12">
                            <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => { this.setInputValidity(true); this.addCollectionBtn.hide(); }}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-collection-btn" title="add new collection"></span>
                  </OverlayTrigger>
                  <span
                    className={this.collectionsVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.collectionsVisible ? 'hide' : 'show'}
                    onClick={this.toggleCollectionsVisibility}>
                  </span>
                </li>
                <li className={this.collectionsVisible ? 'visible-container list-group-item collections' : 'invisible-container list-group-item collections'}>
                  <CollectionList />
                </li>

                <li className="list-group-item groups-header">
                  groups
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addGroupBtn = el} onClick={() => this.setInputValidity(true)} overlay={
                    <Popover className="add-cg-popover group-popover" title="add new group" id="addnewgroup">
                      <form onSubmit={this.handleAddGroup}>
                        <InputGroup>
                          <InputGroup.Addon>id</InputGroup.Addon>
                          <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} />
                        </InputGroup>
                        <div className="row">
                          <div className="col-xs-6">
                            <InputGroup>
                              <InputGroup.Addon>n</InputGroup.Addon>
                              <FormGroup>
                                <FormControl className="add-cg-tc-counter" type="number" min="1" defaultValue="1" />
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
                            <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => { this.setInputValidity(true); this.addGroupBtn.hide(); }}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-group-btn" title="add new group"></span>
                  </OverlayTrigger>
                  <span
                    className={this.groupsVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.groupsVisible ? 'hide' : 'show'}
                    onClick={this.toggleGroupsVisibility}>
                  </span>
                </li>
                <li className={this.groupsVisible ? 'visible-container list-group-item groups' : 'invisible-container list-group-item groups'}>
                  <GroupList />
                </li>

                <li className="list-group-item requirements-header">
                  requirements
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addRequirementBtn = el} onClick={() => this.setInputValidity(true)} overlay={
                    <Popover className="add-cg-popover requirement-popover" title="add new requirement" id="addnewrequirement">
                      <form onSubmit={this.handleAddRequirement}>
                        <InputGroup>
                          <InputGroup.Addon>id</InputGroup.Addon>
                          <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} />
                        </InputGroup>
                        <FormGroup>
                          <ControlLabel className="pattern-label">Pattern Type</ControlLabel>
                          <Radio name="patternType" inline defaultChecked title="host name">hostname</Radio>
                          <Radio name="patternType" inline title="SSH worker node name">wnname</Radio>
                        </FormGroup>
                        <InputGroup>
                          <InputGroup.Addon>pattern</InputGroup.Addon>
                          <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'mono invalid-input'} />
                        </InputGroup>
                        <div className="row">
                          <div className="col-xs-12">
                            <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => { this.setInputValidity(true); this.addRequirementBtn.hide(); }}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-requirement-btn" title="add new requirement"></span>
                  </OverlayTrigger>
                  <span
                    className={this.requirementsVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.requirementsVisible ? 'hide' : 'show'}
                    onClick={this.toggleRequirementsVisibility}>
                  </span>
                </li>
                <li className={this.requirementsVisible ? 'visible-container list-group-item requirements' : 'invisible-container list-group-item requirements'}>
                  <RequirementList />
                </li>

                <li className="list-group-item">
                  <button type="button" className="btn btn-sm btn-default" onClick={this.openResetModal}>
                    <span className="glyphicon glyphicon-remove" title="reset the topology"></span> reset
                  </button>

                  <Modal show={this.showResetModal} onHide={this.closeResetModal}>
                    <Modal.Header closeButton>
                      <Modal.Title>Reset topology?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <p>This will clear all the contents of the topology.</p>
                      <p>Unsaved changes will be lost.</p>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button bsStyle="danger" onClick={() => { store.reset(); this.closeResetModal();} }>Reset</Button>
                      <Button onClick={this.closeResetModal}>Cancel</Button>
                    </Modal.Footer>
                  </Modal>
                </li>
              </ul>
            </div>
            <div className="col-xs-9">
              <MainEditor />
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

reactMixin(TopologyEditor.prototype, localStorageMixin);

export default hot(module)(TopologyEditor);
