import * as React from 'react';

export interface Props {
  time: number;
  onComplete?: () => any;
}
export interface State {}
export default class CountdownTimer extends React.Component<Props, State> {
  state: State = {};
  _interval: null | NodeJS.Timer = null;
  _finished: boolean = false;
  componentDidMount() {
    if (this.props.time - Date.now() > 1000) {
      this._interval = setInterval(() => {
        this.forceUpdate();
      }, 100);
    }
  }
  componentWillReceiveProps(newProps: Props) {
    if (this._interval === null && newProps.time - Date.now() > 1000) {
      this._finished = false;
      this._interval = setInterval(() => {
        this.forceUpdate();
      }, 100);
    }
  }
  componentWillUnmount() {
    if (this._interval !== null) {
      clearInterval(this._interval);
      this._interval = null;
    }
  }
  componentDidUpdate() {
    if (this._interval !== null && this.props.time - Date.now() < 1000) {
      clearInterval(this._interval);
    }
    if (!this._finished && this.props.time - Date.now() < 1000) {
      this._finished = true;
      if (this.props.onComplete) {
        this.props.onComplete();
      }
    }
  }
  render() {
    const delta = this.props.time - Date.now();
    if (delta < 1500) {
      return '1 second';
    }
    if (delta < 90000) {
      return Math.round(delta / 1000) + ' seconds';
    }
    if (delta < 90 * 60 * 1000) {
      return Math.round(delta / (60 * 1000)) + ' minutes';
    }
    if (delta < 72 * 60 * 60 * 1000) {
      return Math.round(delta / (60 * 60 * 1000)) + ' hours';
    }
    return Math.round(delta / (24 * 60 * 60 * 1000)) + ' days';
  }
}
