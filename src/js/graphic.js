/* global d3 */
import { concat, fill, random, shuffle, slice } from 'lodash';
import noUiSlider from 'nouislider';

function resize() {}

const margin = { top: 20, right: 10, bottom: 20, left: 10 };
const width = 640 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

function init() {
  simulation1();
  simulation2();
}

function simulation1() {
  const scale = 10;
  const root = d3.select('#simulation1 svg');
  // .attr("width", width + margin.left + margin.right)
  // .attr("height", height + margin.top + margin.bottom)
  // .append("g")
  // .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const min = 50;
  const max = 62;
  let numBlue = random(min, max);

  let auditPercentage = 3;

  function drawGrid(numBlue, auditPercentage) {
    let blueCount = 0;
    const indicesToAudit = [];
    while (indicesToAudit.length < auditPercentage) {
      const r = Math.floor(Math.random() * 100) + 1;
      if (indicesToAudit.indexOf(r) === -1) indicesToAudit.push(r);
    }
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        root
          .append('rect')
          .attr('transform', `translate(${x * scale}, ${y * scale})`)
          .attr('width', scale)
          .attr('height', scale)
          .attr('fill', `${blueCount < numBlue ? 'blue' : 'yellow'}`)
          .attr(
            'stroke',
            `${indicesToAudit.includes(x * 10 + y) ? 'red' : 'grey'}`
          ); // make this red if it's one of the audited squares
        blueCount++;
      }
    }

    indicesToAudit.forEach(item => {
      const x = Math.floor(item / 10);
      const y = item % 10;
      root
        .append('rect')
        .attr('transform', `translate(${x * scale}, ${y * scale})`)
        .attr('width', scale)
        .attr('height', scale)
        .attr('fill', `${x * 10 + y <= numBlue ? 'blue' : 'yellow'}`)
        .attr('stroke', 'red')
        .attr('stroke-width', '1.5');
    });
  }

  // update the elements
  function updateWinPercentage(newPercentage) {
    // adjust the text on the range slider
    d3.select('#vote-percentage-value').text(newPercentage);
    d3.select('#vote-percentage').property('value', newPercentage);
    numBlue = newPercentage;

    // update the rircle radius
    drawGrid(newPercentage, auditPercentage);
  }

  // update the elements
  function updateAuditPercentage(newPercentage) {
    // adjust the text on the range slider
    d3.select('#audit-percentage-value').text(newPercentage);
    d3.select('#audit-percentage').property('value', newPercentage);
    auditPercentage = newPercentage;
    // update the rircle radius
    drawGrid(numBlue, newPercentage);
  }

  d3.select('#vote-percentage').on('input', function() {
    updateWinPercentage(+this.value);
  });
  updateWinPercentage(numBlue);

  d3.select('#audit-percentage').on('input', function() {
    updateAuditPercentage(+this.value);
  });
  updateAuditPercentage(auditPercentage);

  drawGrid(numBlue, auditPercentage);
}

