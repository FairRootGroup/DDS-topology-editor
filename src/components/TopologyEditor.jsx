/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import _ from 'lodash';
import {
  Button,
  Checkbox,
  ControlLabel,
  FormControl,
  FormGroup,
  InputGroup,
  Modal,
  OverlayTrigger,
  Popover,
  Radio
} from 'react-bootstrap';
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

class TopologyEditor extends Component {
  displayName = 'TopologyEditor';

  constructor() {
    super();

    this.addPropertyBtn;
    this.addTaskBtn;
    this.addCollectionBtn;
    this.addGroupBtn;
    this.addRequirementBtn;

    this.state = {
      topologyId: 'new',
      variables: [],
      properties: [],
      requirements: [],
      tasks: [],
      collections: [],
      main: {
        id: 'main',
        tasks: [],
        collections: [],
        groups: []
      },
      invalidInput: false,
      fluid: false,
      showResetModal: false,
      propertiesVisible: true,
      tasksVisible: true,
      collectionsVisible: true,
      groupsVisible: true,
      requirementsVisible: true
    };

    this.resetState = this.resetState.bind(this);
    this.closeResetModal = this.closeResetModal.bind(this);
    this.openResetModal = this.openResetModal.bind(this);
    this.toggleFluid = this.toggleFluid.bind(this);
    this.togglePropertiesVisibility = this.togglePropertiesVisibility.bind(this);
    this.toggleTasksVisibility = this.toggleTasksVisibility.bind(this);
    this.toggleCollectionsVisibility = this.toggleCollectionsVisibility.bind(this);
    this.toggleGroupsVisibility = this.toggleGroupsVisibility.bind(this);
    this.toggleRequirementsVisibility = this.toggleRequirementsVisibility.bind(this);
    this.handleTopologyChange = this.handleTopologyChange.bind(this);
    this.handleTopologyIdChange = this.handleTopologyIdChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAddProperty = this.handleAddProperty.bind(this);
    this.handleRemoveProperty = this.handleRemoveProperty.bind(this);
    this.handleEditProperty = this.handleEditProperty.bind(this);
    this.handleAddRequirement = this.handleAddRequirement.bind(this);
    this.handleRemoveRequirement = this.handleRemoveRequirement.bind(this);
    this.handleEditRequirement = this.handleEditRequirement.bind(this);
    this.handleAddTask = this.handleAddTask.bind(this);
    this.handleEditTask = this.handleEditTask.bind(this);
    this.handleRemoveTask = this.handleRemoveTask.bind(this);
    this.handleAddCollection = this.handleAddCollection.bind(this);
    this.handleEditCollection = this.handleEditCollection.bind(this);
    this.handleRemoveCollection = this.handleRemoveCollection.bind(this);
    this.handleAddGroup = this.handleAddGroup.bind(this);
    this.handleEditGroup = this.handleEditGroup.bind(this);
    this.handleRemoveGroup = this.handleRemoveGroup.bind(this);
    this.handleEditMain = this.handleEditMain.bind(this);
    this.hideAddPropertyButton = this.hideAddPropertyButton.bind(this);
    this.hideAddRequirementButton = this.hideAddRequirementButton.bind(this);
    this.hideAddTaskButton = this.hideAddTaskButton.bind(this);
    this.hideAddCollectionButton = this.hideAddCollectionButton.bind(this);
    this.hideAddGroupButton = this.hideAddGroupButton.bind(this);
  }

  resetState() {
    this.setState({
      topologyId: 'new',
      variables: [],
      properties: [],
      requirements: [],
      tasks: [],
      collections: [],
      main: {
        id: 'main',
        tasks: [],
        collections: [],
        groups: []
      },
      invalidInput: false,
      fluid: false,
      showResetModal: false,
      propertiesVisible: true,
      tasksVisible: true,
      collectionsVisible: true,
      groupsVisible: true,
      requirementsVisible: true
    });
  }

