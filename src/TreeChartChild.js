import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';

let TreeChartChild = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    let ref = firebase.database().ref(this.props.path).orderByChild("index");
    this.bindAsObject(ref, "element");
    this.setState({
      path : this.props.path
    });
  },
  componentDidMount: function () {
    //  add event listeners
  },
  render() {
    if (!this.state.element) return;
    var style = {
      flexGrow : this.state.element.importance,
      height : this.props.height
    };
    return <div className="TreeChartChild" style={style}>
      {style.flexGrow}
    </div>;
  }
});

export default TreeChartChild;