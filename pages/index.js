import React, { Component, Fragment } from 'react';
import styled from 'styled-components';
import {
  formatDistance,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
  endOfWeek,
  endOfDay,
} from 'date-fns';
import { ToastConsumer, ToastProvider } from 'react-toast-notifications';

import '../styles/app.css';
import '../styles/common.css';

import ToolTip from '../components/tool-tip';
import TodoFilter from '../components/filter';
import Footer from '../components/footer';
import TodoItem from '../components/todoItem';
import Progress from '../components/progress';
import TodoModel from '../util/todoModel';
import utils from '../util/utils';

const ALL_TODOS = 'all';
const DAILY_TODOS = 'daily';
const WEEKLY_TODOS = 'weekly';

var ENTER_KEY = 13;

const XP_MULTIPLE_PER_LEVEL = 1.5;
const GAME_STATE_KEY = 'game-state';
const CHANCE_OF_DAMAGE_PER_TODO = 0.1;

const getDefaultGameState = () => ({
  level: 1,
  hp: 50,
  hpMax: 50,
  xp: 0,
  xpToNextLevel: 10,
  specialMax: 20,
  lastDailyTurn: new Date().getTime(),
  lastWeeklyTurn: new Date().getTime(),
});

const getNextTimeBoundaries = () => {
  const now = new Date();
  return {
    nextDayStartsAt: endOfDay(now).getTime(),
    nextWeekStartsAt: endOfWeek(now, { weekStartsOn: 1 }).getTime(),
  };
};

const AddButton = styled.button`
  line-height: 1.4em;
  font-size: 24px;
`;

