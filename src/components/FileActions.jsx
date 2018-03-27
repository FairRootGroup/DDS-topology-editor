/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import vkbeautify from 'vkbeautify';
import { saveAs } from 'filesaver.js';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Radio from 'react-bootstrap/lib/Radio';

import GitHub from 'github-api';

class FileActions extends Component {
  constructor() {
    super();

    this.fetchBtn;

    this.state = {
      remoteFiles: [],
      remoteUser: 'AliceO2Group',
      remoteRepo: 'AliceO2',
      remotePath: 'Common/Topologies',
      error: ''
    };

    this.hideFetchButton = this.hideFetchButton.bind(this);
    this.cancelFetch = this.cancelFetch.bind(this);
    this.handleFetch = this.handleFetch.bind(this);
    this.fetchTopologies = this.fetchTopologies.bind(this);
    this.handleFileLoad = this.handleFileLoad.bind(this);
    this.handleFileSave = this.handleFileSave.bind(this);
  }

  hideFetchButton(e) {
    e.preventDefault();
    this.fetchBtn.hide();
  }

  cancelFetch() {
    this.setState({ remoteFiles: [], error: '' });
  }

  handleFetch(e) {
    e.preventDefault();
    const self = this;

    const fileSelections = e.target[0].form['files'];

    for (let i = 0; i < fileSelections.length; i++) {
      if (fileSelections.item(i).checked) {
        const github = new GitHub();

        const repo = github.getRepo(self.state.remoteUser, self.state.remoteRepo);
        repo.getContents('dev', 'Common/Topologies' + '/' + self.state.remoteFiles[i].name, true, function(err, contents) {
          if (err) {
            console.log(err);
          }
          self.processXML(contents);
        });
      }
    }

    this.fetchBtn.hide();
  }

  fetchTopologies() {
    let github = new GitHub();
    let self = this;

    this.setState({ error: '' });

    let repo = github.getRepo(this.state.remoteUser, this.state.remoteRepo);
    // console.log(repo);
    repo.getContents('dev', this.state.remotePath, true, function(err, contents) {
      if (err) {
        console.log(err);
        if ('response' in err) {
          self.setState({
            error:
              err.response.data.message +
              '. Rate limit: ' +
              err.response.headers['x-ratelimit-limit'] +
              ', remaining: ' +
              err.response.headers['x-ratelimit-remaining'] +
              ', reset in: ' +
              new Date(err.response.headers['x-ratelimit-reset'] * 1000) + '.'
          });
        } else {
          self.setState({ error: JSON.stringify(err) });
        }
        return;
      }
      // console.log(contents);

      contents.forEach(function(object) {
        // console.log(' --- ');
        // console.log(object.name);
        // console.log(object);

        if (object.name.substr(object.name.length - 4) !== '.xml') {
          console.log('ignoring file with non-XML extension: ' + object.name);
          return;
        }

        let file = {};
        file.name = object.name;
        file.url = object.download_url;

        let nextFiles = self.state.remoteFiles;
        nextFiles.push(file);
        self.setState({ remoteFiles: nextFiles });

        // repo.getContents('dev', 'Common/Topologies' + '/' + object.name, true, function(err, contents) {
        //     if (err) {
        //         console.log(err);
        //     }
        //     file.contents = contents;
        // });
      });
    });
  }

