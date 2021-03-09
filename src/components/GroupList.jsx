/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import { action, observable, makeObservable } from 'mobx';
import { observer } from 'mobx-react';

import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

import Group from './Group';

import store, { MGroup } from '../Store';

@observer export default class GroupList extends Component {
  static propTypes = {
    taskCheckboxes: PropTypes.array.isRequired,
    collectionCheckboxes: PropTypes.array.isRequired,
  };

  @observable inputValid = false;
  @observable groupsVisible = true;

  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action toggleGroupsVisibility = () => { this.groupsVisible = !this.groupsVisible; }

  shouldComponentUpdate = () => true

  addGroupBtn;

  handleAddGroup = (e) => {
    e.preventDefault();

        // cancel if ID is empty, or if ID already exists
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

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  render() {
    return (
      <Fragment>
        <li className="list-group-item groups-header">
          groups
          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addGroupBtn = el} onClick={() => this.setInputValidity(true)} overlay={
            <Popover className="add-cg-popover group-popover" title="add new group" id="addnewgroup">
              <form onSubmit={this.handleAddGroup}>
                <InputGroup>
                  <InputGroup.Addon>id</InputGroup.Addon>
                  <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} />
                  <InputGroup.Addon>n</InputGroup.Addon>
                  <FormControl className="add-cg-tc-counter" type="text" defaultValue="1" />
                </InputGroup>
                <p>Tasks in this group:</p>
                {this.props.taskCheckboxes}
                <p>Collections in this group:</p>
                {this.props.collectionCheckboxes}
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
          {store.main.groups.map((g, i) => {
            return <Group group={g} key={i} index={i} />;
          })}
        </li>
      </Fragment>
    );
  }
}
