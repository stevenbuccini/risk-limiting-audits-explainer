/* global d3 */
function resize() { }

function init() {
  console.log('Make something awesome!');

  const scale = 10;
  let root = d3.select("#simulation1 svg");

  let min = 50;
  let max = 61;
  let numBlue = Math.floor(Math.random() * (max - min) + min);

  let auditPercentage = 3;

  function drawGrid(numBlue) {
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
          .attr('fill', `${blueCount <= numBlue ? "blue" : "yellow"}`)
          .attr('stroke', `${indicesToAudit.includes(x * 10 + y) ? "red" : "grey"}`); // make this red if it's one of the audited squares
        // add 'stroke-width' attribute if it's audited
        blueCount++;
      }
    }

    indicesToAudit.forEach(item => {
      const x = Math.floor(item / 10);
      const y = item % 10;
      console.log(indicesToAudit, item, x, y);
      root.append('rect')
        .attr('transform', `translate(${x * scale}, ${y * scale})`)
        .attr('width', scale)
        .attr('height', scale)
        .attr('stroke', "red")
        .attr('stroke-width', "1.5");
    })
  }


  d3.select("#vote-percentage").on("input", function () {
    updateWinPercentage(+this.value);
  });
  updateWinPercentage(numBlue);
  drawGrid(numBlue);

  // update the elements
  function updateWinPercentage(newPercentage) {

    // adjust the text on the range slider
    d3.select("#vote-percentage-value").text(newPercentage);
    d3.select("#vote-percentage").property("value", newPercentage);

    // update the rircle radius
    drawGrid(newPercentage);
  }

}


export default { init, resize };
