#!/usr/bin/env node

/**
 * git-heatmap
 * 
 * A CLI tool that converts Git repository commit history into a terminal heatmap,
 * similar to GitHub's contribution graph but rendered in the terminal.
 * 
 * Usage:
 *   node index.js                    # Show heatmap for current repo (last year)
 *   node index.js --days 30          # Show heatmap for last 30 days
 *   node index.js --path /path/to/repo
 *   node index.js --author "John"
 *   node index.js --no-color          # Disable colors
 * 
 * @author
 * @license MIT
 */

const { program } = require('commander');
const simpleGit = require('simple-git');
const chalk = require('chalk');

// =============================================================================
// Configuration
// =============================================================================

// Heat level colors (from least to most commits)
// Using RGB background colors for visibility
const HEAT_COLORS = [
  chalk.bgRgb(68, 68, 68),          // Level 0 - No commits (dark gray)
  chalk.bgRgb(0, 109, 63),           // Level 1 - Few commits (dark green)
  chalk.bgRgb(38, 166, 65),         // Level 2 - Some commits (medium green)
  chalk.bgRgb(57, 211, 83),          // Level 3 - More commits (bright green)
  chalk.bgRgb(88, 224, 109),        // Level 4 - Many commits (light green)
];

// Unicode block characters for the heatmap
const BLOCK_CHAR = '██';

// Day labels for the calendar display
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Month labels (abbreviated)
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Get the date string in "YYYY-MM-DD" format
 * @param {Date} date - The date to format
 * @returns {string} Date string in ISO format (date part only)
 */
function getDateString(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Calculate the heat level based on commit count
 * Divides commits into 5 levels: 0, 1-2, 3-5, 6-10, 10+
 * @param {number} count - Number of commits
 * @returns {number} Heat level (0-4)
 */
function getHeatLevel(count) {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

// =============================================================================
// Git Operations
// =============================================================================

/**
 * Initialize git and check if the directory is a git repository
 * @param {string} repoPath - Path to the repository
 * @returns {Promise<simpleGit>} SimpleGit instance
 * @throws {Error} If not a git repository
 */
async function initGit(repoPath) {
  const git = simpleGit(repoPath);
  
  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      throw new Error(`Not a git repository: ${repoPath}`);
    }
    return git;
  } catch (error) {
    throw new Error(`Failed to initialize git: ${error.message}`);
  }
}

/**
 * Get commit history from the git repository
 * @param {simpleGit} git - SimpleGit instance
 * @param {Object} options - Query options
 * @param {number} options.days - Number of days to look back
 * @param {string} options.author - Filter by author name
 * @returns {Promise<Array>} Array of commit objects
 */
async function getCommitHistory(git, options = {}) {
  const { days = 365, author = null } = options;
  
  // Calculate the start date
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Build git log options
  const logOptions = {
    '--since': startDate.toISOString().split('T')[0],
    '--until': endDate.toISOString().split('T')[0],
    '--date': 'short',
    '--format': '%H|%an|%ad|%s',
  };
  
  // Add author filter if specified
  if (author) {
    logOptions['--author'] = author;
  }
  
  try {
    const log = await git.log(logOptions);
    return log.all;
  } catch (error) {
    // If no commits found, return empty array
    if (error.message && error.message.includes('empty')) {
      return [];
    }
    throw error;
  }
}

/**
 * Process commits into a date-indexed map
 * @param {Array} commits - Array of commit objects
 * @returns {Object} Map of date strings to commit counts
 */
function processCommits(commits) {
  const commitMap = {};
  
  for (const commit of commits) {
    // Extract date from the commit (format: "2024-01-15" or "2024-01-15 10:30:00")
    const dateStr = commit.date.split(' ')[0];
    commitMap[dateStr] = (commitMap[dateStr] || 0) + 1;
  }
  
  return commitMap;
}

// =============================================================================
// Heatmap Generation
// =============================================================================

