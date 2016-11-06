import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';

let BreadCrumbs = React.createClass({
  render() {
    let crumbs = [<BreadCrumb key='/' path='/' root={true} focus={this.props.focus}/>];
    let pathParts = this.props.path.replace(/^\/+|\/+$/, '').split('/');
    for (let i=0; i<pathParts.length-1; i+=2) {
      let currentPath = '/'+pathParts.slice(0, i+2).join('/');
      crumbs.push(<BreadCrumb key={currentPath} path={currentPath} focus={this.props.focus}/>);
    }
    return <div className="BreadCrumbs">{crumbs}</div>;
  }
});

let BreadCrumb = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    this.setState({});
    let ref = firebase.database().ref(this.props.path).orderByChild("index");
    this.bindAsObject(ref, "element");
  },
  componentDidMount: function () {
    let self = this;
    self.refs.root.addEventListener('tap', (event)=>{
      self.props.focus('/' + self.props.path);
    });
  },
  render() {
    if (this.props.root) {
      return <span ref="root">{this.state.element ? this.state.element.owner : ''}</span>
    }
    return <span ref="root">/{this.state.element ? this.state.element.title || 'untitled' : ''}</span>;
  }
})

export default BreadCrumbs;