// import './style.css'
// import typescriptLogo from './typescript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.ts'
import * as joint from "@joint/core";
import { DirectedGraph } from "@joint/layout-directed-graph";
import { inhaler } from "./inhaler";

const talkTopics = await inhaler();
console.log(`we have ${talkTopics.length} talk topics`);

const edges: Record<string, Set<string> | null> = {};

for (const topic of talkTopics) {
  const foo = new Set(topic.responses.map((response) => response.topic));
  console.log("topic has " + foo.size + " responses");
  edges[topic.id] = foo;
  for (const edge of foo) {
    if (edges[edge] === undefined) edges[edge] = null;
  }
}
console.log("We have " + Object.keys(edges).length + " nodes");

const namespace = joint.shapes;

const graph = new joint.dia.Graph({}, { cellNamespace: namespace });

const paper = new joint.dia.Paper({
  el: document.querySelector<HTMLDivElement>("#app"),
  model: graph,
  width: "100%",
  height: "100%",
  gridSize: 1,
  cellViewNamespace: namespace,
  defaultRouter: { name: "manhattan", args: { step: 10, padding: 10 } },
  defaultConnector: {
    name: "jumpover",
    args: { jump: "gap", size: 5 },
  },
});

const graphNodes: Record<string, joint.shapes.standard.HeaderedRectangle> = {};
for (const id of Object.keys(edges)) {
  const rect = new joint.shapes.standard.HeaderedRectangle({
    size: { height: 100, width: 150 },
  });
  rect.attr("header/fill", "lightgray");
  rect.attr("headerText/text", id);
  rect.attr(
    "bodyText/text",
    talkTopics
      .find((item) => item.id === id)
      ?.dynamic_line.replace(/(?![^\n]{1,32}$)([^\n]{1,32})\s/g, "$1\n")
  );
  rect.addTo(graph);
  graphNodes[id] = rect;
}

for (const [source, connections] of Object.entries(edges)) {
  for (const target of connections ?? []) {
    console.log(source + "->" + target);
    const link = new joint.shapes.standard.Link();
    link.source(graphNodes[source]);
    link.target(graphNodes[target]);
    link.addTo(graph);
  }
}

DirectedGraph.layout(graph.getCells(), {
  setVertices: true,
  ranker: "tight-tree",
  setLinkVertices: true,
});

paper.fitToContent();
