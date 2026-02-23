import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Button, Col, Form, Row, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { doLogin } from "../../redux/slices/AuthSlice";
import { setAuthStorage } from "../../helpers/utility";
import { fetchPermission } from "../../helpers/fetchPermission";

const SignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, setData] = useState({
    user_Email: "john.doe@malinator.com",
    user_Password: "123123",
  });

  const [errors, setErrors] = useState({
    userNameError: false,
    passwordError: false,
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { user_Email, user_Password } = data;

  const changeHandler = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      userNameError: name === "user_Email" ? value.trim() === "" : prev.userNameError,
      passwordError: name === "user_Password" ? value.trim() === "" : prev.passwordError,
    }));

    setErrorMessage("");
  };

  const Login = async (e) => {
    e.preventDefault();

    const validationErrors = {
      userNameError: user_Email.trim() === "",
      passwordError: user_Password.trim() === "",
    };

    setErrors(validationErrors);

    if (validationErrors.userNameError || validationErrors.passwordError) {
      return;
    }

    try {
      setLoading(true);

      const payload = await dispatch(doLogin({ inputData: data })).unwrap();

      setAuthStorage(payload);
      await fetchPermission();
      navigate(`${process.env.PUBLIC_URL}/dashboard/`);
    } catch (error) {
      setErrorMessage(error?.msg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background:
        "linear-gradient(135deg, rgba(15, 23, 42, 0.03) 0%, rgba(59, 130, 246, 0.08) 40%, rgba(255, 255, 255, 1) 100%)",
      padding: "40px 16px",
      fontFamily: "Poppins, Segoe UI, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: 980,
      borderRadius: 22,
      overflow: "hidden",
      background: "#fff",
      boxShadow: "0 30px 70px rgba(15, 23, 42, 0.15)",
      border: "1px solid #eef1f5",
    },
    leftPanel: {
      background: "linear-gradient(150deg, #0b63f3 0%, #1d4ed8 55%, #0ea5e9 100%)",
      color: "#fff",
      padding: "40px 36px",
      minHeight: "100%",
      position: "relative",
      overflow: "hidden",
    },
    leftBubble: {
      position: "absolute",
      right: "-40px",
      top: "-40px",
      width: 160,
      height: 160,
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.15)",
      filter: "blur(0px)",
    },
    leftBubbleSmall: {
      position: "absolute",
      left: "-30px",
      bottom: "-30px",
      width: 120,
      height: 120,
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.12)",
    },
    brandLogo: {
      height: 42,
    },
    leftTitle: {
      fontSize: 26,
      fontWeight: 700,
      marginTop: 30,
      marginBottom: 12,
    },
    leftSubtitle: {
      fontSize: 13,
      lineHeight: 1.6,
      color: "rgba(255, 255, 255, 0.85)",
    },
    leftList: {
      marginTop: 24,
      display: "grid",
      gap: 12,
      fontSize: 13,
    },
    leftListItem: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontWeight: 600,
    },
    listIcon: {
      width: 24,
      height: 24,
      borderRadius: 999,
      background: "rgba(255, 255, 255, 0.2)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 12,
    },
    rightPanel: {
      padding: "40px 36px",
      background: "#fff",
    },
    formTitle: {
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 8,
      color: "#0f172a",
    },
    formSubtitle: {
      fontSize: 13,
      color: "#6b7280",
      marginBottom: 24,
    },
    label: {
      fontSize: 12,
      fontWeight: 600,
      color: "#374151",
    },
    input: {
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      padding: "10px 12px",
      fontSize: 13,
      color: "#111827",
      boxShadow: "none",
    },
    loginButton: {
      width: "100%",
      borderRadius: 999,
      border: "none",
      padding: "10px 16px",
      fontSize: 14,
      fontWeight: 600,
      background: "linear-gradient(180deg, #3b82ff 0%, #2563eb 100%)",
      boxShadow: "0 10px 18px rgba(37, 99, 235, 0.28)",
    },
    helperRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      fontSize: 12,
      color: "#6b7280",
    },
    link: {
      color: "#2563eb",
      textDecoration: "none",
      fontWeight: 600,
    },
  };

  return (
    <React.Fragment>
      <div style={styles.page}>
        <div style={styles.card}>
          <Row className="g-0">
            <Col lg={6} className="d-none d-lg-block">
              <div style={styles.leftPanel}>
                <div style={styles.leftBubble} />
                <div style={styles.leftBubbleSmall} />
                <Link to="#">
                  <img
                    src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                    alt="logo"
                    style={styles.brandLogo}
                  />
                </Link>
                <div style={styles.leftTitle}>Welcome back</div>
                <div style={styles.leftSubtitle}>
                  Manage events, approvals, and contacts from one place. Keep your team in sync with
                  real-time updates.
                </div>
                <div style={styles.leftList}>
                  <div style={styles.leftListItem}>
                    <span style={styles.listIcon}>
                      <i className="bi bi-check" />
                    </span>
                    Track event approvals instantly
                  </div>
                  <div style={styles.leftListItem}>
                    <span style={styles.listIcon}>
                      <i className="bi bi-check" />
                    </span>
                    Send invitees in one click
                  </div>
                  <div style={styles.leftListItem}>
                    <span style={styles.listIcon}>
                      <i className="bi bi-check" />
                    </span>
                    Centralized contact management
                  </div>
                </div>
              </div>
            </Col>

            <Col lg={6} xs={12}>
              <div style={styles.rightPanel}>
                <h2 style={styles.formTitle}>Sign in to Emami CMS</h2>
                <p style={styles.formSubtitle}>Use your credentials to continue.</p>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                <Form onSubmit={Login}>
                  <Form.Group className="form-group mb-3">
                    <Form.Label style={styles.label}>Email ID</Form.Label>
                    <Form.Control
                      type="email"
                      name="user_Email"
                      placeholder="Enter your email id"
                      value={user_Email}
                      onChange={changeHandler}
                      style={styles.input}
                    />
                  </Form.Group>

                  {errors.userNameError && (
                    <Alert variant="danger">Please enter email id</Alert>
                  )}

                  <Form.Group className="form-group mb-3">
                    <Form.Label style={styles.label}>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="user_Password"
                      placeholder="Enter your password"
                      value={user_Password}
                      onChange={changeHandler}
                      style={styles.input}
                    />
                  </Form.Group>

                  {errors.passwordError && (
                    <Alert variant="danger">Please enter password</Alert>
                  )}

                  <Button
                    type="submit"
                    style={styles.loginButton}
                    disabled={loading}
                  >
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>

                  <div style={styles.helperRow}>
                    <span>Need access? Contact admin</span>
                    {/* <Link to="#" style={styles.link}>
                      Forgot password?
                    </Link> */}
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SignIn;

