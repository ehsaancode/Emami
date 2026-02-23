import { useEffect, useRef, useState } from "react";
import {
  Navbar,
  Col,
  Row,
  Container,
} from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";import { Delete } from "../../redux/actions/action";
import { useDispatch, useSelector } from "react-redux";
import {
  filterBusiness,
  clearThisState,
  setSearchValue,
  clearText,
} from "../../redux/slices/HeaderSearchSlice";
import {  getStorage } from "../../helpers/utility";

export default function Header() {
  const [selectedSearchType, setSelectedSearchType] = useState("");
  const [adminData, setAdminData] = useState();

  useEffect(() => {
    const storedData = getStorage("login_info");
    const login_info = storedData ? JSON.parse(storedData) : null;
    setAdminData(login_info?.staff_Name);
  }, []);



  //leftsidemenu
  const openCloseSidebar = () => {
    document.querySelector("body").classList.toggle("sidenav-toggled");
  };
  //rightsidebar
  const Rightsidebar = () => {
    document.querySelector(".sidebar-right").classList.add("sidebar-open");
  };
  const Darkmode = () => {
    document.querySelector(".app").classList.toggle("dark-theme");
    document.querySelector(".app").classList.remove("light-theme");
  };

  const [price, setPrice] = useState(0);
  // console.log(price);

  let getdata = useSelector((state) => state.cartreducer.carts);

  const dispatch = useDispatch();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // console.log(open)
  };

  const [Data, setData] = useState([]);

  const { id } = useParams();

  // console.log(getdata);

  const compare = () => {
    let comparedata = getdata.filter((e) => {
      console.log(e, id);
      return e.id === id;
    });
    setData(comparedata);
    // console.log(comparedata, Data);
  };

  useEffect(() => {
    compare();
    // eslint-disable-next-line
  }, [id]);
  const ondelete = (id) => {
    dispatch(Delete(id));
  };

  function total() {
    let price = 0;
    getdata.map((ele) => {
      price = ele.price * ele.qnty + price;
      return price;
    });
    setPrice(price);
  }

  useEffect(() => {
    total();
  });

  let navigate = useNavigate();
  const routeChange = () => {
    let path = `${process.env.PUBLIC_URL}/`;
    navigate(path);
  };

  // ! Search feature
  const headerSearch = useSelector(
    (state) => state.HeaderSearchSlice.data.lists
  ); //recieving the data on search.
  const searchValue = useSelector(
    (state) => state.HeaderSearchSlice.searchValue
  ); //state for searchbox value.
  const debounceTimeoutRef = useRef(null);

  // implemented Debouncing Effect on "autocomplete-topbar" API.
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    if (searchValue) {
      debounceTimeoutRef.current = setTimeout(() => {
        const filterBusinessPayload = {
          //Payload
          inputData: {
            redoq_csd_staff_Designation: "Super Admin",
            redoq_csd_staff_Id: 14,
            searchParam: searchValue,
            searchType: selectedSearchType,
          },
        };
        dispatch(filterBusiness(filterBusinessPayload));
      }, 500);

      return () => {
        clearTimeout(debounceTimeoutRef.current);
      };
    }
  }, [dispatch, selectedSearchType, searchValue]);

  // Top Bar Search Field
  const handleChange = (e) => {
    dispatch(setSearchValue(e.target.value));
  };

  // Top Bar DropDown
  const handleSlectedValue = (selectedVal) => {
    setSelectedSearchType(selectedVal);
    console.log(selectedVal);
  };

  const loginInfo = JSON.parse(localStorage.getItem("login_info") || "{}");
  const userName = loginInfo?.user_Name;

  return (
    <Navbar className="main-header side-header sticky nav nav-item">
      <div className="main-container container-fluid">
        <div className="main-header-left ">
          <div className="responsive-logo">
            <Link to={`${process.env.PUBLIC_URL}/dashboard/`} className="header-logo">
              <img
                src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                className="mobile-logo logo-1"
                alt="logo"
                style={{ height: "50px", width: "50px", objectFit: "contain" }}
              />
              <img
                src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                className="mobile-logo dark-logo-1"
                alt="logo"
                style={{ height: "50px", width: "50px", objectFit: "contain" }}
              />
            </Link>
          </div>

          <div className="logo-horizontal">
            <Link to={`${process.env.PUBLIC_URL}/dashboard/`} className="header-logo">
              <img
                src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                className="mobile-logo logo-1"
                alt="logo"
                style={{ height: "50px", width: "50px", objectFit: "contain" }}
              />
              <img
                src="https://imgcdn.kuick.com/cms-designer/emami/emami-logo.svg"
                className="mobile-logo dark-logo-1"
                alt="logo"
                style={{ height: "50px", width: "50px", objectFit: "contain" }}
              />
            </Link>
          </div>
          <div
            className="app-sidebar__toggle"
            data-bs-toggle="sidebar"
            onClick={() => openCloseSidebar()}
          >
            <Link className="open-toggle" to="#">
              <i className="header-icon fe fe-align-left"></i>
            </Link>
            <Link className="close-toggle" to="#">
              <i className="header-icon fe fe-x"></i>
            </Link>
          </div>
          {headerSearch && searchValue.length > 0 && (
            <div className="header-search-container">
              <Container fluid>
                <Row className="d-flex justify-content-between mt-3 align-items-stretch">
                  {headerSearch.map((resultData, index) => (
                    <Col xs={4} key={index}>
                      <Link
                        to={`${process.env.PUBLIC_URL}/clients/landing/${resultData.id}`}
                      >
                        <div
                          className="main-message-list header-search-element"
                          key={index}
                          dangerouslySetInnerHTML={{ __html: resultData.name }}
                          onClick={() => {
                            dispatch(clearText());
                            dispatch(clearThisState());
                          }}
                        ></div>
                      </Link>
                    </Col>
                  ))}
                </Row>
              </Container>
            </div>
          )}
        </div>
        <div className="main-header-right">
          <Navbar.Toggle
            className="navresponsive-toggler d-lg-none ms-auto"
            type="button"
          >
            <span className="navbar-toggler-icon fe fe-more-vertical"></span>
          </Navbar.Toggle>
          <div className="mb-0 navbar navbar-expand-lg   navbar-nav-right responsive-navbar navbar-dark p-0">
            <Navbar.Collapse className="collapse" id="navbarSupportedContent-4">
              <ul className="nav nav-item header-icons navbar-nav-right ">
                <li className="dropdown nav-item">
                  <Link
                    to="#"
                    className="new nav-link theme-layout nav-link-bg layout-setting"
                  // onClick={() => Darkmode()}
                  >
                  </Link>
                </li>
                <div className="menu-header-content p-3 border-bottom">
                  <div className="d-flex wd-100p">
                    <div className="d-flex align-items-center">
                      <span
                        className="ms-2 d-inline-flex align-items-center justify-content-center"
                        style={{
                          width: "34px",
                          height: "34px",
                          borderRadius: "50%",
                          border: "1px solid #e5e7eb",
                          background: "#fff",
                          color: "#0b63f3",
                          fontSize: "14px",
                          marginRight: "10px",
                        }}
                      >
                        <i className="bi bi-bell" />
                      </span>
                      <div
                        className="main-img-user d-flex align-items-center justify-content-center"
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "50%",
                          background: "#eef2ff",
                          color: "#0b63f3",
                          fontSize: "18px",
                        }}
                      >
                        <i className="bi bi-person-fill" />
                      </div>
                    </div>
                    <div className="ms-3 my-auto">
                      <span className="dropdown-title-text subtext op-6  tx-12">Welcome,</span>
                      <h6 className="tx-15 font-weight-semibold mb-0">{userName}</h6>
                    </div>
                  </div>
                </div>
              </ul>
            </Navbar.Collapse>
          </div>

        </div>
      </div>
    </Navbar>
  );
}

