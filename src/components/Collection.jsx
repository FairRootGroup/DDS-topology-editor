/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component, PropTypes } from 'react';
import _ from 'lodash';

import {
    Button,
    FormControl,
    FormGroup,
    InputGroup,
    Modal,
    OverlayTrigger,
    Popover
} from 'react-bootstrap';

export default class Collection extends Component {
    static propTypes = {
        collection: PropTypes.object.isRequired,
        requirements: PropTypes.array.isRequired,
        collections: PropTypes.array.isRequired,
        tasks: PropTypes.array.isRequired,
        onRemoveCollection: PropTypes.func.isRequired,
        onEditCollection: PropTypes.func.isRequired,
        elementKey: PropTypes.number.isRequired
    };

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
        this.hideEditCollectionButton = this.hideEditCollectionButton.bind(this);
        this.toggleBodyVisibility = this.toggleBodyVisibility.bind(this);
        this.handleEditCollection = this.handleEditCollection.bind(this);
        this.handleRemoveCollection = this.handleRemoveCollection.bind(this);
    }

    closeDeleteModal() {
        this.setState({ showDeleteModal: false });
    }

    openDeleteModal() {
        this.setState({ showDeleteModal: true });
    }

    handleInputChange(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
    }

    hideEditCollectionButton(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.editCollectionBtn.toggle();
    }

    toggleBodyVisibility() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    }

    handleEditCollection(e) {
        e.preventDefault();
        var self = this;
        if (e.target[0].form[0].value === '') {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var otherCollections = _.filter(this.props.collections, function(collections) {
            return collections.id !== self.props.collection.id;
        });
        if (_.some(otherCollections, { 'id': e.target[0].form[0].value })) {
            this.setState({
                invalidInput: true
            });
            return;
        }

        var selectedTasks = [];
        this.props.tasks.forEach(function(task, index) {
            for (var i = 0; i < e.target[0].form[index+1].value; i++) {
                selectedTasks.push(task.id);
            }
        });
        var updatedCollection = {
            id: e.target[0].form[0].value,
            tasks: selectedTasks
        };

        if (e.target[0].form['requirements'].value !== '') {
            updatedCollection.requirement = e.target[0].form['requirements'].value;
        }

        this.refs.editCollectionBtn.toggle();
        this.props.onEditCollection(this.props.elementKey, updatedCollection);
    }

    handleRemoveCollection() {
        this.setState({ showDeleteModal: false });
        this.props.onRemoveCollection(this.props.elementKey);
    }

    render() {
        var TaskCheckboxes = [];
        let requirementOptions = [];
        var requirementContainer;
        var self = this;
        let requirement;

        this.props.tasks.forEach(function(task, i) {
            var count = 0;
            self.props.collection.tasks.forEach(function(currentTask) {
                if (task.id === currentTask) {
                    count++;
                }
            }); 
            TaskCheckboxes.push(
                <div className='ct-box ct-box-task' key={'t-box' + i}>
                    <div className='element-name' title={task.id}>{task.id}</div>
                    <FormGroup>
                        <FormControl className='add-cg-tc-counter' type='number' min='0' defaultValue={count} />
                    </FormGroup>
                </div>
            );
        });

        this.props.requirements.forEach(function(requirement, i) {
            requirementOptions.push(
                <option value={requirement.id} key={'option' + i}>{requirement.id}</option>
            );
        });

        if ('requirement' in this.props.collection) {
            requirement = this.props.collection.requirement;
            let el = _.find(this.props.requirements, function(o) { return o.id === self.props.collection.requirement; });
            requirementContainer =
                <div>
                    <span className='requirement-child'>
                        &nbsp;
                        <span className='prop-access' title={ (el.type === 'hostname') ? 'host name' : '' }>{ (el.type === 'hostname') ? 'HN ' : '' }</span>
                        <span className='prop-access' title={ (el.type === 'wnname') ? 'SSH worker node name' : '' }>{ (el.type === 'wnname') ? 'WN ' : '' }</span>
                        {this.props.collection.requirement}
                    </span>
                </div>;
        }

        return (
            <div className='collection'>
                <h5>
                    <span className='glyphicon glyphicon-tasks'></span>
                    {this.props.collection.id} 
                    <span
                        className={this.state.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
                        title={this.state.bodyVisible ? 'hide': 'show'}
                        onClick={this.toggleBodyVisibility}>
                    </span>

                    <span className='glyphicon glyphicon-trash' title='remove' onClick={this.openDeleteModal}></span>
                    <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete <strong>{this.props.collection.id}</strong>?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete the collection <strong>{this.props.collection.id}?</strong></p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle='danger' onClick={this.handleRemoveCollection}>Delete</Button>
                            <Button onClick={this.closeDeleteModal}>Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                    <OverlayTrigger trigger='click' placement='right' ref='editCollectionBtn' onClick={this.handleInputChange} overlay={
                        <Popover className='add-cg-popover collection-popover' title='edit collection' id={this.props.collection.id}>
                            <form onSubmit={this.handleEditCollection}>
                                <InputGroup>
                                    <InputGroup.Addon>id</InputGroup.Addon>
                                    <FormControl type='text' onFocus={this.handleInputChange} className={this.state.invalidInput ? 'invalid-input' : '' } defaultValue={this.props.collection.id} />
                                </InputGroup>

                                <p>Tasks in this collection:</p>
                                {TaskCheckboxes}

                                <p>Requirement for this collection (optional):</p>
                                <div className='ct-box ct-box-requirement'>
                                    <div className='element-name'>Requirement</div>
                                    <FormGroup>
                                        <FormControl componentClass='select' name='requirements' placeholder='' defaultValue={requirement} className='accessSelect'>
                                            <option value=''>-</option>
                                            {requirementOptions}
                                        </FormControl>
                                    </FormGroup>
                                </div>

                                <div className='row'>
                                    <div className='col-xs-12'>
                                        <Button className='add-cg-popover-btn' type='submit' bsSize='small' bsStyle='primary'>edit</Button>
                                        <Button className='add-cg-popover-btn' bsSize='small' bsStyle='default' onClick={this.hideEditCollectionButton}>cancel</Button>
                                    </div>
                                </div>
                            </form>
                        </Popover>
                    }>
                        <span className='glyphicon glyphicon-edit' title='edit'></span>
                    </OverlayTrigger>
                </h5>
                <div className={this.state.bodyVisible ? 'visible-container' : 'invisible-container'}>
                    {this.props.collection.tasks.map(function(task, i) {
                        return <span key={i}>{task}</span>;
                    })}
                    {requirementContainer}
                </div>
            </div>
        );
    }
}
