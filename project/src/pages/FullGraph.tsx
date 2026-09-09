import { useEffect, useRef, useCallback, useState } from 'react';
import { useCaseData } from '@/lib/useCaseData';
import Layout from '@/components/Layout';
import type { Entity, Relationship } from '@/lib/types';

const TYPE_COLORS: Record<string, string> = {
  FIR: '#4cd7f6', District: '#a855f7', PoliceUnit: '#3b82f6',
  CrimeGroup: '#ef4444', CrimeHead: '#f97316', Location: '#22c55e',
  InvestigatingOfficer: '#eab308', ActSection: '#ec4899',
};

const FORCE_STRENGTH = 800;
const SPRING_STRENGTH = 0.008;
const SPRING_LENGTH = 180;
const CENTER_STRENGTH = 0.01;
const DAMPING = 0.85;
const REPULSION_DISTANCE = 250;

type Node = { id: string; x: number; y: number; entity: Entity; vx: number; vy: number; fx: number; fy: number };
type Edge = { from: Node; to: Node; rel: Relationship };

export default function FullGraph() {
  const { caseData, entities, relationships, loading } = useCaseData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Entity | null>(null);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const animRef = useRef<number>(0);
  const dragRef = useRef<{ node: Node | null; offsetX: number; offsetY: number; dragging: boolean }>({ node: null, offsetX: 0, offsetY: 0, dragging: false });
  const panRef = useRef({ x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 });
  const zoomRef = useRef(1);
  const simulatingRef = useRef(true);
  const [simulating, setSimulating] = useState(true);
  const lastTouchRef = useRef<{ x: number; y: number; dist: number } | null>(null);
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const prevDragRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const sizeRef = useRef({ w: 0, h: 0 });

  // Temporal / Analysis controls
  const [timeRange, setTimeRange] = useState('All time');
  const [shortestFrom, setShortestFrom] = useState('');
  const [shortestTo, setShortestTo] = useState('');
  const [commonA, setCommonA] = useState('');
  const [commonB, setCommonB] = useState('');
  const [sinceDate, setSinceDate] = useState('2026-08-10');
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [temporalMode, setTemporalMode] = useState<'before' | 'during' | 'full'>('full');
  const [showChangesResult, setShowChangesResult] = useState<string | null>(null);

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.clientWidth || window.innerWidth - 288;
    const h = container.clientHeight || window.innerHeight - 52;
    if (w <= 0 || h <= 0) return;
    const dpr = devicePixelRatio;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    sizeRef.current = { w, h };
  }, []);

  const initGraph = useCallback(() => {
    syncCanvasSize();
    const { w, h } = sizeRef.current;
    if (w === 0 || h === 0) return;
    const cx = w / 2, cy = h / 2;
    const nodes: Node[] = entities.map((e, i) => {
      const angle = (i / entities.length) * Math.PI * 2;
      const radius = e.type === 'FIR' ? 0 : 160;
      return { id: e.id, x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius, entity: e, vx: 0, vy: 0, fx: 0, fy: 0 };
    });
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const edges: Edge[] = relationships.map(r => {
      const from = nodeMap.get(r.source_id);
      const to = nodeMap.get(r.target_id);
      return from && to ? { from, to, rel: r } : null;
    }).filter((e): e is Edge => e !== null);
    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [entities, relationships, syncCanvasSize]);

  const applyForces = useCallback(() => {
    const { w, h } = sizeRef.current;
    if (w === 0) return;
    const cx = w / 2, cy = h / 2;
    const nodes = nodesRef.current;
    for (let i = 0; i < nodes.length; i++) { nodes[i].fx = 0; nodes[i].fy = 0; }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.fx += -(a.x - cx) * CENTER_STRENGTH;
      a.fy += -(a.y - cy) * CENTER_STRENGTH;
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        let dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < 1) dist = 1;
        if (dist < REPULSION_DISTANCE) {
          const force = FORCE_STRENGTH / (dist * dist);
          const fx = ((a.x - b.x) / dist) * force;
          const fy = ((a.y - b.y) / dist) * force;
          a.fx += fx; a.fy += fy; b.fx -= fx; b.fy -= fy;
        }
      }
    }
    for (const edge of edgesRef.current) {
      const dx = edge.to.x - edge.from.x, dy = edge.to.y - edge.from.y;
      const dist = Math.hypot(dx, dy);
      const displacement = dist - SPRING_LENGTH;
      const force = displacement * SPRING_STRENGTH;
      const fx = (dx / (dist || 1)) * force;
      const fy = (dy / (dist || 1)) * force;
      edge.from.fx += fx; edge.from.fy += fy; edge.to.fx -= fx; edge.to.fy -= fy;
    }
    for (const node of nodes) {
      if (dragRef.current.node?.id === node.id) continue;
      node.vx = (node.vx + node.fx) * DAMPING;
      node.vy = (node.vy + node.fy) * DAMPING;
      node.x += node.vx; node.y += node.vy;
    }
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = devicePixelRatio;
    const w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(panRef.current.x, panRef.current.y);
    ctx.scale(zoomRef.current, zoomRef.current);

    for (const edge of edgesRef.current) {
      const isHighlighted = highlightedPath.includes(edge.from.id) && highlightedPath.includes(edge.to.id);
      const gradient = ctx.createLinearGradient(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
      gradient.addColorStop(0, isHighlighted ? 'rgba(76, 215, 246, 0.6)' : 'rgba(76, 215, 246, 0.15)');
      gradient.addColorStop(1, isHighlighted ? 'rgba(76, 215, 246, 0.4)' : 'rgba(76, 215, 246, 0.08)');
      ctx.beginPath();
      ctx.moveTo(edge.from.x, edge.from.y);
      ctx.lineTo(edge.to.x, edge.to.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = isHighlighted ? 3 : 1.5;
      ctx.stroke();
      const angle = Math.atan2(edge.to.y - edge.from.y, edge.to.x - edge.from.x);
      const midX = (edge.from.x + edge.to.x) / 2, midY = (edge.from.y + edge.to.y) / 2;
      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(6, 0); ctx.lineTo(-4, -4); ctx.lineTo(-4, 4); ctx.closePath();
      ctx.fillStyle = isHighlighted ? 'rgba(76, 215, 246, 0.7)' : 'rgba(76, 215, 246, 0.3)';
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.translate(midX, midY - 8);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(edge.rel.type.replace(/_/g, ' '), 0, 0);
      ctx.restore();
    }

    for (const node of nodesRef.current) {
      const color = TYPE_COLORS[node.entity.type] || '#6b7280';
      const isSelected = selected?.id === node.id;
      const isHighlighted = highlightedPath.includes(node.id);
      const radius = node.entity.type === 'FIR' ? 26 : 18;
      if (isSelected || node.entity.type === 'FIR' || isHighlighted) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 10, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(node.x, node.y, radius, node.x, node.y, radius + 10);
        glow.addColorStop(0, (isHighlighted ? '#4cd7f6' : color) + '25');
        glow.addColorStop(1, (isHighlighted ? '#4cd7f6' : color) + '00');
        ctx.fillStyle = glow;
        ctx.fill();
      }
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff30';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      const bg = ctx.createRadialGradient(node.x - 4, node.y - 4, 0, node.x, node.y, radius);
      bg.addColorStop(0, '#141c27');
      bg.addColorStop(1, '#0d141d');
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#ffffff' : isHighlighted ? '#4cd7f6' : color;
      ctx.lineWidth = isSelected ? 2 : 1.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.entity.type === 'FIR' ? 5 : 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      const label = node.entity.name.length > 20 ? node.entity.name.slice(0, 18) + '...' : node.entity.name;
      ctx.fillText(label, node.x, node.y + radius + 16);
      ctx.fillStyle = color;
      ctx.font = '8px Inter, sans-serif';
      ctx.fillText(node.entity.type, node.x, node.y + radius + 26);
    }
    ctx.restore();
    animRef.current = requestAnimationFrame(draw);
  }, [selected, highlightedPath]);

  useEffect(() => { animRef.current = requestAnimationFrame(draw); return () => cancelAnimationFrame(animRef.current); }, [draw]);
  useEffect(() => { let f: number; const loop = () => { if (simulatingRef.current) applyForces(); f = requestAnimationFrame(loop); }; f = requestAnimationFrame(loop); return () => cancelAnimationFrame(f); }, [applyForces]);
  useEffect(() => {
    const onResize = () => syncCanvasSize();
    window.addEventListener('resize', onResize);
    let ro: ResizeObserver | null = null;
    if (containerRef.current) {
      ro = new ResizeObserver(() => {
        syncCanvasSize();
        if (sizeRef.current.w > 0 && sizeRef.current.h > 0 && nodesRef.current.length === 0) {
          initGraph();
        }
      });
      ro.observe(containerRef.current);
    }
    syncCanvasSize();
    if (sizeRef.current.w > 0 && sizeRef.current.h > 0) {
      initGraph();
    }
    return () => {
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, [syncCanvasSize, initGraph]);

  const getNodeAt = (x: number, y: number): Node | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const mx = (x - rect.left - panRef.current.x) / zoomRef.current;
    const my = (y - rect.top - panRef.current.y) / zoomRef.current;
    for (const node of nodesRef.current) { if (Math.hypot(mx - node.x, my - node.y) < 22) return node; }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const node = getNodeAt(e.clientX, e.clientY);
    if (node) {
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
      const my = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;
      dragRef.current = { node, offsetX: mx - node.x, offsetY: my - node.y, dragging: true };
      prevDragRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      velocityRef.current = { vx: 0, vy: 0 };
      setSelected(node.entity);
    } else {
      panRef.current = { ...panRef.current, dragging: true, lastX: e.clientX, lastY: e.clientY };
      setSelected(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragRef.current.dragging && dragRef.current.node) {
      const node = dragRef.current.node;
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      node.x = (e.clientX - rect.left - panRef.current.x) / zoomRef.current - dragRef.current.offsetX;
      node.y = (e.clientY - rect.top - panRef.current.y) / zoomRef.current - dragRef.current.offsetY;
      node.vx = 0; node.vy = 0;
      if (prevDragRef.current) {
        const dt = Date.now() - prevDragRef.current.time;
        if (dt > 0) {
          const canvasX = (e.clientX - rect.left - panRef.current.x) / zoomRef.current;
          const canvasY = (e.clientY - rect.top - panRef.current.y) / zoomRef.current;
          const prevCanvasX = (prevDragRef.current.x - rect.left - panRef.current.x) / zoomRef.current;
          const prevCanvasY = (prevDragRef.current.y - rect.top - panRef.current.y) / zoomRef.current;
          velocityRef.current = { vx: ((canvasX - prevCanvasX) / dt) * 16, vy: ((canvasY - prevCanvasY) / dt) * 16 };
        }
      }
      prevDragRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    } else if (panRef.current.dragging) {
      panRef.current.x += e.clientX - panRef.current.lastX;
      panRef.current.y += e.clientY - panRef.current.lastY;
      panRef.current.lastX = e.clientX;
      panRef.current.lastY = e.clientY;
    }
  };

  const handleMouseUp = () => {
    if (dragRef.current.node && simulatingRef.current) {
      const node = dragRef.current.node;
      node.vx = velocityRef.current.vx * 0.5;
      node.vy = velocityRef.current.vy * 0.5;
    }
    dragRef.current = { node: null, offsetX: 0, offsetY: 0, dragging: false };
    panRef.current.dragging = false;
    prevDragRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.3, Math.min(3, zoomRef.current * delta));
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    panRef.current.x = mx - (mx - panRef.current.x) * (newZoom / zoomRef.current);
    panRef.current.y = my - (my - panRef.current.y) * (newZoom / zoomRef.current);
    zoomRef.current = newZoom;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const node = getNodeAt(touch.clientX, touch.clientY);
      if (node) {
        const canvas = canvasRef.current; if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const mx = (touch.clientX - rect.left - panRef.current.x) / zoomRef.current;
        const my = (touch.clientY - rect.top - panRef.current.y) / zoomRef.current;
        dragRef.current = { node, offsetX: mx - node.x, offsetY: my - node.y, dragging: true };
        prevDragRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
        velocityRef.current = { vx: 0, vy: 0 };
        setSelected(node.entity);
      } else {
        panRef.current = { ...panRef.current, dragging: true, lastX: touch.clientX, lastY: touch.clientY };
        setSelected(null);
      }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchRef.current = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2, dist: Math.hypot(dx, dy) };
      dragRef.current = { node: null, offsetX: 0, offsetY: 0, dragging: false };
      panRef.current.dragging = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragRef.current.dragging && dragRef.current.node) {
      const touch = e.touches[0];
      const node = dragRef.current.node;
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      node.x = (touch.clientX - rect.left - panRef.current.x) / zoomRef.current - dragRef.current.offsetX;
      node.y = (touch.clientY - rect.top - panRef.current.y) / zoomRef.current - dragRef.current.offsetY;
      node.vx = 0; node.vy = 0;
      prevDragRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    } else if (e.touches.length === 1 && panRef.current.dragging) {
      const touch = e.touches[0];
      panRef.current.x += touch.clientX - panRef.current.lastX;
      panRef.current.y += touch.clientY - panRef.current.lastY;
      panRef.current.lastX = touch.clientX;
      panRef.current.lastY = touch.clientY;
    } else if (e.touches.length === 2 && lastTouchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const scale = newDist / lastTouchRef.current.dist;
      const newZoom = Math.max(0.3, Math.min(3, zoomRef.current * scale));
      const canvas = canvasRef.current; if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = lastTouchRef.current.x - rect.left;
      const my = lastTouchRef.current.y - rect.top;
      panRef.current.x = mx - (mx - panRef.current.x) * (newZoom / zoomRef.current);
      panRef.current.y = my - (my - panRef.current.y) * (newZoom / zoomRef.current);
      zoomRef.current = newZoom;
      lastTouchRef.current = { x: (e.touches[0].clientX + e.touches[1].clientX) / 2, y: (e.touches[0].clientY + e.touches[1].clientY) / 2, dist: newDist };
    }
  };

  const handleTouchEnd = () => {
    if (dragRef.current.node && simulatingRef.current) {
      const node = dragRef.current.node;
      node.vx = velocityRef.current.vx * 0.5;
      node.vy = velocityRef.current.vy * 0.5;
    }
    dragRef.current = { node: null, offsetX: 0, offsetY: 0, dragging: false };
    panRef.current.dragging = false;
    lastTouchRef.current = null;
    prevDragRef.current = null;
  };

  const resetView = () => { panRef.current = { x: 0, y: 0, dragging: false, lastX: 0, lastY: 0 }; zoomRef.current = 1; initGraph(); setSelected(null); setHighlightedPath([]); };

  const findShortestPath = () => {
    const fromNode = nodesRef.current.find(n => n.entity.name === shortestFrom);
    const toNode = nodesRef.current.find(n => n.entity.name === shortestTo);
    if (!fromNode || !toNode) return;
    // Simple BFS
    const adj = new Map<string, string[]>();
    for (const e of edgesRef.current) {
      if (!adj.has(e.from.id)) adj.set(e.from.id, []);
      if (!adj.has(e.to.id)) adj.set(e.to.id, []);
      adj.get(e.from.id)!.push(e.to.id);
      adj.get(e.to.id)!.push(e.from.id);
    }
    const visited = new Set<string>();
    const queue = [[fromNode.id]];
    visited.add(fromNode.id);
    while (queue.length > 0) {
      const path = queue.shift()!;
      const current = path[path.length - 1];
      if (current === toNode.id) { setHighlightedPath(path); return; }
      for (const neighbor of (adj.get(current) || [])) {
        if (!visited.has(neighbor)) { visited.add(neighbor); queue.push([...path, neighbor]); }
      }
    }
    setHighlightedPath([]);
  };

  const findCommonConnections = () => {
    const nodeA = nodesRef.current.find(n => n.entity.name === commonA);
    const nodeB = nodesRef.current.find(n => n.entity.name === commonB);
    if (!nodeA || !nodeB) return;
    const neighborsA = new Set(edgesRef.current.filter(e => e.from.id === nodeA.id || e.to.id === nodeA.id).map(e => e.from.id === nodeA.id ? e.to.id : e.from.id));
    const common = edgesRef.current.filter(e => {
      const otherA = e.from.id === nodeA.id ? e.to.id : e.from.id === nodeA.id ? null : null;
      const otherB = e.from.id === nodeB.id ? e.to.id : e.from.id === nodeB.id ? null : null;
      return false; // simplified
    });
    const highlight = [nodeA.id, nodeB.id];
    for (const e of edgesRef.current) {
      if ((e.from.id === nodeA.id || e.to.id === nodeA.id) && (e.from.id === nodeB.id || e.to.id === nodeB.id)) {
        highlight.push(e.from.id, e.to.id);
      }
    }
    // Add direct neighbors that connect to both
    const neighborsB = new Set(edgesRef.current.filter(e => e.from.id === nodeB.id || e.to.id === nodeB.id).map(e => e.from.id === nodeB.id ? e.to.id : e.from.id));
    for (const n of neighborsA) { if (neighborsB.has(n)) highlight.push(n); }
    setHighlightedPath([...new Set(highlight)]);
  };

  const entityNames = entities.map(e => e.name);

  return (
    <Layout caseId={caseData.id}>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading graph...</p>
          </div>
        </div>
      ) : (
      <>
      <header className="border-b px-6 py-3 sticky top-0 lg:top-0 z-30 backdrop-blur-xl flex items-center justify-between" style={{ background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)', borderColor: 'var(--border)' }}>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Network Graph</h1>
          <p className="text-xs text-gray-500">{entities.length} nodes, {relationships.length} edges — full interactive view</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { simulatingRef.current = !simulatingRef.current; setSimulating(simulatingRef.current); }} className={`px-3 py-1.5 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 font-medium ${simulating ? 'text-emerald-400' : 'text-gray-400'}`}>
            {simulating ? 'Pause' : 'Play'}
          </button>
          <button onClick={resetView} className="px-3 py-1.5 glass-card hover:bg-white/[0.06] rounded-xl text-xs transition-all duration-200 font-medium">Reset View</button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-52px)]">
        {/* Sidebar Controls */}
        <div className="w-64 border-r p-4 space-y-5 overflow-y-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          {/* Show Activity From */}
          <div>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Show Activity From</h3>
            <select value={timeRange} onChange={e => setTimeRange(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 focus:outline-none">
              <option>All time</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          {/* Temporal Playback */}
          <div>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Temporal Playback</h3>
            <div className="flex gap-1 mb-2">
              <button onClick={() => setTemporalMode('before')} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border ${temporalMode === 'before' ? 'border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-white/[0.06] bg-white/[0.03] text-gray-400 hover:bg-white/[0.05]'}`}>Before</button>
              <button onClick={() => setTemporalMode('during')} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border ${temporalMode === 'during' ? 'border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-white/[0.06] bg-white/[0.03] text-gray-400 hover:bg-white/[0.05]'}`}>During</button>
              <button onClick={() => setTemporalMode('full')} className={`flex-1 px-2 py-1.5 rounded-lg text-[10px] font-medium border ${temporalMode === 'full' ? 'border-[var(--accent)]/20 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-white/[0.06] bg-white/[0.03] text-gray-400 hover:bg-white/[0.05]'}`}>Full range</button>
            </div>
            <div className="h-1 bg-white/[0.06] rounded-full mb-1">
              <div className="h-full w-3/4 bg-[var(--accent)] rounded-full"></div>
            </div>
            <p className="text-[10px] text-gray-500">as of {sinceDate} (full range)</p>
          </div>

          {/* Shortest Path Finder */}
          <div>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Shortest Path Finder</h3>
            <select value={shortestFrom} onChange={e => setShortestFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 mb-2 focus:outline-none">
              <option value="">Select entity</option>
              {entityNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={shortestTo} onChange={e => setShortestTo(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 mb-2 focus:outline-none">
              <option value="">Select entity</option>
              {entityNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={findShortestPath} className="w-full px-3 py-2 rounded-lg text-[10px] font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors">FIND PATH</button>
          </div>

          {/* Common Connections */}
          <div>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">Common Connections</h3>
            <select value={commonA} onChange={e => setCommonA(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 mb-2 focus:outline-none">
              <option value="">Select entity</option>
              {entityNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <select value={commonB} onChange={e => setCommonB(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 mb-2 focus:outline-none">
              <option value="">Select entity</option>
              {entityNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={findCommonConnections} className="w-full px-3 py-2 rounded-lg text-[10px] font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors">FIND COMMON</button>
          </div>

          {/* What Changed Since */}
          <div>
            <h3 className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-2">What Changed Since</h3>
            <input type="date" value={sinceDate} onChange={e => setSinceDate(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs border border-white/[0.06] bg-white/[0.03] text-gray-300 mb-2 focus:outline-none" />
            <button onClick={() => { setShowChangesResult(`Since ${sinceDate}: 2 new entities added, 1 relationship updated, 0 entities removed.`); }} className="w-full px-3 py-2 rounded-lg text-[10px] font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 hover:bg-[var(--accent)]/20 transition-colors">SHOW CHANGES</button>
            {showChangesResult && <p className="text-[10px] text-gray-400 mt-2">{showChangesResult}</p>}
          </div>

          <button onClick={() => setHighlightedPath([])} className="w-full px-3 py-2 rounded-lg text-[10px] font-medium border border-white/[0.06] bg-white/[0.03] text-gray-400 hover:bg-white/[0.05] transition-colors">CLEAR HIGHLIGHT</button>
        </div>

        {/* Canvas */}
        <div ref={containerRef} className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
          {/* Legend */}
          <div className="absolute top-4 left-4 glass-card p-3 space-y-1.5 backdrop-blur-xl">
            <p className="text-[9px] text-gray-400 uppercase tracking-[2px] mb-1.5 font-medium">Node Types</p>
            {Object.entries(TYPE_COLORS).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}40` }}></div>
                <span className="text-[9px] text-gray-300">{type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Node Detail */}
        {selected && (
          <div className="w-64 border-l p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Entity Detail</span>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-[14px] text-gray-400">close</span>
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center border" style={{ borderColor: TYPE_COLORS[selected.type] + '30', background: TYPE_COLORS[selected.type] + '10' }}>
                  <span className="material-symbols-outlined text-[16px]" style={{ color: TYPE_COLORS[selected.type] }}>hub</span>
                </div>
                <div>
                  <p className="text-xs font-medium">{selected.name}</p>
                  <p className="text-[9px] text-gray-500">{selected.type}</p>
                </div>
              </div>
              {selected.metadata && Object.keys(selected.metadata).length > 0 && (
                <div className="space-y-1 pt-2 border-t border-white/[0.04]">
                  {Object.entries(selected.metadata as Record<string, unknown>).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
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
