/* global d3 */
import { concat, each, fill, random, shuffle, slice } from 'lodash';
import noUiSlider from 'nouislider';
import { removeAllListeners } from 'cluster';

function resize() { }

// const margin = { top: 20, right: 10, bottom: 20, left: 10 };
// const width = 640 - margin.left - margin.right;
// const height = 500 - margin.top - margin.bottom;

const party1Color = '#63BF67';
const party2Color = '#AF5757';
const highlightColor = '#FFE600';
const textColor = '#5d5d5d';
const bodyColor = '#7DCDD2';

function init() {
  simulation3();
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
  let numParty1 = random(min, max);

  let auditPercentage = 3;

  function drawGrid(numParty1, auditPercentage) {
    root.selectAll('*').remove();
    let party1Count = 0;
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
          .attr(
            'fill',
            `${party1Count < numParty1 ? party1Color : party2Color}`
          )
          .attr(
            'stroke',
            `${indicesToAudit.includes(x * 10 + y) ? highlightColor : 'white'}`
          ); // make this red if it's one of the audited squares
        party1Count++;
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
        .attr('fill', `${x * 10 + y <= numParty1 ? party1Color : party2Color}`)
        .attr('stroke', highlightColor)
        .attr('stroke-width', '1.5');
    });
  }

  // update the elements
  function updateWinPercentage(newPercentage) {
    // adjust the text on the range slider
    d3.select('#vote-percentage-value').text(newPercentage);
    d3.select('#vote-percentage').property('value', newPercentage);
    numParty1 = newPercentage;

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
    drawGrid(numParty1, newPercentage);
  }

  d3.select('#vote-percentage').on('input', function () {
    updateWinPercentage(+this.value);
  });
  updateWinPercentage(numParty1);

  d3.select('#audit-percentage').on('input', function () {
    updateAuditPercentage(+this.value);
  });
  updateAuditPercentage(auditPercentage);

  drawGrid(numParty1, auditPercentage);
}

function simulation2() {
  const scale = 10;
  const min = 50;
  const max = 62;
  // Thus average count will be 14 if blue wins with 80%
  const numParty1 = 80; // random(min, max);
  let votes = concat(
    fill(Array(numParty1), party1Color),
    fill(Array(100 - numParty1), party2Color)
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
        .attr('transform', `translate(${y * scale + scale / 2}, ${scale / 2})`)
        .attr('width', scale)
        .attr('height', scale)
        .attr('fill', precinctTallies[x].votes[y])
        .attr('stroke', 'white'); // make this red if it's one of the audited squares
    }
  }

  // do the auditing!
  // assumes risk limit is 10%
  let total = 1;
  const tolerance = 1; // generally, this is ignored in the simple calculations, this is equivalent to 1%
  // Will not work correctly if it is a tie
  const winner = numParty1 > 50 ? party1Color : party2Color;
  // To write the number of times it's been audited
  const runningTotal = [];
  while (total < 9.9) {
    if (total < 0.011) {
      alert('manal recount required');
      break;
    }
    const index = random(0, 100);
    const vote = votes[index];
    if (vote === winner) {
      total *= (numParty1 - tolerance) / 50;
    } else {
      total *= (100 - (numParty1 - tolerance)) / 50;
    }

    runningTotal.push({ auditedVoteIndex: index, color: vote, total });
  }

  const slider = document.getElementById('simulation2-stepper');

  function filterPips(value, type) {
    return 1;
  }

  if (slider.noUiSlider === undefined) {
    noUiSlider.create(slider, {
      pips: {
        mode: 'steps',
        density: -1,
        filter: filterPips,
      },
      range: {
        min: [0],
        max: [runningTotal.length],
      },
      start: 0,
      step: 1,
    });
    slider.noUiSlider.on('slide', () => {
      renderUpToStep(Math.floor(slider.noUiSlider.get()));
    });
  }


  // Try to use this when finished: https://bl.ocks.org/gordlea/27370d1eea8464b04538e6d8ced39e89
  const n = runningTotal.length;
  const margin = { top: 50, right: 50, bottom: 50, left: 50 };

  const width =
    document.getElementById('running-total-container').offsetWidth -
    margin.left -
    margin.right; // Use the window's width
  const height = window.innerHeight - document.getElementById('simulation2-container').clientHeight - document.getElementById('slider-container').clientHeight - 200;


  const xScale = d3
    .scaleLinear()
    .domain([1, n]) // input
    .range([0, width]); // output

  const yScale = d3
    .scaleLinear()
    .domain([0, 12]) // input
    .range([height, 0]); // output

  const line = d3
    .line()
    .x(function (d, i) {
      return xScale(i + 1);
    }) // set the x values for the line generator
    .y(function (d) {
      return yScale(d.y);
    }) // set the y values for the line generator
    .curve(d3.curveMonotoneX); // apply smoothing to the line

  const dataset = d3.range(runningTotal.length).map(function (d) {
    return { color: runningTotal[d].color, y: runningTotal[d].total };
  });


  d3.select('#running-total-container > svg').remove();
  const svg = d3
    .select('#running-total-container')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat(d3.format('d'))
        .ticks(dataset.length - 1)
      // .tickSubdivide(0)
    );

  svg
    .append('text')
    .attr('x', `${width / 2}`)
    .attr('y', `${height + 50}`)
    .style('text-anchor', 'middle')
    .text('Number of ballots audited');

  svg
    .append('g')
    .attr('class', 'y axis')
    .call(d3.axisLeft(yScale));

  svg
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', `${0 - height / 2}`)
    .style('text-anchor', 'middle')
    .attr('dy', '-1.5em')
    .text('Score');

  // Add threshold
  // https://codepen.io/dannyhc/pen/WQdmwa
  svg
    .append('g')
    .attr('transform', `translate(0, ${yScale(9.9)})`)
    .append('line')
    .attr('x2', width)
    .style('stroke', bodyColor)
    .style('stroke-width', '5px')
    .text('threshold');

  // svg
  //   .append('g')
  //   .attr('transform', `translate(0, ${yScale(0.011)})`)
  //   .append('line')
  //   .attr('x2', width)
  //   .style('stroke', highlightColor)
  //   .style('stroke-width', '1px')
  //   .text('threshold');

  let path;
  function renderUpToStep(idx) {
    // clear previous line segments and circles
    if (path) path.remove();
    d3.selectAll('.dot').remove();
    d3.selectAll('.audited').remove();

    for (let i = 0; i < idx; i++) {
      const vote = runningTotal[i];
      const root = d3.select(
        `#precinct${Math.floor(vote.auditedVoteIndex / 10) + 1}`
      );
      root
        .append('rect')
        .attr(
          'transform',
          `translate(${(vote.auditedVoteIndex % 10) * scale +
          scale / 2}, ${scale / 2})`
        )
        .attr('class', 'audited')
        .attr('width', scale)
        .attr('height', scale)
        .attr('fill', vote.color)
        .attr('stroke', highlightColor)
        .attr('stroke-width', '4');
    }

    const manipulatedData = {};
    each(slice(dataset, 0, idx), (val, idx) => {
      manipulatedData[idx] = val;
    });


    path = svg
      .append('path')
      .datum(slice(dataset, 0, idx)) // 10. Binds data to the line
      .attr('class', 'line') // Assign a class for styling
      .attr('d', line) // 11. Calls the line generator
      .attr('color', textColor);

    svg
      .selectAll('.dot')
      .data(slice(dataset, 0, idx))
      .enter()
      .append('circle') // Uses the enter().append() method
      .attr('class', 'dot') // Assign a class for styling
      .attr('cx', function (d, i) {
        return xScale(i + 1);
      })
      .attr('cy', function (d) {
        return yScale(d.y);
      })
      .attr('r', 10)
      .attr('fill', function (d) {
        return d.color;
      });
  }
}

