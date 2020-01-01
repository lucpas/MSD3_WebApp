class Subject {
  constructor() {
    this.observers = [];
  }

  attachObserver(...observers) {
    observers.forEach((obs) => this.observers.push(obs));
  }

  detachObserver(...observer) {
    this.observers = this.observers.filter(obs => !observer.includes(obs));
  }

  notify(data, stateName) {
    if (this.observers.length > 0) {
      this.observers.forEach(obs => obs.update(data, stateName));
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
  constructor(state = {}, autoNotify = false, descriptor = 'anonymous') {
    super();
    this.state = state;
    this.descriptor = descriptor;
    this.autoNotify = autoNotify;
  }

  set(data = {}) {
    // this.state = Object.assign(this.state, data);
    this.state = data;

    if (this.autoNotify) {
      super.notify(this.state, this.descriptor);
    }
  }

  get() {
    return this.state;
  }

  dumpToConsole() {
    console.log('DUMPING STATE - ' + this.descriptor);
    console.log('- Observers:', this.observers);
    console.log('- State:', this.state);
  }
}

export { Subject, Observer, State };
