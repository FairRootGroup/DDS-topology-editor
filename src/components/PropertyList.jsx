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
import FormControl from 'react-bootstrap/lib/FormControl';
import InputGroup from 'react-bootstrap/lib/InputGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';

import Property from './Property';

import store, { MProperty } from '../Store';

@observer export default class PropertyList extends Component {
  @observable inputValid = false;
  @observable propertiesVisible = true;

  @action setInputValidity = (valid) => { this.inputValid = valid; }
  @action togglePropertiesVisibility = () => { this.propertiesVisible = !this.propertiesVisible; }

  shouldComponentUpdate = () => true

  addPropertyBtn;

  handleAddProperty = (e) => {
    e.preventDefault();

    if (e.target[0].form[0].value === '' || store.hasProperty(e.target[0].form[0].value)) {
      this.setInputValidity(false);
      return;
    }

    const property = new MProperty;
    property.id = e.target[0].form[0].value;

    store.addProperty(property);
    this.addPropertyBtn.hide();
  }

  render() {
    return (
      <Fragment>
        <li className="list-group-item properties-header">
          properties
          <OverlayTrigger trigger="click" placement="right" ref={(el) => this.addPropertyBtn = el} onClick={() => this.setInputValidity(true)} overlay={
            <Popover className="add-cg-popover property-popover" title="add new property" id="addnewproperty">
              <form onSubmit={this.handleAddProperty}>
                <InputGroup>
                  <InputGroup.Addon>id&nbsp;</InputGroup.Addon>
                  <FormControl type="text" autoFocus onFocus={() => this.setInputValidity(true)} className={this.inputValid ? '' : 'invalid-input'} />
                </InputGroup>
                <div className="row">
                  <div className="col-xs-12">
                    <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">add</Button>
                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => { this.setInputValidity(true); this.addPropertyBtn.hide(); }}>cancel</Button>
                  </div>
                </div>
              </form>
            </Popover>
          }>
            <span className="glyphicon glyphicon-plus add-property-btn" title="add new property"></span>
          </OverlayTrigger>
          <span
            className={this.propertiesVisible ? 'glyphicon glyphicon-chevron-up toggle-property-btn' : 'glyphicon glyphicon-chevron-down toggle-property-btn'}
            title={this.propertiesVisible ? 'hide' : 'show'}
            onClick={this.togglePropertiesVisibility}>
          </span>
        </li>
        <li className={this.propertiesVisible ? 'visible-container list-group-item properties' : 'invisible-container list-group-item properties'}>
          {store.properties.map((p, i) => {
            return <Property property={p} key={i} index={i} />;
          })}
        </li>
      </Fragment>
    );
  }
}
