/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var PropertyList = React.createClass({
    propTypes: {
        properties: React.PropTypes.array.isRequired,
        onRemoveProperty: React.PropTypes.func.isRequired,
        onEditProperty: React.PropTypes.func.isRequired
    },

    render: function() {
        var self = this;
        return (
            <div>
                {this.props.properties.map(function(property, index) {
                    return <Property property={property}
                                     onRemoveProperty={self.props.onRemoveProperty}
                                     onEditProperty={self.props.onEditProperty}
                                     key={index}
                                     elementKey={index}
                            />;
                })}
            </div>
        );
    }
});

var Property = React.createClass({
    propTypes: {
        property: React.PropTypes.object.isRequired,
        onRemoveProperty: React.PropTypes.func.isRequired,
        onEditProperty: React.PropTypes.func.isRequired,
        elementKey: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            bodyVisible: false,
            beeingEdited: false,
            showDeleteModal: false
        }
    },

    closeDeleteModal: function() {
        this.setState({ showDeleteModal: false });
    },

    openDeleteModal: function() {
        this.setState({ showDeleteModal: true });
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
        this.setState({ showDeleteModal: false });
        this.props.onRemoveProperty(this.props.elementKey);
    },

    render: function() {
        var Modal = ReactBootstrap.Modal;
        var Button = ReactBootstrap.Button;

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

                    <span className="glyphicon glyphicon-trash" title="delete" onClick={this.openDeleteModal}></span>
                    <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
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
                <ul className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    <div>
                        {this.state.beeingEdited ?
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
});
