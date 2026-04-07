import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { motion } from 'motion/react';
import { Download, Share2, Maximize2 } from 'lucide-react';

interface FlowStep {
  step: string;
  desc: string;
}

interface FlowChartProps {
  data: FlowStep[];
}

export default function FlowChart({ data }: FlowChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || !data.length || !svgRef.current || !containerRef.current) return;

    const updateDimensions = () => {
      if (!containerRef.current || !svgRef.current) return;
      const width = containerRef.current.clientWidth;
      const nodeHeight = 100;
      const nodeWidth = Math.min(280, width - 60);
      const verticalGap = 60;
      const height = data.length * (nodeHeight + verticalGap) + 100;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // Define Gradients
      const defs = svg.append("defs");
      
      const gradient = defs.append("linearGradient")
        .attr("id", "node-gradient")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      gradient.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1");
      gradient.append("stop").attr("offset", "100%").attr("stop-color", "#8b5cf6");

      const shadow = defs.append("filter")
        .attr("id", "drop-shadow")
        .attr("height", "130%");
      shadow.append("feGaussianBlur")
        .attr("in", "SourceAlpha")
        .attr("stdDeviation", 3)
        .attr("result", "blur");
      shadow.append("feOffset")
        .attr("in", "blur")
        .attr("dx", 2)
        .attr("dy", 4)
        .attr("result", "offsetBlur");
      const feMerge = shadow.append("feMerge");
      feMerge.append("feMergeNode").attr("in", "offsetBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      const g = svg.append("g")
        .attr("transform", `translate(${width / 2 - nodeWidth / 2}, 50)`);

      // Draw nodes
      data.forEach((d, i) => {
        const y = i * (nodeHeight + verticalGap);
        
        const node = g.append("g")
          .attr("transform", `translate(0, ${y})`)
          .style("cursor", "pointer");

        // Node box with shadow
        node.append("rect")
          .attr("width", nodeWidth)
          .attr("height", nodeHeight)
          .attr("rx", 24)
          .attr("fill", "rgba(30, 41, 59, 0.7)")
          .attr("stroke", "rgba(99, 102, 241, 0.3)")
          .attr("stroke-width", 2)
          .attr("filter", "url(#drop-shadow)");

        // Accent line
        node.append("path")
          .attr("d", `M 0 24 Q 0 0 24 0 L ${nodeWidth / 4} 0 L ${nodeWidth / 4} 4 L 24 4 Q 4 4 4 24 Z`)
          .attr("fill", "url(#node-gradient)");

        // Step number badge
        const badge = node.append("g")
          .attr("transform", `translate(${nodeWidth - 40}, 20)`);
        
        badge.append("circle")
          .attr("r", 15)
          .attr("fill", "url(#node-gradient)");

        badge.append("text")
          .attr("text-anchor", "middle")
          .attr("dy", "0.35em")
          .attr("fill", "#fff")
          .attr("font-weight", "900")
          .attr("font-size", "12px")
          .text(i + 1);

        // Step title
        node.append("text")
          .attr("x", 24)
          .attr("y", 40)
          .attr("fill", "#fff")
          .attr("font-weight", "900")
          .attr("font-size", "16px")
          .text(d.step.length > 22 ? d.step.substring(0, 19) + "..." : d.step);

        // Description (wrapped)
        const descText = node.append("text")
          .attr("x", 24)
          .attr("y", 65)
          .attr("fill", "rgba(255,255,255,0.6)")
          .attr("font-size", "12px")
          .attr("width", nodeWidth - 48);

        const words = d.desc.split(/\s+/);
        let line: string[] = [];
        let lineCount = 0;
        const lineHeight = 16;
        
        words.forEach(word => {
          line.push(word);
          if (line.join(" ").length > 35 && lineCount < 1) {
            descText.append("tspan")
              .attr("x", 24)
              .attr("dy", lineCount === 0 ? 0 : lineHeight)
              .text(line.join(" "));
            line = [];
            lineCount++;
          }
        });
        if (line.length > 0 && lineCount < 2) {
          descText.append("tspan")
            .attr("x", 24)
            .attr("dy", lineCount === 0 ? 0 : lineHeight)
            .text(line.join(" "));
        }

        // Connector line
        if (i < data.length - 1) {
          const connector = g.append("g");
          
          connector.append("line")
            .attr("x1", nodeWidth / 2)
            .attr("y1", y + nodeHeight)
            .attr("x2", nodeWidth / 2)
            .attr("y2", y + nodeHeight + verticalGap)
            .attr("stroke", "rgba(99, 102, 241, 0.4)")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "8,4");
          
          connector.append("path")
            .attr("d", `M ${nodeWidth / 2 - 8} ${y + nodeHeight + verticalGap - 12} L ${nodeWidth / 2} ${y + nodeHeight + verticalGap} L ${nodeWidth / 2 + 8} ${y + nodeHeight + verticalGap - 12}`)
            .attr("fill", "none")
            .attr("stroke", "#6366f1")
            .attr("stroke-width", 3)
            .attr("stroke-linecap", "round");
        }
      });

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
          <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30">
            <Share2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Visual Process Map</h3>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Step-by-step logic flow</p>
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
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-indigo-500/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-purple-500/30 rounded-full blur-[100px]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
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
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Generated by AI Tutor</div>
          <div className="text-[8px] font-bold text-white/10 uppercase tracking-widest">© 2026 Magical Learning Journey</div>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-4 bg-indigo-500/20 rounded-full" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
