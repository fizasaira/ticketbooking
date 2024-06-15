const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Initialize seats array with false values
let seats = Array(12)
  .fill(null)
  .map(() => Array(7).fill(false));
for (let i = 0; i < seats.length; i++) {
  if (i === 11) {
    seats[i] = Array(3).fill(false);
  }
}

// Endpoint to get current seat status
app.get('/api/seats', (req, res) => {
  res.json(seats);
});

// Endpoint to book seats
app.post('/api/book', (req, res) => {
  const numSeats = req.body.numSeats;
  if (numSeats < 1 || numSeats > 7) {
    return res
      .status(400)
      .json({ message: 'You can book between 1 to 7 seats only.' });
  }

  let bookedSeats = [];
  for (let i = 0; i < seats.length; i++) {
    let availableSeatsInRow = seats[i]
      .map((seat, index) => (seat === false ? index : null))
      .filter((index) => index !== null);
    if (availableSeatsInRow.length >= numSeats) {
      for (let j = 0; j < numSeats; j++) {
        seats[i][availableSeatsInRow[j]] = true;
        bookedSeats.push({ row: i + 1, seat: availableSeatsInRow[j] + 1 });
      }
      // Check if all seats are booked
      if (areAllSeatsBooked()) {
        resetSeats(); // Reset seats if all are booked
      }
      return res.json({ bookedSeats, seats });
    }
  }

  // If enough seats are not available, try booking any available seats
  if (bookedSeats.length < numSeats) {
    bookedSeats = [];
    for (let i = 0; i < seats.length; i++) {
      for (let j = 0; j < seats[i].length; j++) {
        if (seats[i][j] === false) {
          seats[i][j] = true;
          bookedSeats.push({ row: i + 1, seat: j + 1 });
          if (bookedSeats.length === numSeats) {
            // Check if all seats are booked after booking available seats
            if (areAllSeatsBooked()) {
              resetSeats(); // Reset seats if all are booked
            }
            return res.json({ bookedSeats, seats });
          }
        }
      }
    }
  }

  res.status(400).json({ message: 'Not enough seats available.' });
});

// Helper function to check if all seats are booked
function areAllSeatsBooked() {
  for (let i = 0; i < seats.length; i++) {
    for (let j = 0; j < seats[i].length; j++) {
      if (seats[i][j] === false) {
        return false; // Return false if any seat is not booked
      }
    }
  }
  return true; // Return true if all seats are booked
}

// Helper function to reset all seats to false
function resetSeats() {
  seats = Array(12)
    .fill(null)
    .map(() => Array(7).fill(false));
  for (let i = 0; i < seats.length; i++) {
    if (i === 11) {
      seats[i] = Array(3).fill(false);
    }
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
