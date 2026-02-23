import React, { useEffect, useState, useMemo } from "react";
import Pagination from "react-bootstrap/Pagination";
import { checkInt } from "../../helpers/utility";

    const PaginationComponent = ({
      total = 0,
      itemsPerPage = 10,
      currentPage = 1,
      onPageChange,
    }) => {
      total = checkInt(total);
      itemsPerPage = checkInt(itemsPerPage);
      currentPage = checkInt(currentPage);
      const [totalPages, setTotalPages] = useState(0);
    
      useEffect(() => {
        if (total > 0 && itemsPerPage > 0)
          setTotalPages(Math.ceil(total / itemsPerPage));
      }, [total, itemsPerPage]);
    
      const paginationItems = useMemo(() => {
        const pages = [];
        if(totalPages<=8)
        {
          for (let i = 1; i <= totalPages; i++) {
            pages.push(
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => onPageChange(i)}
                className="page-item "
              >
                {i}
              </Pagination.Item>
            );
          }
        }else
        {
          const midpoint = checkInt( totalPages/2 );
          for (let i = 1; i <= 3; i++) {
            pages.push(
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => onPageChange(i)}
                className="page-item "
              >
                {i}
              </Pagination.Item>
            );
          }
          pages.push(<Pagination.Ellipsis disabled />);
          for (let i = midpoint; i <= midpoint + 2; i++) {
            pages.push(
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => onPageChange(i)}
                className="page-item "
              >
                {i}
              </Pagination.Item>
            );
          }
          pages.push(<Pagination.Ellipsis disabled />);
          for (let i = totalPages-3; i <= totalPages; i++) {
            pages.push(
              <Pagination.Item
                key={i}
                active={i === currentPage}
                onClick={() => onPageChange(i)}
                className="page-item "
              >
                {i}
              </Pagination.Item>
            );
          }


        }
        
    
        return pages;
      }, [totalPages, currentPage]);
    
      if (totalPages === 0) return null;

      return (
          <Pagination className=" mb-0" size="xs">   
             
            <Pagination.Item className="page-item"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            >
              <i className="icon ion-ios-arrow-back"></i>
            </Pagination.Item>
            
            {paginationItems}
            
            <Pagination.Item className="page-item"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            >
              <i className="icon ion-ios-arrow-forward"></i>
            </Pagination.Item>
          </Pagination>
      );
    };
    
    export default PaginationComponent;
