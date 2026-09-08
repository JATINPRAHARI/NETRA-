import { useEffect, useRef, useCallback, useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';
import type { Entity, Relationship } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  FIR: '#4cd7f6', District: '#a855f7', PoliceUnit: '#3b82f6',
  CrimeGroup: '#ef4444', CrimeHead: '#f97316', Location: '#22c55e',
  InvestigatingOfficer: '#eab308', ActSection: '#ec4899',
};

type Node = { id: string; x: number; y: number; entity: Entity; vx: number; vy: number };
type Edge = { from: Node; to: Node; rel: Relationship };

export default function KnowledgeGraph() {
  const { caseData, entities, relationships, loading } = useCaseData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selected, setSelected] = useState<Entity | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ node: Node | null; offsetX: number; offsetY: number }>({ node: null, offsetX: 0, offsetY: 0 });
  const panRef = useRef({ x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 });
  const zoomRef = useRef(1);

  const initGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2, cy = h / 2;

    const nodes: Node[] = entities.map((e, i) => {
      const angle = (i / entities.length) * Math.PI * 2;
      const radius = e.type === 'FIR' ? 0 : 160;
      return {
        id: e.id,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        entity: e,
        vx: 0, vy: 0,
      };
    });

    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edges: Edge[] = relationships.map(r => ({
      from: nodeMap.get(r.source_id)!,
      to: nodeMap.get(r.target_id)!,
      rel: r,
    })).filter(e => e.from && e.to);

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [entities, relationships]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    ctx.translate(panRef.current.x, panRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    // Draw edges
    for (const edge of edgesRef.current) {
      const gradient = ctx.createLinearGradient(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
      gradient.addColorStop(0, 'rgba(76, 215, 246, 0.15)');
      gradient.addColorStop(1, 'rgba(76, 215, 246, 0.08)');
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);
      const midX = (edge.from.x + edge.to.x) / 2;
      const midY = (edge.from.y + edge.to.y) / 2;
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fillStyle = 'rgba(76, 215, 246, 0.3)';
      ctx.fill();
      ctx.restore();

      // Label
      ctx.save();
      ctx.translate(midX, midY - 8);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(edge.rel.type.replace(/_/g, ' '), 0, 0);
      ctx.restore();
    }

    // Draw nodes
    for (const node of nodesRef.current) {
      const color = TYPE_COLORS[node.entity.type] || '#6b7280';
      const isSelected = selected?.id === node.id;
      const radius = node.entity.type === 'FIR' ? 26 : 18;

      // Outer glow
      if (isSelected || node.entity.type === 'FIR') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 10, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(node.x, node.y, radius, node.x, node.y, radius + 10);
        glow.addColorStop(0, color + '15');
        glow.addColorStop(1, color + '00');
        ctx.fillStyle = glow;
        ctx.fill();
      }

      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff30';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      const bg = ctx.createRadialGradient(node.x - 4, node.y - 4, 0, node.x, node.y, radius);
      bg.addColorStop(0, '#141c27');
      bg.addColorStop(1, '#0d141d');
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#ffffff' : color;
      ctx.lineWidth = isSelected ? 2 : 1.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.entity.type === 'FIR' ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = node.entity.name.length > 20 ? node.entity.name.slice(0, 18) + '...' : node.entity.name;
      ctx.fillText(label, node.x, node.y + radius + 16);

      // Type label
      ctx.fillStyle = color;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(node.entity.type, node.x, node.y + radius + 26);
    }

    ctx.restore();
    animRef.current = requestAnimationFrame(draw);
  }, [selected]);

  useEffect(() => {
    initGraph();
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [initGraph, draw]);

  const getNodeAt = (x: number, y: number): Node | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = (x - rect.left - panRef.current.x) / zoomRef.current;
    const my = (y - rect.top - panRef.current.y) / zoomRef.current;
    for (const node of nodesRef.current) {
      const dist = Math.hypot(mx - node.x, my - node.y);
      if (dist < 22) return node;
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const node = getNodeAt(e.clientX, e.clientY);
    if (node) {
      dragRef.current = { node, offsetX: e.clientX - node.x, offsetY: e.clientY - node.y };
      setSelected(node.entity);
    } else {
      panRef.current = { ...panRef.current, dragging: true, lastX: e.clientX, lastY: e.clientY };
      setSelected(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.node) {
      const node = dragRef.current.node;
      node.x = (e.clientX - dragRef.current.offsetX - panRef.current.x) / zoomRef.current;
      node.y = (e.clientY - dragRef.current.offsetY - panRef.current.y) / zoomRef.current;
    } else if (panRef.current.dragging) {
      panRef.current.x += e.clientX - panRef.current.lastX;
      panRef.current.y += e.clientY - panRef.current.lastY;
      panRef.current.lastX = e.clientX;
      panRef.current.lastY = e.clientY;
    }
  };

  const handleMouseUp = () => {
    dragRef.current = { node: null, offsetX: 0, offsetY: 0 };
    panRef.current.dragging = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    zoomRef.current = Math.max(0.3, Math.min(3, zoomRef.current * delta));
  };

  const resetView = () => {
    panRef.current = { x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 };
    zoomRef.current = 1;
    initGraph();
    setSelected(null);
  };

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading knowledge graph...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-3 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Knowledge Graph</h1>
          <p className="text-xs text-gray-500">{entities.length} nodes, {relationships.length} edges — from FIR data</p>
        </div>
        <button onClick={resetView} className="px-4 py-2 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 font-medium">
          Reset View
        </button>
      </header>

      <div className="relative" style={{ height: 'calc(100vh - 52px)' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Legend */}
        <div className="absolute top-4 left-4 glass-card p-4 space-y-2 backdrop-blur-xl">
          <p className="text-[9px] text-gray-400 uppercase tracking-[2px] mb-2 font-medium">Node Types</p>
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}40` }}></div>
              <span className="text-[10px] text-gray-300">{type}</span>
            </div>
          ))}
        </div>

        {/* Selected Node Detail */}
        {selected && (
          <div className="absolute top-4 right-4 w-72 glass-card backdrop-blur-xl overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <span className="text-xs font-medium">Node Detail</span>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-[14px] text-gray-400">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ borderColor: TYPE_COLORS[selected.type] + '30', background: TYPE_COLORS[selected.type] + '10' }}>
                  <span className="material-symbols-outlined text-[18px]" style={{ color: TYPE_COLORS[selected.type] }}>hub</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{selected.name}</p>
                  <p className="text-[10px] text-gray-400">{selected.type}</p>
                </div>
              </div>
              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                  {Object.entries(selected.metadata as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-xs">
                      <span className="text-gray-500">{k}</span>
                      <span className="font-mono text-gray-300">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="pt-2 border-t border-white/[0.04]">
                <p className="text-[10px] text-gray-500">Connections: {relationships.filter(r => r.source_id === selected.id || r.target_id === selected.id).length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </Layout>
  );
}
