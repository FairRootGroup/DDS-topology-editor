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

    handleAddCollection: function(e) {
        e.preventDefault();
        var selectedTasks = [];
        this.state.tasks.forEach(function(task, index) {
            for(var i = 0; i < e.target[0].form[index+1].value; i++) {
                selectedTasks.push(task.properties.name);
            }
        });
        var nextCollections = this.state.collections.concat([{
            name: e.target[0].form[0].value,
            tasks: selectedTasks
        }]);
        this.refs.addCollectionBtn.toggle();
        this.setState({
            collections: nextCollections
        });
    },

    handleAddGroup: function(e) {
        e.preventDefault();
        var selectedTasks = [];
        var selectedCollections = [];
        var tasksIndex = 0;
        this.state.tasks.forEach(function(task, index) {
            tasksIndex++;
            for(var i = 0; i < e.target[0].form[index+1].value; i++) {
                selectedTasks.push(task.properties.name);
            }
        });
        this.state.collections.forEach(function(collection, index) {
            for(var i = 0; i < e.target[0].form[tasksIndex+index+1].value; i++) {
                selectedCollections.push(collection.name);
            }
        });
        var nextGroups = this.state.main.groups.concat([{
            name: e.target[0].form[0].value,
            n: 1,
            minRequired: 1,
            tasks: selectedTasks,
            collections: selectedCollections
        }]);
        var nextMain = {
                name: this.state.main.name,
                n: this.state.main.n,
                minRequired: this.state.main.minRequired,
                tasks: this.state.main.tasks,
                collections: this.state.main.collections,
                groups: nextGroups
            }
        this.setState({
            main: nextMain
        });
        this.refs.addGroupBtn.toggle();
    },

    hideAddCollectionButton: function(e) {
        e.preventDefault();
        this.refs.addCollectionBtn.toggle();
    },

    hideAddGroupButton: function(e) {
        e.preventDefault();
        this.refs.addGroupBtn.toggle();
    },

    render: function() {
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var Popover = ReactBootstrap.Popover;
        var Button = ReactBootstrap.Button;
        var Input = ReactBootstrap.Input;
        var TaskCheckboxes = [];
        var CollectionCheckboxes = [];

        this.state.tasks.forEach(function(task, i) {
            TaskCheckboxes.push(
                <div>
                    <div className="col-xs-8">
                        <div className="element-name" title={task.properties.name} key={i} >{task.properties.name}</div>
                    </div>
                    <div className="col-xs-4">
                        <Input className="add-cg-tc-counter" type="number" pattern="\d+" defaultValue="0" key={i} />
                    </div>
                </div>
            );
        });

        this.state.collections.forEach(function(collection, i) {
            CollectionCheckboxes.push(
                <div>
                    <div className="col-xs-8">
                        <div className="element-name" title={collection.name} key={i} >{collection.name}</div>
                    </div>
                    <div className="col-xs-4">
                        <Input className="add-cg-tc-counter" type="number" pattern="\d+" defaultValue="0" key={i} />
                    </div>
                </div>
            );
        });

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
                                    <OverlayTrigger trigger="click" placement="bottom" ref="addCollectionBtn" overlay={
                                        <Popover className="add-cg-popover" title="add new collection">
                                            <form onSubmit={this.handleAddCollection}>
                                                <Input type="text" addonBefore="name" />
                                                <p>Tasks in this collection:</p>
                                                <div className="row">
                                                {TaskCheckboxes}
                                                </div>
                                                <Input className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddCollectionButton}>cancel</Button>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-collection-btn" title="add new collection"></span>
                                    </OverlayTrigger>
                                </li>
                                <li className="list-group-item collections">
                                    <CollectionList collections={this.state.collections} />
                                </li>

                                <li className="list-group-item groups-header">
                                    groups
                                    <OverlayTrigger trigger="click" placement="bottom" ref="addGroupBtn" overlay={
                                        <Popover className="add-cg-popover" title="add new group">
                                            <form onSubmit={this.handleAddGroup}>
                                                <Input type="text" addonBefore="name" />
                                                <p>Tasks in this group:</p>
                                                <div className="row">
                                                {TaskCheckboxes}
                                                </div>
                                                <p>Collections in this group:</p>
                                                <div className="row">
                                                {CollectionCheckboxes}
                                                </div>
                                                <Input className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="add" />
                                                <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideAddGroupButton}>cancel</Button>
                                            </form>
                                        </Popover>
                                    }>
                                        <span className="glyphicon glyphicon-plus add-group-btn" title="add new group"></span>
                                    </OverlayTrigger>
                                </li>
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
                
            </li>
        );
    }
});
