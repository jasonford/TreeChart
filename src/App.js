import React from 'react';
import TreeChart from './TreeChart.js';
import firebase from 'firebase';

let App = React.createClass({
  componentWillMount() {
    let self = this;
    self.setState({user : false});
    firebase.auth().onAuthStateChanged((user)=>{
      self.setState({user : user});
    });
  },
  render() {
    let root = '/elements/default';
    if (this.state.user) {
      root = '/elements/' + this.state.user.uid;
    }
    return <TreeChart path={root} key={root}/>;
  }
})

export default App;