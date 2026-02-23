import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Breadcrumb.css';

function Breadcrumb() {
    const location = useLocation()

    const { pathname } = location
    console.log("pathname ", pathname);

    let currentLink = '';

    const crumbs = pathname.split('/').filter(crumb => crumb !== '').map(crumb => {
        currentLink += `/${crumb}`

        return (
            <div className='crumb' key={crumb}>
                <Link to={currentLink}>{crumb}</Link>
            </div>
        )
    })
    return (
        <div className='breadcrumbs'>
            {crumbs}
        </div>

    )
}

export default Breadcrumb