  closeResetModal() {
    this.setState({ showResetModal: false });
  }

  openResetModal() {
    this.setState({ showResetModal: true });
  }

  toggleFluid() {
    this.setState({ fluid: !this.state.fluid });
  }

  togglePropertiesVisibility() {
    this.setState({ propertiesVisible: !this.state.propertiesVisible });
  }

  toggleTasksVisibility() {
    this.setState({ tasksVisible: !this.state.tasksVisible });
  }

  toggleCollectionsVisibility() {
    this.setState({ collectionsVisible: !this.state.collectionsVisible });
  }

  toggleGroupsVisibility() {
    this.setState({ groupsVisible: !this.state.groupsVisible });
  }

  toggleRequirementsVisibility() {
    this.setState({ requirementsVisible: !this.state.requirementsVisible });
  }

  handleTopologyChange(topologyId, variables, properties, requirements, tasks, collections, main) {
    this.setState({
      topologyId: topologyId,
      variables: variables,
      properties: properties,
      requirements: requirements,
      tasks: tasks,
      collections: collections,
      main: main
    });
  }

  handleTopologyIdChange(topologyId) {
    this.setState({
      topologyId: topologyId
    });
  }

  handleInputChange(e) {
    e.preventDefault();
    this.setState({
      invalidInput: false
    });
  }

  handleAddProperty(e) {
    e.preventDefault();
    if (e.target[0].form[0].value === '') {
      this.setState({
        invalidInput: true
      });
      return;
    }
    if (_.some(this.state.properties, { 'id': e.target[0].form[0].value })) {
      this.setState({
        invalidInput: true
      });
      return;
    }
    var nextProperties = this.state.properties.concat([{ id: e.target[0].form[0].value }]);
    this.addPropertyBtn.hide();
    this.setState({
      properties: nextProperties
    });
  }

  handleRemoveProperty(key) {
    var nextProperties = this.state.properties;
    var removedProperty = nextProperties.splice(key, 1);
    var nextTasks = this.state.tasks;
    nextTasks.forEach(function (task) {
      task.properties = _.filter(task.properties, function (property) {
        return property.id !== removedProperty[0].id;
      });
    });
    this.setState({
      properties: nextProperties,
      tasks: nextTasks
    });
  }

  handleEditProperty(key, updatedProperty) {
    if (_.some(this.state.properties, { 'id': updatedProperty.id })) {
      return;
    }
    var nextProperties = this.state.properties;
    var oldId = this.state.properties[key].id;
    nextProperties[key] = updatedProperty;
    var nextTasks = this.state.tasks;
    nextTasks.forEach(function (task) {
      task.properties.forEach(function (property) {
        if (property.id === oldId) {
          property.id = updatedProperty.id;
        }
      });
    });
    this.setState({
      properties: nextProperties,
      tasks: nextTasks
    });
  }

  handleAddRequirement(e) {
    e.preventDefault();

    // cancel if ID or value is empty
    if (e.target[0].form[0].value === '' || e.target[0].form[3].value === '') {
      this.setState({
        invalidInput: true
      });
      return;
    }
    // cancel if ID already exists
    if (_.some(this.state.requirements, { 'id': e.target[0].form[0].value })) {
      this.setState({
        invalidInput: true
      });
      return;
    }

    // set the type according to the radio button value
    let type = '';
    if (e.target[0].form[1].checked) {
      type = 'hostname';
    } else {
      type = 'wnname';
    }

    // create next requirements out of existing and new value
    let nextRequirements = this.state.requirements.concat([{
      id: e.target[0].form[0].value,
      type: type,
      value: e.target[0].form[3].value
    }]);
    this.addRequirementBtn.hide();
    this.setState({
      requirements: nextRequirements
    });
  }

  handleRemoveRequirement(key) {
    var nextRequirements = this.state.requirements;
    var removedRequirement = nextRequirements.splice(key, 1);
    var nextTasks = this.state.tasks;
    nextTasks.forEach(function (task) {
      if ('requirement' in task && task.requirement.id === removedRequirement.id) {
        delete task.requirement;
      }
    });
    this.setState({
      requirements: nextRequirements,
      tasks: nextTasks
    });
  }

