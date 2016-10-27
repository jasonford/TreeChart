import React from 'react';
import firebase from 'firebase';
import ReactFireMixin from 'reactfire';

let TreeChartChild = React.createClass({
  mixins : [ReactFireMixin],
  componentWillMount() {
    this.setState({
      path : this.props.path,
      element : {
        importance : 0
      }
    });
    let ref = firebase.database().ref(this.props.path).orderByChild("index");
    this.bindAsObject(ref, "element");
  },
  componentDidMount: function () {
    let self = this;
    //  add event listeners
    this.refs.root.addEventListener("dragone", (event)=>{
      console.log('dragging')
      self.refs.root.style.transform = 'translate(' + event.tx + 'px,'+ event.ty + 'px)'
    });
    this.refs.root.addEventListener("drop", (event)=>{
      self.refs.root.style.transform = 'translate(0px,0px)';
      //  TODO: hight velocity off edge should trigger remove too
      if (event.x > window.innerWidth
      ||  event.y > window.innerHeight
      ||  event.x < 0
      ||  event.y < 0) {
        self.props.remove();
      }
    });
  },
  render() {
    var style = {
      flexGrow : this.state.element.importance,
      height : this.props.height
    };
    return <div ref="root" className="TreeChartChild" style={style}>
      {style.flexGrow}
    </div>;
  }
});

export default TreeChartChild;