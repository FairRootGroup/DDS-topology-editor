/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, PropTypes } from 'react';
import {
    Button,
    Modal
} from 'react-bootstrap';

export default class Property extends Component {
    static propTypes = {
        property: PropTypes.object.isRequired,
        onRemoveProperty: PropTypes.func.isRequired,
        onEditProperty: PropTypes.func.isRequired,
        elementKey: PropTypes.number.isRequired
    };

    constructor() {
        super();

        this.state = {
            bodyVisible: false,
            beeingEdited: false,
            showDeleteModal: false
        };

        this.closeDeleteModal = this.closeDeleteModal.bind(this);
        this.openDeleteModal = this.openDeleteModal.bind(this);
        this.toggleBodyVisibility = this.toggleBodyVisibility.bind(this);
        this.toggleEditing = this.toggleEditing.bind(this);
        this.handleEditProperty = this.handleEditProperty.bind(this);
        this.handleRemoveProperty = this.handleRemoveProperty.bind(this);
    }

    closeDeleteModal() {
        this.setState({ showDeleteModal: false });
    }

    openDeleteModal() {
        this.setState({ showDeleteModal: true });
    }

    toggleBodyVisibility() {
        if (!this.state.beeingEdited) {
            this.setState({ bodyVisible: !this.state.bodyVisible });
        }
    }

    toggleEditing() {
        if (!this.state.beeingEdited) {
            this.setState({ beeingEdited: true, bodyVisible: true });
        } else {
            this.setState({ beeingEdited: false });
        }
    }

    handleEditProperty(e) {
        e.preventDefault();
        if(e.target[0].form[0].value === "") {
            return;
        }
        var updatedProperty = {
            id: e.target[0].form[0].value
        };
        this.toggleEditing();
        this.props.onEditProperty(this.props.elementKey, updatedProperty);
    }

    handleRemoveProperty() {
        this.setState({ showDeleteModal: false });
        this.props.onRemoveProperty(this.props.elementKey);
    }

    render() {
        return (
            <div className="property">
                <h5>
                    <span className="glyphicon glyphicon-tasks"></span>
                    <span className="element-title" title={this.props.property.id}>{this.props.property.id}</span>
                    <span
                        className={this.state.bodyVisible ? "glyphicon glyphicon-chevron-up" : "glyphicon glyphicon-chevron-down"}
                        title={this.state.bodyVisible ? "hide": "show"}
                        onClick={this.toggleBodyVisibility}>
                    </span>

                    <span className="glyphicon glyphicon-trash" title="delete" onClick={this.openDeleteModal}></span>
                    <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete <strong>{this.props.property.id}</strong>?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete the property <strong>{this.props.property.id}?</strong></p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="danger" onClick={this.handleRemoveProperty}>Delete</Button>
                            <Button onClick={this.closeDeleteModal}>Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                    <span className="glyphicon glyphicon-edit" title="edit" onClick={this.toggleEditing}></span>
                </h5>
                <ul className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    <div>
                        {this.state.beeingEdited ?
                            <form onSubmit={this.handleEditProperty}>
                                <strong>id: </strong>
                                <input className="form-control" type="text" autoFocus defaultValue={this.props.property.id}></input>
                                <button className="btn btn-xs btn-primary" type="submit">ok</button>
                            </form>
                            :
                            <span title={this.props.property.id}><strong>id:</strong> {this.props.property.id}</span>
                        }
                    </div>
                </ul>
            </div>
        );
    }
}
