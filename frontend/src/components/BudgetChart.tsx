import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface BudgetChartProps {
  data: { category: string; amount: number }[];
}

const COLORS = [
  "hsl(280, 90%, 65%)", // primary
  "hsl(200, 100%, 55%)", // secondary
  "hsl(320, 90%, 65%)", // accent
  "hsl(160, 84%, 39%)", // success
  "hsl(0, 85%, 60%)",   // destructive
  "hsl(47, 96%, 53%)",  // warning
];

export default function BudgetChart({ data }: BudgetChartProps) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // clear before redraw

    if (data.length === 0) {
      svg
        .append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .attr("fill", "hsl(215 20% 65%)")
        .attr("font-size", "14px")
        .text("No expense data to display");
      return;
    }

    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;
    const radius = Math.min(width, height) / 2.2;

    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(COLORS);

    const pie = d3
      .pie<{ category: string; amount: number }>()
      .value((d) => d.amount)
      .sort(null);

    const arc = d3
      .arc<d3.PieArcDatum<{ category: string; amount: number }>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcs = g.selectAll(".arc").data(pie(data)).enter().append("g");

    arcs
      .append("path")
      .attr("d", arc as unknown as string)
      .attr("fill", (_, i) => color(String(i)) as string)
      .attr("stroke", "hsl(0 0% 100% / 0.15)")
      .attr("stroke-width", 2);

    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "hsl(0 0% 100% / 0.9)")
      .text((d) => d.data.category);

  }, [data]);

  return (
    <div className="relative flex items-center justify-center w-full h-[400px] rounded-xl bg-card/40 border border-border/40 shadow-inner">
      <svg ref={ref} className="w-full h-full" />
    </div>
  );
}
