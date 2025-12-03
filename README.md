
# White Elephant Gift Exchange App

## Live Site
[Link to Live App](https://tollbros.github.io/white-elephant-game/)

## Overview
The **White Elephant Gift Exchange App** is a dynamic app for early organizing and managing a virtual White Elephant-style gift exchanges. The owner will be resonsible for adding all of the gifts to the game prior to play - whether the owner hand selects gifts or collects a list of gifts from players. Images of gifts, gift names, and player names will be needed to play. 

It follows these classic rules:

1. **Random Player Order:** Players are randomly assigned an order to take their turns.
2. **Gift Unwrapping:** Players can choose to unwrap a new gift or steal an unwrapped one from another player.
3. **Gift Stealing Limits:** 
   - Each gift can only be stolen a maximum of **two times**, after which it is locked.
   - A player cannot immediately steal back a gift that was just taken from them.
4. **Final Pick for First Player:** The first player gets a final opportunity to either keep their gift or swap it with another player at the end of the game.
5. **Game Conclusion:** The game ends when all players have had their turn, and the final pick phase is completed.

This app replicates the fun of a traditional White Elephant game while adding seamless set up and tracking, making it perfect for virtual holiday parties, team-building events, or family gatherings.

---

## Features
- **Randomized Player Order:** Automatically shuffles players to ensure fairness.
- **Gift Unwrapping and Stealing:** Allows players to unwrap new gifts or steal unwrapped ones from others.
- **Gift Locking:** Gifts can only be stolen twice, and locked gifts are clearly indicated.
- **Final Pick Phase:** Gives the first player a special opportunity to swap or keep their gift at the end of the game.
- **Responsive UI:** Optimized for various screen sizes, ensuring accessibility on desktop, tablet, or mobile devices.
- **Summary Screen:** For easy gift tracking and direct links to purchase

---

## Prerequisites
Before running the app, ensure you have the following installed:
- **Node.js** (v14 or later)
- **npm** (Node Package Manager)

---

## Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/tollbros/white-elephant-game.git
   cd white-elephant-game
   ```

2. **Install Dependencies:**
   Run the following command to install the required Node modules:
   ```bash
   npm install
   ```

3. **Start the Development Server:**
   Launch the app locally:
   ```bash
   npm start
   ```

4. **Open in Browser:**
   Navigate to `http://localhost:3000` to view the app.



### Available Scripts

In the project directory, you can run:

#### `npm start`
Runs the app in the development mode.  
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.  
You may also see any lint errors in the console.

#### `npm run build`
Builds the app for production to the `build` folder.  
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.  
Your app is ready to be deployed!

---

## Usage
### Game Setup

All setup is now done from a single config file:

```
src/config/gameData.js
```

Inside this file, you’ll find:

- `basePlayers` → list of all players  
- `giftsData` → gift name, Amazon link, and image filename  
- `totalGifts` → automatically calculated from the gifts array  

### How to Customize the Game

#### 1. Add or Edit Players
Open `src/config/gameData.js` and update:

```js
export const basePlayers = [
  "Player 1",
  "Player 2",
  ...
];
```

#### 2. Add or Edit Gifts
Update the `giftsData` array:

```js
{ id: 1, name: "Gift Name", link: "AmazonLink", imageFile: "gift1.jpg" }
```

Each gift needs:
- a `name`
- a `link`
- an `imageFile` that matches the actual file in `src/images/`

#### 3. Add Gift Images
Place gift images in:

```
src/images/
```

Filenames must match the `imageFile` value  
(e.g., `imageFile: "gift1.jpg"` requires an image named `gift1.jpg`).

#### 4. Total Gifts
No manual updating needed — `totalGifts` calculates automatically:

```js
export const totalGifts = giftsData.length;
```

---

## Deploying Changes
After updating players, gifts, or images — and merging your changes into `main` — run:

```bash
npm run deploy
```

This rebuilds the production app and publishes it to GitHub Pages.

---

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

---

## Technologies Used
- **React.js**: For building the user interface.
- **Tailwind CSS**: For styling and responsive design.
- **Node.js**: For managing dependencies and running the development server.

---

## Acknowledgments
- Icons from **lucide-react**
- Developed for virtual holiday season celebrations 🎁
