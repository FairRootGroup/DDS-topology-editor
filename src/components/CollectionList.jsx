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
import FormGroup from 'react-bootstrap/lib/FormGroup';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

import Collection from './Collection';

import store, { MCollection } from '../Store';

@observer export default class CollectionList extends Component {
  static propTypes = {
    taskCheckboxes: PropTypes.array.isRequired,
    requirementOptions: PropTypes.array.isRequired
  };

  @observable inputValid = false;
  @observable collectionsVisible = true;

  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action toggleCollectionsVisibility = () => { this.collectionsVisible = !this.collectionsVisible; }

  shouldComponentUpdate = () => true

  addCollectionBtn;

  handleAddCollection = (e) => {
    e.preventDefault();

    // cancel if ID is empty, or if ID already exists
    if (e.target[0].form[0].value === '' || store.hasCollection(e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const collection = new MCollection;
    collection.id = e.target[0].form[0].value;

    store.tasks.forEach((t, j) => {
      for (let i = 0; i < e.target[0].form[j + 1].value; i++) {
        collection.tasks.push(t.id);
      }
    });

    if (e.target[0].form['requirements'].value !== '') { // TODO: handle multiple
      collection.requirements.push(e.target[0].form['requirements'].value);
    }

    store.addCollection(collection);
    this.addCollectionBtn.hide();
  }

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  render() {
    return (
      <Fragment>
        <li className="list-group-item collections-header">
          collections
          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addCollectionBtn = el} onClick={() => this.setInputValidity(true)} overlay={
            <Popover className="add-cg-popover collection-popover" title="add new collection" id="addnewcollection">
              <form onSubmit={this.handleAddCollection}>
                <InputGroup>
                  <InputGroup.Addon>id</InputGroup.Addon>
                  <FormControl type="text" onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} />
                </InputGroup>

                <p>Tasks in this collection:</p>
                {this.props.taskCheckboxes}

                <p>Requirement for this collection (optional):</p>
                <div className="ct-box ct-box-requirement">
                  <div className="element-name">Requirement</div>
                  <FormGroup>
                    <FormControl componentClass="select" name="requirements" placeholder="" defaultValue="" className="accessSelect">
                      <option value="">-</option>
                      {this.props.requirementOptions}
                    </FormControl>
                  </FormGroup>
                </div>

                <div className="row">
                  <div className="col-xs-12">
                    <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => { this.setInputValidity(true); this.addCollectionBtn.hide(); }}>cancel</Button>
                  </div>
                </div>
              </form>
            </Popover>
          }>
            <span className="glyphicon glyphicon-plus add-collection-btn" title="add new collection"></span>
          </OverlayTrigger>
          <span
            className={this.collectionsVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
            title={this.collectionsVisible ? 'hide' : 'show'}
            onClick={this.toggleCollectionsVisibility}>
          </span>
        </li>
        <li className={this.collectionsVisible ? 'visible-container list-group-item collections' : 'invisible-container list-group-item collections'}>
          {store.collections.map((c, i) => {
            return <Collection collection={c} key={i} index={i} />;
          })}
        </li>
      </Fragment>
    );
  }
}
