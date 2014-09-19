/** @jsx React.DOM */

/*
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 */

var TopologyEditor = React.createClass({
    getInitialState: function() {
        return {
            topologyName: 'new topology',
            tasks: [],
            collections: [],
            main: {
                name: 'main',
                n: 1,
                minRequired: 1,
                tasks: [],
                collections: [],
                groups: []
            }
        };
    },

    handleTopologyChange: function(topologyName, tasks, collections, main) {
        this.setState({
            topologyName: topologyName,
            tasks: tasks,
            collections: collections,
            main: main
        });
    },

    handleAddTask: function(e) {
        e.preventDefault();
        var nextTasks = this.state.tasks.concat([{
            inputs: [],
            outputs: [],
            properties: {name: 'new task'}
        }]);
        this.setState({
            tasks: nextTasks
        });
    },

    render: function() {
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var Popover = ReactBootstrap.Popover;
        var Button = ReactBootstrap.Button;
        var Input = ReactBootstrap.Input;

        return (
            <div>
                <TopBar topologyName={this.state.topologyName} />

                <div className="container">
                    <div className="row">
                        <div className="col-xs-3">
                            <ul className="list-group left-pane">
                                <FileActions
                                    onFileLoad={this.handleTopologyChange}
                                    topologyName={this.state.topologyName}
                                    tasks={this.state.tasks}
                                    collections={this.state.collections}
                                    main={this.state.main}
                                />

                                <li className="list-group-item tasks-header">
                                    tasks<span className="glyphicon glyphicon-plus add-task-btn" title="add new task" onClick={this.handleAddTask}></span>
                                </li>
                                <li className="list-group-item tasks">
                                    <TaskList tasks={this.state.tasks} />
                                </li>

                                <li className="list-group-item collections-header">
                                    collections
                                    <OverlayTrigger trigger="click" placement="bottom" overlay={
                                        <Popover title="add new collection">
                                            <Input type="text" addonBefore="name" />
                                            <br />
                                            <Button bsSize="xsmall" bsStyle="primary">add</Button>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-collection-btn" title="add new collection"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item collections">
                                    <CollectionList collections={this.state.collections} />
                                </li>

                                <li className="list-group-item groups-header">groups<span className="glyphicon glyphicon-plus add-group-btn" title="add new group"></span></li>
                                <li className="list-group-item groups">
                                    <GroupList groups={this.state.main.groups} />
                                </li>

                                <Commands />
                            </ul>
                        </div>
                        <div className="col-xs-9">
                            <MainEditor tasks={this.state.tasks} collections={this.state.collections} main={this.state.main} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

var Commands = React.createClass({
    render: function() {
        return (
            <li className="list-group-item">
                commands
            </li>
        );
    }
});
