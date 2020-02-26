
const rule_callbacks = {

};
const rules_loaded = {

};

const _preload = [], _postload = [];
// min number of entities to load:
let to_min_load = 0;
let n_min_loaded = 0;

const ctx_obj = {

};

function initiate_load_cb(callbacks) {
  let everything_finished = true;

  for (let [rule, lcb] of callbacks) {
    let has_loaded_all = rule.reduce((accu, name)=> accu && Boolean(rules_loaded[name]), true);

    if (!has_loaded_all)
      everything_finished = false;

    if (has_loaded_all)
      lcb(ctx_obj);
  }

  return everything_finished;
}

function on_min_has_loaded() {
  // minimum number of things have been loaded. start loading process
  // pre onload
  //initiate_load_cb(_preload);

  let everything_finished = initiate_load_cb(_postload);

  // clear loader's cache
  if (everything_finished)
    for (let key in ctx_obj)
      delete ctx_obj[key]
}

class LoaderObj {
  constructor(name) {
    this.name = name;
    this.ctx = ctx_obj;
  }

  loaded() {
    rules_loaded[this.name] = true;
    n_min_loaded++;

    if (n_min_loaded >= to_min_load)
      on_min_has_loaded();
  }

  before_loadend(fun) {
    _preload.push(fun);
  }

  after_loadend(fun) {
    _postload.push(fun);
  }

  finished(fun) {
    _postload.push(fun);
  }
};


export function load(name, cb) {
  if (typeof rules_loaded[name] === 'undefined') {
    rules_loaded[name] = false;

    cb.call(new LoaderObj(name));
  }

  // otherwise it's either already being loaded or being loaded
}


export function onload(rule, cb) {
  if (!Array.isArray(rule))
    rule = [rule];

  _postload.push([rule, cb]);
};

export function preload(rule, cb) {
  _preload.push([rule, cb]);
};

export function toload(...args) {
  to_min_load = args.length;
}
