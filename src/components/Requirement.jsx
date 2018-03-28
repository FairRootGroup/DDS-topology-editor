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
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import Modal from 'react-bootstrap/lib/Modal';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Radio from 'react-bootstrap/lib/Radio';

@observer class Requirement extends Component {
  @observable bodyVisible = false;
  @observable invalidInput = false;
  @observable showDeleteModal = false;

  @action toggleBodyVisibility = () => { this.bodyVisible = !(this.bodyVisible); }
  @action setInputValidity = (valid) => { this.invalidInput = valid; }
  @action openDeleteModal = () => { this.showDeleteModal = true; }
  @action closeDeleteModal = () => { this.showDeleteModal = false; }

  constructor() {
    super();

    this.editRequirementBtn;
  }

  shouldComponentUpdate = () => true

  handleInputChange = (e) => {
    e.preventDefault();
    this.setInputValidity(false);
  }

  hideEditRequirementButton = (e) => {
    e.preventDefault();
    this.setInputValidity(false);
    this.editRequirementBtn.hide();
  }

  handleEditRequirement = (e) => {
    e.preventDefault();

    // cancel if ID or value is empty
    if (e.target[0].form[0].value === '' || e.target[0].form[3].value === '') {
      this.setInputValidity(true);
      return;
    }

    // cancel if ID already exists (except its own ID)
    var otherRequirements = this.props.requirements.filter(requirement => requirement.id !== this.props.requirement.id);
    if (otherRequirements.some(requirement => requirement.id === e.target[0].form[0].value)) {
      this.setInputValidity(true);
      return;
    }

    // set the type according to the radio button value
    let type = '';
    if (e.target[0].form[1].checked) {
      type = 'hostname';
    } else {
      type = 'wnname';
    }

    let updatedRequirement = {
      id: e.target[0].form[0].value,
      type: type,
      value: e.target[0].form[3].value
    };

    this.editRequirementBtn.hide();
    this.props.onEditRequirement(this.props.elementKey, updatedRequirement);
  }

  handleRemoveRequirement = () => {
    this.closeDeleteModal();
    this.props.onRemoveRequirement(this.props.elementKey);
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
          <Modal show={this.showDeleteModal} onHide={this.closeDeleteModal}>
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

          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.editRequirementBtn = el} onClick={this.handleInputChange} overlay={
            <Popover className="add-cg-popover requirement-popover" title="edit requirement" id={this.props.requirement.id}>
              <form onSubmit={this.handleEditRequirement}>
                <InputGroup>
                  <InputGroup.Addon>id</InputGroup.Addon>
                  <FormControl type="text" onFocus={this.handleInputChange} defaultValue={this.props.requirement.id} className={this.invalidInput ? 'invalid-input' : ''} />
                </InputGroup>
                <FormGroup>
                  <ControlLabel className="pattern-label">Pattern Type</ControlLabel>
                  <Radio name="patternType" inline defaultChecked={this.props.requirement.type === 'hostname' ? true : false} title="host name">hostname</Radio>
                  <Radio name="patternType" inline defaultChecked={this.props.requirement.type === 'wnname' ? true : false} title="SSH worker node name">wnname</Radio>
                </FormGroup>
                <InputGroup>
                  <InputGroup.Addon>pattern</InputGroup.Addon>
                  <FormControl type="text" onFocus={this.handleInputChange} defaultValue={this.props.requirement.value} className={this.invalidInput ? 'mono invalid-input' : 'mono'} />
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

Requirement.propTypes = {
  requirement: PropTypes.object.isRequired,
  requirements: PropTypes.array.isRequired,
  onRemoveRequirement: PropTypes.func.isRequired,
  onEditRequirement: PropTypes.func.isRequired,
  elementKey: PropTypes.number.isRequired
};

export default Requirement;
