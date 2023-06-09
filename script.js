const playerContainer = document.getElementById("all-players-container");
const newPlayerFormContainer = document.getElementById("new-player-form");

// Add your cohort name to the cohortName variable below, replacing the 'COHORT-NAME' placeholder
const cohortName = "2302-acc-pt-web-pt-b";
// Use the APIURL variable for fetch requests
const APIURL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}/`;

/**
 * It fetches all players from the API and returns them
 * @returns An array of objects.
 */
const fetchAllPlayers = async () => {
  try {
    const response = await fetch(`${APIURL}/players`);
    const players = await response.json();
    console.log(players);
    return players.data.players;
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

const fetchSinglePlayer = async (playerId) => {
  try {
    console.log(typeof playerId);
    const response = await fetch(`${APIURL}/players/${playerId}`);
    const player = await response.json();
    const playerData = player.data.player;
    // Add div with details to the player parent container
    const playerParent = playerContainer.querySelector(
      `div[data-id="${playerId.toString()}"]`
    );
    const flipCardBack = playerParent.querySelector(".flip-card-back");
    const playerDetails = document.createElement("div");
    // Check if player has a team
    if (playerData.team === null) {
      playerDetails.innerHTML = `<div class="details"><p>Breed: ${playerData.breed}</p>
      <p>Status: ${playerData.status}</p>
      <p>Team: None</p></div>
    
   `;
    } else {
      playerDetails.innerHTML = `<div class="details"><p>Breed: ${playerData.breed}</p>
      <p>Status: ${playerData.status}</p>
      <p>Team: ${playerData.team.name}</p></div>
    
    `;
    }
    flipCardBack.appendChild(playerDetails);
    console.log(playerParent);
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

const getNewPlayer = () => {
  const form = newPlayerFormContainer.querySelector("form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    // Create Player Object
    const name = formData.get("name");
    const breed = formData.get("breed");
    const status = formData.get("status");
    const imageUrl = formData.get("imageUrl");
    const playerObj = {
      name,
      breed,
      status,
      imageUrl,
    };
    // Call addNewPlayer
    addNewPlayer(playerObj);
  });
};

const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(`${APIURL}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(playerObj),
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    location.reload();
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

const removePlayer = async (playerId) => {
  try {
    const response = await fetch(`${APIURL}/players/${playerId}`, {
      method: "DELETE",
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse);
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }
};

/**
 * It takes an array of player objects, loops through them, and creates a string of HTML for each
 * player, then adds that string to a larger string of HTML that represents all the players.
 *
 * Then it takes that larger string of HTML and adds it to the DOM.
 *
 * It also adds event listeners to the buttons in each player card.
 *
 * The event listeners are for the "See details" and "Remove from roster" buttons.
 *
 * The "See details" button calls the `fetchSinglePlayer` function, which makes a fetch request to the
 * API to get the details for a single player.
 *
 * The "Remove from roster" button calls the `removePlayer` function, which makes a fetch request to
 * the API to remove a player from the roster.
 *
 * The `fetchSinglePlayer` and `removePlayer` functions are defined in the
 * @param playerList - an array of player objects
 * @returns the playerContainerHTML variable.
 */
const renderAllPlayers = (playerList) => {
  try {
    playerContainer.innerHTML = "";
    playerList.forEach((player) => {
      const playerElement = document.createElement("div");
      playerElement.innerHTML = ` <div class="flip-card-inner">
      <div class="flip-card-front">
        <h2>${player.name}</h2>
        <img src="${player.imageUrl}" alt="" /><br />
        <button class="details-button">See Details</button>
        <button class="delete-button">Remove From Roster</button>
      </div>
      <div class="flip-card-back"><button class="close-button">Close</button></div>
    </div>`;

      // Set data-id attribute to player id and class to flip-card
      playerElement.setAttribute("data-id", player.id);
      playerElement.classList.add("flip-card");

      // Appending each playerElement to the playerContainer div
      playerContainer.appendChild(playerElement);

      // See Details Button
      const detailsButton = playerElement.querySelector(".details-button");
      detailsButton.addEventListener("click", async (event) => {
        const innerCard = playerElement.querySelector(".flip-card-inner");
        const flipCardBack = innerCard.querySelector(".flip-card-back");
        innerCard.style.transform = "rotateY(180deg)";
        if (flipCardBack.childElementCount === 1) {
          fetchSinglePlayer(player.id);
        }
      });

      // Details Page close button
      const detailsPage = playerElement.querySelector(".flip-card-back");
      const closeButton = detailsPage.querySelector(".close-button");
      closeButton.addEventListener("click", (event) => {
        const innerCard = playerElement.querySelector(".flip-card-inner");
        innerCard.style.transform = "rotateY(360deg)";
      });

      // Delete Player
      const deleteButton = playerElement.querySelector(".delete-button");
      deleteButton.addEventListener("click", (event) => {
        removePlayer(player.id);
        playerElement.remove();
      });
    });
  } catch (err) {
    console.error("Uh oh, trouble rendering players!", err);
  }
};

/**
 * It renders a form to the DOM, and when the form is submitted, it adds a new player to the database,
 * fetches all players from the database, and renders them to the DOM.
 */
const renderNewPlayerForm = () => {
  try {
    newPlayerFormContainer.classList.add("form");
    newPlayerFormContainer.innerHTML = `<h2>Add New Player</h2>
    <form>
    <label for="name">Name:</label>
    <input type="text" id="name" name="name"><br>
    <label for="breed">Breed:</label>
    <input type="text" id="breed" name="breed"><br>
    <label for="imageUrl">ImageURL:</label>
    <input type="text" id="imageUrl" name="imageUrl"><br>
    <input type="radio" id="field" name="status" value="field">
    <label for="Field">Field</label><br>
    <input type="radio" id="bench" name="status" value="bench">
    <label for="bench">Bench</label><br>
    <button type="submit">Submit</button>
  </form>`;
  } catch (err) {
    console.error("Uh oh, trouble rendering the new player form!", err);
  }
};

const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);
  renderNewPlayerForm();
  getNewPlayer();
};

init();
