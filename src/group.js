/** @jsx React.DOM */

/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var GroupList = React.createClass({
    render: function() {
        var that = this;
        return (
            <div>
                {this.props.groups.map(function(group, index) {
                    return <Group group={group} key={index} onRemoveGroup={that.props.onRemoveGroup} />;
                })}
            </div>
        );
    }
});

var Group = React.createClass({
    getInitialState: function() {
        return {
            bodyVisible: false
        }
    },

    toggleBodyVisibility: function() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    },

    handleRemoveGroup: function() {
        this.props.onRemoveGroup(this.props.key);
    },

    render: function() {
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
                    <span className="glyphicon glyphicon-remove" title="remove" onClick={this.handleRemoveGroup}></span>
                    <span className="glyphicon glyphicon-edit" title="edit"></span>
                </h5>
                <div className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    <div><strong> n: </strong><span className="plain">{this.props.group.n}</span></div>
                    <hr />
                    <div className="group-tasks">
                        {this.props.group.tasks}
                    </div>
                    <div className="group-collections">
                        {this.props.group.collections}
                    </div>
                </div>
            </div>
        );
    }
});