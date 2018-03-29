/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Badge from 'react-bootstrap/lib/Badge';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

export default class MainEditor extends Component {
  propTypes = {
    properties: PropTypes.array.isRequired,
    tasks: PropTypes.array.isRequired,
    collections: PropTypes.array.isRequired,
    main: PropTypes.object.isRequired,
    onEditMain: PropTypes.func.isRequired
  };

  editTasksInMainBtn;
  editCollectionsInMainBtn;

  handleEditTasksInMain = (e) => {
    e.preventDefault();

    var selectedTasks = [];
    this.props.tasks.forEach((task, index) => {
      for (var i = 0; i < e.target[0].form[index].value; i++) {
        selectedTasks.push(task.id);
      }
    });
    var nextMain = {
      id: this.props.main.id,
      tasks: selectedTasks,
      collections: this.props.main.collections,
      groups: this.props.main.groups
    };

    this.editTasksInMainBtn.hide();
    this.props.onEditMain(nextMain);
  }

  handleEditCollectionsInMain = (e) => {
    e.preventDefault();

    var selectedCollections = [];
    this.props.collections.forEach((collection, index) => {
      for (var i = 0; i < e.target[0].form[index].value; i++) {
        selectedCollections.push(collection.id);
      }
    });
    var nextMain = {
      id: this.props.main.id,
      tasks: this.props.main.tasks,
      collections: selectedCollections,
      groups: this.props.main.groups
    };

    this.editCollectionsInMainBtn.hide();
    this.props.onEditMain(nextMain);
  }

  render() {
    var TaskCheckboxes = [];
    var CollectionCheckboxes = [];

    this.props.tasks.forEach((task, i) => {
      var count = 0;
      this.props.main.tasks.forEach(currentTask => {
        if (task.id === currentTask) {
          count++;
        }
      });
      TaskCheckboxes.push(
        <div className="ct-box ct-box-task" key={'t-box' + i}>
          <div className="element-name" title={task.id}>{task.id}</div>
          <div className="form-group">
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
          </div>
        </div>
      );
    });

    this.props.collections.forEach((collection, i) => {
      var count = 0;
      this.props.main.collections.forEach(currentCollection => {
        if (collection.id === currentCollection) {
          count++;
        }
      });
      CollectionCheckboxes.push(
        <div className="ct-box ct-box-collection" key={'c-box' + i}>
          <div className="element-name" title={collection.id}>{collection.id}</div>
          <div className="form-group">
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
          </div>
        </div>
      );
    });

    return (
      <div>
        <div className="panel panel-default">
          <div className="panel-heading">
            <p className="panel-title">{this.props.main.id}</p>
          </div>
          <div id="main-editor-body" className="panel-body">
            <div className="row">
              <div className="col-xs-4 centered main-element main-element-tasks">
                <h5 className="main-header">
                  tasks in main
                  <OverlayTrigger trigger="click" placement="bottom" ref={(el) => this.editTasksInMainBtn = el} overlay={
                    <Popover className="add-cg-popover task-popover" title="modify tasks in main" id="tasksinmain">
                      <form onSubmit={this.handleEditTasksInMain}>
                        {TaskCheckboxes}
                        <div className="row">
                          <div className="col-xs-12">
                            <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">edit</Button>
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => this.editTasksInMainBtn.hide()}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-edit add-task-btn edit-main-btn" title="edit tasks in main"></span>
                  </OverlayTrigger>
                </h5>
                <div className="group-tasks">
                  {this.props.main.tasks.map((task, i) => {
                    return <span key={i}>{task}</span>;
                  })}
                </div>
              </div>
              <div className="col-xs-4 centered main-element main-element-collections">
                <h5 className="main-header">
                  collections in main
                  <OverlayTrigger trigger="click" placement="bottom" ref={(el) => this.editCollectionsInMainBtn = el} overlay={
                    <Popover className="add-cg-popover collection-popover" title="modify collections in main" id="collectionsinmain">
                      <form onSubmit={this.handleEditCollectionsInMain}>
                        {CollectionCheckboxes}
                        <div className="row">
                          <div className="col-xs-12">
                            <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">edit</Button>
                            <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => this.editCollectionsInMainBtn.hide()}>cancel</Button>
                          </div>
                        </div>
                      </form>
                    </Popover>
                  }>
                    <span className="glyphicon glyphicon-edit add-collection-btn edit-main-btn" title="edit collections in main"></span>
                  </OverlayTrigger>
                </h5>
                <div className="group-collections">
                  {this.props.main.collections.map((collection, i) => {
                    return <span key={i}>{collection}</span>;
                  })}
                </div>
              </div>
              <div className="col-xs-4 centered main-element main-element-groups">
                <h5 className="main-header">groups</h5>
                {this.props.main.groups.map((group, index) => {
                  return <div className="group-groups" key={index}><span>{group.id} <Badge>{group.n}</Badge></span></div>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
