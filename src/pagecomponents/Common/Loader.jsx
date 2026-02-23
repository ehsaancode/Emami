import { Spinner } from 'react-bootstrap';

const Loader = () => {
  return (
    <div className="text-center mg-b-20">
      <Spinner animation="border" className="spinner-border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  );
};

export default Loader;
