/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file "LICENSE"                       *
 ********************************************************************************/

var MainEditor = React.createClass({
    propTypes: {
        properties: React.PropTypes.array.isRequired,
        tasks: React.PropTypes.array.isRequired,
        collections: React.PropTypes.array.isRequired,
        main: React.PropTypes.object.isRequired,
        onEditMain: React.PropTypes.func.isRequired
    },

    getInitialState: function() {
        return {
            IdBeeingEdited: false,
            paper: null,
            graphScale: 1,
            interactive: true
        }
    },

    hideEditTasksInMainBtn: function(e) {
        e.preventDefault();
        this.refs.editTasksInMainBtn.toggle();
    },

    hideEditCollectionsInMainBtn: function(e) {
        e.preventDefault();
        this.refs.editCollectionsInMainBtn.toggle();
    },

    handleEditTasksInMain: function(e) {
        e.preventDefault();

        var selectedTasks = [];
        this.props.tasks.forEach(function(task, index) {
            for(var i = 0; i < e.target[0].form[index].value; i++) {
                selectedTasks.push(task.id);
            }
        });
        var nextMain = {
            id: this.props.main.id,
            tasks: selectedTasks,
            collections: this.props.main.collections,
            groups: this.props.main.groups
        };

        this.refs.editTasksInMainBtn.toggle();
        this.props.onEditMain(nextMain);
    },

    handleEditCollectionsInMain: function(e) {
        e.preventDefault();

        var selectedCollections = [];
        this.props.collections.forEach(function(collection, index) {
            for(var i = 0; i < e.target[0].form[index].value; i++) {
                selectedCollections.push(collection.id);
            }
        });
        var nextMain = {
            id: this.props.main.id,
            tasks: this.props.main.tasks,
            collections: selectedCollections,
            groups: this.props.main.groups
        };

        this.refs.editCollectionsInMainBtn.toggle();
        this.props.onEditMain(nextMain);
    },

    handlePaperVis: function(paper)  {
        this.setState({
            paper: paper
        });
    },

    handleZoomIn: function() {
        this.setState({
            graphScale: (this.state.graphScale + 0.1)
        });
        this.state.paper.scale(this.state.graphScale + 0.1, this.state.graphScale + 0.1);
        this.state.paper.fitToContent();
        this.state.paper.scaleContentToFit();
    },

    handleZoomOut: function() {
        this.setState({
            graphScale: (this.state.graphScale - 0.1)
        });
        this.state.paper.scale(this.state.graphScale - 0.1, this.state.graphScale -0.1);
        this.state.paper.fitToContent();
        this.state.paper.fitToContent();
    },

    handleReset: function() {
        this.setState({
            graphScale: 1
        });
        this.state.paper.scale(1, 1);
        this.state.paper.fitToContent();
    },

    handleInteraction: function() {
        if (this.state.interactive) {
            this.state.interactive = false;
            $('#adjust').html('<span class="glyphicon-pushpin"></span>');
        } else {
            this.state.interactive = true;
            $('#adjust').html('<span class="glyphicon glyphicon-move"></span>');
        }

        this.forceUpdate();
    },

    handlePropertyMenu: function(event) {
        if (this.state.paper !== null) {
            var propLines = V(this.state.paper.viewport).find('line');
            for (var i = 0; i < propLines.length; i++) {
                V(propLines[i]).attr('visibility', 'visible');
            }
            if (event.target.value !== 'all') {
                for (var i = 0; i < propLines.length; i++) {
                    for (var j = 0; j < propLines[i].attributes.length; j++) {
                        if (propLines[i].attributes[j].name === 'title') {
                            if (propLines[i].attributes[j].value !== event.target.value) {
                                console.log(propLines[i].attributes[j].value);
                                console.log(event.target.value);
                                V(propLines[i]).attr('visibility', 'hidden');
                            }
                        }
                    }
                    
                }
            }
        }
    },

    render: function() {
        var OverlayTrigger = ReactBootstrap.OverlayTrigger;
        var Popover = ReactBootstrap.Popover;
        var Button = ReactBootstrap.Button;
        var Input = ReactBootstrap.Input;
        var ButtonInput = ReactBootstrap.ButtonInput;
        var TaskCheckboxes = [];
        var CollectionCheckboxes = [];
        var PropertiesMenu = [];
        var self = this;

        PropertiesMenu.push(
                <option value="all" key={"p-vis-menu-all"}>all</option>
        );
        this.props.properties.forEach(function (property, i) {
            PropertiesMenu.push(
                <option value={property.id} key={"p-vis-menu"+i}>{property.id}</option>
            );
        });

        this.props.tasks.forEach(function(task, i) {
            var count = 0;
            self.props.main.tasks.forEach(function(currentTask, i) {
                if (task.id === currentTask) {
                    count++;
                }
            }); 
            TaskCheckboxes.push(
                <div className="ct-box ct-box-task" key={"t-box" + i}>
                    <div className="element-name" title={task.id}>{task.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
                </div>
            );
        });

        this.props.collections.forEach(function(collection, i) {
            var count = 0;
            self.props.main.collections.forEach(function(currentCollection, i) {
                if (collection.id === currentCollection) {
                    count++;
                }
            }); 
            CollectionCheckboxes.push(
                <div className="ct-box ct-box-collection" key={"c-box" + i}>
                    <div className="element-name" title={collection.id}>{collection.id}</div>
                    <Input className="add-cg-tc-counter" type="number" min="0" defaultValue={count} />
                </div>
            );
        });

        return (
            <div className="panel panel-default">
                <div className="panel-heading">
                    <p className="panel-title">{this.props.main.id}</p>
                </div>
                <div id="main-editor-body" className="panel-body">
                    <div className="row">
                        <div className="col-xs-4 centered main-element main-element-tasks">
                            <h5 className="main-header">
                                tasks in main
                                <OverlayTrigger trigger="click" placement="bottom" ref="editTasksInMainBtn" overlay={
                                    <Popover className="add-cg-popover" title="modify tasks in main">
                                        <form onSubmit={this.handleEditTasksInMain}>
                                            <p>Tasks in main:</p>
                                            {TaskCheckboxes}
                                            <div className="row">
                                                <div className="col-xs-12">
                                                    <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="edit" />
                                                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditTasksInMainBtn}>cancel</Button>
                                                </div>
                                            </div>
                                        </form>
                                    </Popover>
                                }>
                                    <span className="glyphicon glyphicon-edit add-task-btn edit-main-btn" title="edit tasks in main"></span>
                                </OverlayTrigger>
                            </h5>
                            <div className="group-tasks">{this.props.main.tasks}</div>
                        </div>
                        <div className="col-xs-4 centered main-element main-element-collections">
                            <h5 className="main-header">
                                collections in main
                                <OverlayTrigger trigger="click" placement="bottom" ref="editCollectionsInMainBtn" overlay={
                                    <Popover className="add-cg-popover" title="modify collections in main">
                                        <form onSubmit={this.handleEditCollectionsInMain}>
                                            <p>Collections in main:</p>
                                            {CollectionCheckboxes}
                                            <div className="row">
                                                <div className="col-xs-12">
                                                    <ButtonInput className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary" value="edit" />
                                                    <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideEditCollectionsInMainBtn}>cancel</Button>
                                                </div>
                                            </div>
                                        </form>
                                    </Popover>
                                }>
                                    <span className="glyphicon glyphicon-edit add-collection-btn edit-main-btn" title="edit collections in main"></span>
                                </OverlayTrigger>
                            </h5>
                            <div className="group-collections">{this.props.main.collections}</div>
                        </div>
                        <div className="col-xs-4 centered main-element main-element-groups">
                            <h5 className="main-header">groups</h5>
                            {this.props.main.groups.map(function(group, index) {
                                return <div className="group-groups" key={index}><span>{group.id} [{group.n}]</span></div>;
                            })}
                        </div>
                    <div className="centered main-element-vis">
                        <TopologyGraph tasks={this.props.tasks} collections={this.props.collections} main={this.props.main} interactive={this.state.interactive} onPaperChange={this.handlePaperVis}/>
                    </div>
                    <div className="row visual-menu">
                        <div className="col-xs-12">
                            <div className="col-xs-3">
                                <Button className="zoom-in glyphicon glyphicon-zoom-in" centered type="submit" bsSize="small" bsStyle="primary" onClick={this.handleZoomIn}> Zoom in </Button>
                            </div>
                            <div className="col-xs-3">
                                <Button className="zoom-out glyphicon glyphicon-zoom-out" centered type="submit" bsSize="small" bsStyle="primary" onClick={this.handleZoomOut}> Zoom out </Button>
                            </div>
                            <div className="col-xs-3">
                                <Button className="reset-view glyphicon glyphicon-refresh" centered type="submit" bsSize="small" bsStyle="primary" onClick={this.handleReset}> Reset </Button>
                            </div>
                            <div className="col-xs-3">
                                <Button id="adjust" className="interactive-view glyphicon glyphicon-adjust" centered type="submit" bsSize="small" bsStyle="primary" onClick={this.handleInteraction}></Button>
                            </div>
                        </div>
                    </div> <br />
                    <div className="row">
                        <div className="centered col-xs-12">
                            <span className="glyphicon glyphicon-align-justify ct-box-property" title="Properties"></span> Properties
                            <select onChange={this.handlePropertyMenu}>
                                {PropertiesMenu}
                            </select>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        );
    }
});

