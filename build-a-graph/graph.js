 const nodes = [];
 const links = [];
 let mouse = null;

 const mindistance = 30;
 let inrange = ({x: sx, y: sy}, {x: tx, y: ty}) => Math.hypot(sx-tx, sy-ty) <= mindistance;

 const svg = d3.select("svg")
   .property("value", {nodes: [], links: []})
   .attr("cursor", "crosshair")
   .on("mouseleave", mouseleft)
   .on("mousemove", mousemoved)
   .on("click", clicked),
 width = +svg.attr("width"),
 height = +svg.attr("height");

 const simulation = d3.forceSimulation(nodes)
   .force("charge", d3.forceManyBody().strength(-60))
   .force("link", d3.forceLink(links))
   .force("x", d3.forceX())
   .force("y", d3.forceY())
   .on("tick", ticked);

 const dragger = d3.drag(simulation)
   .on("start.mouse", mouseleft)
   .on("end.mouse", mousemoved);

 let link = svg.append("g")
   .attr("class", "links")
   .selectAll("line");

 let mouselink = svg.append("g")
   .attr("stroke", "red")
   .selectAll("line");

 let node = svg.append("g")
   .attr("class", "nodes")
   .selectAll("circle");

 const cursor = svg.append("circle")
   .attr("display", "none")
   .attr("fill", "none")
   .attr("stroke", "red")
   .attr("r", mindistance - 5);

 function ticked() {
   node
     .attr("cx", d => d.x)
     .attr("cy", d => d.y);

   link
     .attr("x1", d => d.source.x)
     .attr("y1", d => d.source.y)
     .attr("x2", d => d.target.x)
     .attr("y2", d => d.target.y);

   mouselink = mouselink
     .data(mouse ? nodes.filter(node => inrange(mouse, node)) : [])
     .join("line")
       .attr("x1", mouse && mouse.x)
       .attr("y1", mouse && mouse.y)
       .attr("x2", d => d.x)
       .attr("y2", d => d.y);

   cursor
     .attr("display", mouse ? null : "none")
     .attr("cx", mouse && mouse.x)
     .attr("cy", mouse && mouse.y)
 }

 function mouseleft() {
   mouse = null;
 }

 function mousemoved() {
   const [x, y] = d3.mouse(this);
   mouse = {x, y};
   simulation.alpha(0.3).restart();
 }

 function clicked() {
   mousemoved.call(this);
   spawn({x: mouse.x, y: mouse.y});
 }

 function spawn(source) {
   nodes.push(source)

   for (const target of nodes) {
     if (inrange(source, target)) {
       links.push({source, target});
     }
   }

   link = link
     .data(links)
     .join("line");

   node = node
     .data(nodes)
     .join(
       enter => enter.append("circle").attr("r", 0)
         .call(enter => enter.transition().attr("r", 5))
         .call(dragger),
       update => update,
       exit => exit.remove()
     );

   simulation.nodes(nodes);
   simulation.force("link").links(links);
   simulation.alpha(1).restart();

   svg.property("value", {
     nodes: nodes.map(d => ({id: d.index})),
     links: links.map(d => ({source: d.source.index, target: d.target.index}))
   });

   svg.dispatch("input");
 }

 spawn({x: 0, y: 0});

