import { action, autorun, observable } from 'mobx';
import * as mobx from 'mobx';
import { create, persist } from 'mobx-persist';

mobx.configure({ enforceActions: true });

class Main {
  @persist @observable id = 'main';
  @persist('list') @observable tasks = [];
  @persist('list') @observable collections = [];
  @persist('list') @observable groups = [];
}

class Store {
  @persist @observable topologyId = 'new';
  @persist @observable fluid = false;

  @persist('list') @observable variables = [];
  @persist('list') @observable properties = [];
  @persist('list') @observable requirements = [];
  @persist('list') @observable tasks = [];
  @persist('list') @observable collections = [];
  @persist('object', Main) @observable main = new Main;

  @action reset = () => {
    this.topologyId = 'new';
    this.fluid = false;
  }

  @action toggleFluid = () => { this.fluid = !this.fluid; }
  @action setTopologyId = (id) => { this.topologyId = id; }
}

const hydrate = create({ storage: localStorage, jsonify: true });

const store = new Store();

export default store;

hydrate('some', store);

autorun(() => {
  console.log('fluid: ' + store.fluid);
  console.log('topologyId: ' + store.topologyId);
});
