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
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Modal from 'react-bootstrap/lib/Modal';

import { hot } from 'react-hot-loader';

import TopBar from './TopBar';
import FileActions from './FileActions';
import CollectionList from './CollectionList';
import GroupList from './GroupList';
import PropertyList from './PropertyList';
import RequirementList from './RequirementList';
import TaskList from './TaskList';
import MainEditor from './MainEditor';

import store from '../Store';

@observer class TopologyEditor extends Component {
  @observable showResetModal = false;

  @action openResetModal = () => { this.showResetModal = true; }
  @action closeResetModal = () => { this.showResetModal = false; }

  render() {
    let propertyCheckboxes = [];
    let taskCheckboxes = [];
    let collectionCheckboxes = [];
    let requirementOptions = [];

    store.properties.forEach((p, i) => {
      propertyCheckboxes.push(
        <div className="ct-box ct-box-property" key={'t-box' + i}>
          <div className="element-name" title={p.id}>{p.id}</div>
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

    store.tasks.forEach((t, i) => {
      taskCheckboxes.push(
        <div className="ct-box ct-box-task" key={'t-box' + i}>
          <div className="element-name" title={t.id}>{t.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
          </FormGroup>
        </div>
      );
    });

    store.collections.forEach((c, i) => {
      collectionCheckboxes.push(
        <div className="ct-box ct-box-collection" key={'c-box' + i}>
          <div className="element-name" title={c.id}>{c.id}</div>
          <FormGroup>
            <FormControl className="add-cg-tc-counter" type="number" min="0" defaultValue="0" />
          </FormGroup>
        </div>
      );
    });

    store.requirements.forEach((r, i) => { // TODO: handle multiple
      requirementOptions.push(<option value={r.id} key={'option' + i}>{r.id}</option>);
    });

    return (
      <Fragment>
        <div className="main-container">
          <TopBar />

          <ul className="list-group left-pane">
            <FileActions />
            <PropertyList />
            <TaskList propertyCheckboxes={propertyCheckboxes} requirementOptions={requirementOptions} />
            <CollectionList taskCheckboxes={taskCheckboxes} requirementOptions={requirementOptions} />
            <GroupList taskCheckboxes={taskCheckboxes} collectionCheckboxes={collectionCheckboxes} />
            <RequirementList />

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

          <MainEditor />
        </div>
      </Fragment>
    );
  }
}

export default hot(module)(TopologyEditor);
