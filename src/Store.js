import { action, autorun, observable, makeObservable } from 'mobx';
import * as mobx from 'mobx';
import { create, persist } from 'mobx-persist';

mobx.configure({ enforceActions: "observed" });

export class MVariable {
  @persist @observable id = '';
  @persist @observable value = '';
}

export class MProperty {
  @persist @observable id = '';
}

export class MRequirement {
  @persist @observable id = '';
  @persist @observable type = '';
  @persist @observable value = '';
}

export class MTaskProperty {
  @persist @observable id = '';
  @persist @observable access = '';
}

export class MTask {
  @persist @observable id = '';
  @persist @observable exeValue = '';
  @persist @observable exeReachable = '';
  @persist @observable envValue = '';
  @persist @observable envReachable = '';
  @persist('list', MTaskProperty) @observable properties = [];
  @persist('list') @observable requirements = [];
}

export class MCollection {
  @persist @observable id = '';
  @persist('list') @observable tasks = [];
  @persist('list') @observable requirements = [];
}

export class MGroup {
  @persist @observable id = '';
  @persist @observable n = '';
  @persist('list') @observable tasks = [];
  @persist('list') @observable collections = [];
}

export class MMain {
  @persist @observable id = 'main';
  @persist('list') @observable tasks = [];
  @persist('list') @observable collections = [];
  @persist('list', MGroup) @observable groups = [];
}

class Store {
  @persist @observable topologyId = 'new';

  @persist('list', MVariable) @observable variables = [];
  @persist('list', MProperty) @observable properties = [];
  @persist('list', MRequirement) @observable requirements = [];
  @persist('list', MTask) @observable tasks = [];
  @persist('list', MCollection) @observable collections = [];
  @persist('object', MMain) @observable main = new MMain;

  @action reset = () => {
    this.topologyId = 'new';
    this.variables = [];
    this.properties = [];
    this.requirements = [];
    this.tasks = [];
    this.collections = [];
    this.main = new MMain;
  }

  @action setTopologyId = (id) => { this.topologyId = id; }

  @action setVariables = (variables) => { this.variables = variables; }
  @action setProperties = (properties) => { this.properties = properties; }
  @action setRequirements = (requirements) => { this.requirements = requirements; }
  @action setTasks = (tasks) => { this.tasks = tasks; }
  @action setCollections = (collections) => { this.collections = collections; }
  @action setMain = (main) => { this.main = main; }

  @action addVariable = (newVariable) => { this.variables.push(newVariable); }
  @action addProperty = (newProperty) => { this.properties.push(newProperty); }
  @action addRequirement = (newRequirement) => { this.requirements.push(newRequirement); }
  @action addTask = (newTask) => { this.tasks.push(newTask); }
  @action addCollection = (newCollection) => { this.collections.push(newCollection); }
  @action addMainGroup = (newGroup) => { this.main.groups.push(newGroup); }

  @action removeVariable = (i) => {
    this.variables.splice(i, 1);
  }

  @action removeProperty = (i) => {
    const removedPropertyId = this.properties.splice(i, 1)[0].id;
    this.tasks.forEach(task => {
      task.properties = task.properties.filter(property => property.id !== removedPropertyId);
    });
  }

  @action removeRequirement = (i) => {
    const removedRequirementId = this.requirements.splice(i, 1)[0].id;

    this.tasks.forEach(task => {
      task.requirements = task.requirements.filter(requirement => requirement !== removedRequirementId);
    });

    this.collections.forEach(collection => {
      collection.requirements = collection.requirements.filter(requirement => requirement !== removedRequirementId);
    });
  }

  @action removeTask = (i) => {
    const removedTaskId = this.tasks.splice(i, 1)[0].id;

    this.main.tasks = this.main.tasks.filter(task => task !== removedTaskId);
    this.collections.forEach(collection => {
      collection.tasks = collection.tasks.filter(task => task !== removedTaskId);
    });
    this.main.groups.forEach(group => {
      group.tasks = group.tasks.filter(task => task !== removedTaskId);
    });
  }

  @action removeCollection = (i) => {
    const removedCollectionId = this.collections.splice(i, 1)[0].id;
    this.main.collections = this.main.collections.filter(collection => collection !== removedCollectionId);
    this.main.groups.forEach(group => {
      group.collections = group.collections.filter(collection => collection !== removedCollectionId);
    });
  }

  @action removeMainGroup = (i) => {
    this.main.groups.splice(i, 1);
  }

  // @action editVariable = (i, variable) => { }
  @action editProperty = (i, updatedProperty) => {
    const oldId = this.properties[i].id;
    this.properties[i] = updatedProperty;

    this.tasks.forEach(t => {
      t.properties.forEach(p => {
        if (p.id === oldId) {
          p.id = updatedProperty.id;
        }
      });
    });
  }

  @action editRequirement = (i, updatedRequirement) => {
    const oldId = this.requirements[i].id;
    this.requirements[i] = updatedRequirement;

    this.tasks.forEach(t => {
      const index = t.requirements.indexOf(oldId);
      if (index > -1) {
        t.requirements[index] = updatedRequirement.id;
      }
    });

    this.collections.forEach(c => {
      const index = c.requirements.indexOf(oldId);
      if (index > -1) {
        c.requirements[index] = updatedRequirement.id;
      }
    });
  }

  @action editTask = (i, updatedTask) => {
    const oldId = this.tasks[i].id;
    this.tasks[i] = updatedTask;

    // update collections with new task info
    this.collections.forEach((c) => {
      c.tasks.forEach((t, i, a) => {
        if (t === oldId) {
          a[i] = updatedTask.id;
        }
      });
    });

    // update groups with new task info
    this.main.groups.forEach((g) => {
      g.tasks.forEach((t, i, a) => {
        if (t === oldId) {
          a[i] = updatedTask.id;
        }
      });
    });

    // update main with new task info
    this.main.tasks.forEach((t, i, a) => {
      if (t === oldId) {
        a[i] = updatedTask.id;
      }
    });
  }

  @action editCollection = (i, updatedCollection) => {
    const oldId = this.collections[i].id;
    this.collections[i] = updatedCollection;

    // update groups with new collection info
    this.main.groups.forEach((g) => {
      g.collections.forEach((c, i, a) => {
        if (c === oldId) {
          a[i] = updatedCollection.id;
        }
      });
    });

    // update main with new collection info
    this.main.collections.forEach((c, i, a) => {
      if (c === oldId) {
        a[i] = updatedCollection.id;
      }
    });
  }

  @action editMainGroup = (i, updatedGroup) => {
    this.main.groups[i] = updatedGroup;
  }

  hasVariable = (id) => { return this.variables.some(el => el.id === id); }
  hasProperty = (id) => { return this.properties.some(el => el.id === id); }
  hasRequirement = (id) => { return this.requirements.some(el => el.id === id); }
  hasTask = (id) => { return this.tasks.some(el => el.id === id); }
  hasCollection = (id) => { return this.collections.some(el => el.id === id); }
  hasMainGroup = (id) => { return this.main.groups.some(el => el.id === id); }

  constructor() {
    makeObservable(this);
  }
}

const hydrate = create({ storage: localStorage, jsonify: true });

const store = new Store();

export default store;

hydrate('topologyEditor', store);

autorun(() => {
  // console.log('store.topologyId: ' + store.topologyId);
});
