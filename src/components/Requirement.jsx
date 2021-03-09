/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { action, observable, makeObservable } from 'mobx';
import { observer } from 'mobx-react';

import Button from 'react-bootstrap/lib/Button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Radio from 'react-bootstrap/lib/Radio';

import store, { MRequirement } from '../Store';

@observer export default class Requirement extends Component {
  static propTypes = {
    requirement: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
  };

  @observable bodyVisible = false;
  @observable inputValid = true;
  @observable deleteModalVisible = false;

  @action toggleBodyVisibility = () => { this.bodyVisible = !(this.bodyVisible); }
  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action openDeleteModal = () => { this.deleteModalVisible = true; }
  @action closeDeleteModal = () => { this.deleteModalVisible = false; }

  editRequirementBtn;

  shouldComponentUpdate = () => true

  hideEditRequirementButton = (e) => {
    e.preventDefault();
    this.setInputValidity(true);
    this.editRequirementBtn.hide();
  }

  handleEditRequirement = (e) => {
    e.preventDefault();

    // cancel if ID or value is empty
    if (e.target[0].form[0].value === '' || e.target[0].form[3].value === '') {
      this.setInputValidity(false);
      return;
    }

    // cancel if ID already exists (except its own ID)
    const otherRequirements = store.requirements.filter(r => r.id !== this.props.requirement.id);
    if (otherRequirements.some(r => r.id === e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const requirement = new MRequirement;
    requirement.id = e.target[0].form[0].value;
    requirement.value = e.target[0].form[3].value;

    // set the type according to the radio button value
    if (e.target[0].form[1].checked) {
      requirement.type = 'hostname';
    } else {
      requirement.type = 'wnname';
    }

    store.editRequirement(this.props.index, requirement);
    this.editRequirementBtn.hide();
  }

  handleRemoveRequirement = () => {
    store.removeRequirement(this.props.index);
    this.closeDeleteModal();
  }

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  render() {
    return (
      <div className="requirement">
        <h5>
          <span className="glyphicon glyphicon-tasks"></span>
          <span className="element-title" title={this.props.requirement.id}>{this.props.requirement.id}</span>
          <span
            className={this.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
            title={this.bodyVisible ? 'hide' : 'show'}
            onClick={this.toggleBodyVisibility}>
          </span>

          <span className="glyphicon glyphicon-trash" title="delete" onClick={this.openDeleteModal}></span>
          <Modal show={this.deleteModalVisible} onHide={this.closeDeleteModal}>
            <Modal.Header closeButton>
              <Modal.Title>Delete <strong>{this.props.requirement.id}</strong>?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>Are you sure you want to delete the requirement <strong>{this.props.requirement.id}?</strong></p>
            </Modal.Body>
            <Modal.Footer>
              <Button bsStyle="danger" onClick={this.handleRemoveRequirement}>Delete</Button>
              <Button onClick={this.closeDeleteModal}>Cancel</Button>
            </Modal.Footer>
          </Modal>

          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.editRequirementBtn = el} onClick={() => this.setInputValidity(true)} overlay={
            <Popover className="add-cg-popover requirement-popover" title="edit requirement" id={this.props.requirement.id}>
              <form onSubmit={this.handleEditRequirement}>
                <InputGroup>
                  <InputGroup.Addon>id</InputGroup.Addon>
                  <FormControl type="text" onFocus={() => this.setInputValidity(true)} defaultValue={this.props.requirement.id} className={this.inputValid ? '' : 'invalid-input'} />
                </InputGroup>
                <FormGroup>
                  <ControlLabel className="pattern-label">Pattern Type</ControlLabel>
                  <Radio name="patternType" inline defaultChecked={this.props.requirement.type === 'hostname' ? true : false} title="host name">hostname</Radio>
                  <Radio name="patternType" inline defaultChecked={this.props.requirement.type === 'wnname' ? true : false} title="SSH worker node name">wnname</Radio>
                </FormGroup>
                <InputGroup>
                  <InputGroup.Addon>pattern</InputGroup.Addon>
                  <FormControl type="text" onFocus={() => this.setInputValidity(true)} defaultValue={this.props.requirement.value} className={this.inputValid ? 'mono' : 'mono invalid-input'} />
                </InputGroup>
                <div className="row">
                  <div className="col-xs-12">
                    <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">save</Button>
                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditRequirementButton}>cancel</Button>
                  </div>
                </div>
              </form>
            </Popover>
          }>
            <span className="glyphicon glyphicon-edit" title="edit task"></span>
          </OverlayTrigger>
        </h5>
        <ul className={this.bodyVisible ? 'visible-container' : 'invisible-container'}>
          <li>
            <span>
              <strong>pattern:</strong>
            </span>
            <input className="code" readOnly value={this.props.requirement.value} title={this.props.requirement.value}></input>
            <span className="pattern-type" title="pattern type">{this.props.requirement.type}</span>
          </li>
        </ul>
      </div>
    );
  }
}
