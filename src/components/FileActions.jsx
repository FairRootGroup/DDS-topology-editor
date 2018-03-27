/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

    const fileSelections = e.target[0].form['files'];

    for (let i = 0; i < fileSelections.length; i++) {
      if (fileSelections.item(i).checked) {
        const github = new GitHub();

        const repo = github.getRepo(this.state.remoteUser, this.state.remoteRepo);
        repo.getContents('dev', 'Common/Topologies' + '/' + this.state.remoteFiles[i].name, true, (err, contents) => {
          if (err) {
            console.log(err);
          }
          this.processXML(contents);
        });
      }
    }

    this.fetchBtn.hide();
  }

  fetchTopologies() {
    let github = new GitHub();

    this.setState({ error: '' });

    let repo = github.getRepo(this.state.remoteUser, this.state.remoteRepo);

    repo.getContents('dev', this.state.remotePath, true, (err, contents) => {
      if (err) {
        console.log(err);
        if ('response' in err) {
          this.setState({
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
          this.setState({ error: JSON.stringify(err) });
        }
        return;
      }

      contents.forEach(object => {
        if (object.name.substr(object.name.length - 4) !== '.xml') {
          console.log('ignoring file with non-XML extension: ' + object.name);
          return;
        }

        let file = {};
        file.name = object.name;
        file.url = object.download_url;

        let nextFiles = this.state.remoteFiles;
        nextFiles.push(file);
        this.setState({ remoteFiles: nextFiles });
      });
    });
  }

  processXML(xmlString) {
    const parser = new DOMParser();
    let topologyId = '',
      variables = [],
      properties = [],
      requirements = [],
      tasks = [],
      collections = [],
      main = {};

    const xml = parser.parseFromString(xmlString, 'application/xml');

    // topology name
    topologyId = xml.querySelector('topology').getAttribute('id');

    // variables
    xml.querySelectorAll('topology>var').forEach(v => {
      const variable = {};

      variable.id = v.getAttribute('id');
      variable.value = v.getAttribute('value');

      variables.push(variable);
    });

    // properties
    xml.querySelectorAll('topology>property').forEach(p => {
      const property = {};

      property.id = p.getAttribute('id');

      properties.push(property);
    });

    // requirements
    xml.querySelectorAll('topology>declrequirement').forEach(r => {
      const requirement = {};

      requirement.id = r.getAttribute('id');
      requirement.type = r.getAttribute('type');
      requirement.value = r.getAttribute('value');

      requirements.push(requirement);
    });

    // tasks
    xml.querySelectorAll('topology>decltask').forEach(t => {
      const task = {};

      task.id = t.getAttribute('id');
      task.requirements = [];

      t.querySelectorAll('requirements').forEach(r => {
        r.querySelectorAll('id').forEach(i => task.requirements.push(i.textContent));
      });

      t.querySelectorAll('exe').forEach(e => {
        task.exe = {};
        if (e.hasAttribute('reachable')) {
          task.exe.reachable = e.getAttribute('reachable');
        }
        task.exe.valueText = e.textContent;
      });

      t.querySelectorAll('env').forEach(e => {
        task.env = {};
        if (e.hasAttribute('reachable')) {
          task.env.reachable = e.getAttribute('reachable');
        }
        task.env.valueText = e.textContent;
      });

      task.properties = [];
      t.querySelectorAll('properties>id').forEach(p => {
        const property = {};
        property.id = p.textContent;
        if (p.hasAttribute('access')) {
          property.access = p.getAttribute('access');
        } else {
          property.access = 'readwrite';
        }
        task.properties.push(property);
      });

      tasks.push(task);
    });

    // collections
    xml.querySelectorAll('topology>declcollection').forEach(c => {
      const collection = {};
      collection.id = c.getAttribute('id');
      collection.tasks = [];
      collection.requirements = [];

      c.querySelectorAll('requirements').forEach(r => {
        r.querySelectorAll('id').forEach(i => collection.requirements.push(i.textContent));
      });

      c.querySelectorAll('tasks>id').forEach(t => collection.tasks.push(t.textContent));

      collections.push(collection);
    });

    // main
    main.id = xml.querySelector('topology>main').getAttribute('id');
    main.tasks = [];
    main.collections = [];
    main.groups = [];

    xml.querySelectorAll('topology>main>task').forEach(t => main.tasks.push(t.textContent));
    xml.querySelectorAll('topology>main>collection').forEach(c => main.collections.push(c.textContent));

    // groups in main
    xml.querySelectorAll('topology>main>group').forEach(g => {
      const group = {};
      group.tasks = [];
      group.collections = [];
      group.id = g.getAttribute('id');
      group.n = g.getAttribute('n');

      g.querySelectorAll('task').forEach(t => group.tasks.push(t.textContent));
      g.querySelectorAll('collection').forEach(c => group.collections.push(c.textContent));

      main.groups.push(group);
    });

    this.props.onFileLoad(topologyId, variables, properties, requirements, tasks, collections, main);
  }

  handleFileLoad(event) {
    const reader = new FileReader();
    const target = event.target;

    reader.onload = () => {
      this.processXML(reader.result);
      target.value = '';
    };

    reader.readAsText(event.target.files[0]);
  }

  handleFileSave() {
    const xmlDoc = document.implementation.createDocument('', '', null);
    const root = xmlDoc.createElement('topology');
    root.setAttribute('id', this.props.topologyId);

    // variables
    this.props.variables.forEach(variable => {
      const newVariable = xmlDoc.createElement('var');
      newVariable.setAttribute('id', variable.id);
      newVariable.setAttribute('value', variable.value);
      root.appendChild(newVariable);
    });

    // properties
    this.props.properties.forEach(property => {
      const newProperty = xmlDoc.createElement('property');
      newProperty.setAttribute('id', property.id);
      root.appendChild(newProperty);
    });

    // requirements
    this.props.requirements.forEach(requirement => {
      const newRequirement = xmlDoc.createElement('declrequirement');
      newRequirement.setAttribute('id', requirement.id);
      newRequirement.setAttribute('type', requirement.type);
      newRequirement.setAttribute('value', requirement.value);

      // append requirement to the root
      root.appendChild(newRequirement);
    });

    // tasks
    this.props.tasks.forEach(task => {
      const newTask = xmlDoc.createElement('decltask');
      newTask.setAttribute('id', task.id);

      // create and append task exe
      const taskExe = xmlDoc.createElement('exe');
      taskExe.textContent = task.exe.valueText;
      if (typeof task.exe.reachable !== typeof undefined) {
        taskExe.setAttribute('reachable', task.exe.reachable);
      }

      newTask.appendChild(taskExe);

      if (task.requirements.length > 0) {
        const taskRequirements = xmlDoc.createElement('requirements');
        task.requirements.forEach(taskRequirement => {
          const requirement = xmlDoc.createElement('id');
          requirement.textContent = taskRequirement;
          taskRequirements.appendChild(requirement);
        });
        newTask.appendChild(taskRequirements);
      }

      // create and append task env (if it exists)
      if (typeof task.env !== typeof undefined) {
        const taskEnv = xmlDoc.createElement('env');
        taskEnv.textContent = task.env.valueText;
        if (typeof task.env.reachable !== typeof undefined) {
          taskEnv.setAttribute('reachable', task.env.reachable);
        }

        newTask.appendChild(taskEnv);
      }

      // create task properties
      if (task.properties.length > 0) {
        const propertiesContainer = xmlDoc.createElement('properties');

        task.properties.forEach(property => {
          const newProperty = xmlDoc.createElement('id');
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
    this.props.collections.forEach(collection => {
      const newCollection = xmlDoc.createElement('declcollection');
      newCollection.setAttribute('id', collection.id);

      if (collection.requirements.length > 0) {
        const collectionRequirements = xmlDoc.createElement('requirements');
        collection.requirements.forEach(collectionRequirement => {
          const requirement = xmlDoc.createElement('id');
          requirement.textContent = collectionRequirement;
          collectionRequirements.appendChild(requirement);
        });
        newCollection.appendChild(collectionRequirements);
      }

      const tasks = xmlDoc.createElement('tasks');

      collection.tasks.forEach(task => {
        const newTask = xmlDoc.createElement('id');
        newTask.textContent = task;
        tasks.appendChild(newTask);
      });

      newCollection.appendChild(tasks);

      root.appendChild(newCollection);
    });

    // main
    const main = xmlDoc.createElement('main');
    main.setAttribute('id', this.props.main.id);
    // tasks in main
    this.props.main.tasks.forEach(task => {
      const newTask = xmlDoc.createElement('task');
      newTask.textContent = task;
      main.appendChild(newTask);
    });
    // collections in main
    this.props.main.collections.forEach(collection => {
      const newCollection = xmlDoc.createElement('collection');
      newCollection.textContent = collection;
      main.appendChild(newCollection);
    });
    // groups in main
    this.props.main.groups.forEach(group => {
      const newGroup = xmlDoc.createElement('group');
      newGroup.setAttribute('id', group.id);
      newGroup.setAttribute('n', group.n);

      group.tasks.forEach(task => {
        const newTask = xmlDoc.createElement('task');
        newTask.textContent = task;
        newGroup.appendChild(newTask);
      });
      group.collections.forEach(collection => {
        const newCollection = xmlDoc.createElement('collection');
        newCollection.textContent = collection;
        newGroup.appendChild(newCollection);
      });

      main.appendChild(newGroup);
    });

    root.appendChild(main);

    xmlDoc.appendChild(root);

    let xmlString = new XMLSerializer().serializeToString(xmlDoc);

    xmlString = vkbeautify.xml(xmlString);

    const blob = new Blob([xmlString], { type: 'text/plain;charset=utf-8' });
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

            <OverlayTrigger trigger="click" placement="bottom" ref={el => this.fetchBtn = el} onEnter={this.fetchTopologies} onExit={this.cancelFetch} overlay={
              <Popover className="fetch-popover" title="fetch remote topologies" id="fetchremotetopologies">
                <p>Fetching topologies from<br /><span className="mono monobg">{this.state.remoteUser}/{this.state.remoteRepo}/{this.state.remotePath}</span></p>
                <form onSubmit={this.handleFetch}>
                  {this.state.error !== '' ? <p className="error">{this.state.error}</p> : ''}
                  <FormGroup>
                    {this.state.remoteFiles.map((file, i) => {
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
