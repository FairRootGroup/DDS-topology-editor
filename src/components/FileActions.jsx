/********************************************************************************
 *    Copyright (C) 2014 GSI Helmholtzzentrum fuer Schwerionenforschung GmbH    *
 *                                                                              *
 *              This software is distributed under the terms of the             *
 *         GNU Lesser General Public Licence version 3 (LGPL) version 3,        *
 *                  copied verbatim in the file 'LICENSE'                       *
 ********************************************************************************/

import React, { Component } from 'react';
import vkbeautify from 'vkbeautify';
import { saveAs } from 'file-saver';

import { action, observable, makeObservable } from 'mobx';
import { observer } from 'mobx-react';

import Button from 'react-bootstrap/lib/Button';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import Radio from 'react-bootstrap/lib/Radio';

import GitHub from 'github-api';

import store, { MCollection, MGroup, MMain, MProperty, MRequirement, MTask, MTaskProperty, MVariable } from '../Store';

@observer export default class FileActions extends Component {
  @observable remoteFiles = [];
  @observable error = '';

  @action updateRemoteFiles = (files) => { this.remoteFiles = files; }
  @action addRemoteFile = (file) => { this.remoteFiles.push(file); }
  @action setError = (e) => { this.error = e; }

  remoteUser = 'AliceO2Group';
  remoteRepo = 'AliceO2';
  remotePath = 'Common/Topologies';

  fetchBtn;

  cancelFetch = () => {
    this.updateRemoteFiles([]);
    this.setError('');
  }

  handleFetch = (e) => {
    e.preventDefault();

    const fileSelections = e.target[0].form['files'];

    for (let i = 0; i < fileSelections.length; i++) {
      if (fileSelections.item(i).checked) {
        const github = new GitHub();

        const repo = github.getRepo(this.remoteUser, this.remoteRepo);
        repo.getContents('dev', 'Common/Topologies' + '/' + this.remoteFiles[i].name, true, (err, contents) => {
          if (err) {
            console.log(err);
          }
          this.processXML(contents);
        });
      }
    }

    this.fetchBtn.hide();
  }

  fetchTopologies = () => {
    const github = new GitHub();

    this.setError('');

    const repo = github.getRepo(this.remoteUser, this.remoteRepo);

    repo.getContents('dev', this.remotePath, true, (err, contents) => {
      if (err) {
        console.log(err);
        if ('response' in err) {
          this.setError(err.response.data.message +
                        '. Rate limit: ' +
                        err.response.headers['x-ratelimit-limit'] +
                        ', remaining: ' +
                        err.response.headers['x-ratelimit-remaining'] +
                        ', reset in: ' +
                        new Date(err.response.headers['x-ratelimit-reset'] * 1000) + '.');
        } else {
          this.setError(JSON.stringify(err));
        }
        return;
      }

      contents.forEach(object => {
        if (object.name.substr(object.name.length - 4) !== '.xml') {
          console.log('ignoring file with non-XML extension: ' + object.name);
          return;
        }

        const file = {};
        file.name = object.name;
        file.url = object.download_url;

        this.addRemoteFile(file);
      });
    });
  }

