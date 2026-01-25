# West Loop Chicago Construction Tracker

A web application to view and track new construction projects in the West Loop neighborhood of Chicago.

## Features

- **Project Overview**: View all current construction projects in West Loop Chicago
- **Filtering**: Filter projects by status (Under Construction, Proposed, Approved, Completed) and type (Residential, Commercial, Mixed-Use, Hotel)
- **Search**: Search projects by name, address, developer, architect, or neighborhood
- **Detailed Views**: Click on any project to see comprehensive details including developer info, estimated costs, features, and timeline
- **Statistics Dashboard**: Quick overview of total projects and their statuses

## Getting Started

### Option 1: Open directly in browser
Simply open `index.html` in your web browser.

### Option 2: Use a local server
```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx)
npx serve
```

Then navigate to `http://localhost:8000` in your browser.

## Project Structure

```
├── index.html      # Main HTML structure
├── styles.css      # CSS styling
├── app.js          # Application logic and interactivity
├── data.js         # Construction project data
└── README.md       # This file
```

## Data

The application includes sample data for 15 construction projects in the West Loop area, including:
- Residential towers
- Mixed-use developments
- Commercial/office buildings
- Hotels

Each project includes:
- Name and address
- Developer and architect
- Building specifications (floors, units, square footage)
- Estimated cost
- Construction timeline
- Features and amenities
- Current status

## Technologies Used

- HTML5
- CSS3 (with CSS Variables and Grid/Flexbox)
- Vanilla JavaScript (ES6+)
- Responsive design for mobile and desktop

## Browser Support

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

MIT License