  handleEditRequirement(key, updatedRequirement) {
    // create new requirements
    let nextRequirements = this.state.requirements;
    let oldId = nextRequirements[key].id;
    nextRequirements[key] = updatedRequirement;

    // create new tasks
    let nextTasks = this.state.tasks;
    nextTasks.forEach(function (task) {
      if ('requirement' in task && task.requirement === oldId) {
        task.requirement = updatedRequirement.id;
      }
    });

    // create new tasks
    let nextCollections = this.state.collections;
    nextCollections.forEach(function (collection) {
      if ('requirement' in collection && collection.requirement === oldId) {
        collection.requirement = updatedRequirement.id;
      }
    });

    this.setState({
      requirements: nextRequirements,
      tasks: nextTasks,
      collections: nextCollections
    });
  }

  handleAddTask(e) {
    e.preventDefault();
    if (e.target[0].form[0].value === '' || e.target[0].form[1].value === '') {
      this.setState({
        invalidInput: true
      });
      return;
    }
    if (_.some(this.state.tasks, { 'id': e.target[0].form[0].value })) {
      this.setState({
        invalidInput: true
      });
      return;
    }

    var selectedProperties = [];
    this.state.properties.forEach(function (property, index) {
      if (e.target[0].form[index + 5].value === 'read') {
        selectedProperties.push({ id: property.id, access: 'read' });
      } else if (e.target[0].form[index + 5].value === 'write') {
        selectedProperties.push({ id: property.id, access: 'write' });
      } else if (e.target[0].form[index + 5].value === 'readwrite') {
        selectedProperties.push({ id: property.id, access: 'readwrite' });
      }
    });
    var newTask = {
      id: e.target[0].form[0].value,
      exe: {
        valueText: e.target[0].form[1].value
      },
      properties: selectedProperties
    };

    if (e.target[0].form['requirements'].value !== '') {
      newTask.requirement = e.target[0].form['requirements'].value;
    }

    if (e.target[0].form[2].checked === true) {
      newTask.exe.reachable = 'true';
    }

    if (e.target[0].form[3].value !== '') {
      newTask.env = {};
      newTask.env.valueText = e.target[0].form[3].value;
      if (e.target[0].form[4].checked == true) {
        newTask.env.reachable = 'true';
      }
    }

    var nextTasks = this.state.tasks.concat([newTask]);
    this.addTaskBtn.hide();
    this.setState({
      tasks: nextTasks
    });
  }

  handleEditTask(key, updatedTask) {
    var nextTasks = this.state.tasks;
    var oldId = nextTasks[key].id;
    nextTasks[key] = updatedTask;

    // update collections with new task info
    var nextCollections = this.state.collections;
    nextCollections.forEach(function (collection, colIndex) {
      collection.tasks.forEach(function (task, index) {
        if (task === oldId) {
          nextCollections[colIndex].tasks[index] = updatedTask.id;
        }
      });
    });

    // update groups with new task info
    var nextGroups = this.state.main.groups;
    nextGroups.forEach(function (group, groupIndex) {
      group.tasks.forEach(function (task, index) {
        if (task === oldId) {
          nextGroups[groupIndex].tasks[index] = updatedTask.id;
        }
      });
    });

    // update main with new task info
    var nextMain = this.state.main;
    nextMain.groups = nextGroups;
    nextMain.tasks.forEach(function (task, index) {
      if (task === oldId) {
        nextMain.tasks[index] = updatedTask.id;
      }
    });

    // update state
    this.setState({
      tasks: nextTasks,
      collections: nextCollections,
      main: nextMain
    });
  }

