import React from "react";
import { Link } from "react-router-dom";
import * as Dashboard3data from "./data";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  ListGroup,
  ListGroupItem,
  Row,
} from "react-bootstrap";

import PageWrapper from "../../../pagecomponents/Common/PageWrapper";

const Dashboard = () => {
  const pageTitle = "System Overview";
  const pageSubTitle = "Complete system statics & activity";
  
  return (
    <>
      <PageWrapper
          pageName={pageTitle}
          pageSubTitle={pageSubTitle}
      >
        <Row>
          <Col xs={12} lg={3} xl={3} md={12}>
            <Card className="sales-card circle-image1">
              <Row>
                <div className="col-8">
                  <div className="ps-4 pt-4 pe-3 pb-4">
                    <div className="">
                      <h6 className="mb-2 tx-12 ">Today Contacts</h6>
                    </div>
                    <div className="pb-0 mt-0">
                      <div className="d-flex">
                        <h4 className="tx-50 font-weight-semibold mb-2">
                          08
                        </h4>
                      </div>
                      <p className="mb-0 tx-12 text-muted">
                        Recently added
                        <i className="fa fa-caret-up mx-2 text-success"></i>
                        <span className="text-success font-weight-semibold">
                          {" "}
                          +2
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="circle-icon bg-info-transparent text-center align-self-center overflow-hidden">
                    <i className="fa fa-user tx-16 text-primary"></i>
                  </div>
                </div>
              </Row>
            </Card>
          </Col>
          <Col xs={12} lg={3} xl={3} md={12}>
            <Card className="sales-card circle-image2">
              <Row>
                <div className="col-8">
                  <div className="ps-4 pt-4 pe-3 pb-4">
                    <div className="">
                      <h6 className="mb-2 tx-12">Today Events</h6>
                    </div>
                    <div className="pb-0 mt-0">
                      <div className="d-flex">
                        <h4 className="tx-50 font-weight-semibold mb-2">
                          05
                        </h4>
                      </div>
                      <p className="mb-0 tx-12 text-muted">
                        Recently added
                        <i className="fa fa-caret-up mx-2 text-success"></i>
                        <span className="font-weight-semibold text-success">
                          {" "}
                          +2
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="circle-icon bg-info-transparent text-center align-self-center overflow-hidden">
                    <i className="fas fa-calendar-check tx-16 text-info"></i>
                  </div>
                </div>
              </Row>
            </Card>
          </Col>
          <Col xs={12} lg={3} xl={3} md={12}>
            <Card className="sales-card circle-image3">
              <Row>
                <div className="col-8">
                  <div className="ps-4 pt-4 pe-3 pb-4">
                    <div className="">
                      <h6 className="mb-2 tx-12">Pending Approvals</h6>
                    </div>
                    <div className="pb-0 mt-0">
                      <div className="d-flex">
                        <h4 className="tx-50 font-weight-semibold mb-2">
                          02
                        </h4>
                      </div>
                      <p className="mb-0 tx-12 text-muted">
                        Recently added
                        <i className="fa fa-caret-up mx-2 text-success"></i>
                        <span className=" text-success font-weight-semibold">
                          {" "}
                          +1
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="circle-icon bg-info-transparent text-center align-self-center overflow-hidden">
                    <i className="fa fa-history tx-16 text-info"></i>
                  </div>
                </div>
              </Row>
            </Card>
          </Col>
          <Col xs={12} lg={3} xl={3} md={12}>
            <Card className="sales-card circle-image4">
              <Row>
                <div className="col-8">
                  <div className="ps-4 pt-4 pe-3 pb-4">
                    <div className="">
                      <h6 className="mb-2 tx-12">Print Jobs</h6>
                    </div>
                    <div className="pb-0 mt-0">
                      <div className="d-flex">
                        <h4 className="tx-50 font-weight-semibold mb-2">
                          03
                        </h4>
                      </div>
                      <p className="mb-0 tx-12  text-muted">
                        Recently added
                        <i className="fa fa-caret-up mx-2 text-success"></i>
                        <span className="text-success font-weight-semibold">
                          {" "}
                          +3
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="circle-icon bg-info-transparent text-center align-self-center overflow-hidden">
                    <i className="icon ion-ios-print tx-16 text-info"></i>
                  </div>
                </div>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xl={9} lg={12} md={12} sm={12}>
            <Card className=" custom-card overflow-hidden">
              <Card.Header className=" border-bottom-0">
                <div>
                  <h3 className="card-title mb-2 ">Attendees</h3>{" "}
                  <span className="d-block tx-12 mb-0 text-muted"></span>
                </div>
              </Card.Header>
              <Card.Body>
                <div id="statistics3"><Dashboard3data.Statistics3/></div>
              </Card.Body>
            </Card>
          </Col>
          <Col dm={12} lg={12} xl={3}>
            <Card className=" overflow-hidden">
              <Card.Header className=" pb-1">
                <h3 className="card-title mb-2">Recent Activity</h3>
              </Card.Header>
              <Card.Body className=" p-0 customer mt-1">
                <ListGroup className=" list-lg-group list-group-flush">
                  <Link to="#" className="border-0">
                    <ListGroupItem className=" list-group-item-action border-0">
                      <div className="media mt-0">
                        <img
                          className="avatar-lg rounded-circle me-3 my-auto shadow"
                          src={new URL('../../../assets/img/faces/2.jpg', import.meta.url).href}
                          alt=""
                        />
                        <div className="media-body">
                          <div className="d-flex align-items-center">
                            <div className="mt-0">
                              <h5 className="mb-1 tx-13 font-weight-sembold text-dark">
                                Samantha Melon
                              </h5>
                              <p className="mb-0 tx-12 text-muted">
                                User ID: #1234
                              </p>
                            </div>
                            <span className="ms-auto wd-45p tx-14">
                              <span className="float-end badge badge-success-transparent">
                                <span className="op-7 text-success font-weight-semibold">
                                  paid{" "}
                                </span>
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </ListGroupItem>
                  </Link>
                  <Link to="#" className="border-0">
                    <ListGroupItem className=" list-group-item-action border-0">
                      <div className="media mt-0">
                        <img
                          className="avatar-lg rounded-circle me-3 my-auto shadow"
                          src={new URL('../../../assets/img/faces/1.jpg', import.meta.url).href}
                          alt=""
                        />
                        <div className="media-body">
                          <div className="d-flex align-items-center">
                            <div className="mt-1">
                              <h5 className="mb-1 tx-13 font-weight-sembold text-dark">
                                Allie Grater
                              </h5>
                              <p className="mb-0 tx-12 text-muted">
                                User ID: #1234
                              </p>
                            </div>
                            <span className="ms-auto wd-45p tx-14">
                              <span className="float-end badge badge-danger-transparent ">
                                <span className="op-7 text-danger font-weight-semibold">
                                  Pending
                                </span>
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </ListGroupItem>
                  </Link>
                  <Link to="#" className="border-0">
                    <ListGroupItem className=" list-group-item-action border-0">
                      <div className="media mt-0">
                        <img
                          className="avatar-lg rounded-circle me-3 my-auto shadow"
                          src={new URL('../../../assets/img/faces/5.jpg', import.meta.url).href}
                          alt=""
                        />
                        <div className="media-body">
                          <div className="d-flex align-items-center">
                            <div className="mt-1">
                              <h5 className="mb-1 tx-13 font-weight-sembold text-dark">
                                Gabe Lackmen
                              </h5>
                              <p className="mb-0 tx-12 text-muted">
                                User ID: #1234
                              </p>
                            </div>
                            <span className="ms-auto wd-45p  tx-14">
                              <span className="float-end badge badge-danger-transparent ">
                                <span className="op-7 text-danger font-weight-semibold">
                                  Pending
                                </span>
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </ListGroupItem>
                  </Link>
                  <Link to="#" className="border-0">
                    <ListGroupItem className=" list-group-item-action border-0">
                      <div className="media mt-0">
                        <img
                          className="avatar-lg rounded-circle me-3 my-auto shadow"
                          src={new URL('../../../assets/img/faces/7.jpg', import.meta.url).href}
                          alt=""
                        />
                        <div className="media-body">
                          <div className="d-flex align-items-center">
                            <div className="mt-1">
                              <h5 className="mb-1 tx-13 font-weight-sembold text-dark">
                                Manuel Labor
                              </h5>
                              <p className="mb-0 tx-12 text-muted">
                                User ID: #1234
                              </p>
                            </div>
                            <span className="ms-auto wd-45p tx-14">
                              <span className="float-end badge badge-success-transparent ">
                                <span className="op-7 text-success font-weight-semibold">
                                  Paid
                                </span>
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </ListGroupItem>
                  </Link>
                  <Link to="#" className="border-0">
                    <ListGroupItem className=" list-group-item-action border-0">
                      <div className="media mt-0">
                        <img
                          className="avatar-lg rounded-circle me-3 my-auto shadow"
                          src={new URL('../../../assets/img/faces/9.jpg', import.meta.url).href}
                          alt=""
                        />
                        <div className="media-body">
                          <div className="d-flex align-items-center">
                            <div className="mt-1">
                              <h5 className="mb-1 tx-13 font-weight-sembold text-dark">
                                Hercules Bing
                              </h5>
                              <p className="mb-0 tx-12 text-muted">
                                User ID: #1754
                              </p>
                            </div>
                            <span className="ms-auto wd-45p tx-14">
                              <span className="float-end badge badge-success-transparent ">
                                <span className="op-7 text-success font-weight-semibold">
                                  Paid
                                </span>
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </ListGroupItem>
                  </Link>
                  <Link to="#" className="border-0">
                    <ListGroupItem className=" list-group-item-action border-0">
                      <div className="media mt-0">
                        <img
                          className="avatar-lg rounded-circle me-3 my-auto shadow"
                          src={new URL('../../../assets/img/faces/11.jpg', import.meta.url).href}
                          alt=""
                        />
                        <div className="media-body">
                          <div className="d-flex align-items-center">
                            <div className="mt-1">
                              <h5 className="mb-1 tx-13 font-weight-sembold text-dark">
                                Manuel Labor
                              </h5>
                              <p className="mb-0 tx-12 text-muted">
                                User ID: #1234
                              </p>
                            </div>
                            <span className="ms-auto wd-45p tx-14">
                              <span className="float-end badge badge-danger-transparent ">
                                <span className="op-7 text-danger font-weight-semibold">
                                  Pending
                                </span>
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </ListGroupItem>
                  </Link>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </PageWrapper>
    </>
  );
};

Dashboard.propTypes = {};

Dashboard.defaultProps = {};

export default Dashboard;