function simulation2() {
  const scale = 10;
  const min = 50;
  const max = 62;
  // Thus average count will be 14 if blue wins with 80%
  const numBlue = 80; // random(min, max);
  let votes = concat(
    fill(Array(numBlue), 'blue'),
    fill(Array(100 - numBlue), 'yellow')
  );

  // shufftle votes up
  votes = shuffle(votes);
  const precinctTallies = [];
  for (let x = 0; x < 10; x++) {
    const precinct = { name: `Precinct ${x + 1}` };
    precinct.votes = slice(votes, x * 10, x * 10 + 10);
    precinctTallies.push(precinct);
  }

  for (let x = 0; x < 10; x++) {
    const root = d3.select(`#precinct${x + 1}`);
    for (let y = 0; y < 10; y++) {
      root
        .append('rect')
        .attr('transform', `translate(${y * scale}, 0)`)
        .attr('width', scale)
        .attr('height', scale)
        .attr('fill', precinctTallies[x].votes[y])
        .attr('stroke', 'grey'); // make this red if it's one of the audited squares
    }
  }

  // do the auditing!
  // assumes risk limit is 10%
  let total = 1;
  const tolerance = 1; // generally, this is ignored in the simple calculations, this is equivalent to 1%
  // Will not work correctly if it is a tie
  const winner = numBlue > 50 ? 'blue' : 'yellow';
  // To write the number of times it's been audited
  const runningTotal = [];
  while (total < 9.9) {
    if (total < 0.011) {
      console.log('manal recount required');
      break;
    }
    const index = random(0, 101);
    const vote = votes[index];
    if (vote === winner) {
      total *= (numBlue - tolerance) / 50;
    } else {
      total *= (100 - (numBlue - tolerance)) / 50;
    }

    runningTotal.push({ auditedVoteIndex: index, color: vote, total });
  }

  // Try to use this when finished: https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89
  const n = runningTotal.length;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };
  const width = window.innerWidth - margin.left - margin.right; // Use the window's width
  const height = 500 - margin.top - margin.bottom; // Use the window's height

  const xScale = d3
    .scaleLinear()
    .domain([0, n - 1]) // input
    .range([0, width]); // output

  const yScale = d3
    .scaleLinear()
    .domain([0, 12]) // input
    .range([height, 0]); // output

  const line = d3
    .line()
    .x(function(d, i) {
      return xScale(i);
    }) // set the x values for the line generator
    .y(function(d) {
      return yScale(d.y);
    }) // set the y values for the line generator
    .curve(d3.curveMonotoneX); // apply smoothing to the line

  const dataset = d3.range(runningTotal.length).map(function(d) {
    return { color: runningTotal[d].color, y: runningTotal[d].total };
  });

  const slider = document.getElementById('simulation2-stepper');

  noUiSlider.create(slider, {
    pips: {
      mode: 'values',
      values: d3.range(runningTotal.length + 1),
      density: 0,
    },
    range: {
      min: [0],
      max: [runningTotal.length],
    },
    start: [0],
    step: 1,
  });

  slider.noUiSlider.on('set', () => {
    renderUpToStep(Math.floor(slider.noUiSlider.get()));
  });

  let path;
  function renderUpToStep(idx) {
    // clear previous line segments and circles
    if (path) path.remove();
    d3.selectAll('.dot').remove();

    for (let i = 0; i < idx; i++) {
      const vote = runningTotal[i];
      const root = d3.select(
        `#precinct${Math.floor(vote.auditedVoteIndex / 10)}`
      );
      root
        .append('rect')
        .attr(
          'transform',
          `translate(${(vote.auditedVoteIndex % 10) * scale}, 0)`
        )
        .attr('width', scale)
        .attr('height', scale)
        .attr('fill', vote.color)
        .attr('stroke', 'chartreuse');
    }
    path = svg
      .append('path')
      .datum(slice(dataset, 0, idx)) // 10. Binds data to the line
      .attr('class', 'line') // Assign a class for styling
      .attr('d', line); // 11. Calls the line generator
    svg
      .selectAll('.dot')
      .data(slice(dataset, 0, idx))
      .enter()
      .append('circle') // Uses the enter().append() method
      .attr('class', 'dot') // Assign a class for styling
      .attr('cx', function(d, i) {
        return xScale(i);
      })
      .attr('cy', function(d) {
        return yScale(d.y);
      })
      .attr('r', 5)
      .attr('fill', function(d) {
        return d.color;
      });
  }

  const svg = d3
    .select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  svg
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(yScale));

  // Add threshold
  // https://codepen.io/dannyhc/pen/WQdmwa
  svg
    .append('g')
    .attr('transform', `translate(0, ${yScale(9.9)})`)
    .append('line')
    .attr('x2', width)
    .style('stroke', '#2ecc71')
    .style('stroke-width', '5px')
    .text('threshold');

  // svg
  //   .selectAll('.dot')
  //   .data(dataset)
  //   .enter()
  //   .append('circle') // Uses the enter().append() method
  //   .attr('class', 'dot') // Assign a class for styling
  //   .attr('cx', function(d, i) {
  //     return xScale(i);
  //   })
  //   .attr('cy', function(d) {
  //     return yScale(d.y);
  //   })
  //   .attr('r', 5)
  //   .attr('fill', function(d) {
  //     return d.color;
  //   });

  // // Add threshold
  // // https://codepen.io/dannyhc/pen/WQdmwa
  // svg
  //   .append('g')
  //   .attr('transform', `translate(0, ${yScale(9.9)})`)
  //   .append('line')
  //   .attr('x2', width)
  //   .style('stroke', '#2ecc71')
  //   .style('stroke-width', '5px')
  //   .text('threshold');
}

export default { init, resize };