  handleRemoveTask(key) {
    var nextTasks = this.state.tasks;
    var removedTask = nextTasks.splice(key, 1);
    var nextCollections = this.state.collections;
    nextCollections.forEach(function (collection) {
      collection.tasks = _.filter(collection.tasks, function (task) {
        return task !== removedTask[0].id;
      });
    });
    var nextMainTasks = this.state.main.tasks;
    nextMainTasks = _.filter(nextMainTasks, function (task) {
      return task !== removedTask[0].id;
    });
    var nextGroups = this.state.main.groups;
    nextGroups.forEach(function (group) {
      group.tasks = _.filter(group.tasks, function (task) {
        return task !== removedTask[0].id;
      });
    });
    var nextMain = {
      id: this.state.main.id,
      tasks: nextMainTasks,
      collections: this.state.main.collections,
      groups: nextGroups
    };
    this.setState({
      tasks: nextTasks,
      collections: nextCollections,
      main: nextMain
    });
  }

  handleAddCollection(e) {
    e.preventDefault();
    if (e.target[0].form[0].value === '') {
      this.setState({
        invalidInput: true
      });
      return;
    }
    if (_.some(this.state.collections, { 'id': e.target[0].form[0].value })) {
      this.setState({
        invalidInput: true
      });
      return;
    }

    var selectedTasks = [];
    this.state.tasks.forEach(function (task, index) {
      for (var i = 0; i < e.target[0].form[index + 1].value; i++) {
        selectedTasks.push(task.id);
      }
    });

    let newCollection = {
      id: e.target[0].form[0].value,
      tasks: selectedTasks
    };

    if (e.target[0].form['requirements'].value !== '') {
      newCollection.requirement = e.target[0].form['requirements'].value;
    }

    var nextCollections = this.state.collections.concat([newCollection]);
    this.addCollectionBtn.hide();
    this.setState({
      collections: nextCollections
    });
  }

  handleEditCollection(key, updatedCollection) {
    var nextCollections = this.state.collections;
    var oldId = nextCollections[key].id;
    nextCollections[key] = updatedCollection;

    // update groups with new collection info
    var nextGroups = this.state.main.groups;
    nextGroups.forEach(function (group, groupIndex) {
      group.collections.forEach(function (collection, index) {
        if (collection === oldId) {
          nextGroups[groupIndex].collections[index] = updatedCollection.id;
        }
      });
    });

    // update main with new collection info
    var nextMain = this.state.main;
    nextMain.groups = nextGroups;
    nextMain.collections.forEach(function (collection, index) {
      if (collection === oldId) {
        nextMain.collections[index] = updatedCollection.id;
      }
    });

    // update state
    this.setState({
      collections: nextCollections,
      main: nextMain
    });
  }

  handleRemoveCollection(key) {
    var nextCollections = this.state.collections;
    var removedCollection = nextCollections.splice(key, 1);
    var nextMainCollections = this.state.main.collections;
    nextMainCollections = _.filter(nextMainCollections, function (collection) {
      return collection !== removedCollection[0].id;
    });
    var nextGroups = this.state.main.groups;
    nextGroups.forEach(function (group) {
      group.collections = _.filter(group.collections, function (collection) {
        return collection !== removedCollection[0].id;
      });
    });
    var nextMain = {
      id: this.state.main.id,
      tasks: this.state.main.tasks,
      collections: nextMainCollections,
      groups: nextGroups
    };
    this.setState({
      collections: nextCollections,
      main: nextMain
    });
  }

