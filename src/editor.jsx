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

    render: function() {
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
                                    tasks<span className="glyphicon glyphicon-plus add-task-btn" title="add new task"></span>
                                </li>
                                <li className="list-group-item tasks">
                                    <TaskList tasks={this.state.tasks} />
                                </li>

                                <li className="list-group-item collections-header">
                                    collections<span className="glyphicon glyphicon-plus add-collection-btn" title="add new collection"></span>
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
