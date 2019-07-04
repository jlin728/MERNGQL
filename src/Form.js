import React from 'react';
import TextField from '@material-ui/core/TextField';






export default class Form extends React.Component {

    state = {
        text: ' ',
    };

    handleOnChange = e =>{
        const newText = e.target.value;
        //console.log(newText);
        this.setState({
            text: newText
        });
    };

    handleKeyDown = e =>{
        console.log(e);
        if(e.key === 'Enter') {
            this.props.submit(this.state.text);
            this.setState({ text: ""});
        }
    };

    render() {
        const {text} = this.state;

        return (
            <TextField
                onChange={this.handleOnChange}
                onKeyDown={this.handleKeyDown}  //@1:00:05 this throws warning
                label="Enter Your Todo"
                margin="normal"
                fullWidth
                value={text}
            />
        );
    }



}