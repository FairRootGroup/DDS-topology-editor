/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';

import Collection from './Collection';

export default class CollectionList extends Component {
  static propTypes = {
    collections: PropTypes.array.isRequired,
    requirements: PropTypes.array.isRequired,
    tasks: PropTypes.array.isRequired,
    onRemoveCollection: PropTypes.func.isRequired,
    onEditCollection: PropTypes.func.isRequired
  };

  render() {
    return (
      <Fragment>
        {this.props.collections.map((collection, i) => {
          return <Collection collection={collection}
            requirements={this.props.requirements}
            collections={this.props.collections}
            tasks={this.props.tasks}
            onRemoveCollection={this.props.onRemoveCollection}
            onEditCollection={this.props.onEditCollection}
            key={i}
            elementKey={i}
          />;
        })}
      </Fragment>
    );
  }
}
