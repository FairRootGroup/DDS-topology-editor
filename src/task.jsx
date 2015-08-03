/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var TaskList = React.createClass({
    propTypes: {
        properties: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        onRemoveTask: React.PropTypes.func.isRequired,
        onEditTask: React.PropTypes.func.isRequired
    },

    render: function() {
        var self = this;
        return (
            <div>
                {this.props.tasks.map(function(task, index) {
                    return <Task task={task}
                                 properties={self.props.properties}
                                 tasks={self.props.tasks}
                                 onRemoveTask={self.props.onRemoveTask}
                                 onEditTask={self.props.onEditTask}
                                 key={index}
                                 elementKey={index}
                            />;
                })}
            </div>
        );
    }
});

var Task = React.createClass({
    propTypes: {
        task: React.PropTypes.object.isRequired,
        properties: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        onRemoveTask: React.PropTypes.func.isRequired,
        onEditTask: React.PropTypes.func.isRequired,
        elementKey: React.PropTypes.number.isRequired
    },

    getInitialState: function() {
        return {
            bodyVisible: false,
            invalidInput: false,
            showDeleteModal: false
        }
    },

    closeDeleteModal: function() {
        this.setState({ showDeleteModal: false });
    },

    openDeleteModal: function() {
        this.setState({ showDeleteModal: true });
    },

    handleInputChange: function(e) {
        e.preventDefault();
        this.setState({ invalidInput: false });
    },

    hideEditTaskButton: function(e) {
        e.preventDefault();
        this.setState({ invalidInput: false });
        this.refs.editTaskBtn.toggle();
    },

    toggleBodyVisibility: function() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    },

    handleEditTask: function(e) {
        e.preventDefault();
        var self = this;
        if (e.target[0].form[0].value === "" || e.target[0].form[1].value === "") {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var otherTasks = _.filter(this.props.tasks, function(task) {
            return task.id !== self.props.task.id;
        });
        if (_.some(otherTasks, { 'id': e.target[0].form[0].value })) {
            this.setState({
                invalidInput: true
            });
            return;
        }
        var selectedProperties = [];
        this.props.properties.forEach(function(property, index) {
            if (e.target[0].form[index+5].value === "read") {
                selectedProperties.push({ id: property.id, access: "read" });
            } else if (e.target[0].form[index+5].value === "write") {
                selectedProperties.push({ id: property.id, access: "write" });
            } else if (e.target[0].form[index+5].value === "readwrite") {
                selectedProperties.push({ id: property.id, access: "readwrite" });
            }
        });
        var updatedTask = {
            id: e.target[0].form[0].value,
            exe: {
                valueText: e.target[0].form[1].value
            },
            properties: selectedProperties,
            requirement: this.props.task.requirement
        }

        if (e.target[0].form[2].checked === true) {
            updatedTask.exe.reachable = "true";
        }

        if (e.target[0].form[3].value !== "") {
            updatedTask.env = {};
            updatedTask.env.valueText = e.target[0].form[3].value;
            if (e.target[0].form[4].checked == true) {
                updatedTask.env.reachable = "true";
            }
        }

        this.refs.editTaskBtn.toggle();
        this.props.onEditTask(this.props.elementKey, updatedTask);
    },

    handleRemoveTask: function() {
        this.setState({ showDeleteModal: false });
        this.props.onRemoveTask(this.props.elementKey);
    },

    render: function() {
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var Popover = ReactBootstrap.Popover;
        var Button = ReactBootstrap.Button;
        var Input = ReactBootstrap.Input;
        var ButtonInput = ReactBootstrap.ButtonInput;
        var Modal = ReactBootstrap.Modal;
        var PropertyCheckboxes = [];
        var exeReachableCheckbox = false;
        var envReachableCheckbox = false;
        var envPresent = false;
        var self = this;

        this.props.properties.forEach(function(property, i) {
            var access = "";
            self.props.task.properties.forEach(function(currentProperty, i) {
                if (property.id === currentProperty.id) {
                    access = currentProperty.access;
                }
            });
            PropertyCheckboxes.push(
                <div className="ct-box ct-box-property" key={"t-box" + i}>
                    <div className="element-name" title={property.id}>{property.id}</div>
                    <Input type="select" defaultValue={access} className="accessSelect">
                        <option value="">-</option>
                        <option value="read">read</option>
                        <option value="write">write</option>
                        <option value="readwrite">readwrite</option>
                    </Input>
                </div>
            );
        });

        if (this.props.task.exe.reachable) {
            if (this.props.task.exe.reachable === "true") {
                var exeReachable = <span className="reachable" title="executable is available on worker nodes">(reachable)</span>
                exeReachableCheckbox = true;
            } else if (this.props.task.exe.reachable === "false") {
                var exeReachable = <span className="reachable" title="executable is not available on worker nodes">(unreachable)</span>
            }
        }
        if (this.props.task.env) {
            envPresent = true;
            if (this.props.task.env.reachable) {
                if (this.props.task.env.reachable === "true") {
                    var envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input><span className="reachable" title="executable is available on worker nodes">(reachable)</span></li>;
                    envReachableCheckbox = true;
                } else if (this.props.task.env.reachable === "false") {
                    var envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input><span className="reachable" title="executable is not available on worker nodes">(unreachable)</span></li>;
                }
            } else {
                var envValue = <li><span><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input></li>;
            }
        }
        return (
            <div className="task">
                <h5>
                    <span className="glyphicon glyphicon-tasks"></span>
                    <span className="element-title" title={this.props.task.id}>{this.props.task.id}</span>
                    <span
                        className={this.state.bodyVisible ? "glyphicon glyphicon-chevron-up" : "glyphicon glyphicon-chevron-down"}
                        title={this.state.bodyVisible ? "hide": "show"}
                        onClick={this.toggleBodyVisibility}>
                    </span>

                    <span className="glyphicon glyphicon-trash" title="delete" onClick={this.openDeleteModal}></span>
                    <Modal show={this.state.showDeleteModal} onHide={this.closeDeleteModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete <strong>{this.props.task.id}</strong>?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete the task <strong>{this.props.task.id}?</strong></p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="danger" onClick={this.handleRemoveTask}>Delete</Button>
                            <Button onClick={this.closeDeleteModal}>Cancel</Button>
                        </Modal.Footer>
                    </Modal>

                    <OverlayTrigger trigger="click" placement="right" ref="editTaskBtn" onClick={this.handleInputChange} overlay={
                        <Popover className="add-cg-popover" title="edit task">
                            <form onSubmit={this.handleEditTask}>
                                <Input type="text" addonBefore="id" onChange={this.handleInputChange} className={this.state.invalidInput ? "invalid-input" : "" } defaultValue={this.props.task.id} />
                                <Input type="text" addonBefore="exe" onChange={this.handleInputChange} className={this.state.invalidInput ? "mono invalid-input" : "mono" } defaultValue={this.props.task.exe.valueText || ""} />
                                <Input type="checkbox" label="exe reachable (optional)" defaultChecked={exeReachableCheckbox} />
                                <Input type="text" addonBefore="env" className="mono" defaultValue={envPresent ? this.props.task.env.valueText || "" : ""}/>
                                <Input type="checkbox" label="env reachable (optional)"defaultChecked={envReachableCheckbox} />
                                <p>Properties in this task:</p>
                                {PropertyCheckboxes}
                                <div className="row">
                                    <div className="col-xs-12">
                                        <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="edit" />
                                        <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditTaskButton}>cancel</Button>
                                    </div>
                                </div>
                            </form>
                        </Popover>
                    }>
                        <span className="glyphicon glyphicon-edit" title="edit task"></span>
                    </OverlayTrigger>
                </h5>
                <ul className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    <li><span><strong>exe:</strong></span> <input className="code" readOnly value={this.props.task.exe.valueText} title={this.props.task.exe.valueText}></input>{exeReachable}</li>
                    {envValue}
                    <div>
                        {this.props.task.properties.map(function(property) {
                            return (<span title={property.id} key={property.id}>
                                        &nbsp;
                                        <span className="prop-access" title={ (property.access === "write") ? "write" : "" }>{ (property.access === "write") ? "W " : "" }</span>
                                        <span className="prop-access" title={ (property.access === "read") ? "read" : "" }>{ (property.access === "read") ? "R " : "" }</span>
                                        <span className="prop-access" title={ (property.access === "readwrite") ? "read & write" : "" }>{ (property.access === "readwrite") ? "RW " : "" }</span>
                                        {property.id}
                                    </span>);
                        })}
                    </div>
                </ul>
            </div>
        );
    }
});
