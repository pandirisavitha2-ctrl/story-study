import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RoadmapNode {
  day: string;
  topic: string;
  objective: string;
}

interface RoadmapFlowProps {
  data: RoadmapNode[];
}

export default function RoadmapFlow({ data }: RoadmapFlowProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || !data.length || !svgRef.current) return;

    const width = 800;
    const nodeHeight = 80;
    const nodeWidth = 200;
    const verticalGap = 40;
    const height = data.length * (nodeHeight + verticalGap) + 100;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2 - nodeWidth / 2}, 50)`);

    // Draw nodes
    data.forEach((d, i) => {
      const y = i * (nodeHeight + verticalGap);
      
      // Node box
      const node = g.append("g")
        .attr("transform", `translate(0, ${y})`);

      node.append("rect")
        .attr("width", nodeWidth)
        .attr("height", nodeHeight)
        .attr("rx", 15)
        .attr("fill", "rgba(244, 63, 94, 0.1)")
        .attr("stroke", "rgba(244, 63, 94, 0.4)")
        .attr("stroke-width", 2);

      // Day label
      node.append("text")
        .attr("x", 10)
        .attr("y", 25)
        .attr("fill", "#f43f5e")
        .attr("font-weight", "black")
        .attr("font-size", "12px")
        .text(d.day.toUpperCase());

      // Topic text
      node.append("text")
        .attr("x", 10)
        .attr("y", 50)
        .attr("fill", "#fff")
        .attr("font-weight", "bold")
        .attr("font-size", "14px")
        .text(d.topic.length > 22 ? d.topic.substring(0, 20) + "..." : d.topic);

      // Objective text
      node.append("text")
        .attr("x", 10)
        .attr("y", 70)
        .attr("fill", "rgba(255,255,255,0.5)")
        .attr("font-size", "10px")
        .text(d.objective.length > 35 ? d.objective.substring(0, 32) + "..." : d.objective);

      // Connector line
      if (i < data.length - 1) {
        g.append("line")
          .attr("x1", nodeWidth / 2)
          .attr("y1", y + nodeHeight)
          .attr("x2", nodeWidth / 2)
          .attr("y2", y + nodeHeight + verticalGap)
          .attr("stroke", "rgba(244, 63, 94, 0.4)")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4");
        
        g.append("circle")
          .attr("cx", nodeWidth / 2)
          .attr("cy", y + nodeHeight + verticalGap / 2)
          .attr("r", 4)
          .attr("fill", "#f43f5e");
      }
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

  }, [data]);

  return (
    <div className="w-full h-[500px] bg-black/20 rounded-3xl border border-white/10 overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-xs font-black text-white/40 uppercase tracking-widest">Visual Roadmap Flow</span>
      </div>
      <svg
        ref={svgRef}
        viewBox="0 0 800 1000"
        className="w-full h-full cursor-move"
      />
    </div>
  );
}
