import React, { Component } from "react";
import { connect } from "react-redux";

import * as actions from "../../../store/actions";
import { getUserBoard } from "../../../services/userService";
import { handleRefreshToken } from "../../../services/authService";

class UserBoard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: [],
    };
  }
  async componentDidMount() {}
  async componentDidUpdate(prevProps, prevState, snapshot) {
    if (
      prevProps.accessToken !== this.props.accessToken &&
      prevProps.refreshToken !== this.props.refreshToken
    ) {
      let { accessToken, refreshToken, updateAccessToken } = this.props;
      let res = await getUserBoard({
        "x-access-token": accessToken,
      });
      if (res && res.status === "success") {
        this.setState({
          content: res,
        });
      } else {
        let dataToken = await handleRefreshToken(refreshToken);
        if (dataToken && dataToken.status === "error") {
          await this.props.processLogout();
          this.setState({
            content: dataToken,
          });
          setTimeout(() => {
            this.props.history.push("/login");
          }, 5000);
        } else {
          this.setState({ content: res.message });
          await updateAccessToken(dataToken.accessToken);
        }
      }
    }
  }

  render() {
    let { content } = this.state;
    return (
      <div>
        <div className="container">
          <div className="jumbotron">
            <h1
              className={
                content.status === "success"
                  ? "text-center text-success"
                  : "text-center text-danger"
              }
            >
              {content.message}
            </h1>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.auth.userInfo,
    accessToken: state.auth.accessToken,
    refreshToken: state.auth.refreshToken,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    processLogout: () => dispatch(actions.processLogout()),
    updateAccessToken: (accessToken) =>
      dispatch(actions.updateAccessToken(accessToken)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(UserBoard);
