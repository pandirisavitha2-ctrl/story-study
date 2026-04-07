import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Download, Share2, Maximize2, Brain } from 'lucide-react';

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

interface MindMapProps {
  data: MindMapNode;
}

export default function MindMap({ data }: MindMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current || !svgRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = 600;
      const margin = { top: 40, right: 160, bottom: 40, left: 160 };

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Define Gradients and Filters
      const defs = svg.append("defs");
      
      const nodeGradient = defs.append("radialGradient")
        .attr("id", "node-glow")
        .attr("cx", "50%").attr("cy", "50%")
        .attr("r", "50%");
      nodeGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(99, 102, 241, 0.4)");
      nodeGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(99, 102, 241, 0)");

      const leafGradient = defs.append("radialGradient")
        .attr("id", "leaf-glow")
        .attr("cx", "50%").attr("cy", "50%")
        .attr("r", "50%");
      leafGradient.append("stop").attr("offset", "0%").attr("stop-color", "rgba(251, 191, 36, 0.4)");
      leafGradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(251, 191, 36, 0)");

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      const tree = d3.tree<MindMapNode>().size([height - margin.top - margin.bottom, width - margin.left - margin.right]);

      const root = d3.hierarchy(data);
      tree(root);

      // Links with organic curves
      g.selectAll(".link")
        .data(root.links())
        .enter().append("path")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "rgba(99, 102, 241, 0.2)")
        .attr("stroke-width", d => Math.max(1, 4 - d.source.depth))
        .attr("stroke-linecap", "round")
        .attr("d", d3.linkHorizontal<any, any>()
          .x(d => d.y)
          .y(d => d.x) as any);

      // Nodes
      const node = g.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", d => "node" + (d.children ? " node--internal" : " node--leaf"))
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .style("cursor", "pointer");

      // Glow effect
      node.append("circle")
        .attr("r", d => d.children ? 20 : 15)
        .attr("fill", d => d.children ? "url(#node-glow)" : "url(#leaf-glow)");

      // Core circle
      node.append("circle")
        .attr("r", d => d.children ? 8 : 5)
        .attr("fill", d => d.children ? "#6366f1" : "#fbbf24")
        .attr("stroke", "rgba(255,255,255,0.2)")
        .attr("stroke-width", 2);

      // Text with better styling
      const text = node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -15 : 15)
        .attr("text-anchor", d => d.children ? "end" : "start")
        .attr("fill", "#fff")
        .attr("font-weight", d => d.depth === 0 ? "900" : "bold")
        .attr("font-size", d => d.depth === 0 ? "16px" : "12px")
        .style("text-shadow", "0 4px 12px rgba(0,0,0,0.8)")
        .text(d => d.data.name);

      // Add zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 2])
        .on("zoom", (event) => {
          g.attr("transform", event.transform);
        });

      svg.call(zoom as any);
    };

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(containerRef.current);
    updateDimensions();

    return () => observer.disconnect();
  }, [data]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative w-full bg-slate-900/50 rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl"
    >
      {/* Poster Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-slate-900/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Concept Mind Map</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Hierarchical Knowledge Tree</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '48px 48px' }} />
      </div>

      <div ref={containerRef} className="w-full h-[600px] relative z-10">
        <svg
          ref={svgRef}
          className="w-full h-full cursor-move"
        />
      </div>

      {/* Poster Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-900/80 to-transparent flex justify-between items-end pointer-events-none">
        <div className="space-y-1">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Visualized by AI Tutor</div>
          <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Interactive Knowledge Graph</div>
        </div>
        <div className="flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-8 h-1 bg-amber-500/20 rounded-full" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