/**
 * Generate the heatmap data structure
 * Creates a 2D array representing weeks x days
 * @param {number} days - Number of days to display
 * @returns {Array} 2D array of date objects
 */
function generateHeatmapDates(days) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days + 1);
  
  // Align to the start of the week (Sunday)
  const startDayOfWeek = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDayOfWeek);
  
  // Calculate number of weeks needed
  const totalDaysIncludingOffset = days + startDayOfWeek;
  const weeks = Math.ceil(totalDaysIncludingOffset / 7);
  
  const dates = [];
  
  for (let week = 0; week < weeks; week++) {
    const weekDates = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (week * 7) + day);
      weekDates.push(date);
    }
    dates.push(weekDates);
  }
  
  return dates;
}

/**
 * Render a single heatmap block
 * @param {number} level - Heat level (0-4)
 * @param {boolean} colored - Whether to use colors
 * @returns {string} Rendered block
 */
function renderBlock(level, colored) {
  if (colored) {
    return HEAT_COLORS[level](BLOCK_CHAR);
  } else {
    // ASCII fallback without colors
    const chars = ['░░', '▒▒', '▓▓', '██', '◉◉'];
    return chars[level];
  }
}

/**
 * Render the month labels row
 * @param {Array} weeks - 2D array of dates
 * @returns {string} Month labels string with proper spacing
 */
function renderMonthLabels(weeks) {
  let labels = '          '; // Initial spacing for day labels area
  
  let lastMonth = -1;
  
  for (let weekIdx = 0; weekIdx < weeks.length; weekIdx++) {
    const week = weeks[weekIdx];
    // Use the middle of the week (Wednesday) for month determination
    const midWeekDate = week[3] || week[0];
    const month = midWeekDate.getMonth();
    const year = midWeekDate.getFullYear();
    
    // Only print month+year when it changes
    if (month !== lastMonth) {
      labels += MONTH_LABELS[month] + ' ' + year + '    ';
      lastMonth = month;
    } else {
      labels += '              ';
    }
  }
  
  return labels.trimEnd();
}

/**
 * Render the complete heatmap
 * @param {Array} weeks - 2D array of dates
 * @param {Object} commitMap - Map of date strings to commit counts
 * @param {boolean} colored - Whether to use colors
 * @returns {string} Complete heatmap string
 */
function renderHeatmap(weeks, commitMap, colored) {
  const lines = [];
  
  // Render month labels
  lines.push(renderMonthLabels(weeks));
  lines.push('');
  
  // Create a string representation of day labels for column alignment
  // We'll render each row of days (each day of the week)
  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    let row = '';
    
    // Add day label (only for certain rows to avoid clutter)
    if (dayOfWeek % 2 === 1) {
      row = DAY_LABELS[dayOfWeek].padEnd(10);
    } else {
      row = '          ';
    }
    
    // Add heatmap blocks for each week
    for (const week of weeks) {
      const date = week[dayOfWeek];
      const dateStr = getDateString(date);
      const commitCount = commitMap[dateStr] || 0;
      const level = getHeatLevel(commitCount);
      row += renderBlock(level, colored);
    }
    
    lines.push(row);
  }
  
  return lines.join('\n');
}

/**
 * Render the legend showing heat levels
 * @param {boolean} colored - Whether to use colors
 * @returns {string} Legend string
 */
