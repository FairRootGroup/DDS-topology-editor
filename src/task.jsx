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
        return (
            <div>
                {this.props.tasks.map(function(task, index) {
                    return <Task task={task} key={index} />;
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

    componentDidMount: function() {
        $(function () { $("[data-toggle='tooltip']").tooltip(); });
    },

    render: function() {
        var taskProperties = [];
        _.forIn(this.props.task.properties, function(prop, key) {
            if (key !== 'name') {
                taskProperties.push(<TaskProperty property={prop} key={key} />);
            }
        });
        return (
            <div className="task">
                <h5>
                    <span className="glyphicon glyphicon-tasks"></span>
                    {this.props.task.properties.name} 
                    <span
                        className={this.state.bodyVisible ? "glyphicon glyphicon-chevron-up" : "glyphicon glyphicon-chevron-down"}
                        title={this.state.bodyVisible ? "hide": "show"}
                        onClick={this.toggleBodyVisibility}>
                    </span>
                    <span className="glyphicon glyphicon-edit" title="edit"></span>
                </h5>
                <ul className={this.state.bodyVisible ? "visible-container" : "invisible-container"}>
                    <div>{taskProperties}</div>
                    {this.props.task.inputs.map(function(input) {
                        return (
                            <div data-toggle="tooltip" data-placement="right" title={input.type + " " + input.buffSize + " " + input.method}>
                                <span className="glyphicon glyphicon-log-in"></span>{input.address}
                            </div>
                        );
                    })}
                    {this.props.task.outputs.map(function(output) {
                        return (
                            <div data-toggle="tooltip" data-placement="right" title={output.type + " " + output.buffSize + " " + output.method}>
                                <span className="glyphicon glyphicon-log-out"></span>{output.address}
                            </div>
                        );
                    })}
                </ul>
            </div>
        );
    }
});

var TaskProperty = React.createClass({
    render: function() {
        return (
            <li><strong>{this.props.key}:</strong> {this.props.property}</li>
        );
    }
});
