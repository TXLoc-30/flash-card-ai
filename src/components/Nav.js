/**
 * Displays the upper navigation bar.
 */

import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faReply } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

import Navlinks from './Navlinks';
import SearchBar from './SearchBar';

const Nav = ({
  onClick,
  isMenuOpen,
  mobile=false,
  searchQuery,
  setSearchQuery,
  decks,
  publicDecks,
  user
}) => {
  const [navClasses, setNavClasses] = useState("navbar");
  const btnClasses= "btn btn-hamburger small-screen-only " + (isMenuOpen && "open"); 
  let location = useLocation();
  const history = useHistory();

  useEffect(() => {

    if (mobile) {
      setNavClasses("navbar");
      return;
    }

    if (location.pathname !== "/") {
      setNavClasses("navbar light");
      return;
    }

    setNavClasses("navbar");
  }, [location, mobile])

  return (
    <header className={navClasses}>
      <div className="navbar-inner">
        <Link to="/" className="logo">
          <FontAwesomeIcon icon={faReply} size="2x" className="icon"/>&nbsp;&nbsp;
          Flash Cards
        </Link>
        {(decks && decks.length > 0) || (publicDecks && publicDecks.length > 0) ? (
          <div className="navbar-search">
            <SearchBar
              value={searchQuery}
              onChange={(e) => {
                const newValue = e.target.value;
                setSearchQuery(newValue);
                // Navigate to search page when user types, or back to home if empty
                if (newValue.trim() && location.pathname !== '/search') {
                  history.push('/search');
                } else if (!newValue.trim() && location.pathname === '/search') {
                  history.push('/');
                }
              }}
              placeholder="Tìm kiếm bộ thẻ..."
            />
          </div>
        ) : null}
        <div className="right-nav">
          <nav className="large-screen-only">
            <Navlinks closeMenu={() => null}/>
          </nav>
          {/* { !user && 
            <NavLink to="/log-in" className="btn btn-small nav-cta">
              Log in
            </NavLink>
          } */}
          <button 
            className={btnClasses}
            name="toggle-menu"
            onClick={onClick}
          >
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Nav;