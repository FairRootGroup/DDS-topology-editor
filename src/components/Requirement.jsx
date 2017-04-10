/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
    Button,
    ControlLabel,
    FormControl,
    FormGroup,
    InputGroup,
    Modal,
    OverlayTrigger,
    Popover,
    Radio
} from 'react-bootstrap';

class Requirement extends Component {
    constructor() {
        super();

        this.state = {
            bodyVisible: false,
            invalidInput: false,
            showDeleteModal: false
        };

        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.hideEditRequirementButton = this.hideEditRequirementButton.bind(this);
        this.toggleBodyVisibility = this.toggleBodyVisibility.bind(this);
        this.handleEditRequirement = this.handleEditRequirement.bind(this);
        this.handleRemoveRequirement = this.handleRemoveRequirement.bind(this);
    }

    closeDeleteModal() {
        this.setState({ showDeleteModal: false });
    }

    openDeleteModal() {
        this.setState({ showDeleteModal: true });
    }

    handleInputChange(e) {
        e.preventDefault();
        this.setState({ invalidInput: false });
    }

    hideEditRequirementButton(e) {
        e.preventDefault();
        this.setState({ invalidInput: false });
        this.refs.editRequirementBtn.hide();
    }

    toggleBodyVisibility() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    }

    handleEditRequirement(e) {
        e.preventDefault();
        const self = this;

        // cancel if ID or value is empty
        if (e.target[0].form[0].value === '' || e.target[0].form[3].value === '') {
            this.setState({
                invalidInput: true
            });
            return;
        }

        // cancel if ID already exists (except its own ID)
        var otherRequirements = _.filter(this.props.requirements, function(requirement) {
            return requirement.id !== self.props.requirement.id;
        });
        if (_.some(otherRequirements, { 'id': e.target[0].form[0].value })) {
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

        let updatedRequirement= {
            id: e.target[0].form[0].value,
            type: type,
            value: e.target[0].form[3].value
        };

        this.refs.editRequirementBtn.hide();
        this.props.onEditRequirement(this.props.elementKey, updatedRequirement);
    }

    handleRemoveRequirement() {
        this.setState({ showDeleteModal: false });
        this.props.onRemoveRequirement(this.props.elementKey);
    }

    render() {
        return (
            <div className='requirement'>
                <h5>
                    <span className='glyphicon glyphicon-tasks'></span>
                    <span className='element-title' title={this.props.requirement.id}>{this.props.requirement.id}</span>
                    <span
                        className={this.state.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
                        title={this.state.bodyVisible ? 'hide': 'show'}
                        onClick={this.toggleBodyVisibility}>
                    </span>

                    <span className='glyphicon glyphicon-trash' title='delete' onClick={this.openDeleteModal}></span>
                    <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete <strong>{this.props.requirement.id}</strong>?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete the requirement <strong>{this.props.requirement.id}?</strong></p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle='danger' onClick={this.handleRemoveRequirement}>Delete</Button>
                            <Button onClick={this.closeDeleteModal}>Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                    <OverlayTrigger trigger='click' placement='right' ref='editRequirementBtn' onClick={this.handleInputChange} overlay={
                        <Popover className='add-cg-popover requirement-popover' title='edit requirement' id={this.props.requirement.id}>
                            <form onSubmit={this.handleEditRequirement}>
                                <InputGroup>
                                    <InputGroup.Addon>id</InputGroup.Addon>
                                    <FormControl type='text' onFocus={this.handleInputChange} defaultValue={this.props.requirement.id} className={this.state.invalidInput ? 'invalid-input' : '' } />
                                </InputGroup>
                                <FormGroup>
                                    <ControlLabel className='pattern-label'>Pattern Type</ControlLabel>
                                    <Radio name='patternType' inline defaultChecked={this.props.requirement.type === 'hostname' ? true : false} title='host name'>hostname</Radio>
                                    <Radio name='patternType' inline defaultChecked={this.props.requirement.type === 'wnname' ? true : false} title='SSH worker node name'>wnname</Radio>
                                </FormGroup>
                                <InputGroup>
                                    <InputGroup.Addon>pattern</InputGroup.Addon>
                                    <FormControl type='text' onFocus={this.handleInputChange} defaultValue={this.props.requirement.value} className={this.state.invalidInput ? 'mono invalid-input' : 'mono' } />
                                </InputGroup>
                                <div className='row'>
                                    <div className='col-xs-12'>
                                        <Button className='add-cg-popover-btn' type='submit' bsSize='small' bsStyle='primary'>save</Button>
                                        <Button className='add-cg-popover-btn' bsSize='small' bsStyle='default' onClick={this.hideEditRequirementButton}>cancel</Button>
                                    </div>
                                </div>
                            </form>
                        </Popover>
                    }>
                        <span className='glyphicon glyphicon-edit' title='edit task'></span>
                    </OverlayTrigger>
                </h5>
                <ul className={this.state.bodyVisible ? 'visible-container' : 'invisible-container'}>
                    <li>
                        <span>
                            <strong>pattern:</strong>
                        </span>
                        <input className='code' readOnly value={this.props.requirement.value} title={this.props.requirement.value}></input>
                        <span className='pattern-type' title='pattern type'>{this.props.requirement.type}</span>
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
