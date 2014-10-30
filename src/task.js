/** @jsx React.DOM */

/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var TaskList = React.createClass({
    render: function() {
        var that = this;
        return (
            <div>
                {this.props.tasks.map(function(task, index) {
                    return <Task task={task} key={index} onRemoveTask={that.props.onRemoveTask} />;
                })}
            </div>
        );
    }
});

var Task = React.createClass({
    getInitialState: function() {
        return {
            bodyVisible: false
        }
    },

    toggleBodyVisibility: function() {
        this.setState({ bodyVisible: !this.state.bodyVisible });
    },

    handleRemoveTask: function() {
        this.props.onRemoveTask(this.props.key);
    },

    render: function() {
        if (this.props.task.exe.reachable) {
            if (this.props.task.exe.reachable === "true") {
                var exeReachable = <span className="reachable" title="executable is available on worker nodes">(reachable)</span>
            } else if (this.props.task.exe.reachable === "false") {
                var exeReachable = <span className="reachable" title="executable is not available on worker nodes">(unreachable)</span>
            }
        }
        if (this.props.task.env) {
            if (this.props.task.env.reachable) {
                if (this.props.task.env.reachable === "true") {
                    var envValue = <li><span className="default-cursor"><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input><span className="reachable" title="executable is available on worker nodes">(reachable)</span></li>;
                } else if (this.props.task.env.reachable === "false") {
                    var envValue = <li><span className="default-cursor"><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input><span className="reachable" title="executable is not available on worker nodes">(unreachable)</span></li>;
                }
            } else {
                var envValue = <li><span className="default-cursor"><strong>env:</strong></span> <input className="code" readOnly value={this.props.task.env.valueText}></input></li>;
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
                    <span className="glyphicon glyphicon-remove" title="remove" onClick={this.handleRemoveTask}></span>
                    <span className="glyphicon glyphicon-edit" title="edit"></span>
                </h5>
                <ul className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    <li><span className="default-cursor"><strong>exe:</strong></span> <input className="code" readOnly value={this.props.task.exe.valueText}></input>{exeReachable}</li>
                    {envValue}
                    <div>
                        {this.props.task.properties}
                    </div>
                </ul>
            </div>
        );
    }
});
