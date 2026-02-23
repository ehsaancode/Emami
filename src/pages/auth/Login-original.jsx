import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Col, Form, Row, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { doLogin } from '../../redux/slices/AuthSlice';
import { setAuthStorage } from '../../helpers/utility';

const SignIn = () => {
  const dispatch = useDispatch();
  let navigate = useNavigate();
  const authData = useSelector((state) => state.authSlice);
  const [errorMessage, setErrorMessage] = useState('');

  const [err, setError] = useState([
    {
      userNameError: false,
      passwordError: false,
    },
  ]);
  const [data, setData] = useState({
    user_Email: '',
    user_Password: '',
  });
  const { user_Email, user_Password } = data;
  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    let errorArray = err;
    errorArray.forEach((a) => {
      if (e.target.name === 'user_Email') {
        a.userNameError = e.target.value === '' ? true : false;
      }
      if (e.target.name === 'user_Password') {
        a.passwordError = e.target.value === '' ? true : false;
      }
    });
    setError(errorArray);
    setErrorMessage('');
  };

  const Login = (e) => {
    e.preventDefault();
    let isCalling = false;
    err.forEach((a) => {
      a.passwordError || a.userNameError == true ? (isCalling = false) : (isCalling = true);
    });
    if (isCalling) {
      dispatch(doLogin({ inputData: data })).then(({ payload }) => {
        console.log(payload);

        if (payload.status === 'error') {
          setErrorMessage(payload.msg);
        } else {
          console.log('else');

          setErrorMessage(payload.msg);
          setAuthStorage(payload);
          navigate(`${process.env.PUBLIC_URL}/`);
        }
      });
    }
  };

  useEffect(() => {
    return () => {};
  }, [dispatch]);

  return (
    <React.Fragment>
      {/* <div className="square-box"> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> <div></div> </div> */}
      <div className="page bg-primary">
        <div className="page-single">
          <div className="container" style={{ marginTop: '89px' }}>
            <Row>
              <Col
                xl={5}
                lg={6}
                md={8}
                sm={8}
                xs={10}
                className="card-sigin-main mx-auto my-auto py-4 justify-content-center"
              >
                <div className="card-sigin">
                  {/* <!-- Demo content--> */}
                  <div className="main-card-signin d-md-flex">
                    <div className="wd-100p">
                      <div className="d-flex mb-4">
                        <Link to="#">
                          <img
                            src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                            className="sign-favicon ht-40"
                            alt="logo"
                          />
                        </Link>
                      </div>
                      <div className="">
                        <div className="main-signup-header">
                          <h2>Welcome back!</h2>
                          <h6 className="font-weight-semibold mb-4">Please sign in to continue.</h6>
                          <div className="panel panel-primary">
                            <div className=" tab-menu-heading mb-2 border-bottom-0">
                              <div className="tabs-menu1">
                                <Alert variant="danger">sadfasdf</Alert>
                                {errorMessage != '' && <Alert variant="danger">{errorMessage}</Alert>}
                                <Form>
                                  <Form.Group className="form-group">
                                    <Form.Label className="">Email ID</Form.Label>{' '}
                                    <Form.Control
                                      className="form-control"
                                      placeholder="Enter your email id"
                                      name="user_Email"
                                      type="text"
                                      value={user_Email}
                                      onChange={changeHandler}
                                      required
                                    />
                                  </Form.Group>
                                  {err[0].userNameError && <Alert variant="danger">Please enter email id</Alert>}
                                  <Form.Group className="form-group">
                                    <Form.Label>Password</Form.Label>{' '}
                                    <Form.Control
                                      className="form-control"
                                      placeholder="Enter your password"
                                      name="user_Password"
                                      type="password"
                                      value={user_Password}
                                      onChange={changeHandler}
                                      required
                                    />
                                  </Form.Group>
                                  {err[0].passwordError && <Alert variant="danger">Please Enter Password</Alert>}
                                  <Button
                                    variant=""
                                    type="submit"
                                    className="btn btn-primary btn-block"
                                    onClick={Login}
                                  >
                                    Sign In
                                  </Button>

                                  {/* <div className="main-signin-footer text-center mt-3">
                                  <p><Link to="#" className="mb-3">Forgot password?</Link></p>
                                  <p>Don't have an account ? <Link to={`${process.env.PUBLIC_URL}/authentication/signup`} className=""> Create an Account</Link></p>
                                    </div> */}
                                </Form>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

SignIn.propTypes = {};

SignIn.defaultProps = {};

export default SignIn;

