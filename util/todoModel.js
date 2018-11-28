import utils from './utils';

// Generic "model" object. You can use whatever
// framework you want. For this application it
// may not even be worth separating this logic
// out, but we do this to demonstrate one way to
// separate out parts of your application.
const TodoModel = function(key) {
  this.key = key;
  this.todos = utils.store(key) || [];
  this.onChanges = [];
};

TodoModel.prototype.subscribe = function(onChange) {
  this.onChanges.push(onChange);
};

TodoModel.prototype.inform = function() {
  utils.store(this.key, this.todos);
  this.onChanges.forEach(function(cb) {
    cb();
  });
};

TodoModel.prototype.sort = function() {
  this.todos.sort((left, right) => {
    if (left.completed === right.completed) {
      return 0;
    }
    if (right.completed) {
      return -1;
    }
    return 1;
  });
};

TodoModel.prototype.addTodo = function(title, repeats) {
  this.todos = this.todos.concat({
    id: utils.uuid(),
    title: title,
    completed: false,
    repeats,
  });

  this.sort();

  this.inform();
};

TodoModel.prototype.toggleAll = function(checked, filter = () => true) {
  // Note: it's usually better to use immutable data structures since they're
  // easier to reason about and React works very well with them. That's why
  // we use map() and filter() everywhere instead of mutating the array or
  // todo items themselves.
  this.todos = this.todos.map(function(todo) {
    if (filter(todo)) {
      return { ...todo, completed: checked };
    } else {
      return { ...todo };
    }
  });

  this.sort();

  this.inform();
};

TodoModel.prototype.complete = function(todoToToggle) {
  this.todos = this.todos.map(function(todo) {
    return todo !== todoToToggle
      ? todo
      : {
          ...todo,
          completed: true,
          streak: (todo.streak || 0) + 1,
        };
  });

  this.sort();

  this.inform();
};

TodoModel.prototype.destroy = function(todo) {
  this.todos = this.todos.filter(function(candidate) {
    return candidate !== todo;
  });

  this.inform();
};

TodoModel.prototype.save = function(todoToSave, text) {
  this.todos = this.todos.map(function(todo) {
    return todo !== todoToSave ? todo : utils.extend({}, todo, { title: text });
  });

  this.sort();

  this.inform();
};

TodoModel.prototype.clearCompleted = function() {
  this.todos = this.todos.filter(function(todo) {
    return !todo.completed;
  });

  this.sort();

  this.inform();
};

export default TodoModel;