  processXML(xmlString) {
    const parser = new DOMParser();
    var topologyId = '',
      variables = [],
      properties = [],
      requirements = [],
      tasks = [],
      collections = [],
      main = {};

    const $xml = $(parser.parseFromString(xmlString, 'application/xml'));

    // topology name
    topologyId = $xml.find('topology').attr('id');

    // variables
    $xml.find('topology>var').each(function() {
      var variable = {};
      variable.id = $(this).attr('id');
      variable.value = $(this).attr('value');
      variables.push(variable);
    });

    // properties
    $xml.find('topology>property').each(function() {
      var property = {};
      property.id = $(this).attr('id');
      properties.push(property);
    });

    // requirements
    $xml.find('topology>declrequirement').each(function() {
      var requirement = {};

      requirement.id = $(this).attr('id');
      requirement.type = $(this).attr('type');
      requirement.value = $(this).attr('value');

      requirements.push(requirement);
    });

    // tasks
    $xml.find('topology>decltask').each(function() {
      var task = {};

      task.id = $(this).attr('id');
      task.requirements = [];

      $(this).find('requirements').each(function() {
        $(this).find('id').each(function() {
          task.requirements.push($(this).text());
        });
      });

      $(this).find('exe').each(function() {
        task.exe = {};
        if (typeof ($(this).attr('reachable')) !== typeof undefined && ($(this).attr('reachable')) !== false) {
          task.exe.reachable = $(this).attr('reachable');
        }
        task.exe.valueText = $(this).text();
      });

      $(this).find('env').each(function() {
        task.env = {};
        if (typeof ($(this).attr('reachable')) !== typeof undefined && ($(this).attr('reachable')) !== false) {
          task.env.reachable = $(this).attr('reachable');
        }
        task.env.valueText = $(this).text();
      });

      task.properties = [];
      $(this).find('properties>id').each(function() {
        var property = {};
        property.id = $(this).text();
        if (typeof ($(this).attr('access')) !== typeof undefined) {
          property.access = $(this).attr('access');
        } else {
          property.access = 'readwrite';
        }
        task.properties.push(property);
      });
      tasks.push(task);
    });

    // collections
    $xml.find('topology>declcollection').each(function() {
      var collection = {};
      collection.id = $(this).attr('id');
      collection.requirements = [];

      $(this).find('requirements').each(function() {
        $(this).find('id').each(function() {
          collection.requirements.push($(this).text());
        });
      });

      collection.tasks = [];
      $(this).find('tasks>id').each(function() {
        collection.tasks.push($(this).text());
      });
      collections.push(collection);
    });

    // main
    var $main = $xml.find('topology>main');
    main.id = $main.attr('id');
    main.tasks = [];
    main.collections = [];
    main.groups = [];

    $xml.find('topology>main>task').each(function() {
      main.tasks.push($(this).text());
    });
    $xml.find('topology>main>collection').each(function() {
      main.collections.push($(this).text());
    });

    // groups in main
    $xml.find('topology>main>group').each(function() {
      var group = {};
      group.tasks = [];
      group.collections = [];
      group.id = $(this).attr('id');
      group.n = $(this).attr('n');
      $(this).find('task').each(function() {
        group.tasks.push($(this).text());
      });
      $(this).find('collection').each(function() {
        group.collections.push($(this).text());
      });
      main.groups.push(group);
    });

    this.props.onFileLoad(topologyId, variables, properties, requirements, tasks, collections, main);
  }

  handleFileLoad(event) {
    const self = this;
    var reader = new FileReader();
    var target = event.target;

    reader.onload = function() {
      self.processXML(reader.result);
      target.value = '';
    };

    reader.readAsText(event.target.files[0]);
  }

