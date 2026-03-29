# git-heatmap

🔥 **A CLI tool that displays Git repository commit history as a terminal heatmap**

![npm](https://img.shields.io/npm/v/git-heatmap)
![license](https://img.shields.io/npm/l/git-heatmap)
![Node.js](https://img.shields.io/node/v/git-heatmap)

## Overview

git-heatmap transforms your Git repository's commit history into a beautiful, GitHub-style contribution heatmap right in your terminal. Perfect for tracking your coding activity, presentations, or just satisfying your inner data visualizer.

```
   Jan 2025                              Feb 2025                              Mar 2025                              Apr 2025                              May 2025                              Jun 2025
          Sun                                                                  Sun                                                                  Sun                              
          Mon  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Mon
          Tue  ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Tue
          Wed  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Wed
          Thu                                                                  Thu                                                                  Thu                              
          Fri  ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Fri
          Sat                                                                  Sat                                                                  Sat                              
```

## Features

- 📊 **GitHub-style heatmap** - Visual commit history similar to GitHub's contribution graph
- 🎨 **Color-coded intensity** - Five levels of heat based on commit frequency
- 📈 **Statistics** - Total commits, daily average, most active day, streaks
- 🔍 **Flexible filtering** - By time range and author
- 🎯 **Multi-repository support** - Analyze any git repository
- 🌈 **ASCII fallback** - Works even without color support

## Installation

### Prerequisites

- Node.js >= 14.0.0
- npm or yarn

### Install globally via npm

```bash
npm install -g git-heatmap
```

### Install locally in a project

```bash
npm install git-heatmap
```

### Manual installation

```bash
git clone https://github.com/heiyouhu/git-heatmap.git
cd git-heatmap
npm install
```

## Usage

### Basic Usage

```bash
# Run from current repository (shows last year)
git-heatmap

# Or using node directly
node index.js
```

### Command Line Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--days <n>` | `-d` | Number of days to show | 365 |
| `--weeks <n>` | `-w` | Show last N weeks | - |
| `--path <path>` | `-p` | Path to git repository | Current directory |
| `--author <name>` | `-a` | Filter by author name | All authors |
| `--no-color` | `-c` | Disable colored output | - |
| `--version` | `-v` | Show version number | - |
| `--help` | `-h` | Show help message | - |

### Examples

```bash
# Show last 30 days
git-heatmap --days 30
git-heatmap -d 30

# Show last 12 weeks (approximately 3 months)
git-heatmap --weeks 12
git-heatmap -w 12

# Analyze a specific repository
git-heatmap --path /path/to/repo
git-heatmap -p /path/to/repo

# Filter by author
git-heatmap --author "John Doe"
git-heatmap -a "John Doe"

# Disable colors (for terminals without color support)
git-heatmap --no-color

# Combine options
git-heatmap -d 90 -a "John" --no-color
```

## Visual Output

### Heatmap Legend

```
Less ░░ ▒▒ ▓▓ ██ ◉◉ More
```

The heat levels represent commit counts:
- **Level 0** (░░) - No commits
- **Level 1** (▒▒) - 1-2 commits
- **Level 2** (▓▓) - 3-5 commits
- **Level 3** (██) - 6-10 commits
- **Level 4** (◉◉) - More than 10 commits

### Statistics Displayed

The tool automatically calculates and displays:
- **Total commits** - Total number of commits in the period
- **Active days** - Number of days with at least one commit
- **Daily average** - Average commits per day
- **Most active day** - Day of week with the most commits
- **Longest streak** - Longest consecutive days with commits
- **Current streak** - Current consecutive days with commits

## Example Output

```
🔥 Git Heatmap
   Repository: /Users/john/projects/my-app
   Period: Last 365 days

   Jan 2025                              Feb 2025                              Mar 2025
          Sun     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Sun
          Mon     ░░▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Mon
          Tue     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Tue
          Wed     ▒▒▒▒░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Wed
          Thu     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Thu
          Fri     ████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Fri
          Sat     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Sat

          Less ░░ ▒▒ ▓▓ ██ ◉◉ More

📊 Statistics:
   Total commits:  247
   Active days:   89
   Daily average: 0.7
   Most active:   Fridays
   Longest streak: 12 days
   Current streak: 3 days
```

## How It Works

1. **Initialize Git**: Uses `simple-git` to interact with the repository
2. **Fetch History**: Retrieves commits within the specified time range
3. **Process Data**: Aggregates commits by date into a map
4. **Generate Heatmap**: Creates a calendar-style grid with color-coded blocks
5. **Calculate Stats**: Derives statistics from the commit data

## Dependencies

- **[simple-git](https://github.com/steveukx/git-js)** - Git interface for Node.js
- **[chalk](https://github.com/chalk/chalk)** - Terminal string styling
- **[commander](https://github.com/tj/commander.js)** - CLI argument parsing

## Troubleshooting

### "Not a git repository" error

Make sure you're running the command in a directory that contains a `.git` folder, or specify the path with `-p`:

```bash
git-heatmap --path /valid/git/repo
```

### No commits displayed

- Check that the repository has commits in the specified time range
- Verify the author filter if using `-a` option
- Try extending the `--days` parameter

### Color issues

If colors appear broken, try disabling them:

```bash
git-heatmap --no-color
```

## License

MIT License - feel free to use, modify, and distribute.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

Made with ❤️ for developers who love their terminals
