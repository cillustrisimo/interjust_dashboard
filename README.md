# Interjust Dashboard Draft

This is the early draft of a project for the Responsibility Lab, building data visualization tools for InterJust. We are utilizing the Observable Framework

**To see how we intend the visualization to render at the end of our work, you may navigate to [https://cillustrisimo.github.io/interjust_dashboard](https://cillustrisimo.github.io/interjust_dashboard), or  launch a terminal in the run the following code:**
```
python3 -m http.server
```
- Then, access server that is launched on webpage (likely in port 8000)

## Some Preliminaries

### node.js Requirements
This is an Observable Framework project. To get started:

1. Clone this repo and `cd` into it
2. Install a modern version of Node.js (if necessary)
3. Run `npm install` in the terminal
4. Run `npm run dev` in the terminal
5. Visit http://localhost:3000 to see the live preview


### Python Requirements
Before running the static site, navigate to the directory via the terminal, then activate the
Python venv before running the site so as to ensure the data loaders work properly.

You can do so in the following way:
```
# Navigate to your project directory
cd project_directory (called interjust_dashboard on my system)

# Activate your virtual environment
source .venv/bin/activate  # On macOS/Linux
# OR
.venv\Scripts\activate     # On Windows

# Now start Observable Framework
npm run dev
```

To ensure you have all the necessary python requirements, while in the project directory, type the following into your terminal (assuming you activated the venv already)

```
# Install all requirements
pip install -r requirements.txt

# Verify installation
pip list
```

The static site should work as intended.