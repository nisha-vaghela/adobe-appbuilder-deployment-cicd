/* 
* <license header>
*/

import React from 'react'
import { NavLink } from 'react-router-dom'

function SideBar () {
    return (
        <ul className="SideNav">
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    end
                    to="/"
                >
                    Home
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/actions"
                >
                    Your App Actions
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/product-lookup"
                >
                    Product Lookup
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/api-mesh"
                >
                    API Mesh
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/product-crud"
                >
                    Product Database
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/file-manager"
                >
                    File Manager
                </NavLink>
            </li>
            <li className="SideNav-item">
                <NavLink
                    className={({ isActive }) => `SideNav-itemLink ${isActive ? 'is-selected' : ''}`}
                    aria-current="page"
                    to="/about"
                >
                    About App Builder
                </NavLink>
            </li>
        </ul>
    )
}

export default SideBar
