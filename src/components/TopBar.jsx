/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { action, observable } from 'mobx';
import { observer } from 'mobx-react';

@observer export default class TopBar extends Component {
  propTypes = {
    topologyId: PropTypes.string.isRequired,
    onTopologyIdChange: PropTypes.func.isRequired,
    fluid: PropTypes.bool.isRequired,
    onToggleFluid: PropTypes.func.isRequired
  };

  @observable editing = false;

  @action toggleEditing = () => { this.editing = !(this.editing); }

  shouldComponentUpdate = () => true

  handleTopologyIdChange = (e) => {
    e.preventDefault();
    this.toggleEditing();
    this.props.onTopologyIdChange(e.target[0].form[0].value);
  }

  render() {
    return (
      <nav className="navbar navbar-inverse" role="navigation">
        <div className="container">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
              <span className="sr-only">Toggle navigation</span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
              <span className="icon-bar"></span>
            </button>
            <a className="navbar-brand" href="#">DDS Topology Editor</a>
          </div>
          <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
            <ul className="nav navbar-nav">
              <li className="active">
                {this.editing ?
                  <form className="name-change" onSubmit={this.handleTopologyIdChange}>
                    <input type="text" autoFocus defaultValue={this.props.topologyId}></input>
                    <input type="submit" value="ok" ></input>
                  </form>
                  :
                  <a href="#" onClick={this.toggleEditing}>{this.props.topologyId}</a>}
              </li>
            </ul>
            <ul className="nav navbar-nav navbar-right">
              <li>
                <a href="#" onClick={this.props.onToggleFluid}>
                  {this.props.fluid ?
                    <span className="glyphicon glyphicon-resize-small"></span>
                    :
                    <span className="glyphicon glyphicon-resize-full"></span>
                  }
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
