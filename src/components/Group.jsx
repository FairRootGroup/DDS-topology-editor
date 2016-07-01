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

var Group = React.createClass({
    propTypes: {
        group: React.PropTypes.object.isRequired,
        groups: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        collections: React.PropTypes.array.isRequired,
        onRemoveGroup: React.PropTypes.func.isRequired,
        onEditGroup: React.PropTypes.func.isRequired,
        elementKey: React.PropTypes.number.isRequired
    },

    getInitialState() {
        return {
            bodyVisible: false,
            invalidInput: false,
            showDeleteModal: false
        };
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

    hideEditGroupButton(e) {
        e.preventDefault();
        this.setState({
            invalidInput: false
        });
        this.refs.editGroupBtn.toggle();
    },

    toggleBodyVisibility() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    },

    handleEditGroup(e) {
        e.preventDefault();
        var self = this;
        if (e.target[0].form[0].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var otherGroups = _.filter(this.props.groups, function(groups) {
            return groups.id !== self.props.group.id;
        });
        if (_.some(otherGroups, { 'id': e.target[0].form[0].value })) {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var selectedTasks = [];
        var selectedCollections = [];
        var tasksIndex = 0;
        this.props.tasks.forEach(function(task, index) {
            tasksIndex++;
            for(var i = 0; i < e.target[0].form[index+2].value; i++) {
                selectedTasks.push(task.id);
            }
        });
        this.props.collections.forEach(function(collection, index) {
            for(var i = 0; i < e.target[0].form[tasksIndex+index+2].value; i++) {
                selectedCollections.push(collection.id);
            }
        });
        var newGroup = {
            id: e.target[0].form[0].value,
            n: e.target[0].form[1].value,
            tasks: selectedTasks,
            collections: selectedCollections
        };

        var nextGroups = this.props.groups;
        nextGroups[this.props.elementKey] = newGroup;

        this.refs.editGroupBtn.toggle();
        this.props.onEditGroup(nextGroups);
    },

    handleRemoveGroup() {
        this.setState({ showDeleteModal: false });
        this.props.onRemoveGroup(this.props.elementKey);
    },

    render() {
        var TaskCheckboxes = [];
        var CollectionCheckboxes = [];
        var self = this;

        this.props.tasks.forEach(function(task, i) {
            var count = 0;
            self.props.group.tasks.forEach(function(currentTask) {
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

        this.props.collections.forEach(function(collection, i) {
            var count = 0;
            self.props.group.collections.forEach(function(currentCollection) {
                if (collection.id === currentCollection) {
                    count++;
                }
            }); 
            CollectionCheckboxes.push(
                <div className="ct-box ct-box-collection" key={"c-box" + i}>
                    <div className="element-name" title={collection.id}>{collection.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
                </div>
            );
        });

        return (
            <div className="group">
                <h5>
                    <span className="glyphicon glyphicon-tasks"></span>
                    {this.props.group.id}
                    <span
                        className={this.state.bodyVisible ? "glyphicon glyphicon-chevron-up" : "glyphicon glyphicon-chevron-down"}
                        title={this.state.bodyVisible ? "hide": "show"}
                        onClick={this.toggleBodyVisibility}>
                    </span>

                    <span className="glyphicon glyphicon-trash" title="remove" onClick={this.openDeleteModal}></span>
                    <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete <strong>{this.props.group.id}</strong>?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete the group <strong>{this.props.group.id}?</strong></p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="danger" onClick={this.handleRemoveGroup}>Delete</Button>
                            <Button onClick={this.closeDeleteModal}>Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                    <OverlayTrigger trigger="click" placement="right" ref="editGroupBtn" onClick={this.handleInputChange} overlay={
                        <Popover className="add-cg-popover" title="edit group" id={this.props.group.id}>
                            <form onSubmit={this.handleEditGroup}>
                                <Input type="text" addonBefore="id" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : ""} defaultValue={this.props.group.id} />
                                <div className="row">
                                    <div className="col-xs-6">
                                        <Input type="number" min="1" step="1" addonBefore="n" defaultValue={this.props.group.n} />
                                    </div>
                                </div>
                                <p>Tasks in this group:</p>
                                {TaskCheckboxes}
                                <p>Collections in this group:</p>
                                {CollectionCheckboxes}
                                <div className="row">
                                    <div className="col-xs-12">
                                        <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="edit" />
                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditGroupButton}>cancel</Button>
                                    </div>
                                </div>
                            </form>
                        </Popover>
                    }>
                        <span className="glyphicon glyphicon-edit" title="edit"></span>
                    </OverlayTrigger>
                </h5>
                <div className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    <div><strong> n: </strong><span className="plain">{this.props.group.n}</span></div>
                    <hr />
                    <div className="group-tasks">
                        {this.props.group.tasks.map(function(task, i) {
                            return <span key={i}>{task}</span>;
                        })}
                    </div>
                    <div className="group-collections">
                        {this.props.group.collections.map(function(collection, i) {
                            return <span key={i}>{collection}</span>;
                        })}
                    </div>
                </div>
            </div>
        );
    }
});

export default Group;
