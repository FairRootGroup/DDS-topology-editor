/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var PropertyList = React.createClass({
    render: function() {
        var self = this;
        return (
            <div>
                {this.props.properties.map(function(property, index) {
                    return <Property
                                property={property}
                                onEditProperty={self.props.onEditProperty}
                                onRemoveProperty={self.props.onRemoveProperty}
                                key={index}
                                elementKey={index}
                            />;
                })}
            </div>
        );
    }
});

var Property = React.createClass({
    getInitialState: function() {
        return {
            bodyVisible: false,
            beeingEdited: false
        }
    },

    toggleBodyVisibility: function() {
        if (!this.state.beeingEdited) {
            this.setState({ bodyVisible: !this.state.bodyVisible });
        }
    },

    toggleEditing: function() {
        if (!this.state.beeingEdited) {
            this.setState({ beeingEdited: true, bodyVisible: true });
        } else {
            this.setState({ beeingEdited: false });
        }
    },

    handleEditProperty: function(e) {
        e.preventDefault();
        if(e.target[0].form[0].value === "") {
            return;
        }
        var updatedProperty = {
            id: e.target[0].form[0].value
        };
        this.toggleEditing();
        this.props.onEditProperty(this.props.elementKey, updatedProperty);
    },

    handleRemoveProperty: function() {
        this.props.onRemoveProperty(this.props.elementKey);
    },

    render: function() {
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
                    <span className="glyphicon glyphicon-remove" title="remove" onClick={this.handleRemoveProperty}></span>
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
                            <span><strong>id:</strong> {this.props.property.id}</span>
                        }
                    </div>
                </ul>
            </div>
        );
    }
});