  handleFileSave() {
    var xmlDoc = document.implementation.createDocument('', '', null);
    var root = xmlDoc.createElement('topology');
    root.setAttribute('id', this.props.topologyId);

    // variables
    this.props.variables.forEach(function(variable) {
      var newVariable = xmlDoc.createElement('var');
      newVariable.setAttribute('id', variable.id);
      newVariable.setAttribute('value', variable.value);
      root.appendChild(newVariable);
    });

    // properties
    this.props.properties.forEach(function(property) {
      var newProperty = xmlDoc.createElement('property');
      newProperty.setAttribute('id', property.id);
      root.appendChild(newProperty);
    });

    // requirements
    this.props.requirements.forEach(function(requirement) {
      var newRequirement = xmlDoc.createElement('declrequirement');
      newRequirement.setAttribute('id', requirement.id);
      newRequirement.setAttribute('type', requirement.type);
      newRequirement.setAttribute('value', requirement.value);

      // append requirement to the root
      root.appendChild(newRequirement);
    });

    // tasks
    this.props.tasks.forEach(function(task) {
      var newTask = xmlDoc.createElement('decltask');
      newTask.setAttribute('id', task.id);

      // create and append task exe
      var taskExe = xmlDoc.createElement('exe');
      taskExe.textContent = task.exe.valueText;
      if (typeof task.exe.reachable !== typeof undefined) {
        taskExe.setAttribute('reachable', task.exe.reachable);
      }

      newTask.appendChild(taskExe);

      if (task.requirements.length > 0) {
        var taskRequirements = xmlDoc.createElement('requirements');
        task.requirements.forEach(function(taskRequirement) {
          let requirement = xmlDoc.createElement('id');
          requirement.textContent = taskRequirement;
          taskRequirements.appendChild(requirement);
        });
        newTask.appendChild(taskRequirements);
      }

      // create and append task env (if it exists)
      if (typeof task.env !== typeof undefined) {
        var taskEnv = xmlDoc.createElement('env');
        taskEnv.textContent = task.env.valueText;
        if (typeof task.env.reachable !== typeof undefined) {
          taskEnv.setAttribute('reachable', task.env.reachable);
        }

        newTask.appendChild(taskEnv);
      }

      // create task properties
      if (task.properties.length > 0) {
        var propertiesContainer = xmlDoc.createElement('properties');

        task.properties.forEach(function(property) {
          var newProperty = xmlDoc.createElement('id');
          newProperty.textContent = property.id;
          newProperty.setAttribute('access', property.access);
          propertiesContainer.appendChild(newProperty);
        });

        // append properties container
        newTask.appendChild(propertiesContainer);
      }

      root.appendChild(newTask);
    });

    // collections
    this.props.collections.forEach(function(collection) {
      var newCollection = xmlDoc.createElement('declcollection');
      newCollection.setAttribute('id', collection.id);

      if (collection.requirements.length > 0) {
        var collectionRequirements = xmlDoc.createElement('requirements');
        collection.requirements.forEach(function(collectionRequirement) {
          let requirement = xmlDoc.createElement('id');
          requirement.textContent = collectionRequirement;
          collectionRequirements.appendChild(requirement);
        });
        newCollection.appendChild(collectionRequirements);
      }

      var tasks = xmlDoc.createElement('tasks');

      collection.tasks.forEach(function(task) {
        var newTask = xmlDoc.createElement('id');
        newTask.textContent = task;
        tasks.appendChild(newTask);
      });

      newCollection.appendChild(tasks);

      root.appendChild(newCollection);
    });

    // main
    var main = xmlDoc.createElement('main');
    main.setAttribute('id', this.props.main.id);
    // tasks in main
    this.props.main.tasks.forEach(function(task) {
      var newTask = xmlDoc.createElement('task');
      newTask.textContent = task;
      main.appendChild(newTask);
    });
    // collections in main
    this.props.main.collections.forEach(function(collection) {
      var newCollection = xmlDoc.createElement('collection');
      newCollection.textContent = collection;
      main.appendChild(newCollection);
    });
    // groups in main
    this.props.main.groups.forEach(function(group) {
      var newGroup = xmlDoc.createElement('group');
      newGroup.setAttribute('id', group.id);
      newGroup.setAttribute('n', group.n);

      group.tasks.forEach(function(task) {
        var newTask = xmlDoc.createElement('task');
        newTask.textContent = task;
        newGroup.appendChild(newTask);
      });
      group.collections.forEach(function(collection) {
        var newCollection = xmlDoc.createElement('collection');
        newCollection.textContent = collection;
        newGroup.appendChild(newCollection);
      });

      main.appendChild(newGroup);
    });

    root.appendChild(main);

    xmlDoc.appendChild(root);

    let xmlString = new XMLSerializer().serializeToString(xmlDoc);

    xmlString = vkbeautify.xml(xmlString);

    var blob = new Blob([xmlString], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, this.props.topologyId + '.xml');
  }

  render() {
    return (
      <li className="list-group-item file-actions">
        <div className="row centered">
          <ButtonGroup>
            <Button className="btn-file" componentClass="span" bsSize="small" title="load topology file from disk">
              <span className="glyphicon glyphicon-floppy-open"></span> load<input type="file" onChange={this.handleFileLoad} />
            </Button>

            <OverlayTrigger trigger="click" placement="bottom" ref={(el) => this.fetchBtn = el} onEnter={this.fetchTopologies} onExit={this.cancelFetch} overlay={
              <Popover className="fetch-popover" title="fetch remote topologies" id="fetchremotetopologies">
                <p>Fetching topologies from<br /><span className="mono monobg">{this.state.remoteUser}/{this.state.remoteRepo}/{this.state.remotePath}</span></p>
                <form onSubmit={this.handleFetch}>
                  {this.state.error !== '' ? <p className="error">{this.state.error}</p> : ''}
                  <FormGroup>
                    {this.state.remoteFiles.map(function(file, i) {
                      return (<Radio title={file.url} key={file.name + i} name="files" className="mono">{file.name}</Radio>);
                    })}
                  </FormGroup>
                  <div className="row">
                    <div className="col-xs-12">
                      <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">load</Button>
                      <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={this.hideFetchButton}>cancel</Button>
                    </div>
                  </div>
                </form>
              </Popover>
            }>
              <Button bsSize="small" title="fetch topology file from a remote repository">
                <span className="glyphicon glyphicon-cloud-download"></span> fetch
                            </Button>
            </OverlayTrigger>

            <Button bsSize="small" onClick={this.handleFileSave} title="save the topology to disk">
              <span className="glyphicon glyphicon-floppy-save"></span> save
                        </Button>
          </ButtonGroup>
        </div>
      </li>
    );
  }
}

FileActions.propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  topologyId: PropTypes.string.isRequired,
  variables: PropTypes.array.isRequired,
  properties: PropTypes.array.isRequired,
  requirements: PropTypes.array.isRequired,
  tasks: PropTypes.array.isRequired,
  collections: PropTypes.array.isRequired,
  main: PropTypes.object.isRequired
};

export default FileActions;