  handleAddGroup(e) {
    e.preventDefault();
    if (e.target[0].form[0].value === '') {
      this.setState({
        invalidInput: true
      });
      return;
    }
    if (_.some(this.state.main.groups, { 'id': e.target[0].form[0].value })) {
      this.setState({
        invalidInput: true
      });
      return;
    }
    var selectedTasks = [];
    var selectedCollections = [];
    var tasksIndex = 0;
    this.state.tasks.forEach(function (task, index) {
      tasksIndex++;
      for (var i = 0; i < e.target[0].form[index + 2].value; i++) {
        selectedTasks.push(task.id);
      }
    });
    this.state.collections.forEach(function (collection, index) {
      for (var i = 0; i < e.target[0].form[tasksIndex + index + 2].value; i++) {
        selectedCollections.push(collection.id);
      }
    });
    var nextGroups = this.state.main.groups.concat([{
      id: e.target[0].form[0].value,
      n: e.target[0].form[1].value,
      tasks: selectedTasks,
      collections: selectedCollections
    }]);
    var nextMain = {
      id: this.state.main.id,
      tasks: this.state.main.tasks,
      collections: this.state.main.collections,
      groups: nextGroups
    };
    this.setState({
      main: nextMain
    });
    this.addGroupBtn.hide();
  }

  handleEditGroup(groups) {
    var nextMain = {
      id: this.state.main.id,
      tasks: this.state.main.tasks,
      collections: this.state.main.collections,
      groups: groups
    };
    this.setState({
      main: nextMain
    });
  }

  handleRemoveGroup(key) {
    var nextGroups = this.state.main.groups;
    nextGroups.splice(key, 1);
    var nextMain = {
      id: this.state.main.id,
      tasks: this.state.main.tasks,
      collections: this.state.main.collections,
      groups: nextGroups
    };
    this.setState({
      main: nextMain
    });
  }

  handleEditMain(main) {
    this.setState({
      main: main
    });
  }

  hideAddPropertyButton(e) {
    e.preventDefault();
    this.setState({
      invalidInput: false
    });
    this.addPropertyBtn.hide();
  }

  hideAddRequirementButton(e) {
    e.preventDefault();
    this.setState({
      invalidInput: false
    });
    this.addRequirementBtn.hide();
  }

  hideAddTaskButton(e) {
    e.preventDefault();
    this.setState({
      invalidInput: false
    });
    this.addTaskBtn.hide();
  }

  hideAddCollectionButton(e) {
    e.preventDefault();
    this.setState({
      invalidInput: false
    });
    this.addCollectionBtn.hide();
  }

  hideAddGroupButton(e) {
    e.preventDefault();
    this.setState({
      invalidInput: false
    });
    this.addGroupBtn.hide();
  }