export default class TodoApp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowShowing: ALL_TODOS,
      editing: null,
      newTodo: '',
      todoRepeats: 'daily',
      todos: [],
      gameState: getDefaultGameState(),
    };
  }

  componentDidMount() {
    const model = new TodoModel('react-todos');

    let gameState = utils.store(GAME_STATE_KEY);

    if (!gameState) {
      gameState = getDefaultGameState();
    }

    if (differenceInCalendarDays(new Date(), gameState.lastDailyTurn) > 0) {
      gameState = this.completeDay(gameState, model);
    }

    if (differenceInCalendarWeeks(new Date(), gameState.lastWeeklyTurn) > 0) {
      gameState = this.completeWeek(gameState, model);
    }

    utils.store(GAME_STATE_KEY, gameState);

    this.setupResetTimers();

    model.subscribe(() => {
      this.setState(() => ({ todos: model.todos }));
    });

    this.setState(() => ({
      ...getNextTimeBoundaries(),
      model,
      gameState,
      todos: model.todos,
    }));
  }

  componentWillUnmount() {
    clearTimeout(this._dailyTimer);
    clearTimeout(this._weeklyTimer);
  }

  setupResetTimers = () => {
    const { nextDayStartsAt, nextWeekStartsAt } = getNextTimeBoundaries();
    const now = Date.now();

    clearTimeout(this._dailyTimer);
    clearTimeout(this._weeklyTimer);

    // + 100 buffer to make sure we're actually in the new day
    this._dailyTimer = setTimeout(this.onNextDay, nextDayStartsAt - now + 100);
    this._weeklyTimer = setTimeout(
      this.onNextWeek,
      nextWeekStartsAt - now + 100,
    );
  };

  onNextDay = () => {
    this.setState(({ gameState, model }) => {
      const newGameState = this.completeDay(gameState, model);
      utils.store(GAME_STATE_KEY, newGameState);
      this.setupResetTimers();
      return { gameState: newGameState };
    });
  };

  onNextWeek = () => {
    this.setState(({ gameState, model }) => {
      const newGameState = this.completeWeek(gameState, model);
      utils.store(GAME_STATE_KEY, newGameState);
      this.setupResetTimers();
      return { gameState: newGameState };
    });
  };

  completeDay = (gameState, model) => {
    let newGameState = { ...gameState };
    if (this.didReceiveDamage(model, ({ repeats }) => repeats === 'daily')) {
      // deal damage
      const damage = this.calculateDamage(newGameState);
      console.log('received damage', damage);
      newGameState.hp = newGameState.hp - damage;

      this._addToast(
        <Fragment>
          <strong>{damage} HP</strong> damage received
          <br />
          from <strong>uncompleted dailies</strong>.
        </Fragment>,
        { appearance: 'error', autoDismiss: true },
      );
    } else {
      console.log('no damage received');
    }
    return this.resetDailies(newGameState, model);
  };

  completeWeek = (gameState, model) => {
    let newGameState = { ...gameState };
    if (this.didReceiveDamage(model, ({ repeats }) => repeats === 'weekly')) {
      // deal damage
      const damage = this.calculateDamage(gameState);
      newGameState.hp = newGameState.hp - damage;

      this._addToast(
        <Fragment>
          <strong>{damage} HP</strong> damage received
          <br />
          from <strong>uncompleted weeklies</strong>.
        </Fragment>,
        { appearance: 'error', autoDismiss: true },
      );
    }
    return this.resetWeeklies(newGameState, model);
  };

  calculateDamage = gameState => {
    // TODO
    return 1;
  };

  didReceiveDamage = (model, filter = () => true) => {
    const uncompleted = model.todos.filter(
      todo => filter(todo) && !todo.completed,
    );
    return (
      Math.random() <
      Math.min(1, uncompleted.length * CHANCE_OF_DAMAGE_PER_TODO)
    );
  };

  resetDailies = (gameState, model) => {
    // Ticked over into a new day, so update all the dailies
    model.toggleAll(false, todo => todo.repeats === 'daily');
    const newGameState = {
      ...gameState,
      lastDailyTurn: Date.now(),
    };
    utils.store(GAME_STATE_KEY, newGameState);
    return newGameState;
  };

  resetWeeklies = (gameState, model) => {
    // Ticked over into a new week, so update all the weekly
    model.toggleAll(false, todo => todo.repeats === 'weekly');
    const newGameState = {
      ...gameState,
      lastWeeklyTurn: Date.now(),
    };
    utils.store(GAME_STATE_KEY, newGameState);
    return newGameState;
  };

  handleNewTodoChange = event => {
    this.setState({ newTodo: event.target.value });
  };

  handleNewTodoRepeatsChange = event => {
    this.setState({ todoRepeats: event.target.value });
  };

  saveTodoForm = event => {
    event.preventDefault();

    var val = this.state.newTodo.trim();

    if (val) {
      this.state.model.addTodo(val, this.state.todoRepeats);
      this.setState({ newTodo: '' });
    }
  };

  complete = todoToToggle => {
    this.state.model.complete(todoToToggle);
    this.setState(({ gameState }) => {
      const newGameState = {
        ...gameState,
        xp: gameState.xp + 1,
      };

      const lastLevel = newGameState.level;

      // Possible to get lots of XP in one go, so we make sure we level up
      // correctly here
      while (newGameState.xp >= newGameState.xpToNextLevel) {
        newGameState.level = newGameState.level + 1;
        newGameState.xp = newGameState.xp - newGameState.xpToNextLevel;
        newGameState.xpToNextLevel = Math.round(
          newGameState.xpToNextLevel * XP_MULTIPLE_PER_LEVEL,
        );
      }

      if (lastLevel !== newGameState.level) {
        this._addToast(
          <Fragment>
            You've reached <strong>level {newGameState.level}</strong>! 🎉
          </Fragment>,
          { appearance: 'success', autoDismiss: true },
        );
      }

      utils.store(GAME_STATE_KEY, newGameState);

      return {
        gameState: newGameState,
      };
    });
  };

  destroy = todo => {
    this.state.model.destroy(todo);
  };

  edit = todo => {
    this.setState({ editing: todo.id });
  };

  save = (todoToSave, text) => {
    this.state.model.save(todoToSave, text);
    this.setState({ editing: null });
  };

  cancel = () => {
    this.setState({ editing: null });
  };

  filterChange = filter => {
    this.setState(() => ({ nowShowing: filter }));
  };

  render() {
    var filter = null;
    var main = null;
    var todos = this.state.todos;

    var shownTodos = todos.filter(todo => {
      switch (this.state.nowShowing) {
        case DAILY_TODOS:
          return todo.repeats === 'daily';
        case WEEKLY_TODOS:
          return todo.repeats === 'weekly';
        default:
          return true;
      }
    });

    var todoItems = shownTodos.map(todo => {
      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          onComplete={this.complete.bind(this, todo)}
          onDestroy={this.destroy.bind(this, todo)}
          onEdit={this.edit.bind(this, todo)}
          editing={this.state.editing === todo.id}
          onSave={this.save.bind(this, todo)}
          onCancel={this.cancel}
        />
      );
    });

    if (todos.length) {
      main = (
        <section className="main">
          <ul className="todo-list">{todoItems}</ul>
        </section>
      );
    }

    const special = Math.min(
      todos.reduce((memo, { streak = 0 }) => memo + streak, 0),
      this.state.gameState.specialMax,
    );

    return (
      <ToastProvider>
        <ToastConsumer>
          {({ add }) => {
            this._addToast = add;
            return (
              <div>
                <header className="header">
                  <h1>Strategy List</h1>
                  <ToolTip
                    verticalPos="below"
                    tip="Uncompleted todos increase % chance of hit against you."
                  >
                    Health
                  </ToolTip>
                  <Progress
                    progress={this.state.gameState.hp}
                    max={this.state.gameState.hpMax}
                    color="red"
                    bgColor="black"
                  />
                  <br />
                  <ToolTip tip="Progress increases with every completed todo">
                    Progress to level {this.state.gameState.level + 1}
                  </ToolTip>
                  <Progress
                    progress={this.state.gameState.xp}
                    max={this.state.gameState.xpToNextLevel}
                    color="yellow"
                    bgColor="black"
                  />
                  <br />
                  <ToolTip tip="Special Attack power increases with streaks of completed recurring todos">
                    Special Attack power
                  </ToolTip>
                  <Progress
                    progress={special}
                    max={this.state.gameState.specialMax}
                    color="green"
                    bgColor="black"
                  />
                  <br />
                  <form
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    onSubmit={this.saveTodoForm}
                  >
                    <input
                      className="new-todo"
                      style={{ flexGrow: 1 }}
                      placeholder="What needs to be done?"
                      value={this.state.newTodo}
                      onChange={this.handleNewTodoChange}
                      autoFocus={true}
                    />
                    <div>
                      Repeats:
                      <select onChange={this.handleNewTodoRepeatsChange}>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                    <AddButton disabled={!this.state.newTodo}>Add</AddButton>
                  </form>
                </header>
                <br />
                <TodoFilter
                  nowShowing={this.state.nowShowing}
                  onFilterChange={this.filterChange}
                />
                {this.state.nextDayStartsAt ? (
                  <span>
                    Dailies reset in{' '}
                    {formatDistance(Date.now(), this.state.nextDayStartsAt)}.{' '}
                  </span>
                ) : null}
                {this.state.nextWeekStartsAt ? (
                  <span>
                    Weeklies reset in{' '}
                    {formatDistance(Date.now(), this.state.nextWeekStartsAt)}.
                  </span>
                ) : null}
                {main}
                <Footer
                  onNextDay={this.onNextDay}
                  onNextWeek={this.onNextWeek}
                />
              </div>
            );
          }}
        </ToastConsumer>
      </ToastProvider>
    );
  }
}
