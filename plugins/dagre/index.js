const dagre = require('dagre');
const PluginBase = require('../base');

class DagreLayout extends PluginBase {

  init() {
    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(function() { return {}; });
    g.setGraph(this._cfgs);
    this.set('g', g);
  }

  getDefaultCfg() {
    return { rankdir: 'LR' };
  }

  getEvents() {
    return {
      afteradditems: 'layout',
      beforerender: 'preProcess'
    };
  }

  preProcess() {
    const data = this.get('graph').get('data');
    data.nodes.forEach(node => {
      node.id += '';
    });
    data.edges.forEach(edge => {
      edge.source += '';
      edge.target += '';
    });
  }

  layout() {
    const nodes = this.get('graph').get('nodes');
    const edges = this.get('graph').get('edges');
    const g = this.get('g');
    nodes.forEach(node => {
      const [ width, height ] = node.get('model').size;
      const id = node.get('id');
      g.setNode(id, { width, height });
    });
    edges.forEach(edge => {
      const model = edge.get('model');
      const { source, target } = model;
      g.setEdge(source, target);
    });
    dagre.layout(g);
    let coord;
    g.nodes().forEach((node, i) => {
      coord = g.node(node);
      nodes[i].update({ x: coord.x, y: coord.y });
    });
    g.edges().forEach((edge, i) => {
      coord = g.edge(edge);
      edges[i].update({
        startPoint: coord.points[0],
        endPoint: coord.points[coord.points.length - 1],
        controlPoints: coord.points.slice(1, coord.points.length - 1)
      });
    });
  }
}

module.exports = DagreLayout;

