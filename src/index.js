import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import exports from './config/default'

const axios = require('axios').default

class NewToDo extends React.Component {
    constructor(props) {
        super(props);
        this.keyPress = this.keyPress.bind(this)
    }

    keyPress(e) {
        if (e.charCode === 13) {
            this.props.addItem()
            e.target.value = ""
        }
    }

    render() {
        return (
          <div>
              New Item: <input type='text' onKeyPress={(e) => this.keyPress(e)} onChange={(e) => this.props.changeNewItemName(e)} />
              <button onClick={() => this.props.addItem()}>+</button>
          </div>
        );
    }
}

class ToDoItem extends React.Component {
    render() {
        return (
            <label>
                <input
                    type='checkbox'
                    name={this.props.id}
                    checked={this.props.done}
                    onChange={(e) => this.props.handleUpdate(e)}
                />
                {this.props.text}
            </label>
        );
    }
}

class ToDos extends React.Component {
    render() {
        return (
            <ul>
                {this.props.todos.map(
                    todo =>
                        <li key={todo.id}>
                            <ToDoItem
                                done={todo.done}
                                text={todo.text}
                                id={todo.id}
                                handleUpdate={(e) => this.props.handleUpdate(e)} />
                        </li>
                )}
            </ul>
        );
    }
}

class Checklist extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            todos: [],
            newItemName: "",
        }
    }

    componentDidMount() {
        axios.get(exports.backend.url + '/api/todo/full')
            .then(res => res.data)
            .then((data) => {
                this.setState({todos: data})
            })
            .catch(console.log)
    }

    updateServer = todo => {
        axios.put(exports.backend.url + '/api/todo', todo)
            .then(response => {
                console.log(response)
            })
            .catch(error => {
                console.log(error)
            })
    }

    changeNewItemName = event => {
        const newItemName = event.target.value

        if (newItemName.trim !== "") {
            this.setState({
                newItemName: newItemName
            })
        }
    }

    addItem = () => {
        axios.post(exports.backend.url + '/api/todo', this.state.newItemName)
            .then(response => {
                console.log(response)
                const todos = this.state.todos.slice();

                this.setState({
                    todos: todos.concat(response.data),
                    newItemName: ""
                })
            })
            .catch(error => {
                console.log(error)
            })
    }

    handleUpdate = event => {
        const { name } = event.target
        const todos = this.state.todos.slice();
        let todo = todos.find(todo => todo.id === name)
        todo.done = !todo.done

        this.setState({
                todos: todos
            }
        )

        this.updateServer(todo)
    }

    render() {
        return (
            <div className="checklist">
                <NewToDo changeNewItemName={(e) => this.changeNewItemName(e)}
                         addItem={() => this.addItem()}
                />
                <span>ToDo</span>
                <ToDos todos={this.state.todos.filter(todo => !todo.done)} handleUpdate={(e) => this.handleUpdate(e)}/>
                <span>Done</span>
                <ToDos todos={this.state.todos.filter(todo => todo.done)} handleUpdate={(e) => this.handleUpdate(e)}/>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Checklist />,
    document.getElementById('root')
);