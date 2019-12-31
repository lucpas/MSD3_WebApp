class Subject {
  constructor() {
    this.observers = [];
  }

  attachObserver(observer) {
    this.observers.push(observer);
  }

  detachObserver(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(data) {
    if (this.observers.length > 0) {
      this.observers.forEach(obs => obs.update(data));
    }
  }
}

class Observer {
  constructor(update = () => {}) {
    this.update = update;
  }
  // update() {}
}

class State extends Subject {
  constructor(descriptor = 'anonymous', autoNotify = false) {
    super();
    this.state = {};
    this.descriptor = descriptor;
    this.autoNotify = autoNotify;
  }

  set(data = {}) {
    // this.state = Object.assign(this.state, data);
    this.state = data;

    if (this.autoNotify) {
      super.notify(this.state);
    }
  }

  get() {
    return this.state;
  }

  dumpToConsole() {
    console.log('DUMPING STATE - ' + this.descriptor)
    console.log('- Observers:', this.observers);
    console.log('- State:', this.state);
  }
}

export { Subject, Observer, State };
