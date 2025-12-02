/**
 * Displays the dashboard page.
 */

import React, { useState, useContext } from 'react';
import { Link, Switch, Route } from 'react-router-dom';
import { firebaseAuth } from '../provider/AuthProvider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRandom, faPlus, faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';

import Breadcrumb from './Breadcrumb';
import DeckCreator from './decks-and-cards/DeckCreator';
import DeckEditor from './decks-and-cards/DeckEditor';
import DeckList from './decks-and-cards/DeckList';
import PageHeading from './PageHeading';

const Dashboard = ({
  onClick,
  decks,
  cards,
  selectedDecks,
  setSelectedDecks,
}) => {
  const [deckToEdit, setDeckToEdit] = useState(null);
  const { user } = useContext(firebaseAuth);

  if (!user) {
    return (
      <div className="dashboard">
        <p>You are not logged in. To view your dashboard, log in or sign up here:</p>
        <Link to="/">Home</Link>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-inner">
        <Switch>
          <Route path="/app/edit">
            <DeckEditor 
              selectedDecks={selectedDecks}
              deckToEdit={deckToEdit}
              setDeckToEdit={setDeckToEdit}
              cards={cards}
            />
          </Route>
          <Route path="/app/create">
            <Breadcrumb
              to="/app"
              name="Dashboard"
            />
            <PageHeading 
              title="New Deck!"
              subtitle="Create a new deck of flash cards. You can always come back and edit it at any time!"
            />
            <DeckCreator 
              setDeckToEdit={setDeckToEdit}
              setSelectedDecks={setSelectedDecks}
            />
          </Route>
          <Route path="/app">
            <Breadcrumb
              to="/"
              name="Home"
            />
            <PageHeading 
              title="Dashboard."
              subtitle="Select decks to study, then click shuffle."
            />
            <div>
              <Link 
                to="/app/create" 
                className="btn btn-tertiary"
              >
                Create a new deck
                <FontAwesomeIcon icon={faPlus} className="icon"/>
              </Link>
              <DeckList
                decks={decks}
                selectedDecks={selectedDecks}
                setSelectedDecks={setSelectedDecks}
                setDeckToEdit={setDeckToEdit}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                id="shuffle"
                name="shuffle"
                onClick={(e) => {
                  console.log("Shuffle button clicked in Dashboard", { 
                    cardsLength: cards.length, 
                    selectedDecksLength: selectedDecks.length,
                    disabled: cards.length === 0 || selectedDecks.length === 0
                  });
                  onClick(e);
                }}
                className="btn btn-primary"
                disabled={cards.length === 0 || selectedDecks.length === 0}
                title={cards.length === 0 ? "Không có thẻ" : selectedDecks.length === 0 ? "Vui lòng chọn ít nhất một bộ thẻ" : "Xáo trộn các bộ thẻ đã chọn"}
              >
                <><FontAwesomeIcon icon={faRandom} /> Xáo trộn!</>
              </button>
              <button
                id="match-game"
                name="match-game"
                onClick={(e) => {
                  console.log("Match game button clicked in Dashboard", { 
                    cardsLength: cards.length, 
                    selectedDecksLength: selectedDecks.length,
                    disabled: cards.length === 0 || selectedDecks.length === 0
                  });
                  onClick(e);
                }}
                className="btn btn-primary"
                disabled={cards.length === 0 || selectedDecks.length === 0}
                title={cards.length === 0 ? "Không có thẻ" : selectedDecks.length === 0 ? "Vui lòng chọn ít nhất một bộ thẻ" : "Bắt đầu trò chơi ghép thẻ"}
              >
                <><FontAwesomeIcon icon={faPuzzlePiece} /> Trò chơi ghép thẻ</>
              </button>
            </div>
          </Route>
        </Switch>
      </div>
    </div>
  );
} 

export default Dashboard;