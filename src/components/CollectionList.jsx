/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React, { Component, PropTypes } from 'react';

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
        var self = this;
        return (
            <div>
                {this.props.collections.map(function(collection, index) {
                    return <Collection collection={collection}
                        requirements={self.props.requirements}
                        collections={self.props.collections}
                        tasks={self.props.tasks}
                        onRemoveCollection={self.props.onRemoveCollection}
                        onEditCollection={self.props.onEditCollection}
                        key={index}
                        elementKey={index}
                        />;
                })}
            </div>
        );
    }
}