  processXML = (xmlString) => {
    const parser = new DOMParser();
    const variables = [];
    const properties = [];
    const requirements = [];
    const tasks = [];
    const collections = [];
    const main = new MMain;

    const xml = parser.parseFromString(xmlString, 'application/xml');

    // topology name
    store.setTopologyId(xml.querySelector('topology').getAttribute('id'));

    // variables
    xml.querySelectorAll('topology>var').forEach(v => {
      const variable = new MVariable;

      variable.id = v.getAttribute('id');
      variable.value = v.getAttribute('value');

      variables.push(variable);
    });
    store.setVariables(variables);

    // properties
    xml.querySelectorAll('topology>property').forEach(p => {
      const property = new MProperty;

      property.id = p.getAttribute('id');

      properties.push(property);
    });
    store.setProperties(properties);

    // requirements
    xml.querySelectorAll('topology>declrequirement').forEach(r => {
      const requirement = new MRequirement;

      requirement.id = r.getAttribute('id');

      r.querySelectorAll('hostPattern').forEach(hp => {
        requirement.type = hp.getAttribute('type');
        requirement.value = hp.getAttribute('value');
      });

      requirements.push(requirement);
    });
    store.setRequirements(requirements);

    // tasks
    xml.querySelectorAll('topology>decltask').forEach(t => {
      const task = new MTask;

      task.id = t.getAttribute('id');

      t.querySelectorAll('requirements').forEach(r => {
        r.querySelectorAll('id').forEach(i => task.requirements.push(i.textContent));
      });

      t.querySelectorAll('exe').forEach(e => {
        if (e.hasAttribute('reachable')) {
          task.exeReachable = e.getAttribute('reachable');
        }
        task.exeValue = e.textContent;
      });

      t.querySelectorAll('env').forEach(e => {
        if (e.hasAttribute('reachable')) {
          task.envReachable = e.getAttribute('reachable');
        }
        task.envValue = e.textContent;
      });

      t.querySelectorAll('properties>id').forEach(p => {
        const property = new MTaskProperty;
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
    store.setTasks(tasks);

    // collections
    xml.querySelectorAll('topology>declcollection').forEach(c => {
      const collection = new MCollection;
      collection.id = c.getAttribute('id');

      c.querySelectorAll('requirements').forEach(r => {
        r.querySelectorAll('id').forEach(i => collection.requirements.push(i.textContent));
      });

      c.querySelectorAll('tasks>id').forEach(t => collection.tasks.push(t.textContent));

      collections.push(collection);
    });
    store.setCollections(collections);

    // main
    main.id = xml.querySelector('topology>main').getAttribute('id');

    xml.querySelectorAll('topology>main>task').forEach(t => main.tasks.push(t.textContent));
    xml.querySelectorAll('topology>main>collection').forEach(c => main.collections.push(c.textContent));

    // groups in main
    xml.querySelectorAll('topology>main>group').forEach(g => {
      const group = new MGroup;
      group.id = g.getAttribute('id');
      group.n = g.getAttribute('n');

      g.querySelectorAll('task').forEach(t => group.tasks.push(t.textContent));
      g.querySelectorAll('collection').forEach(c => group.collections.push(c.textContent));

      main.groups.push(group);
    });
    store.setMain(main);
  }

  handleFileLoad = (e) => {
    const reader = new FileReader();
    const target = e.target;

    reader.onload = () => {
      this.processXML(reader.result);
      target.value = '';
    };

    reader.readAsText(e.target.files[0]);
  }

  handleFileSave = () => {
    const xmlDoc = document.implementation.createDocument('', '', null);
    const root = xmlDoc.createElement('topology');
    root.setAttribute('id', store.topologyId);

    // variables
    store.variables.forEach(variable => {
      const newVariable = xmlDoc.createElement('var');
      newVariable.setAttribute('id', variable.id);
      newVariable.setAttribute('value', variable.value);
      root.appendChild(newVariable);
    });

    // properties
    store.properties.forEach(property => {
      const newProperty = xmlDoc.createElement('property');
      newProperty.setAttribute('id', property.id);
      root.appendChild(newProperty);
    });

    // requirements
    store.requirements.forEach(requirement => {
      const newRequirement = xmlDoc.createElement('declrequirement');
      newRequirement.setAttribute('id', requirement.id);
      newRequirement.setAttribute('type', requirement.type);
      newRequirement.setAttribute('value', requirement.value);

      // append requirement to the root
      root.appendChild(newRequirement);
    });

    // tasks
    store.tasks.forEach(task => {
      const newTask = xmlDoc.createElement('decltask');
      newTask.setAttribute('id', task.id);

      // create and append task exe
      const taskExe = xmlDoc.createElement('exe');
      taskExe.textContent = task.exeValue;
      if (task.exeReachable !== '') {
        taskExe.setAttribute('reachable', task.exeReachable);
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
      if (task.envValue !== '') {
        const taskEnv = xmlDoc.createElement('env');
        taskEnv.textContent = task.envValue;
        if (task.envReachable !== '') {
          taskEnv.setAttribute('reachable', task.envReachable);
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
    store.collections.forEach(collection => {
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
    main.setAttribute('id', store.main.id);
    // tasks in main
    store.main.tasks.forEach(task => {
      const newTask = xmlDoc.createElement('task');
      newTask.textContent = task;
      main.appendChild(newTask);
    });
    // collections in main
    store.main.collections.forEach(collection => {
      const newCollection = xmlDoc.createElement('collection');
      newCollection.textContent = collection;
      main.appendChild(newCollection);
    });
    // groups in main
    store.main.groups.forEach(group => {
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
    saveAs(blob, store.topologyId + '.xml');
  }

  constructor(props) {
    super(props);
    makeObservable(this);
  }

  render() {
    return (
      <li className="list-group-item file-actions">
        <div className="row centered">
          <ButtonGroup>
            <Button className="btn-file" componentClass="span" bsSize="small" title="load topology file from disk">
              <span className="glyphicon glyphicon-floppy-open"></span> load<input type="file" onChange={this.handleFileLoad} value="" />
            </Button>

            <OverlayTrigger trigger="click" placement="bottom" ref={el => this.fetchBtn = el} onEnter={this.fetchTopologies} onExit={this.cancelFetch} overlay={
              <Popover className="fetch-popover" title="fetch remote topologies" id="fetchremotetopologies">
                <p>Fetching topologies from<br /><span className="mono monobg">{this.remoteUser}/{this.remoteRepo}/{this.remotePath}</span></p>
                <form onSubmit={this.handleFetch}>
                  {this.error !== '' ? <p className="error">{this.error}</p> : ''}
                  <FormGroup>
                    {this.remoteFiles.map((file, i) => {
                      return (<Radio title={file.url} key={file.name + i} name="files" className="mono">{file.name}</Radio>);
                    })}
                  </FormGroup>
                  <div className="row">
                    <div className="col-xs-12">
                      <Button className="add-cg-popover-btn" type="submit" bsSize="small" bsStyle="primary">load</Button>
                      <Button className="add-cg-popover-btn" bsSize="small" bsStyle="default" onClick={() => this.fetchBtn.hide()}>cancel</Button>
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