  render() {
    let PropertyCheckboxes = [];
    let TaskCheckboxes = [];
    let CollectionCheckboxes = [];
    let requirementOptions = [];

    this.state.properties.forEach(function (property, i) {
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

    this.state.tasks.forEach(function (task, i) {
      TaskCheckboxes.push(
        <div className="ct-box ct-box-task" key={'t-box' + i}>
          <div className="element-name" title={task.id}>{task.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
          </FormGroup>
        </div>
      );
    });

    this.state.collections.forEach(function (collection, i) {
      CollectionCheckboxes.push(
        <div className="ct-box ct-box-collection" key={'c-box' + i}>
          <div className="element-name" title={collection.id}>{collection.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
          </FormGroup>
        </div>
      );
    });

    this.state.requirements.forEach(function (requirement, i) {
      requirementOptions.push(
        <option value={requirement.id} key={'option' + i}>{requirement.id}</option>
      );
    });

    return (
      <div>
        <TopBar topologyId={this.state.topologyId}
          onTopologyIdChange={this.handleTopologyIdChange}
          fluid={this.state.fluid}
          onToggleFluid={this.toggleFluid} />

        <div className={this.state.fluid ? 'container-fluid' : 'container'}>
          <div className="row">
            <div className="col-xs-3">
              <ul className="list-group left-pane">
                <FileActions
                  onFileLoad={this.handleTopologyChange}
                  topologyId={this.state.topologyId}
                  variables={this.state.variables}
                  properties={this.state.properties}
                  requirements={this.state.requirements}
                  tasks={this.state.tasks}
                  collections={this.state.collections}
                  main={this.state.main}
                />

                <li className="list-group-item properties-header">
                  properties
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addPropertyBtn = el} onClick={this.handleInputChange} overlay={
                    <Popover className="add-cg-popover property-popover" title="add new property" id="addnewproperty">
                      <form onSubmit={this.handleAddProperty}>
                        <InputGroup>
                          <InputGroup.Addon>id&nbsp;</InputGroup.Addon>
                          <FormControl type="text" autoFocus onFocus={this.handleInputChange} className={this.state.invalidInput ? 'invalid-input' : ''} />
                        </InputGroup>
                        <div className="row">
                          <div className="col-xs-12">
                            <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddPropertyButton}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-property-btn" title="add new property"></span>
                  </OverlayTrigger>
                  <span
                    className={this.state.propertiesVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.state.propertiesVisible ? 'hide' : 'show'}
                    onClick={this.togglePropertiesVisibility}>
                  </span>
                </li>
                <li className={this.state.propertiesVisible ? 'visible-container list-group-item properties' : 'invisible-container list-group-item properties'}>
                  <PropertyList properties={this.state.properties}
                    onRemoveProperty={this.handleRemoveProperty}
                    onEditProperty={this.handleEditProperty}
                  />
                </li>

                <li className="list-group-item tasks-header">
                  tasks
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addTaskBtn = el} onClick={this.handleInputChange} overlay={
                    <Popover className="add-cg-popover task-popover" title="add new task" id="addnewtask">
                      <form onSubmit={this.handleAddTask}>
                        <FormGroup>
                          <InputGroup>
                            <InputGroup.Addon>id&nbsp;</InputGroup.Addon>
                            <FormControl type="text" onFocus={this.handleInputChange} className={this.state.invalidInput ? 'invalid-input' : ''} />
                          </InputGroup>
                        </FormGroup>
                        <FormGroup>
                          <InputGroup>
                            <InputGroup.Addon>exe</InputGroup.Addon>
                            <FormControl type="text" onFocus={this.handleInputChange} className={this.state.invalidInput ? 'mono invalid-input' : 'mono'} />
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
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddTaskButton}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-task-btn" title="add new task"></span>
                  </OverlayTrigger>
                  <span
                    className={this.state.tasksVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.state.tasksVisible ? 'hide' : 'show'}
                    onClick={this.toggleTasksVisibility}>
                  </span>
                </li>
                <li className={this.state.tasksVisible ? 'visible-container list-group-item tasks' : 'invisible-container list-group-item tasks'}>
                  <TaskList properties={this.state.properties}
                    tasks={this.state.tasks}
                    requirements={this.state.requirements}
                    onRemoveTask={this.handleRemoveTask}
                    onEditTask={this.handleEditTask}
                  />
                </li>

                <li className="list-group-item collections-header">
                  collections
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addCollectionBtn = el} onClick={this.handleInputChange} overlay={
                    <Popover className="add-cg-popover collection-popover" title="add new collection" id="addnewcollection">
                      <form onSubmit={this.handleAddCollection}>
                        <InputGroup>
                          <InputGroup.Addon>id</InputGroup.Addon>
                          <FormControl type="text" onFocus={this.handleInputChange} className={this.state.invalidInput ? 'invalid-input' : ''} />
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
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddCollectionButton}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-collection-btn" title="add new collection"></span>
                  </OverlayTrigger>
                  <span
                    className={this.state.collectionsVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.state.collectionsVisible ? 'hide' : 'show'}
                    onClick={this.toggleCollectionsVisibility}>
                  </span>
                </li>
                <li className={this.state.collectionsVisible ? 'visible-container list-group-item collections' : 'invisible-container list-group-item collections'}>
                  <CollectionList
                    collections={this.state.collections}
                    tasks={this.state.tasks}
                    requirements={this.state.requirements}
                    onRemoveCollection={this.handleRemoveCollection}
                    onEditCollection={this.handleEditCollection}
                  />
                </li>

                <li className="list-group-item groups-header">
                  groups
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addGroupBtn = el} onClick={this.handleInputChange} overlay={
                    <Popover className="add-cg-popover group-popover" title="add new group" id="addnewgroup">
                      <form onSubmit={this.handleAddGroup}>
                        <InputGroup>
                          <InputGroup.Addon>id</InputGroup.Addon>
                          <FormControl type="text" onFocus={this.handleInputChange} className={this.state.invalidInput ? 'invalid-input' : ''} />
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
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddGroupButton}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-group-btn" title="add new group"></span>
                  </OverlayTrigger>
                  <span
                    className={this.state.groupsVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.state.groupsVisible ? 'hide' : 'show'}
                    onClick={this.toggleGroupsVisibility}>
                  </span>
                </li>
                <li className={this.state.groupsVisible ? 'visible-container list-group-item groups' : 'invisible-container list-group-item groups'}>
                  <GroupList
                    groups={this.state.main.groups}
                    tasks={this.state.tasks}
                    collections={this.state.collections}
                    onRemoveGroup={this.handleRemoveGroup}
                    onEditGroup={this.handleEditGroup}
                  />
                </li>

                <li className="list-group-item requirements-header">
                  requirements
                  <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addRequirementBtn = el} onClick={this.handleInputChange} overlay={
                    <Popover className="add-cg-popover requirement-popover" title="add new requirement" id="addnewrequirement">
                      <form onSubmit={this.handleAddRequirement}>
                        <InputGroup>
                          <InputGroup.Addon>id</InputGroup.Addon>
                          <FormControl type="text" onFocus={this.handleInputChange} className={this.state.invalidInput ? 'invalid-input' : ''} />
                        </InputGroup>
                        <FormGroup>
                          <ControlLabel className="pattern-label">Pattern Type</ControlLabel>
                          <Radio name="patternType" inline defaultChecked title="host name">hostname</Radio>
                          <Radio name="patternType" inline title="SSH worker node name">wnname</Radio>
                        </FormGroup>
                        <InputGroup>
                          <InputGroup.Addon>pattern</InputGroup.Addon>
                          <FormControl type="text" onFocus={this.handleInputChange} className={this.state.invalidInput ? 'mono invalid-input' : 'mono'} />
                        </InputGroup>
                        <div className="row">
                          <div className="col-xs-12">
                            <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddRequirementButton}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-plus add-requirement-btn" title="add new requirement"></span>
                  </OverlayTrigger>
                  <span
                    className={this.state.requirementsVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
                    title={this.state.requirementsVisible ? 'hide' : 'show'}
                    onClick={this.toggleRequirementsVisibility}>
                  </span>
                </li>
                <li className={this.state.requirementsVisible ? 'visible-container list-group-item requirements' : 'invisible-container list-group-item requirements'}>
                  <RequirementList
                    requirements={this.state.requirements}
                    onRemoveRequirement={this.handleRemoveRequirement}
                    onEditRequirement={this.handleEditRequirement}
                  />
                </li>

                <li className="list-group-item">
                  <button type="button" className="btn btn-sm btn-default" onClick={this.openResetModal}>
                    <span className="glyphicon glyphicon-remove" title="reset the topology"></span> reset
                                    </button>

                  <Modal show={this.state.showResetModal} onHide={this.closeResetModal}>
                    <Modal.Header closeButton>
                      <Modal.Title>Reset topology?</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <p>This will clear all the contents of the topology.</p>
                      <p>Unsaved changes will be lost.</p>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button bsStyle="danger" onClick={this.resetState}>Reset</Button>
                      <Button onClick={this.closeResetModal}>Cancel</Button>
                    </Modal.Footer>
                  </Modal>
                </li>
              </ul>
            </div>
            <div className="col-xs-9">
              <MainEditor properties={this.state.properties}
                tasks={this.state.tasks}
                collections={this.state.collections}
                main={this.state.main}
                onEditMain={this.handleEditMain}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

reactMixin(TopologyEditor.prototype, localStorageMixin);

export default hot(module)(TopologyEditor);
