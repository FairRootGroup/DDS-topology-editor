/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Radio from 'react-bootstrap/lib/Radio';

import Requirement from './Requirement';

import store, { MRequirement } from '../Store';

@observer export default class RequirementList extends Component {
  @observable inputValid = false;
  @observable requirementsVisible = true;

  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action toggleRequirementsVisibility = () => { this.requirementsVisible = !this.requirementsVisible; }

  shouldComponentUpdate = () => true

  addRequirementBtn;

  handleAddRequirement = (e) => {
    e.preventDefault();

    // cancel if ID or value is empty, or if ID already exists
    if (e.target[0].form[0].value === '' || e.target[0].form[3].value === '' || store.hasRequirement(e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const requirement = new MRequirement;
    requirement.id = e.target[0].form[0].value;
    requirement.value = e.target[0].form[3].value;
    console.log(e.target[0].form[3].value);

    // set the type according to the radio button value
    e.target[0].form[1].checked ? requirement.type = 'hostname' : requirement.type = 'wnname';

    store.addRequirement(requirement);
    this.addRequirementBtn.hide();
  }

  render() {
    return (
      <Fragment>
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
          {store.requirements.map((r, i) => {
            return <Requirement requirement={r} key={i} index={i} />;
          })}
        </li>
      </Fragment>
    );
  }
}
