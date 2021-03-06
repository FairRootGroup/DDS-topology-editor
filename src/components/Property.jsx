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
import Modal from 'react-bootstrap/lib/Modal';

import store, { MProperty } from '../Store';

@observer export default class Property extends Component {
  static propTypes = {
    property: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
  };

  @observable bodyVisible = false;
  @observable editing = false;
  @observable deleteModalVisible = false;

  @action toggleBodyVisibility = () => { this.bodyVisible = !(this.bodyVisible); }
  @action toggleEditing = () => { if (!this.editing) { this.editing = true; this.bodyVisible = true; } else { this.editing = false; } }
  @action openDeleteModal = () => { this.deleteModalVisible = true; }
  @action closeDeleteModal = () => { this.deleteModalVisible = false; }

  shouldComponentUpdate = () => true

  handleEditProperty = (e) => {
    e.preventDefault();

    if (e.target[0].form[0].value === '' || store.hasProperty(e.target[0].form[0].value)) {
      this.toggleEditing();
      return;
    }

    const property = new MProperty;
    property.id = e.target[0].form[0].value;

    store.editProperty(this.props.index, property);
    this.toggleEditing();
  }

  handleRemoveProperty = () => {
    store.removeProperty(this.props.index);
    this.closeDeleteModal();
  }

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  render() {
    return (
      <div className="property">
        <h5>
          <span className="glyphicon glyphicon-tasks"></span>
          <span className="element-title" title={this.props.property.id}>{this.props.property.id}</span>
          <span
            className={this.bodyVisible ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down'}
            title={this.bodyVisible ? 'hide' : 'show'}
            onClick={this.toggleBodyVisibility}>
          </span>

          <span className="glyphicon glyphicon-trash" title="delete" onClick={this.openDeleteModal}></span>
          <Modal show={this.deleteModalVisible} onHide={this.closeDeleteModal}>
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
        <ul className={this.bodyVisible ? 'visible-container' : 'invisible-container'}>
          <div>
            {this.editing ?
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
