/* global d3 */
function resize() { }

function init() {
  console.log('Make something awesome!');

  const scale = 10;
  let root = d3.select("#simulation1 svg");

  let min = 50;
  let max = 61;
  let numBlue = Math.floor(Math.random() * (max - min) + min);

  function drawGrid(numBlue) {
    let blueCount = 0;
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        root.append('rect')
          .attr('transform', `translate(${x * scale}, ${y * scale})`)
          .attr('width', scale)
          .attr('height', scale)
          .attr('fill', `${ blueCount <= numBlue ? "blue" : "yellow"}`)
          .attr('stroke', "gray"); // make this red if it's one of the audited squares
          // add 'stroke-width' attribute if it's audited
          blueCount++;
      }
    }
  }
  

  d3.select("#vote-percentage").on("input", function() {
    update(+this.value);
  });
  update(numBlue);
  drawGrid(numBlue);

  // update the elements
  function update(newPercentage) {

    // adjust the text on the range slider
    d3.select("#vote-percentage-value").text(newPercentage);
    d3.select("#vote-percentage").property("value", newPercentage);

    // update the rircle radius
    drawGrid(newPercentage);
  }

}


export default { init, resize };