function renderLegend(colored) {
  let legend = '\n     ';
  
  for (let level = 0; level <= 4; level++) {
    legend += renderBlock(level, colored) + ' ';
  }
  
  legend += '\n     ';
  legend += 'Less  More';
  
  return legend;
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Calculate detailed statistics
 * @param {Array} commits - Array of commits
 * @param {Object} commitMap - Map of date strings to counts
 * @param {number} days - Number of days
 * @returns {string} Formatted statistics
 */
function calculateStats(commits, commitMap, days) {
  const lines = [];
  
  // Total commits
  const totalCommits = commits.length;
  
  // Average commits per day
  const avgPerDay = totalCommits > 0 ? (totalCommits / days).toFixed(1) : '0.0';
  
  // Find most active day
  const dayCounts = {};
  for (const commit of commits) {
    const dateStr = commit.date.split(' ')[0];
    const dayOfWeek = new Date(dateStr).getDay();
    dayCounts[dayOfWeek] = (dayCounts[dayOfWeek] || 0) + 1;
  }
  
  let maxDay = 0;
  let maxCount = 0;
  for (const [day, count] of Object.entries(dayCounts)) {
    if (count > maxCount) {
      maxCount = count;
      maxDay = parseInt(day);
    }
  }
  
  // Count unique active days
  const activeDays = new Set(commits.map(c => c.date.split(' ')[0])).size;
  
  // Find longest streak and current streak
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Iterate through each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = getDateString(currentDate);
    
    if (commitMap[dateStr]) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Find current streak (from today backwards)
  currentStreak = 0;
  const today = new Date();
  const todayDate = new Date(today);
  while (todayDate >= startDate) {
    const dateStr = getDateString(todayDate);
    if (commitMap[dateStr]) {
      currentStreak++;
      todayDate.setDate(todayDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  lines.push('');
  lines.push(chalk.bold('📊 Statistics:'));
  lines.push(`   Total commits:  ${chalk.green.bold(totalCommits)}`);
  lines.push(`   Active days:   ${chalk.yellow(activeDays)}`);
  lines.push(`   Daily average: ${chalk.cyan(avgPerDay)}`);
  lines.push(`   Most active:   ${chalk.magenta(DAY_LABELS[maxDay])}s`);
  lines.push(`   Longest streak: ${chalk.blue(longestStreak)} days`);
  lines.push(`   Current streak: ${currentStreak > 0 ? chalk.green(currentStreak) : chalk.gray(0)} days`);
  lines.push('');
  
  return lines.join('\n');
}

// =============================================================================
// Main Program
// =============================================================================

/**
 * Main function to run the heatmap
 */
async function main() {
  // Set up CLI using commander
  program
    .name('git-heatmap')
    .description('Display a heatmap of Git commits in the terminal, similar to GitHub contributions')
    .version('1.0.0')
    .option('-d, --days <days>', 'Number of days to show (default: 365)', '365')
    .option('-p, --path <path>', 'Path to git repository (default: current directory)', process.cwd())
    .option('-a, --author <name>', 'Filter commits by author name')
    .option('-c, --no-color', 'Disable colored output')
    .option('-w, --weeks <weeks>', 'Show last N weeks instead of days', null)
    .parse(process.argv);
  
  const options = program.opts();
  
  // Convert string values to numbers
  let days = parseInt(options.days, 10);
  if (options.weeks) {
    days = parseInt(options.weeks, 10) * 7;
  }
  
  const repoPath = options.path;
  const useColor = options.color !== false;
  
  console.log(chalk.bold(`\n🔥 Git Heatmap`));
  console.log(`   Repository: ${chalk.gray(repoPath)}`);
  console.log(`   Period: Last ${days} days`);
  if (options.author) {
    console.log(`   Author: ${chalk.gray(options.author)}`);
  }
  console.log('');
  
  try {
    // Initialize git
    const git = await initGit(repoPath);
    
    // Get commit history
    const commits = await getCommitHistory(git, {
      days: days,
      author: options.author
    });
    
    // Process commits into a map
    const commitMap = processCommits(commits);
    
    // Generate heatmap dates
    const weeks = generateHeatmapDates(days);
    
    // Render the heatmap
    const heatmap = renderHeatmap(weeks, commitMap, useColor);
    console.log(heatmap);
    
    // Render the legend
    console.log(renderLegend(useColor));
    
    // Render statistics
    console.log(calculateStats(commits, commitMap, days));
    
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    process.exit(1);
  }
}

// Run the main function
main().catch(error => {
  console.error(chalk.red(`\n❌ Fatal error: ${error.message}`));
  process.exit(1);
});
