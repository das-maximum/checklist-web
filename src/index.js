import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'
import exports from './config/default'
import Octicon, {ChevronDown, ChevronUp, Plus, Trashcan} from "@primer/octicons-react";

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
                <button onClick={() => this.props.addItem()}>
                    <Octicon icon={Plus} />
                </button>
            </div>
        );
    }
}

class ToDoItem extends React.Component {
    onDelete() {
        this.props.handleDelete(this.props.id)
    }

    render() {
        return (
            <label className='todoitem'>
                <input
                    type='checkbox'
                    name={this.props.id}
                    checked={this.props.done}
                    onChange={(e) => this.props.handleUpdate(e)}
                />
                <span>
                    {this.props.text}
                </span>
                <button name={this.props.id} onClick={() => this.onDelete()}>
                    <Octicon icon={Trashcan} />
                </button>
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
                                handleUpdate={(e) => this.props.handleUpdate(e)}
                                handleDelete={(e) => this.props.handleDelete(e)}
                            />
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
            doneItemsVisible: true,
            collapseIcon: ChevronUp,
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
        if (this.state.newItemName.trim() === "") {
            return;
        }

        axios.post(exports.backend.url + '/api/todo', this.state.newItemName)
            .then(response => {
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

    collapse = () => {
        this.setState({
            collapseIcon: this.state.doneItemsVisible ? ChevronDown : ChevronUp,
            doneItemsVisible: !this.state.doneItemsVisible
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

    handleDelete = id => {
        const todos = this.state.todos

        axios.delete(exports.backend.url + '/api/todo?id=' + id)
            .then(() => {
                this.setState({
                    todos: todos.filter(item => item.id !== id)
                })
            })
            .catch(error => {
                console.log(error)
            })
    }

    render() {
        return (
            <div className="checklist">
                <NewToDo changeNewItemName={(e) => this.changeNewItemName(e)}
                         addItem={() => this.addItem()}
                />
                <div>
                    <span>ToDo</span>
                    <ToDos
                        todos={this.state.todos.filter(todo => !todo.done)}
                        handleUpdate={(e) => this.handleUpdate(e)}
                        handleDelete={(e) => this.handleDelete(e)}
                    />
                </div>
                <div>
                    <span>Done{!this.state.doneItemsVisible ? ' (' + this.state.todos.filter(todo => todo.done).length + ')': null}</span>
                    <span>
                        <button onClick={() => this.collapse()}>
                            <Octicon icon={this.state.collapseIcon} />
                        </button>
                    </span>
                    {this.state.doneItemsVisible
                        ? <ToDos
                            todos={this.state.todos.filter(todo => todo.done)}
                            handleUpdate={(e) => this.handleUpdate(e)}
                            handleDelete={(e) => this.handleDelete(e)}
                        />
                        : null
                    }
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Checklist />,
    document.getElementById('root')
);
