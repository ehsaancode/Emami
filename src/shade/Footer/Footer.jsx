import React from 'react';
import { Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { app_version } from '../../helpers/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <div className="main-footer">
      <Col md={12} sm={12} className="text-center">
        <div className="container-fluid pt-0 ht-100p">
          Copyright © {currentYear} {app_version}
          {/* <Link to="#" className="text-primary">
          RedoQ
        </Link>
        . Designed with <span className="fa fa-heart text-danger"></span> by
        <Link to="#"> ReactJs </Link> All rights reserved. */}
        </div>
      </Col>
    </div>
  );
}

