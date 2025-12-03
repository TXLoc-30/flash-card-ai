/**
 * Main wrapper for the app, containing the shuffle functionality
 * used by Deck and Dashboard components.
 */

import React, { useContext, useEffect, useState } from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';

import { firebaseAuth } from './provider/AuthProvider';
import useOnDecksSnapshot from './hooks/useOnDecksSnapshot';
import usePublicDecksSnapshot from './hooks/usePublicDecksSnapshot';
import useGetShuffledCards from './hooks/useGetShuffledCards';

import Deck from './components/decks-and-cards/Deck';
import CardMatchingGame from './components/decks-and-cards/CardMatchingGame';
import Dashboard from './components/Dashboard';
import Landing from './components/Landing';
import SearchResults from './components/SearchResults';
import Login from './components/account-management/Login';
import Logout from './components/account-management/Logout';
import MyAccount from './components/account-management/MyAccount';
import Nav from './components/Nav';
import Signup from './components/account-management/Signup';
import MobileMenu from './components/MobileMenu';
import ResetPassword from './components/account-management/ResetPassword';
import Footer from './components/Footer';

const fisherYatesShuffle = (array) => {
  // Create a copy of the array to avoid mutating the original
  const shuffled = [...array];
  var currentIndex = shuffled.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = Object.assign({}, shuffled[currentIndex]);
    shuffled[currentIndex] = shuffled[randomIndex];
    shuffled[randomIndex] = temporaryValue;
  }
  return shuffled;
}

const App = () => {
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const history = useHistory();
  const { user } = useContext(firebaseAuth);
  const { decks } = useOnDecksSnapshot(user);
  const { publicDecks } = usePublicDecksSnapshot();
  const { cards } = useGetShuffledCards(user, selectedDecks);

   /* Update the 'shuffledCards' array whenever 'cards'
      is updated via onSnapshot in firestore. */
  useEffect(() => {
    // Only update if shuffledCards already exists (user has shuffled cards)
    if (shuffledCards.length === 0) return;
    
    let _cards = [];
    shuffledCards.forEach(card => {
      cards.forEach((updatedCard) => {
        if (updatedCard.id === card.id) {
          _cards.push(Object.assign({}, updatedCard)); 
        }
      })
    });
    
    // Only update if we found matching cards (avoid unnecessary updates)
    if (_cards.length > 0) {
      setShuffledCards(_cards);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards]);

  useEffect(() => {
    if (user) return;
    setShuffledCards([]);
    setSelectedDecks([]);
  }, [user]);

  // Redirect to home if search query is empty and on search page
  useEffect(() => {
    if (!searchQuery.trim() && history.location.pathname === '/search') {
      history.push('/');
    }
  }, [searchQuery, history]);

  const handleButtons = (event) => {
    // Prevent default behavior (if event is a real event object)
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    
    // Use currentTarget instead of target to get the element with the listener
    // This ensures we get the button even when clicking on child elements (icon, text)
    const buttonName = event.currentTarget?.name || event.target?.name || event.target.closest('[name]')?.name;
    
    console.log("handleButtons called with:", buttonName, { selectedDecks, cardsLength: cards.length });
    
    switch (buttonName) {
      case "exit":
        setShuffledCards([]);
        if (user) {
          history.push("/app");
          return;
        }
        history.push("/");
        return;

      case "shuffle":
        console.log("Shuffle button clicked", { selectedDecks, cardsLength: cards.length });
        if (selectedDecks.length === 0) {
          console.warn("No decks selected");
          alert("Vui lòng chọn ít nhất một bộ thẻ để xáo trộn.");
          return;
        }
        if (cards.length === 0) {
          console.warn("No cards available in selected decks", { selectedDecks });
          alert("Không có thẻ trong các bộ thẻ đã chọn. Vui lòng đảm bảo các bộ thẻ có chứa thẻ.");
          return;
        }
        console.log("Shuffling cards:", cards.length);
        const randomized_cards = fisherYatesShuffle(cards);
        setShuffledCards(randomized_cards);
        console.log("Navigating to /app/shuffle");
        history.push("/app/shuffle");
        return;

      case "match-game":
        console.log("Match game button clicked", { selectedDecks, cardsLength: cards.length });
        if (selectedDecks.length === 0) {
          console.warn("No decks selected");
          alert("Vui lòng chọn ít nhất một bộ thẻ để chơi.");
          return;
        }
        if (cards.length === 0) {
          console.warn("No cards available in selected decks", { selectedDecks });
          alert("Không có thẻ trong các bộ thẻ đã chọn. Vui lòng đảm bảo các bộ thẻ có chứa thẻ.");
          return;
        }
        console.log("Starting match game with cards:", cards.length);
        history.push("/app/match-game");
        return;

      case "toggle-menu":
        setIsMenuOpen(prev => !prev);
        return;
      default:
        console.warn("Unknown button name:", buttonName, event);
        return;
    }
  }

  return (
    <div className="app">
      <div className="container">
      <Nav 
        onClick={handleButtons}
        isMenuOpen={isMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        decks={decks}
        publicDecks={publicDecks}
        user={user}
      />
      <MobileMenu 
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        handleButtons={handleButtons}
      />
      <Switch>
        <Route path="/log-in">
          <Login />
          <Footer />
        </Route>
        <Route path="/log-out">
          <main>
            <Logout />
          </main>
        </Route>
        <Route path="/sign-up">
          <Signup />
          <Footer />
        </Route>
        <Route path="/reset-password">
          <main>
            <ResetPassword />
            <Footer />
          </main>
        </Route>
        <Route path="/my-account">
          <main>
            <MyAccount />
            <Footer />
          </main>
        </Route>
        <Route path="/app/shuffle">
          <Deck 
            shuffledCards={shuffledCards}
            onClick={handleButtons}
          />
        </Route>
        <Route path="/app/match-game">
          <CardMatchingGame 
            cards={cards}
            onClick={handleButtons}
          />
        </Route>
        <Route path="/app/d/:hash">
          <Deck 
            shuffledCards={shuffledCards}
            onClick={handleButtons}
          />
        </Route>
        <Route path="/app">
          <main>
            <Dashboard 
              onClick={handleButtons}
              decks={decks}
              cards={cards}
              selectedDecks={selectedDecks}
              setSelectedDecks={setSelectedDecks}
              searchQuery={searchQuery}
            />
            <Footer />
          </main>
        </Route>
        <Route path="/search">
          <main>
            <SearchResults searchQuery={searchQuery} publicDecks={publicDecks} />
            <Footer />
          </main>
        </Route>
        <Route exact path="/">
          <main>
            <Landing publicDecks={publicDecks} />
            <Footer />
          </main>
        </Route>
      </Switch>
      </div>
    </div>
  );
}

export default App;