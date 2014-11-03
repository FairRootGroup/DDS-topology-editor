/** @jsx React.DOM */

/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var CollectionList = React.createClass({
    render: function() {
        var that = this;
        return (
            <div>
                {this.props.collections.map(function(collection, index) {
                    return <Collection collection={collection} key={index} onRemoveCollection={that.props.onRemoveCollection} />;
                })}
            </div>
        );
    }
});

var Collection = React.createClass({
    getInitialState: function() {
        return {
            bodyVisible: false
        }
    },

    toggleBodyVisibility: function() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    },

    handleRemoveCollection: function() {
        this.props.onRemoveCollection(this.props.key);
    },

    render: function() {
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
                    <span className="glyphicon glyphicon-remove" title="remove" onClick={this.handleRemoveCollection}></span>
                    <span className="glyphicon glyphicon-edit" title="edit"></span>
                </h5>
                <div className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    {this.props.collection.tasks}
                </div>
            </div>
        );
    }
});