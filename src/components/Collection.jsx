/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React from 'react';
import _ from 'lodash';
import { OverlayTrigger, Popover, Button, Input, ButtonInput, Modal } from 'react-bootstrap';

var Collection = React.createClass({
    propTypes: {
        collection: React.PropTypes.object.isRequired,
        collections: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        onRemoveCollection: React.PropTypes.func.isRequired,
        onEditCollection: React.PropTypes.func.isRequired,
        elementKey: React.PropTypes.number.isRequired
    },

    getInitialState() {
        return {
            bodyVisible: false,
            invalidInput: false,
            showDeleteModal: false
        }
    },

    closeDeleteModal() {
        this.setState({ showDeleteModal: false });
    },

    openDeleteModal() {
        this.setState({ showDeleteModal: true });
    },

    handleInputChange(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
    },

    hideEditCollectionButton(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.editCollectionBtn.toggle();
    },

    toggleBodyVisibility() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    },

    handleEditCollection(e) {
        e.preventDefault();
        var self = this;
        if (e.target[0].form[0].value === "") {
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
            for(var i = 0; i < e.target[0].form[index+1].value; i++) {
                selectedTasks.push(task.id);
            }
        });
        var updatedCollection = {
            id: e.target[0].form[0].value,
            requirement: self.props.collection.requirement,
            tasks: selectedTasks
        }

        this.refs.editCollectionBtn.toggle();
        this.props.onEditCollection(this.props.elementKey, updatedCollection);
    },

    handleRemoveCollection() {
        this.setState({ showDeleteModal: false });
        this.props.onRemoveCollection(this.props.elementKey);
    },

    render() {
        var TaskCheckboxes = [];
        var self = this;

        this.props.tasks.forEach(function(task, i) {
            var count = 0;
            self.props.collection.tasks.forEach(function(currentTask) {
                if (task.id === currentTask) {
                    count++;
                }
            }); 
            TaskCheckboxes.push(
                <div className="ct-box ct-box-task" key={"t-box" + i}>
                    <div className="element-name" title={task.id}>{task.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
                </div>
            );
        });

        return (
            <div className="collection">
                <h5>
                    <span className="glyphicon glyphicon-tasks"></span>
                    {this.props.collection.id} 
                    <span
                        className={this.state.bodyVisible ? "glyphicon glyphicon-chevron-up" : "glyphicon glyphicon-chevron-down"}
                        title={this.state.bodyVisible ? "hide": "show"}
                        onClick={this.toggleBodyVisibility}>
                    </span>

                    <span className="glyphicon glyphicon-trash" title="remove" onClick={this.openDeleteModal}></span>
                    <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete <strong>{this.props.collection.id}</strong>?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete the collection <strong>{this.props.collection.id}?</strong></p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="danger" onClick={this.handleRemoveCollection}>Delete</Button>
                            <Button onClick={this.closeDeleteModal}>Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                    <OverlayTrigger trigger="click" placement="right" ref="editCollectionBtn" onClick={this.handleInputChange} overlay={
                        <Popover className="add-cg-popover" title="edit collection" id={this.props.collection.id}>
                            <form onSubmit={this.handleEditCollection}>
                                <Input type="text" addonBefore="id" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : "" } defaultValue={this.props.collection.id} />
                                <p>Tasks in this collection:</p>
                                {TaskCheckboxes}
                                <div className="row">
                                    <div className="col-xs-12">
                                        <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="edit" />
                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditCollectionButton}>cancel</Button>
                                    </div>
                                </div>
                            </form>
                        </Popover>
                    }>
                        <span className="glyphicon glyphicon-edit" title="edit"></span>
                    </OverlayTrigger>
                </h5>
                <div className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    {this.props.collection.tasks}
                </div>
            </div>
        );
    }
});

export default Collection;
