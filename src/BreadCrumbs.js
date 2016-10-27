import React from 'react';

let BreadCrumbs = React.createClass({
  render() {
    return <div>{this.props.path}</div>;
  }
});

export default BreadCrumbs;