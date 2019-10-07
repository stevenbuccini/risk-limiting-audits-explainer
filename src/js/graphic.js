/* global d3 */
import { concat, fill, shuffle, slice } from 'lodash';
function resize() { }

function init() {
  simulation1();
  simulation2();
}



function simulation1() {
  const scale = 10;
  let root = d3.select("#simulation1 svg");

  let min = 50;
  let max = 61;
  let numBlue = Math.floor(Math.random() * (max - min) + min);

  let auditPercentage = 3;

  function drawGrid(numBlue, auditPercentage) {
    let blueCount = 0;
    let indicesToAudit = [];
    while (indicesToAudit.length < auditPercentage) {
      var r = Math.floor(Math.random() * 100) + 1;
      if (indicesToAudit.indexOf(r) === -1) indicesToAudit.push(r);
    }
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        root.append('rect')
          .attr('transform', `translate(${x * scale}, ${y * scale})`)
          .attr('width', scale)
          .attr('height', scale)
          .attr('fill', `${blueCount < numBlue ? "blue" : "yellow"}`)
          .attr('stroke', `${indicesToAudit.includes(x * 10 + y) ? "red" : "grey"}`); // make this red if it's one of the audited squares
        blueCount++;
      }
    }

    indicesToAudit.forEach(item => {
      const x = Math.floor(item / 10);
      const y = item % 10;
      root.append('rect')
        .attr('transform', `translate(${x * scale}, ${y * scale})`)
        .attr('width', scale)
        .attr('height', scale)
        .attr('fill', `${x * 10 + y <= numBlue ? "blue" : "yellow"}`)
        .attr('stroke', "red")
        .attr('stroke-width', "1.5");
    })
  }

  // update the elements
  function updateWinPercentage(newPercentage) {

    // adjust the text on the range slider
    d3.select("#vote-percentage-value").text(newPercentage);
    d3.select("#vote-percentage").property("value", newPercentage);
    numBlue = newPercentage;

    // update the rircle radius
    drawGrid(newPercentage, auditPercentage);
  }



  // update the elements
  function updateAuditPercentage(newPercentage) {

    // adjust the text on the range slider
    d3.select("#audit-percentage-value").text(newPercentage);
    d3.select("#audit-percentage").property("value", newPercentage);
    auditPercentage = newPercentage;
    // update the rircle radius
    drawGrid(numBlue, newPercentage);
  }

  d3.select("#vote-percentage").on("input", function () {
    updateWinPercentage(+this.value);
  });
  updateWinPercentage(numBlue);

  d3.select("#audit-percentage").on("input", function () {
    updateAuditPercentage(+this.value);
  });
  updateAuditPercentage(auditPercentage);

  drawGrid(numBlue, auditPercentage);

}


function simulation2() {

  const scale = 10;
  let root = d3.select("#simulation2 svg");
  let min = 50;
  let max = 61;
  let numBlue = Math.floor(Math.random() * (max - min) + min);
  let votes = concat(fill(Array(numBlue), 'blue'), fill(Array(100 - numBlue), 'yellow'));

  // shufftle votes up
  votes = shuffle(votes)
  console.log(votes);
  let precinctTallies = []
  for (let x = 0; x < 10; x++) {
    let precinct = { name: `Precinct ${x + 1}` }
    precinct['votes'] = slice(votes, x * 10, (x * 10) + 10)
    precinctTallies.push(precinct);
  }

  console.log(precinctTallies);

  // for (let x = 0; x < 10; x++) {
  //   for (let y = 0; y < 10; y++) {
  //     root.append('rect')
  //       .attr('transform', `translate(${x * scale}, ${y * scale})`)
  //       .attr('width', scale)
  //       .attr('height', scale)
  //       .attr('fill', `${blueCount < numBlue ? "blue" : "yellow"}`)
  //       .attr('stroke', "grey");
  //     blueCount++;
  //   }
  // }


  // If we've picked a squarea already, add text to it and middle it


  // function doStep() {

  // }


  // function runUntilCompletion {
  //   // if not stop...
  // }

}


export default { init, resize };
