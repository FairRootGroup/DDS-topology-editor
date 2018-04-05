/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';

import { observer } from 'mobx-react';

import Badge from 'react-bootstrap/lib/Badge';
import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import Popover from 'react-bootstrap/lib/Popover';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';

import store, { MMain } from '../Store';

@observer export default class MainEditor extends Component {
  editTasksInMainBtn;
  editCollectionsInMainBtn;

  shouldComponentUpdate = () => true

  handleEditTasksInMain = (e) => {
    e.preventDefault();

    const main = new MMain;
    main.id = store.main.id;
    main.collections = store.main.collections;
    main.groups = store.main.groups;

    store.tasks.forEach((t, index) => {
      for (var i = 0; i < e.target[0].form[index].value; i++) {
        main.tasks.push(t.id);
      }
    });

    this.editTasksInMainBtn.hide();
    store.setMain(main);
  }

  handleEditCollectionsInMain = (e) => {
    e.preventDefault();

    const main = new MMain;
    main.id = store.main.id;
    main.tasks = store.main.tasks;
    main.groups = store.main.groups;

    store.collections.forEach((c, index) => {
      for (var i = 0; i < e.target[0].form[index].value; i++) {
        main.collections.push(c.id);
      }
    });

    store.setMain(main);
    this.editCollectionsInMainBtn.hide();
  }

  render() {
    const TaskCheckboxes = [];
    const CollectionCheckboxes = [];

    store.tasks.forEach((t, i) => {
      var count = 0;
      store.main.tasks.forEach(currentTask => {
        if (t.id === currentTask) {
          count++;
        }
      });
      TaskCheckboxes.push(
        <div className="ct-box ct-box-task" key={'t-box' + i}>
          <div className="element-name" title={t.id}>{t.id}</div>
          <div className="form-group">
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
          </div>
        </div>
      );
    });

    store.collections.forEach((c, i) => {
      var count = 0;
      store.main.collections.forEach(currentCollection => {
        if (c.id === currentCollection) {
          count++;
        }
      });
      CollectionCheckboxes.push(
        <div className="ct-box ct-box-collection" key={'c-box' + i}>
          <div className="element-name" title={c.id}>{c.id}</div>
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
            <p className="panel-title">{store.main.id}</p>
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
                  {store.main.tasks.map((task, i) => {
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
                  {store.main.collections.map((collection, i) => {
                    return <span key={i}>{collection}</span>;
                  })}
                </div>
              </div>
              <div className="col-xs-4 centered main-element main-element-groups">
                <h5 className="main-header">groups</h5>
                {store.main.groups.map((g, index) => {
                  return <div className="group-groups" key={index}><span>{g.id} <Badge>{g.n}</Badge></span></div>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