function simulation3() {
  const ballotNumSlider = document.getElementById('ballots-cast-slider');

  noUiSlider.create(ballotNumSlider, {
    pips: {
      mode: 'range',
      density: 0,
    },

    range: {
      // Starting at 500, step the value by 500,
      // until 4000 is reached. From there, step by 1000.
      min: [100],
      '10%': [10000, 1000],
      '50%': [100000, 100000],
      max: [14000000],
    },
    start: [100],
  });

  function filterPips2(value, type) {
    if (value % 10 === 0 || value === 1) {
      return 1;
    }
    return 0;
  }

  function filterPips3(value, type) {
    if (value % 10 === 0) {
      return 1;
    }
    if (value % 5 === 0) {
      return 2;
    }
    return 0;
  }

  ballotNumSlider.noUiSlider.on('set', () => {
    document.getElementById('ballots-cast-num').textContent = Math.floor(
      ballotNumSlider.noUiSlider.get()
    ).toString();
    updateAuditTotals();
  });

  const marginVictorySlider = document.getElementById('margin-of-victory');

  noUiSlider.create(marginVictorySlider, {
    pips: {
      mode: 'steps',
      density: 0,
      filter: filterPips2,
    },

    range: {
      min: [1],
      max: [50],
    },
    start: [9],
    step: 1,
  });

  marginVictorySlider.noUiSlider.on('set', () => {
    document.getElementById('margin-victory-num').textContent = `${Math.floor(
      marginVictorySlider.noUiSlider.get()
    ).toString()}%`;
    updateAuditTotals();
  });

  const traditionalAuditSlider = document.getElementById(
    'traditional-audit-percent'
  );

  noUiSlider.create(traditionalAuditSlider, {
    pips: {
      mode: 'steps',
      density: 0,
      filter: filterPips3,
    },

    range: {
      min: [0],
      max: [100],
    },
    start: [3],
  });

  traditionalAuditSlider.noUiSlider.on('set', () => {
    document.getElementById('audit-percent-num').textContent = `${Math.floor(
      traditionalAuditSlider.noUiSlider.get()
    ).toString()}%`;

    updateAuditTotals();
  });

  function updateAuditTotals() {
    const numBallots = Math.floor(ballotNumSlider.noUiSlider.get());

    // Traditional calculations
    const auditPercentage = Math.floor(traditionalAuditSlider.noUiSlider.get());
    document.getElementById('traditional-number').textContent = Math.ceil(
      numBallots * (auditPercentage / 100)
    ).toString();

    // RLA calculations
    const marginVictory = Math.floor(marginVictorySlider.noUiSlider.get());

    let votes = concat(
      fill(Array(Math.round(numBallots * (marginVictory / 100))), 'winner'),
      fill(Array(Math.round(numBallots * (1 - marginVictory / 100))), 'loser')
    );

    // shufftle votes up
    votes = shuffle(votes);

    let total = 1;
    const tolerance = 1; // generally, this is ignored in the simple calculations, this is equivalent to 1%
    let count = 0;
    while (total < 9.9) {
      if (total < 0.011) {
        document.getElementById('rla-number').textContent =
          'Full recount required!';
        break;
      }
      const index = random(0, numBallots);
      const vote = votes[index];
      if (vote === 'winner') {
        total *= (marginVictory - tolerance) / 50;
      } else {
        total *= (100 - (marginVictory - tolerance)) / 50;
      }

      count += 1;
    }

    document.getElementById('rla-number').textContent = count.toString();
  }
}
export default { init, resize, simulation1, simulation2 };
