/* Reference: https://codepen.io/marekdano/pen/bVNYpq
Todo app structure

TodoApp
	- TodoHeader
	- TodoList
    - TodoListItem #1
		- TodoListItem #2
		  ...
		- TodoListItem #N
	- TodoForm
*/

import React from 'react';
import ReactDOM from 'react-dom';
import getWeb3 from "./utils/getWeb3";

import TodoAppContract from "./build/contracts/TodoApp.json"

import TodoHeader from './pages/TodoHeader';
import TodoForm from './pages/TodoForm';
import TodoList from './pages/TodoList';
import './index.css';

var todoItems = [];
var address = "0x6C75f55060b7DE043EE7338127b6Abee3A3Ef419";
  
class TodoApp extends React.Component {
  constructor (props) {
    super(props);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.markTodoDone = this.markTodoDone.bind(this);
    this.state = {todoItems: todoItems, web3: null, accounts: null, contract: null };
  }

  componentDidMount = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      // console.log(networkId);
      const deployedNetwork = TodoAppContract.networks["1607442141440"];
      console.log(deployedNetwork);
      const instance = new web3.eth.Contract(
        TodoAppContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      instance.options.from = address;
      this.setState({ web3, accounts, contract: instance });
      console.log(instance);
      instance.methods.getTodoList().call()
      .then((result) => {
        console.log(JSON.stringify(result));
      });
      // console.log(a);
    } catch (error) {
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  /* YOUR CODE HERE */
  // Maybe you sould take a look at https://github.com/truffle-box/react-box

  

  addItem (todoItem) {
    this.state.contract.methods.addTodo(todoItem.newItemValue).send({from: address});
    todoItems.unshift({
      index: todoItems.length+1, 
      value: todoItem.newItemValue, 
      done: false
    });
    this.setState({todoItems: todoItems});
  }
  removeItem (itemIndex) {
    this.state.instance.methods.deleteTodo(itemIndex).send({from: address});
    todoItems.splice(itemIndex, 1);
    this.setState({todoItems: todoItems});
  }
  markTodoDone(itemIndex) {
    var todo = todoItems[itemIndex];
    todoItems.splice(itemIndex, 1);
    if (todo.done) {
      this.state.instance.methods.undoneTodo(itemIndex).send({from: address});
      
    } else {
      this.state.instance.methods.completeTodo(itemIndex).send({from: address});

    }
    todo.done = !todo.done;
    todo.done ? todoItems.push(todo) : todoItems.unshift(todo);
    this.setState({todoItems: todoItems});  
  }

  /* END OF YOUR CODE */

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div id="main">
        <TodoHeader />
        <TodoList items={this.props.initItems} removeItem={this.removeItem} markTodoDone={this.markTodoDone}/>
        <TodoForm addItem={this.addItem} />
      </div>
    );
  }
}

ReactDOM.render(
  <TodoApp initItems={todoItems}/>,
  document.getElementById('root')
);