/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

import React from 'react';

import Collection from './Collection';

var CollectionList = React.createClass({
    propTypes: {
        collections: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        onRemoveCollection: React.PropTypes.func.isRequired,
        onEditCollection: React.PropTypes.func.isRequired
    },

    render() {
        var self = this;
        return (
            <div>
                {this.props.collections.map(function(collection, index) {
                    return <Collection collection={collection}
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
});

export default CollectionList;
