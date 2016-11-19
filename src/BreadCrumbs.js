import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';

let BreadCrumbs = React.createClass({
  componentWillMount() {
    let self = this;
    self.setState({user : false});
    firebase.auth().onAuthStateChanged((user)=>{
      self.setState({user : user});
    });
  },
  render() {
    let userRoot = '/elements/';
    if (this.state.user) {
      userRoot = '/elements/'+this.state.user.uid;
    }
    let crumbs = [<BreadCrumb key={userRoot} path={userRoot} root={true} focus={this.props.focus}/>];
    let pathParts = this.props.path.replace(/^\/+|\/+$/, '').split('/');
    for (let i=2; i<pathParts.length-1; i+=2) {
      let currentPath = '/'+pathParts.slice(0, i+2).join('/');
      crumbs.push(<BreadCrumb key={currentPath} path={currentPath} focus={this.props.focus}/>);
    }
    return <span className="BreadCrumbs">{crumbs}</span>;
  }
});

let BreadCrumb = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    let self = this;
    self.setState({user : false});
    let ref = firebase.database().ref(this.props.path).orderByChild("index");
    this.bindAsObject(ref, "element");
    firebase.auth().onAuthStateChanged((user)=>{
      self.setState({user : user});
    });
  },
  componentDidMount: function () {
    let self = this;
    self.refs.root.addEventListener('tap', (event)=>{
      self.props.focus(self.props.path);
    });
  },
  render() {
    let title = '/' + (this.state.element ? this.state.element.title || 'untitled' : '');
    if (this.props.root) {
      if (this.state.user) {
        title = this.state.user.displayName || this.state.user.email;
      }
      else {
        title = 'anonymous';
      }
    }
    return <span ref="root">{title}</span>;
  }
})

export default BreadCrumbs;