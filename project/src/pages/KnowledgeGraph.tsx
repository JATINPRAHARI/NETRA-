import { useEffect, useRef, useCallback, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { demoStore } from '@/lib/auth';
import type { Entity, Relationship } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  FIR: '#4cd7f6', District: '#a855f7', PoliceUnit: '#3b82f6',
  CrimeGroup: '#ef4444', CrimeHead: '#f97316', Location: '#22c55e',
  InvestigatingOfficer: '#eab308', ActSection: '#ec4899',
};

type Node = { id: string; x: number; y: number; entity: Entity; vx: number; vy: number };
type Edge = { from: Node; to: Node; rel: Relationship };

export default function KnowledgeGraph() {
  const { caseId } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const entities = demoStore.getEntities();
  const relationships = demoStore.getRelationships();
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
      const radius = e.type === 'FIR' ? 0 : 150;
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
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      ctx.strokeStyle = 'rgba(76, 215, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Arrow
      const angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);
      const midX = (edge.from.x + edge.to.x) / 2;
      const midY = (edge.from.y + edge.to.y) / 2;
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(-3, -3);
      ctx.lineTo(-3, 3);
      ctx.closePath();
      ctx.fillStyle = 'rgba(76, 215, 246, 0.4)';
      ctx.fill();
      ctx.restore();

      // Label
      ctx.save();
      ctx.translate(midX, midY - 6);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(edge.rel.type.replace(/_/g, ' '), 0, 0);
      ctx.restore();
    }

    // Draw nodes
    for (const node of nodesRef.current) {
      const color = TYPE_COLORS[node.entity.type] || '#6b7280';
      const isSelected = selected?.id === node.id;
      const radius = node.entity.type === 'FIR' ? 24 : 16;

      // Glow
      if (isSelected || node.entity.type === 'FIR') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 8, 0, Math.PI * 2);
        ctx.fillStyle = color + '20';
        ctx.fill();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0d141d';
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#fff' : color;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = node.entity.name.length > 18 ? node.entity.name.slice(0, 16) + '…' : node.entity.name;
      ctx.fillText(label, node.x, node.y + radius + 14);

      // Type label
      ctx.fillStyle = color;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(node.entity.type, node.x, node.y + radius + 24);
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
      if (dist < 20) return node;
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
    <div className="min-h-screen bg-[#0d141d] text-white flex">
      <aside className="w-64 border-r border-[#2a3a4a] flex flex-col fixed h-full">
        <div className="p-4 border-b border-[#2a3a4a] flex items-center gap-2">
          <svg viewBox="0 0 48 48" fill="none" className="w-7 h-7"><circle cx="24" cy="24" r="22" stroke="#4cd7f6" strokeWidth="2" fill="#0d141d"/><ellipse cx="24" cy="24" rx="14" ry="8" stroke="#4cd7f6" strokeWidth="1.5" fill="none"/><circle cx="24" cy="24" r="4" fill="#4cd7f6"/><circle cx="24" cy="24" r="1.5" fill="#0d141d"/></svg>
          <span className="font-bold">Netra</span>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a3a4a] hover:text-white"><span className="material-symbols-outlined text-[18px]">dashboard</span>Dashboard</Link>
          <div className="pt-2 pb-1 px-3 text-[10px] text-gray-500 uppercase tracking-widest">Case</div>
          {[{ p: '', i: 'folder', l: 'Overview' }, { p: '/fir', i: 'description', l: 'FIR Details' }, { p: '/entities', i: 'hub', l: 'Entities' }, { p: '/graph', i: 'lan', l: 'Knowledge Graph' }, { p: '/analytics', i: 'analytics', l: 'Analytics' }, { p: '/evidence', i: 'folder_shared', l: 'Evidence' }, { p: '/audit', i: 'history', l: 'Audit Trail' }, { p: '/report', i: 'summarize', l: 'Report' }].map(n => (
            <Link key={n.p} to={`/cases/${caseId}${n.p}`} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-[#2a3a4a] hover:text-white"><span className="material-symbols-outlined text-[18px]">{n.i}</span>{n.l}</Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 ml-64 relative">
        <header className="border-b border-[#2a3a4a] px-6 py-3 sticky top-0 bg-[#0d141d]/90 backdrop-blur z-10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Knowledge Graph</h1>
            <p className="text-xs text-gray-400">{entities.length} nodes, {relationships.length} edges — from FIR data</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetView} className="px-3 py-1.5 bg-[#2a3a4a] hover:bg-[#3a4a5a] rounded-lg text-xs transition-colors">Reset View</button>
          </div>
        </header>

        <div className="absolute inset-0 top-[53px]">
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
          <div className="absolute top-4 left-4 bg-[#1a2332]/90 backdrop-blur border border-[#2a3a4a] rounded-xl p-3 space-y-1.5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-2">Node Types</p>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }}></div>
                <span className="text-[10px] text-gray-300">{type}</span>
              </div>
            ))}
          </div>

          {/* Selected Node Detail */}
          {selected && (
            <div className="absolute top-4 right-4 w-72 bg-[#1a2332]/95 backdrop-blur border border-[#2a3a4a] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#2a3a4a] flex items-center justify-between">
                <span className="text-xs font-medium">Node Detail</span>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center border" style={{ borderColor: TYPE_COLORS[selected.type] + '40', background: TYPE_COLORS[selected.type] + '10' }}>
                    <span className="material-symbols-outlined text-[18px]" style={{ color: TYPE_COLORS[selected.type] }}>hub</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{selected.name}</p>
                    <p className="text-[10px] text-gray-400">{selected.type}</p>
                  </div>
                </div>
                {Object.keys(selected.metadata).length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[#2a3a4a]/50">
                    {Object.entries(selected.metadata).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-mono text-gray-300">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-[#2a3a4a]/50">
                  <p className="text-[10px] text-gray-500">Connections: {relationships.filter(r => r.source_id === selected.id || r.target_id === selected.id).length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
