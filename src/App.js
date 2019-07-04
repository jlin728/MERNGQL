import React, { Component } from 'react';
import gql from 'graphql-tag';            //A) parser
import { graphql, compose } from 'react-apollo';   //B) binds
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Form from './Form';

// Query tested in Playground
// A) String template calling  - it will pass below as a function and parse
const TodoQuery = gql`               
{
  todos {
    id
    text
    complete
  }
}
`;

const CreateMutation = gql`
mutation ($text: String!) {
 createTodo(text: $text){
   id
   text
   complete
 }
}
`;


const UpdateMutation = gql`
 mutation ($id: ID!, $complete: Boolean!) {
  updateTodo(id: $id, complete: $complete)
}
`;

const DeleteMutation = gql`
mutation ($id: ID!) {
 deleteTodo(id: $id)
}
`;

class App extends Component {

  // CREATE
  createTodo = async text => {
    await this.props.createTodo({
      variables: {
        text,
      },
      //NOT REFRESHING
      //Real time updating  
      update: (store, {data: {createTodo}}) => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodoQuery });
        // Add our comment from the mutation to the end.
        data.todos.unshift(createTodo);
        console.log(createTodo)                     //Unshift NOT WORKING
        // Write our data back to the cache.
        store.writeQuery({ query: TodoQuery, data });
      }
    });
  };

  // UPDATE - Check mark
  updateTodo = async todo => {
    //update to-do written this way automatically binds, allowing use of 'this'
    //C)
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        complete: !todo.complete
      },

      //Real time updating
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodoQuery });
        // Add our comment from the mutation to the end.
        data.todos = data.todos.map(x => x.id === todo.id ? ({ 
          ...todo,
          complete: !todo.complete
        }) : x );
        // Write our data back to the cache.
        store.writeQuery({ query: TodoQuery, data });
      }
    });
  };

  // DELETE
  deleteTodo = async todo => {
    //delete to-do written this way automatically binds, allowing use of 'this'
    //D)
    await this.props.deleteTodo({
      variables: {
        id: todo.id
      },

      //Real time updating
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodoQuery });
        // Add our comment from the mutation to the end.
        data.todos = data.todos.filter(x => x.id !==todo.id);
        // Write our data back to the cache.
        store.writeQuery({ query: TodoQuery, data });
      }
    });
  };

  render() {
    console.log(this.props);                          // You can use this to check what data it is passing

    const {data: {loading, todos}} = this.props; 
    console.log(loading);
    console.log(todos);     //"Loading" and "todos" can be viewed when console.log
    if (loading) {
      return null;
    }
    
    return (
      <div style={{ display: "flex" }}>
        <div style={{ margin: "auto", width: 300 }}>
          <Paper elevation={1}>
            {/* <div style={{ padding: 20 }}>{todos.map(todo => <div key={`${todo.id}-todo-item `}>{todo.text}</div>)}</div>*/}

            <Form submit={this.createTodo}/>

            <List>
              {todos.map(todo => (
                // const labelId = `checkbox-list-label-${todo}`;
                  <ListItem key={todo.id} role={undefined} dense button onClick={()=> this.updateTodo(todo)}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={todo.complete}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText primary={todo.text} />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick ={ () => this.deleteTodo(todo)}>    
                        <CloseIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
              ))}
            </List>
          </Paper>
        </div>
      </div>

  
    )
  }
}




//B) binds
export default compose(
  graphql(CreateMutation, {name: "createTodo"}),
  graphql(UpdateMutation, {name: "updateTodo"}),    //C) giving it a name allows it to be accessible in props
  graphql(DeleteMutation, {name: "deleteTodo"}),    //D) giving it a name allows it to be accessible in props
  graphql(TodoQuery)
  )(App);
