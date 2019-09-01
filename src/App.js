import React, { Component } from 'react';
import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from 'mongodb-stitch-browser-sdk';

import './App.css'

class App extends Component {
  constructor() {
    super();
    this.state = {
      todos: [],
      value: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.displayTodos = this.displayTodos.bind(this);
    this.addTodo = this.addTodo.bind(this);
  }

  componentDidMount() {
    // Initialize the App Client
    this.client = Stitch.initializeDefaultAppClient('tftctl-react-app-mbdww');
    if (this.client) {
      console.log(this.client);
    }
    // Get a MongoDB Service Client
    // This is used for logging in and communicating with Stitch
    const mongodb = this.client.getServiceClient(
      RemoteMongoClient.factory,
      'mongodb-atlas'
    );
    // Get a reference to the database
    this.db = mongodb.db('tftctl-db');
    this.displayTodosOnLoad();
  }

  displayTodos() {
    // query the remote db and update the component state
    this.db
      .collection('cool-stuff')
      .find({}, { limit:1000 })
      .asArray()
      .then(todos => {
        this.setState({todos});
      });
  }

  displayTodosOnLoad() {
    // Anonymously log in and display comments on load
    try {
      this.client.auth
        .loginWithCredential(new AnonymousCredential())
        .then(this.displayTodos)
        .catch(console.error);
    }
    catch(error) {
      console.log(error);
    }
  }

  addTodo(event) {
    event.preventDefault();
    const { value } = this.state;
    // Insert the todo into the remote Stitch db,
    // then re-query the db and display the new todos
    try {
      this.db
        .collection('cool-stuff')
        .insertOne({
          owner_id: this.client.auth.user.id,
          item: value
        })
        .then(this.displayTodos)
        .catch(console.error);
    }
    catch(error) {
      console.log(error);
    }
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  render() {
    return (
      <div className='App'>
        <h3>This is a todo app</h3>
        <hr />
        <p>Add a Todo Item:</p>
        <form onSubmit={this.addTodo}>
          <label>
            <input
              type='text'
              value={this.state.value}
              onChange={this.handleChange}
            />
          </label>
          <input type='submit' value='Submit' />
        </form>
        <ul>
          {/* Map over the todos from our remote db */}
          {this.state.todos.map(_todo => {
            return <li key={_todo.item}>{_todo.item}</li>;
          })}
        </ul>
      </div>
    );
  }
}

export default App;